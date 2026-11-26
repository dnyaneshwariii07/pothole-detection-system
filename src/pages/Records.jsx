/**
 * Records Page (Phase 2 — real API)
 * -----------------------------------
 * Fetches potholes from GET /api/potholes
 * Delete calls DELETE /api/potholes/{id} which also removes the S3 image.
 * Status update calls PATCH /api/potholes/{id}/status
 */

import { useState, useEffect, useCallback } from 'react';
import SeverityBadge from '../components/ui/SeverityBadge';
import api from '../services/api';
import { potholes as mockData } from '../data/mockData';

const SEVERITY_OPTIONS = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUS_OPTIONS   = ['All', 'Pending', 'In Progress', 'Resolved'];

export default function Records() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus]     = useState('All');
  const [selected, setSelected] = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (severity !== 'All') params.append('severity', severity);
      if (status   !== 'All') params.append('status', status);
      if (search)              params.append('search', search);

      const res = await api.get(`/potholes?${params.toString()}`);
      setRecords(res.data);
      setUsingMock(false);
    } catch {
      // Fall back to mock data
      setRecords(mockData.map(p => ({
        id: p.id, location_name: p.location, severity: p.severity,
        status: p.status, confidence: p.confidence,
        created_at: p.detectedAt, image_url: null,
        location: { latitude: p.lat, longitude: p.lng },
      })));
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [severity, status, search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  async function updateStatus(id, newStatus) {
    try {
      await api.patch(`/potholes/${id}/status?status=${encodeURIComponent(newStatus)}`);
      setSelected(null);
      fetchRecords();
    } catch {
      alert('Failed to update status.');
    }
  }

  async function deleteRecord(id) {
    if (!window.confirm('Delete this record? This will also remove its image from S3.')) return;
    try {
      await api.delete(`/potholes/${id}`);
      setSelected(null);
      fetchRecords();
    } catch {
      alert('Failed to delete record.');
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading records…</div>;
  }

  return (
    <div className="space-y-5">

      {usingMock && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2.5 rounded-lg">
          ⚠️ Showing mock data — backend not reachable.
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text" placeholder="Search by location…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={severity} onChange={e => setSeverity(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {SEVERITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">
            Pothole Records <span className="text-sm font-normal text-slate-400 ml-1">({records.length})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">ID</th>
                <th className="px-5 py-3 text-left font-medium">Location</th>
                <th className="px-5 py-3 text-left font-medium">Severity</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Confidence</th>
                <th className="px-5 py-3 text-left font-medium">Image</th>
                <th className="px-5 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">No records found.</td></tr>
              )}
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">#{r.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-700">{r.location_name}</td>
                  <td className="px-5 py-3"><SeverityBadge label={r.severity} /></td>
                  <td className="px-5 py-3"><SeverityBadge label={r.status} /></td>
                  <td className="px-5 py-3 text-slate-600">{r.confidence}%</td>
                  <td className="px-5 py-3">
                    {r.image_url
                      ? <a href={r.image_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">☁️ S3</a>
                      : <span className="text-xs text-slate-400">—</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(r)} className="text-xs text-blue-600 hover:underline font-medium">View</button>
                      <button onClick={() => deleteRecord(r.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Pothole #{selected.id}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {selected.image_url && (
              <img src={selected.image_url} alt="Pothole" className="w-full h-40 object-cover rounded-lg mb-4 border border-slate-200" />
            )}

            <div className="space-y-2 text-sm mb-4">
              <p><span className="font-medium text-slate-600">Location:</span> {selected.location_name}</p>
              <p><span className="font-medium text-slate-600">Severity:</span> <SeverityBadge label={selected.severity} /></p>
              <p><span className="font-medium text-slate-600">Status:</span> <SeverityBadge label={selected.status} /></p>
              <p><span className="font-medium text-slate-600">Confidence:</span> {selected.confidence}%</p>
              {selected.location && (
                <p><span className="font-medium text-slate-600">Coordinates:</span> {selected.location.latitude}, {selected.location.longitude}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Update Status:</p>
              <div className="flex gap-2 flex-wrap">
                {['Pending', 'In Progress', 'Resolved'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selected.status === s ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
