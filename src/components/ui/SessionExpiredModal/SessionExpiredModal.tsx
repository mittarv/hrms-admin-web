import React from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { Modal } from '../Modal/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store';

export const SessionExpiredModal: React.FC = () => {
  const dispatch = useDispatch();
  const isSessionExpired = useSelector((state: RootState) => state.auth.isSessionExpired);

  if (!isSessionExpired) return null;

  const handleReLogin = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <Modal
      isOpen={isSessionExpired}
      onClose={handleReLogin}
      title="Session Expired"
      subtitle="Your active login session has ended"
      width="440px"
    >
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div 
          style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: '#fef2f2', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px auto',
            border: '1px solid #fee2e2'
          }}
        >
          <ShieldAlert size={32} color="#ef4444" />
        </div>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
          Session Timed Out
        </h3>
        
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
          Your authentication token has expired. Please sign in again to access the admin panel.
        </p>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleReLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '11px 20px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
          >
            <LogOut size={18} />
            Log In Again
          </button>
        </div>
      </div>
    </Modal>
  );
};
