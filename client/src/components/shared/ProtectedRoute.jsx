import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ROLE_HOME = {
  student: '/student/courses',
  teacher: '/teacher/courses',
  admin: '/admin/overview',
};

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Role mismatch → redirect to own dashboard
  if (role && user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }

  return children;
}
