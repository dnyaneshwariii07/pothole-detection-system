/**
 * StatCard
 * --------
 * The metric cards shown at the top of the Dashboard.
 *
 * Props:
 *   title   – label text
 *   value   – the big number
 *   icon    – emoji or JSX icon
 *   color   – Tailwind color class for the icon background  e.g. "bg-blue-100 text-blue-600"
 *   trend   – optional string like "+12% this month"
 */

export default function StatCard({ title, value, icon, color, trend }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Icon circle */}
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl ${color}`}>
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">
          {value.toLocaleString()}
        </p>
        {trend && (
          <p className="text-xs text-slate-400 mt-1">{trend}</p>
        )}
      </div>
    </div>
  );
}
