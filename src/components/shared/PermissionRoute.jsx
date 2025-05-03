// src/components/shared/PermissionRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PermissionRoute = ({ children, permissions = [], requireAll = false }) => {
  const { user, hasUserPermission } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // אם לא צריך הרשאות ספציפיות, מאפשר כניסה
  if (permissions.length === 0) {
    return children;
  }
  
  // בדיקת הרשאות
  const hasRequiredPermissions = requireAll
    ? permissions.every(permission => hasUserPermission(permission))
    : permissions.some(permission => hasUserPermission(permission));
  
  if (!hasRequiredPermissions) {
    // אם למשתמש אין הרשאות, מפנים אותו לדף מתאים
    if (user.role === 'tips_manager') {
      return <Navigate to="/admin/tips" />;
    }
    return <Navigate to="/" />;
  }
  
  return children;
};

export default PermissionRoute;