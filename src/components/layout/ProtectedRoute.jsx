/**
 * ProtectedRoute
 * --------------
 * Wraps any route that requires authentication.
 * If the user is not logged in, they are redirected to /login.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();
  // If not logged in, send to login. replace=true means the login page
  // won't appear in the browser history when the user logs in and navigates back.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
