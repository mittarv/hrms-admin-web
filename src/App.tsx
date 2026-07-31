import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import axios from 'axios';
import type { RootState } from './store';
import { syncUser } from './store/slices/authSlice';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import Organizations from './pages/Organizations';
import OrganizationDetails from './pages/OrganizationDetails';
import UsersPage from './pages/UsersPage';
import AcceptInvite from './pages/AcceptInvite';
import { SessionExpiredModal } from './components/ui/SessionExpiredModal/SessionExpiredModal';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleSyncProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user?.id && token) {
      axios.get(`${import.meta.env.VITE_API_URL}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data?.data) {
          dispatch(syncUser(res.data.data));
        }
      })
      .catch(err => console.error('Failed to sync user data:', err));
    }
  }, [isAuthenticated, user?.id, token, dispatch]);

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <SessionExpiredModal />
      <RoleSyncProvider>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="organizations" element={<Organizations />} />
          <Route path="organizations/:id" element={<OrganizationDetails />} />
          <Route path="users" element={<UsersPage />} />
          {/* Add more routes here later */}
        </Route>

        <Route path="/" element={<Navigate to="/dashboard/organizations" replace />} />
      </Routes>
      </RoleSyncProvider>
    </Router>
  );
}

export default App;
