/**
 * Citizen Reports Page (Phase 2 — real API + S3)
 * ------------------------------------------------
 * Form submits to POST /api/reports (multipart/form-data)
 * Optional photo is uploaded to S3 by the backend.
 */

import { useState, useEffect } from 'react';
import SeverityBadge from '../components/ui/SeverityBadge';
import api from '../services/api';
import { citizenReports as mockData } from '../data/mockData';

const EMPTY_FORM = { reporter_name: '', reporter_phone: '', location: '', description: '' };

export default function CitizenReports() {
  const [reports, setReports]     = useState([]);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [photo, setPhoto]         = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch {
      setReports(mockData);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('image', photo);

      await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(EMPTY_FORM);
      setPhoto(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Submit form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Submit a Pothole Report</h3>

        {submitted && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg">
            ✅ Report submitted! {photo ? 'Photo uploaded to S3.' : ''} We will review it shortly.
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">❌ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name',     name: 'reporter_name',  placeholder: 'Your name' },
            { label: 'Phone Number',  name: 'reporter_phone', placeholder: '10-digit mobile' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input name={f.name} value={form[f.name]} onChange={handleChange} required placeholder={f.placeholder}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input name="location" value={form.location} onChange={handleChange} required placeholder="Street, landmark, area, city"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
              placeholder="Describe the pothole — size, depth, any hazards…"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Photo <span className="text-slate-400">(optional — uploaded to AWS S3)</span></label>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
              {loading ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Reports table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">
            Submitted Reports <span className="text-sm font-normal text-slate-400 ml-1">({reports.length})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Location</th>
                <th className="px-5 py-3 text-left font-medium">Description</th>
                <th className="px-5 py-3 text-left font-medium">Photo</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-700">
                    <p>{r.reporter_name ?? r.name}</p>
                    <p className="text-xs text-slate-400">{r.reporter_phone ?? r.phone}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600 max-w-xs">{r.location}</td>
                  <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{r.description}</td>
                  <td className="px-5 py-3">
                    {r.image_url
                      ? <a href={r.image_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">☁️ View</a>
                      : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-5 py-3"><SeverityBadge label={r.status} /></td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{(r.created_at ?? r.submittedAt ?? '').slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
