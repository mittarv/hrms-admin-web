import React, { Component, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.scss';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';

const INVITE_TOKEN_KEY = 'hrms_admin_invite_token';

class GoogleButtonErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Google Sign-In failed to render:', error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [email, setEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [googleRenderFailed, setGoogleRenderFailed] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const apiBase = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setErrorMessage('Invitation token is missing from the link.');
          setStatus('invalid');
          return;
        }

        // Persist so Login can finish activation if Google button fails on this page
        sessionStorage.setItem(INVITE_TOKEN_KEY, token);

        if (!apiBase) {
          setErrorMessage('API URL is not configured (VITE_API_URL).');
          setStatus('invalid');
          return;
        }

        const response = await axios.post(
          `${apiBase}/auth/verify-invite`,
          { token },
          { timeout: 15000 }
        );
        setEmail(response.data.email || '');
        setStatus('valid');
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.error ||
            error?.message ||
            'Your invitation link is invalid or has expired.'
        );
        setStatus('invalid');
      }
    };

    verifyToken();
  }, [token, apiBase]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse?.credential) {
        alert('Google did not return a valid credential. Please try again.');
        return;
      }

      const response = await axios.post(`${apiBase}/auth/google`, {
        token: credentialResponse.credential,
        inviteToken: token,
      });

      const { user, token: authToken } = response.data;
      sessionStorage.removeItem(INVITE_TOKEN_KEY);
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
    setGoogleRenderFailed(true);
    alert('Google Login failed. You can continue via the Login page.');
  };

  return (
    <div className={styles.loginContainer} style={{ minHeight: '100vh', background: '#fafafa' }}>
      <div className={styles.contentWrapper} style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 440, padding: '0 20px', margin: '0 auto' }}>
        <div className={styles.logo} style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 className={styles.brandTitle} style={{ fontSize: 36, margin: 0 }}>
            <span className={styles.extBold} style={{ fontWeight: 800, color: '#7047ab' }}>EXT</span>
            <span className={styles.indiaLight} style={{ fontWeight: 300, color: '#2d3748' }}>India</span>
          </h1>
        </div>

        <div
          className={styles.loginCard}
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '38px 32px',
            textAlign: 'center',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
          }}
        >
          {status === 'loading' && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>
                Verifying Invite...
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                Please wait while we verify your invitation.
              </p>
            </>
          )}

          {status === 'invalid' && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>
                Invalid Invite
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px', lineHeight: 1.4 }}>
                {errorMessage || 'Your invitation link is invalid or has expired.'}
              </p>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => navigate('/login')}
                style={{
                  marginTop: 8,
                  padding: '11px 20px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Go to Login
              </button>
            </>
          )}

          {status === 'valid' && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', margin: '0 0 6px' }}>
                Accept Invitation
              </h2>
              <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 20px', lineHeight: 1.4 }}>
                Continue with Google using <strong>{email}</strong> to activate your access and sign in.
              </p>

              {!googleClientId ? (
                <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
                  Google Client ID is not configured on this environment.
                </p>
              ) : !googleRenderFailed ? (
                <div className={styles.googleBtnWrapper} style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }}>
                  <GoogleButtonErrorBoundary onError={() => setGoogleRenderFailed(true)}>
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
                  </GoogleButtonErrorBoundary>
                </div>
              ) : null}

              {(googleRenderFailed || !googleClientId) && (
                <p style={{ color: '#64748b', fontSize: 13, margin: '16px 0 0', lineHeight: 1.5 }}>
                  Google button could not load here. Your invite was saved — open Login and sign in with the invited Google account.
                </p>
              )}

              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  marginTop: 20,
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Continue to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
export { INVITE_TOKEN_KEY };
