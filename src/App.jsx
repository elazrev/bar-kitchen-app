import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminRoute from './components/shared/AdminRoute';
import Login from './features/auth/Login';
import Opening from './features/opening/Opening';
import Recipes from './features/recipes/Recipes';
import RecipeDetails from './features/recipes/RecipeDetails';
import Closing from './features/closing/Closing';
import Reports from './features/reports/Reports';
import Shortage from './features/reports/Shortage';
import NotFound from './components/shared/NotFound';
import Dashboard from './features/admin/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">טוען...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/opening" />} />
          <Route path="/opening" element={<Opening />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/closing" element={<Closing />} />
          <Route path="/shortage" element={<Shortage />} />
          
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;