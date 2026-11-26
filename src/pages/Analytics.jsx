/**
 * Analytics Page
 * --------------
 * Monthly bar chart, severity pie, status breakdown, and an export button.
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar,
} from 'recharts';

import { monthlyDetections, severityData, dashboardStats } from '../data/mockData';

const statusData = [
  { name: 'Resolved',    value: 635, fill: '#22c55e' },
  { name: 'In Progress', value: 213, fill: '#3b82f6' },
  { name: 'Pending',     value: 429, fill: '#f59e0b' },
];

function handleExport() {
  const rows = [
    ['Month', 'Detections', 'Resolved'],
    ...monthlyDetections.map(m => [m.month, m.detections, m.resolved]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'pothole_report.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function Analytics() {
  const resolutionRate = ((dashboardStats.resolvedPotholes / dashboardStats.totalPotholes) * 100).toFixed(1);

  return (
    <div className="space-y-6">

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Detected',   value: dashboardStats.totalPotholes,   color: 'text-blue-600'   },
          { label: 'Critical',         value: dashboardStats.criticalPotholes, color: 'text-red-600'    },
          { label: 'Resolution Rate',  value: `${resolutionRate}%`,           color: 'text-green-600'  },
          { label: 'Avg / Month',      value: Math.round(dashboardStats.totalPotholes / 12), color: 'text-amber-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">Monthly Detection Statistics</h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            ⬇ Export CSV
          </button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyDetections} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="detections" fill="#3b82f6" name="Detected"  radius={[4,4,0,0]} />
            <Bar dataKey="resolved"   fill="#22c55e" name="Resolved"  radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Severity + Status side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Severity pie */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {severityData.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status radial bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Repair Status Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={statusData}>
              <RadialBar minAngle={15} background dataKey="value" label={{ position: 'insideStart', fill: '#fff', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
