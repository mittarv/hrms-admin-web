import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Upload, Trash2, Building2 } from 'lucide-react';

export interface OrganizationFormData {
  name: string;
  subdomain: string;
  domain?: string;
  adminEmail: string;
  allowedDomain: string;
  status: string;
  logo?: string;
  address?: string;
  metadata?: Record<string, any>;
}

interface OrganizationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: OrganizationFormData) => Promise<void> | void;
  initialData?: Partial<OrganizationFormData> | null;
  isEdit?: boolean;
  showHrmsOption?: boolean;
}

export const OrganizationFormModal: React.FC<OrganizationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    subdomain: '',
    domain: '',
    adminEmail: '',
    allowedDomain: '',
    status: 'ACTIVE',
    logo: '',
    address: ''
  });

  const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
  // const [urlInput, setUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initialLogo = initialData?.logo || '';
      setFormData({
        name: initialData?.name || '',
        subdomain: initialData?.subdomain || '',
        domain: initialData?.domain || '',
        adminEmail: initialData?.adminEmail || '',
        allowedDomain: initialData?.allowedDomain || '',
        status: initialData?.status || 'ACTIVE',
        logo: initialLogo,
        address: initialData?.address || initialData?.metadata?.address || ''
      });

      if (initialLogo && !initialLogo.startsWith('data:image/')) {
        // setUrlInput(initialLogo);
        setLogoInputType('url');
      } else {
        // setUrlInput('');
        setLogoInputType('upload');
      }
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  /*
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setFormData(prev => ({ ...prev, logo: val }));
  };
  */

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
    // setUrlInput('');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBase64 = formData.logo?.startsWith('data:image/');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Organization' : 'Create New Organization'}
      subtitle={isEdit ? 'Update organization details, status, and domain configuration.' : 'Enter organization info to create a new isolated tenant environment.'}
      width="640px"
    >
      <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* LOGO SECTION - RENDER PREVIEW, DO NOT SHOW BASE64 STRING */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {/* Logo Preview Avatar */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '2px dashed #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative'
          }}>
            {formData.logo ? (
              <img 
                src={formData.logo} 
                alt="Organization Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            ) : (
              <Building2 size={32} color="#94a3b8" />
            )}
          </div>

          {/* Logo Control Options */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Organization Logo</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setLogoInputType('upload')}
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: logoInputType === 'upload' ? '#2563eb' : '#cbd5e1',
                    backgroundColor: logoInputType === 'upload' ? '#eff6ff' : '#ffffff',
                    color: logoInputType === 'upload' ? '#2563eb' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  File Upload
                </button>
                {/* <button
                  type="button"
                  onClick={() => setLogoInputType('url')}
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: logoInputType === 'url' ? '#2563eb' : '#cbd5e1',
                    backgroundColor: logoInputType === 'url' ? '#eff6ff' : '#ffffff',
                    color: logoInputType === 'url' ? '#2563eb' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Image URL
                </button> */}
              </div>
            </div>

            {/* File Upload Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1e293b',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <Upload size={14} color="#2563eb" />
                {formData.logo ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
              {formData.logo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#ef4444',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
              {isBase64 && (
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 500 }}>✓ Custom logo attached</span>
              )}
            </div>

            {/* Image URL Option (Commented Out)
            {logoInputType === 'url' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={urlInput}
                  onChange={handleUrlChange}
                  style={{
                    flexGrow: 1,
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
                {formData.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#ef4444',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
            */}
          </div>
        </div>

        {/* FORM FIELDS - 2-COLUMN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Organization Name *
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Acme Corp"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Subdomain *
            </label>
            <input
              required
              type="text"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleInputChange}
              placeholder="e.g. acme"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Admin Email
            </label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleInputChange}
              placeholder="admin@acme.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Custom / App Domain
            </label>
            <input
              type="text"
              name="domain"
              value={formData.domain || ''}
              onChange={handleInputChange}
              placeholder="e.g. hr.acme.com"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Allowed Email Domain
          </label>
          <input
            type="text"
            name="allowedDomain"
            value={formData.allowedDomain}
            onChange={handleInputChange}
            placeholder="e.g. acme.com"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Organization Address (Displayed on Payslips)
          </label>
          <textarea
            name="address"
            rows={2}
            value={formData.address || ''}
            onChange={handleInputChange}
            placeholder="e.g. Ashoka Bhopal Chambers, Begumpet, Secunderabad 500003"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#f8fafc',
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
              padding: '9px 20px',
              border: 'none',
              borderRadius: '8px',
              background: '#2563eb',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Organization'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
