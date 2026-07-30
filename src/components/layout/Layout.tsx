import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Building2, Users, Menu, X, LogOut } from 'lucide-react';
// import { Building2, Users, Settings, LifeBuoy, Menu, X, LogOut } from 'lucide-react';

import { SearchInput } from '../ui/SearchInput/SearchInput';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import styles from './Layout.module.scss';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'AD';
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <div 
        className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}
      >
        <div className={styles.brand}>
          <h2 className={styles.brandTitle}>
            <span className={styles.extBold}>EXT</span>
            <span className={styles.indiaLight}>India</span>
          </h2>
          <p className={styles.brandSubtitle}>HRMS Admin Portal</p>
          {isMobileMenuOpen && (
            <button 
              className={styles.closeBtn} 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ marginLeft: 'auto', display: 'flex', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className={styles.navMenu}>
          <NavLink 
            to="/dashboard/organizations" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Building2 />
            Organizations
          </NavLink>
          <NavLink 
            to="/dashboard/users" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Users />
            Users
          </NavLink>
          {/* <NavLink 
            to="/dashboard/appointments" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Calendar />
            Appointments
          </NavLink>
          <NavLink 
            to="/dashboard/knowledge-base" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <BookOpen />
            Knowledge Base
          </NavLink> */}
        </nav>

        <div className={styles.bottomMenu}>
          {/* <NavLink 
            to="/dashboard/settings" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Settings />
            Settings
          </NavLink> */}
          {/* <NavLink 
            to="/dashboard/support" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <LifeBuoy />
            Support
          </NavLink> */}
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className={styles.mobileMenuBtn} 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ display: 'flex', color: 'var(--text-main)', border: 'none', background: 'none' }}
            >
              <Menu size={24} />
            </button>
            <div className={styles.searchContainer}>
              <SearchInput placeholder="Search everywhere..." />
            </div>
          </div>
          <div className={styles.actions}>
            <div className={styles.userInfo}>
              {user?.picture && !imgError ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'Admin User'} 
                  className={styles.userAvatar} 
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  {getInitials(user?.name, user?.email)}
                </div>
              )}
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.name || user?.email || 'Admin'}</span>
                <span className={styles.userRole}>{user?.role?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
