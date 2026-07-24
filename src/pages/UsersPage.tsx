import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Users, Shield, Mail, RotateCcw, Send, UserX, CheckCircle, Edit } from 'lucide-react';
import { SearchInput } from '../components/ui/SearchInput/SearchInput';
import { Modal } from '../components/ui/Modal/Modal';
import { UserFormModal, type UserFormData } from '../components/users/UserFormModal';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchDeletedUsersSuccess,
  fetchUsersFailure,
  addUserSuccess,
  updateUserSuccess,
  deleteUserSuccess,
  restoreUserSuccess
} from '../store/slices/userSlice';
import axios from 'axios';
import styles from './UsersPage.module.scss';

const UsersPage: React.FC = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);
  const { users, deletedUsers, status } = useSelector((state: RootState) => state.users);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('NEWEST');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'invited' | 'deleted'>('active');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    dispatch(fetchUsersStart());
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(fetchUsersSuccess(response.data.data || []));
    } catch (error: any) {
      dispatch(fetchUsersFailure(error.message || 'Failed to load users'));
    }
  }, [dispatch, token]);

  const loadDeletedUsers = useCallback(async () => {
    setLoadingDeleted(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users?isDeleted=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(fetchDeletedUsersSuccess(response.data.data || []));
    } catch (error) {
      console.error("Failed to load deleted users:", error);
    } finally {
      setLoadingDeleted(false);
    }
  }, [dispatch, token]);

  const loadOrganizations = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizations(response.data.data || []);
    } catch (error) {
      console.error("Failed to load organizations:", error);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
    loadDeletedUsers();
    loadOrganizations();
  }, [loadUsers, loadDeletedUsers, loadOrganizations]);

  const getInitials = (name?: string) => {
    if (!name) return 'US';
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/${selectedUser.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          dispatch(updateUserSuccess(res.data.data));
        }
      } else {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/invite`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data) {
          dispatch(addUserSuccess(res.data.data));
        }
      }
      setIsFormModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save user info');
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/users/${userId}/resend-invite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Invitation email resent successfully!');
      loadUsers();
    } catch (error: any) {
      alert('Failed to resend invite');
    }
    setOpenDropdownId(null);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(deleteUserSuccess(deleteUserId));
      loadDeletedUsers();
    } catch (error) {
      alert('Failed to revoke user access');
    }
    setDeleteUserId(null);
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/users/${userId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        dispatch(restoreUserSuccess(res.data.data));
      }
      loadUsers();
      loadDeletedUsers();
    } catch (error) {
      alert('Failed to restore user access');
    }
  };

  // Filter & Sort Active / Invited Users
  const filteredUsers = users.filter(user => {
    if (activeTab === 'invited' && user.status !== 'INVITED') return false;
    if (activeTab === 'active' && user.status === 'INVITED') return true; // keep invited in main tab as well

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower));

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    if (sortOption === 'A_Z') return (a.name || '').localeCompare(b.name || '');
    if (sortOption === 'Z_A') return (b.name || '').localeCompare(a.name || '');
    if (sortOption === 'NEWEST') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortOption === 'OLDEST') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    return 0;
  });

  const filteredDeletedUsers = deletedUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  }).sort((a, b) => {
    if (sortOption === 'A_Z') return (a.name || '').localeCompare(b.name || '');
    if (sortOption === 'Z_A') return (b.name || '').localeCompare(a.name || '');
    if (sortOption === 'NEWEST') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortOption === 'OLDEST') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    return 0;
  });

  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const invitedCount = users.filter(u => u.status === 'INVITED').length;

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <h1>User Access Management (UAM)</h1>
          <p>Invite, manage roles, and control admin access permissions</p>
        </div>

        <button className="btn-primary" onClick={() => { setSelectedUser(null); setIsFormModalOpen(true); }}>
          <UserPlus size={16} />
          Invite Admin User
        </button>
      </div>

      {/* Metric Cards */}
      <div className={styles.metricsContainer}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} blue`}>
            <Users size={20} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{users.length}</div>
            <div className={styles.metricLabel}>Total Admin Users</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} green`}>
            <CheckCircle size={20} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{activeCount}</div>
            <div className={styles.metricLabel}>Active Users</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} amber`}>
            <Send size={20} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{invitedCount}</div>
            <div className={styles.metricLabel}>Pending Invitations</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} purple`}>
            <Shield size={20} />
          </div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>4</div>
            <div className={styles.metricLabel}>Defined Roles</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'active' ? styles.active : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Users size={16} /> All Active Users ({users.length})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'invited' ? styles.active : ''}`}
          onClick={() => setActiveTab('invited')}
        >
          <Mail size={16} /> Pending Invitations ({invitedCount})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'deleted' ? styles.active : ''}`}
          onClick={() => { setActiveTab('deleted'); loadDeletedUsers(); }}
        >
          <RotateCcw size={16} /> Deactivated Access ({deletedUsers.length})
        </button>
      </div>

      {/* Table Container */}
      <div className={styles.tableContainer}>
        {/* Toolbar */}
        <div className={styles.tableToolbar}>
          <SearchInput
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div style={{ position: 'relative' }}>
            <button className={styles.filterBtn} onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter size={16} />
              Filters
            </button>
            {isFilterOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', zIndex: 10, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', minWidth: '200px' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Sort By</div>
                {[
                  { value: 'NEWEST', label: 'Newest to Oldest' },
                  { value: 'OLDEST', label: 'Oldest to Newest' },
                  { value: 'A_Z', label: 'A to Z' },
                  { value: 'Z_A', label: 'Z to A' }
                ].map(sort => (
                  <label key={sort.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '14px' }}>
                    <input
                      type="radio"
                      name="sortOption"
                      value={sort.value}
                      checked={sortOption === sort.value}
                      onChange={(e) => setSortOption(e.target.value)}
                    />
                    {sort.label}
                  </label>
                ))}

                <div style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Filter by Role</div>
                {['ALL', 'SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'VIEWER'].map(role => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '14px' }}>
                    <input
                      type="radio"
                      name="roleFilter"
                      value={role}
                      checked={roleFilter === role}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    />
                    {role === 'ALL' ? 'All Roles' : role.replace('_', ' ')}
                  </label>
                ))}

                <div style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Filter by Status</div>
                {['ALL', 'ACTIVE', 'INVITED', 'INACTIVE', 'SUSPENDED'].map(status => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '14px' }}>
                    <input
                      type="radio"
                      name="statusFilter"
                      value={status}
                      checked={statusFilter === status}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    {status === 'ALL' ? 'All Statuses' : status}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Table */}
        {((activeTab !== 'deleted' && status === 'loading') || (activeTab === 'deleted' && loadingDeleted)) && (
          <p style={{ padding: 20 }}>Loading users...</p>
        )}

        {activeTab !== 'deleted' && status !== 'loading' && (
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Scope</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {getInitials(user.name)}
                        </div>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{user.name}</span>
                          <span className={styles.userEmail}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[user.role?.toLowerCase()] || ''}`}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className={`${styles.statusBadge} ${styles[user.status?.toLowerCase()] || ''}`}>
                        <span className={styles.dot}></span>
                        {user.status}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#475569' }}>
                        {user.organizationId 
                          ? (organizations.find(o => o.id === user.organizationId)?.name || 'Specific Org')
                          : 'Global Access'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td style={{ textAlign: 'right', position: 'relative' }}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openDropdownId === user.id && (
                        <div style={{ position: 'absolute', right: '16px', top: '38px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 10, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', minWidth: '160px', textAlign: 'left' }}>
                          {user.status === 'INVITED' && (
                            <button
                              onClick={() => handleResendInvite(user.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#2563eb' }}
                            >
                              <Send size={14} /> Resend Invite
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedUser(user); setIsFormModalOpen(true); setOpenDropdownId(null); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#1e293b' }}
                          >
                            <Edit size={14} /> Edit Access
                          </button>
                          <button
                            onClick={() => { setDeleteUserId(user.id); setOpenDropdownId(null); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ef4444' }}
                          >
                            <UserX size={14} /> Revoke Access
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No admin users found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Deactivated Tab Content */}
        {activeTab === 'deleted' && !loadingDeleted && (
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeletedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>
                          {getInitials(user.name)}
                        </div>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{user.name}</span>
                          <span className={styles.userEmail}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[user.role?.toLowerCase()] || ''}`}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: '4px' }}>
                        DEACTIVATED
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={styles.restoreBtn} onClick={() => handleRestoreUser(user.id)}>
                        <RotateCcw size={14} /> Restore Access
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredDeletedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No deactivated admin users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled><ChevronLeft size={16} /></button>
          <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
          <button className={styles.pageBtn} disabled><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Invite / Edit User Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setSelectedUser(null); }}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
        isEdit={!!selectedUser}
        organizations={organizations}
      />

      {/* Revoke Access Confirmation Modal */}
      <Modal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        title="Revoke Admin Access"
        subtitle="This action will remove portal access for this user."
        width="460px"
      >
        <p style={{ margin: '0 0 20px 0', color: '#475569', lineHeight: 1.5 }}>
          Are you sure you want to revoke admin access for this user? They will no longer be able to log into the HRMS Admin Portal.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => setDeleteUserId(null)}
            style={{ padding: '9px 18px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#475569', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteUser}
            style={{ padding: '9px 20px', border: 'none', borderRadius: '8px', background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Revoke Access
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
