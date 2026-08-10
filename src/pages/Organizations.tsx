import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight, RotateCcw, Building2, Pencil, Trash2 } from 'lucide-react';
import { SearchInput } from '../components/ui/SearchInput/SearchInput';
import { Modal } from '../components/ui/Modal/Modal';
import { OrganizationFormModal, type OrganizationFormData } from '../components/organizations/OrganizationFormModal';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { 
  fetchOrganizations, fetchOrganizationsSuccess, fetchOrganizationsFailure,
  createOrganizationAction, createOrganizationFailure
} from '../store/slices/orgSlice';
import axios from 'axios';
import styles from './Organizations.module.scss';

const Organizations: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organizations, status } = useSelector((state: RootState) => state.orgs);
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('NEWEST');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editOrgId, setEditOrgId] = useState<string | null>(null);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedOrgData, setSelectedOrgData] = useState<Partial<OrganizationFormData> | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
  const [deletedOrganizations, setDeletedOrganizations] = useState<any[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState<boolean>(false);

  const loadOrganizations = async () => {
    dispatch(fetchOrganizations());
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(fetchOrganizationsSuccess(response.data.data));
    } catch (error: any) {
      dispatch(fetchOrganizationsFailure(error.message));
    }
  };

  const loadDeletedOrganizations = async () => {
    setLoadingDeleted(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/organizations?isDeleted=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeletedOrganizations(response.data.data || []);
    } catch (error: any) {
      console.error("Error loading deleted orgs:", error);
    } finally {
      setLoadingDeleted(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
    loadDeletedOrganizations();
  }, [dispatch, token]);

  const filteredOrganizations = organizations.filter(org => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (org.name && org.name.toLowerCase().includes(searchLower)) || 
      (org.adminEmail && org.adminEmail.toLowerCase().includes(searchLower)) ||
      (org.id && org.id.toLowerCase().includes(searchLower)) ||
      (org.slugDomain && org.slugDomain.toLowerCase().includes(searchLower));
      
    const matchesFilter = statusFilter === 'ALL' || org.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortOption === 'A_Z') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortOption === 'Z_A') {
      return (b.name || '').localeCompare(a.name || '');
    }
    if (sortOption === 'NEWEST') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortOption === 'OLDEST') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    return 0;
  });

  const filteredDeletedOrganizations = deletedOrganizations.filter(org => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (org.name && org.name.toLowerCase().includes(searchLower)) || 
      (org.adminEmail && org.adminEmail.toLowerCase().includes(searchLower)) ||
      (org.id && org.id.toLowerCase().includes(searchLower)) ||
      (org.slugDomain && org.slugDomain.toLowerCase().includes(searchLower))
    );
  }).sort((a, b) => {
    if (sortOption === 'A_Z') return (a.name || '').localeCompare(b.name || '');
    if (sortOption === 'Z_A') return (b.name || '').localeCompare(a.name || '');
    if (sortOption === 'NEWEST') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortOption === 'OLDEST') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    return 0;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ORG';
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleFormSubmit = async (data: OrganizationFormData) => {
    dispatch(createOrganizationAction());
    try {
      const existingMeta = selectedOrgData?.metadata || {};
      const metadata = {
        ...existingMeta,
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.address !== undefined && { address: data.address }),
      };

      const payload: any = {
        name: data.name,
        subdomain: data.subdomain,
        adminEmail: data.adminEmail,
        allowedDomain: data.allowedDomain,
        status: data.status,
        metadata
      };

      if (editOrgId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/organizations/${editOrgId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditOrgId(null);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/organizations`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsModalOpen(false);
      setSelectedOrgData(null);
      loadOrganizations();
    } catch (error: any) {
      dispatch(createOrganizationFailure(error.message));
      alert(`Failed to ${editOrgId ? 'update' : 'create'} organization`);
    }
  };

  const handleEdit = (org: any) => {
    setSelectedOrgData({
      name: org.name || '',
      subdomain: org.subdomain || '',
      adminEmail: org.adminEmail || '',
      allowedDomain: org.allowedDomain || '',
      status: org.status || 'ACTIVE',
      logo: org.logo || org.metadata?.logo || '',
      address: org.address || org.metadata?.address || '',
      metadata: org.metadata || {}
    });
    setEditOrgId(org.id);
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteOrgId(id);
    setOpenDropdownId(null);
  };

  const confirmDelete = async () => {
    if (!deleteOrgId) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/organizations/${deleteOrgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadOrganizations();
    } catch (error) {
      alert('Failed to delete organization');
    }
    setDeleteOrgId(null);
  };

  const handleRestore = async (id: string) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/organizations/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadOrganizations();
      loadDeletedOrganizations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to restore organization');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <h1>Organizations List</h1>
          <p>View and manage organizations</p>
        </div>
        
        {canEdit && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            Add Organization
          </button>
        )}
      </div>

      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'active' ? styles.active : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Building2 size={16} /> All Organizations ({organizations.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'deleted' ? styles.active : ''}`}
          onClick={() => { setActiveTab('deleted'); loadDeletedOrganizations(); }}
        >
          <RotateCcw size={16} /> Recently Deleted ({deletedOrganizations.length})
        </button>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableToolbar}>
          <SearchInput 
            placeholder="Search organization..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ position: 'relative' }}>
            <button className={styles.filterBtn} onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter />
              Filters
            </button>
            {isFilterOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '12px', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '180px' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Sort By</div>
                {[
                  { value: 'NEWEST', label: 'Newest to Oldest' },
                  { value: 'OLDEST', label: 'Oldest to Newest' },
                  { value: 'A_Z', label: 'A to Z' },
                  { value: 'Z_A', label: 'Z to A' }
                ].map(sort => (
                  <label key={sort.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px', cursor: 'pointer', fontSize: '14px' }}>
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

                <div style={{ fontWeight: '600', marginTop: '16px', marginBottom: '8px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Filter by Status</div>
                {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map(status => (
                  <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px', cursor: 'pointer', fontSize: '14px' }}>
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

        {((activeTab === 'active' && status === 'loading') || (activeTab === 'deleted' && loadingDeleted)) && <p style={{ padding: 20 }}>Loading...</p>}
        
        {activeTab === 'active' && status !== 'loading' && (
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Admin Email</th>
                <th>Created Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizations.map((org) => (
                <tr key={org.id}>
                  <td>
                    <div className={styles.orgCell}>
                      {(() => {
                        const logoUrl = org.logo || org.metadata?.logo || org.metadata?.logoUrl;
                        if (logoUrl) {
                          return <img src={logoUrl} alt={org.name} className={styles.orgLogo} />;
                        }
                        return (
                          <div className={styles.orgAvatar}>
                            {getInitials(org.name)}
                          </div>
                        );
                      })()}
                      <div className={styles.orgInfo}>
                        <span 
                          className={styles.orgName} 
                          onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                          style={{ cursor: 'pointer', color: '#0f172a' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                        >
                          {org.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{org.adminEmail || 'N/A'}</td>
                  <td>{formatDate(org.createdAt)}</td>
                  <td>
                    <div className={`${styles.statusBadge} ${styles[org.status?.toLowerCase()] || ''}`}>
                      <span className={styles.dot}></span>
                      {org.status}
                    </div>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => setOpenDropdownId(openDropdownId === org.id ? null : org.id)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openDropdownId === org.id && (
                      <div style={{ position: 'absolute', right: '32px', top: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', minWidth: '175px', padding: '6px 0' }}>
                        <button 
                          onClick={() => { setOpenDropdownId(null); navigate(`/dashboard/organizations/${org.id}`); }} 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1e293b', fontWeight: 500 }}
                        >
                          <Building2 size={14} color="#2563eb" /> Organization Details
                        </button>
                        {canEdit && (
                          <>
                            <button 
                              onClick={() => { setOpenDropdownId(null); handleEdit(org); }} 
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#1e293b', fontWeight: 500 }}
                            >
                              <Pencil size={14} color="#64748b" /> Edit
                            </button>
                            <button 
                              onClick={() => { setOpenDropdownId(null); handleDeleteClick(org.id); }} 
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '13px', fontWeight: 500 }}
                            >
                              <Trash2 size={14} color="#ef4444" /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredOrganizations.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No organizations found</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}

        {activeTab === 'deleted' && !loadingDeleted && (
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Organization</th>
                <th>Admin Email</th>
                <th>Created Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeletedOrganizations.map((org) => (
                <tr key={org.id}>
                  <td>
                    <div className={styles.orgCell}>
                      {(() => {
                        const logoUrl = org.logo || org.metadata?.logo || org.metadata?.logoUrl;
                        if (logoUrl) {
                          return <img src={logoUrl} alt={org.name} className={styles.orgLogo} />;
                        }
                        return (
                          <div className={styles.orgAvatar}>
                            {getInitials(org.name)}
                          </div>
                        );
                      })()}
                      <div className={styles.orgInfo}>
                        <span 
                          className={styles.orgName} 
                          onClick={() => navigate(`/dashboard/organizations/${org.id}`)}
                          style={{ cursor: 'pointer', color: '#0f172a' }}
                        >
                          {org.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{org.adminEmail || 'N/A'}</td>
                  <td>{formatDate(org.createdAt)}</td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '4px' }}>
                      DELETED
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {canEdit && (
                      <button className={styles.restoreBtn} onClick={() => handleRestore(org.id)}>
                        <RotateCcw size={14} /> Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDeletedOrganizations.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No recently deleted organizations</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        )}

        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled><ChevronLeft size={16} /></button>
          <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
          <button className={styles.pageBtn}><ChevronRight size={16} /></button>
        </div>
      </div>

      <OrganizationFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditOrgId(null); setSelectedOrgData(null); }}
        onSubmit={handleFormSubmit}
        initialData={selectedOrgData}
        isEdit={!!editOrgId}
        showHrmsOption={false}
      />

      <Modal
        isOpen={!!deleteOrgId}
        onClose={() => setDeleteOrgId(null)}
        title="Confirm Deletion"
        subtitle="This action is permanent and cannot be undone."
        width="460px"
      >
        <p style={{ margin: '0 0 20px 0', color: '#475569', lineHeight: 1.5 }}>
          Are you sure you want to delete this organization? All associated data and user access will be removed.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <button 
            onClick={() => setDeleteOrgId(null)} 
            style={{ padding: '9px 18px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', color: '#475569', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={confirmDelete} 
            style={{ padding: '9px 20px', border: 'none', borderRadius: '8px', background: '#ef4444', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            Delete Organization
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Organizations;
