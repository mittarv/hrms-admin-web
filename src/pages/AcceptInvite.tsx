import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.scss';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [email, setEmail] = useState<string>('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setStatus('invalid');
          return;
        }
        
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-invite`, { token });
        setEmail(response.data.email);
        setStatus('valid');
      } catch (error) {
        setStatus('invalid');
      }
    };
    
    verifyToken();
  }, [token]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential,
        inviteToken: token // Pass the invite token to authorize the activation
      });

      const { user, token: authToken } = response.data;
      dispatch(setCredentials({ user, token: authToken }));
      navigate('/dashboard/organizations');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Error');
    alert('Google Login failed.');
  };

  return (
    <div className={styles.loginContainer}>
      {/* Background decorations (copied from Login for consistent UI) */}
      <svg className={styles.topLeftDecoration} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="-100" y="-100" width="550" height="550" rx="180" fill="url(#violet1)" opacity="0.32" transform="rotate(-18)" />
        <rect x="-50" y="-160" width="600" height="600" rx="200" fill="url(#violet2)" opacity="0.25" transform="rotate(12)" />
        <rect x="-140" y="-30" width="480" height="480" rx="160" fill="url(#violet3)" opacity="0.38" transform="rotate(-6)" />
        <defs>
          <linearGradient id="violet1" x1="0" y1="0" x2="550" y2="550" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#c084fc" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="violet2" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#ddd6fe" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="violet3" x1="0" y1="0" x2="480" y2="480" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#e9d5ff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>

      <div className={styles.contentWrapper}>
        <div className={styles.logo}>
          <h1 className={styles.brandTitle}>
            <span className={styles.extBold}>EXT</span>
            <span className={styles.indiaLight}>India</span>
          </h1>
        </div>

        <div className={styles.loginCard}>
          {status === 'loading' && (
            <>
              <h2>Verifying Invite...</h2>
              <p className={styles.subtitle}>Please wait while we verify your invitation.</p>
            </>
          )}

          {status === 'invalid' && (
            <>
              <h2>Invalid Invite</h2>
              <p className={styles.subtitle}>Your invitation link is invalid or has expired.</p>
              <button 
                onClick={() => navigate('/login')} 
                style={{ marginTop: '1rem', padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
              >
                Go to Login
              </button>
            </>
          )}

          {status === 'valid' && (
            <>
              <h2>Accept Invitation</h2>
              <p className={styles.subtitle}>Please continue with Google using <strong>{email}</strong> to accept your invitation and sign in.</p>
              
              <div className={styles.googleBtnWrapper} style={{ marginTop: '24px' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  shape="pill"
                  text="continue_with"
                  width="280"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
