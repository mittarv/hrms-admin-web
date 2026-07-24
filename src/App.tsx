import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type {RootState} from './store';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import Organizations from './pages/Organizations';
import OrganizationDetails from './pages/OrganizationDetails';
import UsersPage from './pages/UsersPage';
import { SessionExpiredModal } from './components/ui/SessionExpiredModal/SessionExpiredModal';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <SessionExpiredModal />
      <Routes>
        <Route path="/login" element={<Login />} />
        
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
    </Router>
  );
}

export default App;
