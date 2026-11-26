/**
 * App.jsx
 * -------
 * Root component. Sets up:
 *   • AuthProvider  – makes login state available everywhere
 *   • BrowserRouter – enables client-side routing
 *   • Route tree    – maps URLs to pages
 *
 * Route structure:
 *   /                  → redirects to /login
 *   /login             → Login page (public)
 *   /dashboard         → protected, inside DashboardLayout
 *   /detection         → protected
 *   /records           → protected
 *   /map               → protected
 *   /reports           → protected
 *   /analytics         → protected
 *   /settings          → protected
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/AuthContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute  from './components/layout/ProtectedRoute';

// Pages
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Detection      from './pages/Detection';
import Records        from './pages/Records';
import MapView        from './pages/MapView';
import CitizenReports from './pages/CitizenReports';
import Analytics      from './pages/Analytics';
import Settings       from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected routes — all rendered inside DashboardLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"  element={<Dashboard />}      />
              <Route path="/detection"  element={<Detection />}       />
              <Route path="/records"    element={<Records />}          />
              <Route path="/map"        element={<MapView />}          />
              <Route path="/reports"    element={<CitizenReports />}   />
              <Route path="/analytics"  element={<Analytics />}        />
              <Route path="/settings"   element={<Settings />}         />
            </Route>
          </Route>

          {/* Catch-all: unknown URLs go to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
