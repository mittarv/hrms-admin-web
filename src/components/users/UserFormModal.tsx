import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { User, Mail, Shield, Building2, UserPlus, CheckCircle, X, ChevronDown } from 'lucide-react';

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  organizationIds: string[];
  status?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: Partial<UserFormData & { organizationId?: string; organizations?: any[] }> | null;
  isEdit?: boolean;
  organizations?: any[];
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  organizations = []
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'ADMIN',
    organizationIds: [],
    status: 'INVITED'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData && isOpen) {
      let orgIds: string[] = [];
      if (initialData.organizationIds && initialData.organizationIds.length > 0) {
        orgIds = initialData.organizationIds;
      } else if (initialData.organizations && initialData.organizations.length > 0) {
        orgIds = initialData.organizations.map((o: any) => o.organizationId || o.id);
      } else if (initialData.organizationId) {
        orgIds = [initialData.organizationId];
      }

      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || 'ADMIN',
        organizationIds: orgIds,
        status: initialData.status || 'INVITED'
      });
    } else if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        role: 'ADMIN',
        organizationIds: [],
        status: 'INVITED'
      });
      setIsDropdownOpen(false);
    }
  }, [initialData, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handled by parent handler
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOrg = (orgId: string) => {
    setFormData(prev => {
      const exists = prev.organizationIds.includes(orgId);
      return {
        ...prev,
        organizationIds: exists
          ? prev.organizationIds.filter(id => id !== orgId)
          : [...prev.organizationIds, orgId]
      };
    });
  };

  const removeOrg = (orgId: string) => {
    setFormData(prev => ({
      ...prev,
      organizationIds: prev.organizationIds.filter(id => id !== orgId)
    }));
  };

  const getOrgName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org ? org.name : 'Unknown';
  };
  const isSuperAdmin = formData.role === 'SUPER_ADMIN';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User Access' : 'Invite New Admin User'}
      subtitle={isEdit ? 'Update user role, access scope, or status.' : 'Send an invitation to grant admin access to the portal.'}
      width="580px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Full Name *
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              required
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Email Address *
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              required
              disabled={isEdit}
              type="email"
              placeholder="name@organization.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: isEdit ? '#f8fafc' : '#ffffff',
                cursor: isEdit ? 'not-allowed' : 'text',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Role & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '1fr 1fr' : '1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Access Role *
            </label>
            <div style={{ position: 'relative' }}>
              <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                <option value="ADMIN">Admin (Manage Orgs & Users)</option>
                <option value="HR_MANAGER">HR Manager (Manage Details)</option>
                <option value="VIEWER">Viewer (Read-Only)</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INVITED">INVITED</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          )}
        </div>

        {/* Assigned Organization Scope - Multi-select */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Assigned Organization Scope
          </label>

          {isSuperAdmin ? (
            <div style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Building2 size={16} />
              Super Admins automatically have access to all organizations.
            </div>
          ) : (
            <>
              {/* Dropdown Trigger */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: `1px solid ${isDropdownOpen ? '#2563eb' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    color: '#64748b'
                  }}
                >
                  <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <span>
                    {formData.organizationIds.length === 0
                      ? 'Select organizations...'
                      : `${formData.organizationIds.length} organization${formData.organizationIds.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown size={16} style={{ color: '#94a3b8', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>

                {/* Dropdown List */}
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    zIndex: 999,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {organizations.length === 0 ? (
                      <div style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
                        No organizations available
                      </div>
                    ) : (
                      organizations.map((org) => {
                        const isSelected = formData.organizationIds.includes(org.id);
                        return (
                          <div
                            key={org.id}
                            onClick={() => toggleOrg(org.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 14px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                              borderBottom: '1px solid #f1f5f9',
                              transition: 'background-color 0.15s'
                            }}
                            onMouseEnter={(e) => { if (!isSelected) (e.currentTarget.style.backgroundColor = '#f8fafc'); }}
                            onMouseLeave={(e) => { if (!isSelected) (e.currentTarget.style.backgroundColor = 'transparent'); }}
                          >
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: isSelected ? '2px solid #2563eb' : '2px solid #cbd5e1',
                              backgroundColor: isSelected ? '#2563eb' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'all 0.15s'
                            }}>
                              {isSelected && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: isSelected ? 600 : 400 }}>
                                {org.name}
                              </div>
                              {org.subdomain && (
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>
                                  {org.subdomain}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Selected Org Chips */}
              {formData.organizationIds.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '10px'
                }}>
                  {formData.organizationIds.map(orgId => (
                    <div
                      key={orgId}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 8px 5px 10px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#1e40af',
                        fontWeight: 500
                      }}
                    >
                      <Building2 size={13} style={{ color: '#3b82f6' }} />
                      {getOrgName(orgId)}
                      <button
                        type="button"
                        onClick={() => removeOrg(orgId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#dbeafe',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#bfdbfe')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dbeafe')}
                      >
                        <X size={12} style={{ color: '#1e40af' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              border: 'none',
              borderRadius: '8px',
              background: 'var(--primary-color, #2563eb)',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isEdit ? <CheckCircle size={16} /> : <UserPlus size={16} />}
            {isSubmitting ? (isEdit ? 'Saving...' : 'Sending Invite...') : (isEdit ? 'Save Changes' : 'Send Invitation')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
