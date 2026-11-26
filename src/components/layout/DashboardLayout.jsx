/**
 * DashboardLayout
 * ---------------
 * The shell that every authenticated page renders inside.
 * Layout:  [Sidebar | Header + Page content]
 *
 * Each page passes its title via the `title` prop.
 * The <Outlet /> is a React Router placeholder – it renders
 * whichever child route is currently active.
 */

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

// Map URL paths → human-readable page titles
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/detection': 'Pothole Detection',
  '/records':   'Pothole Records',
  '/map':       'Map View',
  '/reports':   'Citizen Reports',
  '/analytics': 'Analytics & Reports',
  '/settings':  'Settings',
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'PotHole System';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto p-6 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
