import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '../store/slices/authSlice';
import axios from 'axios';
import styles from './Login.module.scss';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });

      const { user, token } = response.data;
      dispatch(setCredentials({ user, token }));
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
      {/* Top Left Violet Gradient Decoration - Expanded Distribution */}
      <svg className={styles.topLeftDecoration} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="-100" y="-100" width="550" height="550" rx="180" fill="url(#violet1)" opacity="0.32" transform="rotate(-18)" />
        <rect x="-50" y="-160" width="600" height="600" rx="200" fill="url(#violet2)" opacity="0.25" transform="rotate(12)" />
        <rect x="-140" y="-30" width="480" height="480" rx="160" fill="url(#violet3)" opacity="0.38" transform="rotate(-6)" />
        <rect x="100" y="-200" width="420" height="420" rx="140" fill="url(#violet4)" opacity="0.2" transform="rotate(25)" />
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
          <linearGradient id="violet4" x1="0" y1="0" x2="420" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d8b4fe" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom Right Violet Gradient Decoration - Expanded Distribution */}
      <svg className={styles.bottomRightDecoration} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="250" y="250" width="600" height="600" rx="200" fill="url(#violet5)" opacity="0.32" transform="rotate(22 550 550)" />
        <rect x="300" y="160" width="580" height="580" rx="190" fill="url(#violet6)" opacity="0.25" transform="rotate(-12 590 450)" />
        <rect x="160" y="300" width="520" height="520" rx="170" fill="url(#violet7)" opacity="0.38" transform="rotate(16 420 560)" />
        <rect x="180" y="100" width="450" height="450" rx="150" fill="url(#violet8)" opacity="0.2" transform="rotate(-25 405 325)" />
        <defs>
          <linearGradient id="violet5" x1="250" y1="250" x2="850" y2="850" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed" />
            <stop offset="1" stopColor="#c084fc" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="violet6" x1="300" y1="160" x2="880" y2="740" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#ddd6fe" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="violet7" x1="160" y1="300" x2="680" y2="820" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#e9d5ff" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="violet8" x1="180" y1="100" x2="630" y2="550" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c084fc" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        {/* Brand Logo & Name */}
        <div className={styles.logo}>
          <h1 className={styles.brandTitle}>
            <span className={styles.extBold}>EXT</span>
            <span className={styles.indiaLight}>India</span>
          </h1>
        </div>

        {/* Centered Login Card */}
        <div className={styles.loginCard}>
          <h2>Welcome</h2>
          <p className={styles.subtitle}>Sign in or create an account to continue</p>

          <div className={styles.googleBtnWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              width="280"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
