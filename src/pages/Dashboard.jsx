/**
 * Dashboard Page (Phase 2 — real API)
 * ------------------------------------
 * Fetches live stats from GET /api/dashboard/stats
 * Falls back to mock data if the backend is unreachable.
 */

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

import StatCard from '../components/ui/StatCard';
import SeverityBadge from '../components/ui/SeverityBadge';
import api from '../services/api';

import {
  dashboardStats as mockStats,
  monthlyDetections as mockMonthly,
  severityData as mockSeverity,
  potholes as mockPotholes,
  recentActivity,
} from '../data/mockData';

function ActivityDot({ type }) {
  const map = { detection: 'bg-red-500', resolved: 'bg-green-500', report: 'bg-blue-500', update: 'bg-amber-500' };
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${map[type] ?? 'bg-slate-400'}`} />;
}

export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, potholesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/potholes?limit=5'),
        ]);
        setStats(statsRes.data);
        setPotholes(potholesRes.data);
      } catch {
        // Backend not reachable — use mock data
        setStats({
          total_potholes:    mockStats.totalPotholes,
          critical_potholes: mockStats.criticalPotholes,
          pending_repairs:   mockStats.pendingRepairs,
          resolved_potholes: mockStats.resolvedPotholes,
          monthly_data:      mockMonthly,
          severity_data:     mockSeverity,
        });
        setPotholes(mockPotholes.slice(0, 5).map(p => ({
          id: p.id, location_name: p.location, severity: p.severity,
          status: p.status, confidence: p.confidence, created_at: p.detectedAt,
        })));
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm">Loading dashboard…</div>
      </div>
    );
  }

  const monthly  = stats?.monthly_data?.length  ? stats.monthly_data  : mockMonthly;
  const severity = stats?.severity_data?.length ? stats.severity_data : mockSeverity;

  return (
    <div className="space-y-6">

      {usingMock && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2.5 rounded-lg">
          ⚠️ Backend not reachable — showing mock data. Start the FastAPI server on port 8000.
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Potholes"   value={stats?.total_potholes    ?? 0} icon="🕳️" color="bg-blue-100 text-blue-600"   trend="All time" />
        <StatCard title="Critical"         value={stats?.critical_potholes ?? 0} icon="⚠️" color="bg-red-100 text-red-600"     trend="Needs immediate repair" />
        <StatCard title="Pending Repairs"  value={stats?.pending_repairs   ?? 0} icon="🔧" color="bg-amber-100 text-amber-600" trend="Awaiting maintenance" />
        <StatCard title="Resolved"         value={stats?.resolved_potholes ?? 0} icon="✅" color="bg-green-100 text-green-600" trend="Completed repairs" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Monthly Detections vs Resolutions</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="detections" stroke="#3b82f6" strokeWidth={2} dot={false} name="Detected" />
              <Line type="monotone" dataKey="resolved"   stroke="#22c55e" strokeWidth={2} dot={false} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={severity} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {severity.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {severity.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-600">{item.name}</span>
                <span className="text-xs font-semibold text-slate-800 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Recent Detections</h3>
            <a href="/records" className="text-xs text-blue-600 hover:underline font-medium">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">Location</th>
                  <th className="px-5 py-3 text-left font-medium">Severity</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {potholes.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">No detections yet.</td></tr>
                ) : (
                  potholes.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-700">{p.location_name}</td>
                      <td className="px-5 py-3"><SeverityBadge label={p.severity} /></td>
                      <td className="px-5 py-3"><SeverityBadge label={p.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.confidence}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{p.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map(item => (
              <div key={item.id} className="flex gap-3">
                <ActivityDot type={item.type} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 leading-tight">{item.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
