import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Mail, Calendar, Code, Pencil } from 'lucide-react';
import { OrganizationFormModal, type OrganizationFormData } from '../components/organizations/OrganizationFormModal';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import axios from 'axios';
import styles from './OrganizationDetails.module.scss';

const OrganizationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<OrganizationFormData>>({});

  const fetchOrg = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/organizations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrg(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load organization details');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (id) {
      fetchOrg();
    }
  }, [id, fetchOrg]);

  const handleOpenEdit = () => {
    if (!org) return;
    setFormData({
      name: org.name || '',
      subdomain: org.subdomain || '',
      adminEmail: org.adminEmail || '',
      allowedDomain: org.allowedDomain || '',
      status: org.status || 'ACTIVE',
      logo: org.logo || org.metadata?.logo || '',
      address: org.address || org.metadata?.address || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (data: OrganizationFormData) => {
    try {
      const updatedMetadata = {
        ...(org.metadata || {}),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.address !== undefined && { address: data.address })
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/organizations/${id}`, {
        name: data.name,
        subdomain: data.subdomain,
        adminEmail: data.adminEmail,
        allowedDomain: data.allowedDomain,
        status: data.status,
        logo: data.logo,
        metadata: updatedMetadata
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsEditModalOpen(false);
      fetchOrg();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update organization');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard/organizations')}>
          <ArrowLeft size={16} /> Back to Organizations
        </button>
        <p style={{ padding: '24px 0' }}>Loading organization details...</p>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className={styles.pageWrapper}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard/organizations')}>
          <ArrowLeft size={16} /> Back to Organizations
        </button>
        <div style={{ padding: '24px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginTop: '16px' }}>
          {error || 'Organization not found'}
        </div>
      </div>
    );
  }

  const logoUrl = org.logo || org.metadata?.logo || org.metadata?.logoUrl;

  return (
    <div className={styles.pageWrapper}>
      <button className={styles.backBtn} onClick={() => navigate('/dashboard/organizations')}>
        <ArrowLeft size={16} /> Back to Organizations
      </button>

      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.orgHeaderInfo}>
          {logoUrl ? (
            <img src={logoUrl} alt={org.name} className={styles.orgLogo} />
          ) : (
            <div className={styles.orgAvatar}>
              {getInitials(org.name)}
            </div>
          )}
          <div className={styles.headerText}>
            <h1>
              {org.name}
              <span className={`${styles.statusBadge} ${styles[org.status?.toLowerCase()] || ''}`}>
                <span className={styles.dot}></span>
                {org.status || 'ACTIVE'}
              </span>
            </h1>
            <p>ID: #{org.id}</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          {canEdit && (
            <button 
              className="btn-primary" 
              onClick={handleOpenEdit}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
            >
              <Pencil size={16} /> Edit Organization
            </button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className={styles.detailsGrid}>
        {/* Domain & URL Information */}
        <div className={styles.infoCard}>
          <h3>
            <Globe size={18} /> Domain & Routing Details
          </h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Subdomain</span>
              <span className={styles.value}>{org.subdomain || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Slug Domain</span>
              <span className={styles.value}>
                {org.slugDomain ? (
                  <a href={`http://${org.slugDomain}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                    {org.slugDomain}
                  </a>
                ) : 'N/A'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Primary Domain</span>
              <span className={styles.value}>{org.domain || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Allowed Email Domain</span>
              <span className={styles.value}>{org.allowedDomain || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Administration & Access */}
        <div className={styles.infoCard}>
          <h3>
            <Mail size={18} /> Admin & Access Control
          </h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Admin Email</span>
              <span className={styles.value}>{org.adminEmail || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Deletion Status</span>
              <div className={`${styles.booleanTag} ${org.isDeleted ? styles.no : styles.yes}`}>
                {org.isDeleted ? 'Deleted' : 'Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className={styles.infoCard}>
          <h3>
            <Calendar size={18} /> System Timestamps
          </h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Created At</span>
              <span className={styles.value}>{formatDate(org.createdAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Last Updated At</span>
              <span className={styles.value}>{formatDate(org.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className={styles.infoCard} style={{ gridColumn: '1 / -1' }}>
          <h3>
            <Code size={18} /> Additional Metadata
          </h3>
          {org.metadata && Object.keys(org.metadata).length > 0 ? (
            <pre className={styles.jsonBox}>
              {JSON.stringify(org.metadata, null, 2)}
            </pre>
          ) : (
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No metadata configured for this organization.</p>
          )}
        </div>
      </div>

      {/* Edit Organization Modal */}
      <OrganizationFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={formData}
        isEdit={true}
        showHrmsOption={true}
      />
    </div>
  );
};

export default OrganizationDetails;
