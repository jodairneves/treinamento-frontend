import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="empty"><p>Carregando...</p></div>;
  if (!isAuthenticated) return <Navigate to={role === 'admin' ? '/admin/login' : '/cliente/login'} replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}
