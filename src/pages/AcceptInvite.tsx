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
  const [errorMessage, setErrorMessage] = useState<string>('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setErrorMessage('Invitation token is missing from the link.');
          setStatus('invalid');
          return;
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/verify-invite`,
          { token }
        );
        setEmail(response.data.email);
        setStatus('valid');
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.error ||
            'Your invitation link is invalid or has expired.'
        );
        setStatus('invalid');
      }
    };

    verifyToken();
  }, [token]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse?.credential) {
        alert('Google did not return a valid credential. Please try again.');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential,
        inviteToken: token,
      });

      const { user, token: authToken } = response.data;
      dispatch(setCredentials({ user, token: authToken }));
      navigate('/dashboard/organizations');
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(
        error?.response?.data?.error ||
          error?.message ||
          'Login failed. Please try again.'
      );
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Error');
    alert('Google Login failed. Check that this site origin is allowed in Google Cloud Console.');
  };

  return (
    <div className={styles.loginContainer}>
      <svg className={styles.topLeftDecoration} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="-100" y="-100" width="550" height="550" rx="180" fill="url(#acceptViolet1)" opacity="0.32" transform="rotate(-18)" />
        <rect x="-50" y="-160" width="600" height="600" rx="200" fill="url(#acceptViolet2)" opacity="0.25" transform="rotate(12)" />
        <defs>
          <linearGradient id="acceptViolet1" x1="0" y1="0" x2="550" y2="550" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#c084fc" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="acceptViolet2" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#ddd6fe" stopOpacity="0.6" />
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
              <p className={styles.subtitle}>
                {errorMessage || 'Your invitation link is invalid or has expired.'}
              </p>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
            </>
          )}

          {status === 'valid' && (
            <>
              <h2>Accept Invitation</h2>
              <p className={styles.subtitle}>
                Continue with Google using <strong>{email}</strong> to activate your access and sign in.
              </p>

              {!googleClientId ? (
                <p className={styles.subtitle} style={{ color: '#ef4444' }}>
                  Google Client ID is not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> and restart the frontend.
                </p>
              ) : (
                <div className={styles.googleBtnWrapper}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={false}
                    theme="filled_blue"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    width={320}
                    logo_alignment="left"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
