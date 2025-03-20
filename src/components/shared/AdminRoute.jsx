import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading">טוען...</div>;
  }

  return isAdmin() ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;