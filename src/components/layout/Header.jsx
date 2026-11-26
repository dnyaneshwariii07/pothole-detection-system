/**
 * Header
 * ------
 * Top bar shown on every dashboard page.
 * Receives a `title` prop from each page so the heading updates dynamically.
 */

import { useAuth } from '../../services/AuthContext';

export default function Header({ title }) {
  const { user } = useAuth();

  // Format today's date nicely
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{today}</p>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {/* Red dot badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-xs font-bold">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user?.name ?? 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
