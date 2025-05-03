import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import PermissionRoute from './components/shared/PermissionRoute';
import { PERMISSIONS } from './services/api';
import Login from './features/auth/Login';
import Opening from './features/opening/Opening';
import Recipes from './features/recipes/Recipes';
import RecipeDetails from './features/recipes/RecipeDetails';
import Closing from './features/closing/Closing';
import Reports from './features/reports/Reports';
import Shortage from './features/reports/Shortage';
import NotFound from './components/shared/NotFound';
import Dashboard from './features/admin/Dashboard';
import TipsManagement from './features/admin/tips/TipsManagement';

function App() {
  const { user, loading, canAccessKitchenContent } = useAuth();

  if (loading) {
    return <div className="loading">טוען...</div>;
  }

  // נתיב ברירת מחדל לפי הרשאות משתמש
  const getDefaultRoute = () => {
    if (!user) return '/login';
    
    if (user.role === 'tips_manager') {
      return '/admin/tips';
    }
    
    return '/opening';
  };

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={getDefaultRoute()} />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
          
          {/* דפי מטבח - רק למי שיש הרשאות מטבח */}
          <Route
            path="/opening"
            element={
              <PermissionRoute permissions={[PERMISSIONS.VIEW_RECIPES, PERMISSIONS.MANAGE_KITCHEN]}>
                <Opening />
              </PermissionRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <PermissionRoute permissions={[PERMISSIONS.VIEW_RECIPES, PERMISSIONS.MANAGE_KITCHEN]}>
                <Recipes />
              </PermissionRoute>
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <PermissionRoute permissions={[PERMISSIONS.VIEW_RECIPES, PERMISSIONS.MANAGE_KITCHEN]}>
                <RecipeDetails />
              </PermissionRoute>
            }
          />
          <Route
            path="/closing"
            element={
              <PermissionRoute permissions={[PERMISSIONS.VIEW_RECIPES, PERMISSIONS.MANAGE_KITCHEN]}>
                <Closing />
              </PermissionRoute>
            }
          />
          <Route
            path="/shortage"
            element={
              <PermissionRoute permissions={[PERMISSIONS.VIEW_RECIPES, PERMISSIONS.MANAGE_KITCHEN]}>
                <Shortage />
              </PermissionRoute>
            }
          />
          
          {/* דפי אדמין - רק למי שיש הרשאות מתאימות */}
          <Route
            path="/admin"
            element={
              <PermissionRoute permissions={[PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_KITCHEN]}>
                <Dashboard />
              </PermissionRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PermissionRoute permissions={[PERMISSIONS.MANAGE_USERS, PERMISSIONS.VIEW_TIP_REPORTS]}>
                <Reports />
              </PermissionRoute>
            }
          />
          <Route
            path="/admin/tips/*"
            element={
              <PermissionRoute permissions={[
                PERMISSIONS.MANAGE_TIPS,
                PERMISSIONS.VIEW_TIP_REPORTS,
                PERMISSIONS.MANAGE_EMPLOYEES
              ]}>
                <TipsManagement />
              </PermissionRoute>
            }
          />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;