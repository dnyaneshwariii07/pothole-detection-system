/**
 * Settings Page
 * -------------
 * Admin profile and system configuration.
 * Values are stored in localStorage until the backend is integrated.
 */

import { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import api from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name:  user?.name ?? 'Admin User',
    email: 'admin@cityroads.gov.in',
    phone: '9876543210',
    org:   'City Municipal Corporation',
  });
  const [s3Status, setS3Status] = useState(null);
  const [s3Testing, setS3Testing] = useState(false);

  async function testS3() {
    setS3Testing(true);
    try {
      const res = await api.get('/s3/test');
      setS3Status({ success: res.data.success, message: res.data.message || res.data.error });
    } catch {
      setS3Status({ success: false, message: 'Could not reach backend.' });
    } finally {
      setS3Testing(false);
    }
  }

  async function triggerBackup() {
    try {
      const res = await api.post('/s3/backup');
      alert(res.data.message + (res.data.url ? '\n' + res.data.url : ''));
    } catch {
      alert('Backup failed.');
    }
  }

  const [thresholds, setThresholds] = useState({
    confidenceMin: 70,
    autoAlert:     true,
    emailNotify:   true,
  });

  function save(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-6">

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-lg">
          ✅ Settings saved successfully.
        </div>
      )}

      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Admin Profile</h3>
        <form onSubmit={save} className="space-y-4">
          {[
            { label: 'Full Name',     key: 'name'  },
            { label: 'Email Address', key: 'email' },
            { label: 'Phone Number',  key: 'phone' },
            { label: 'Organisation',  key: 'org'   },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
              <input
                value={profile[f.key]}
                onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
            Save Profile
          </button>
        </form>
      </div>

      {/* Detection thresholds */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Detection Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Minimum Confidence Threshold: <span className="text-blue-600 font-bold">{thresholds.confidenceMin}%</span>
            </label>
            <input
              type="range" min={50} max={99}
              value={thresholds.confidenceMin}
              onChange={e => setThresholds(t => ({ ...t, confidenceMin: +e.target.value }))}
              className="w-full accent-blue-600"
            />
            <p className="text-xs text-slate-400 mt-1">Detections below this confidence are discarded.</p>
          </div>

          {[
            { key: 'autoAlert',   label: 'Auto-alert on Critical potholes' },
            { key: 'emailNotify', label: 'Email notifications for new reports' },
          ].map(t => (
            <div key={t.key} className="flex items-center justify-between py-2 border-t border-slate-100">
              <span className="text-sm text-slate-700">{t.label}</span>
              <button
                onClick={() => setThresholds(p => ({ ...p, [t.key]: !p[t.key] }))}
                className={`w-11 h-6 rounded-full transition-colors relative ${thresholds[t.key] ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${thresholds[t.key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* AWS S3 panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">AWS S3 Storage</h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <button onClick={testS3} disabled={s3Testing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              {s3Testing ? 'Testing…' : '🔌 Test S3 Connection'}
            </button>
            <button onClick={triggerBackup}
              className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              💾 Backup DB to S3
            </button>
          </div>
          {s3Status && (
            <div className={`text-sm px-4 py-2.5 rounded-lg border ${s3Status.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {s3Status.success ? '✅' : '❌'} {s3Status.message}
            </div>
          )}
          <div className="text-xs text-slate-500 space-y-0.5">
            <p>Bucket: <span className="font-mono font-semibold text-slate-700">pothole-detection-images79</span></p>
            <p>Region: <span className="font-mono font-semibold text-slate-700">eu-north-1</span></p>
          </div>
        </div>
      </div>

      {/* App info */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-500 space-y-1">
        <p>PotHole Detection System — v1.0.0 (Phase 1)</p>
        <p>Frontend: React 18 + Vite + Tailwind CSS</p>
        <p>Backend: FastAPI + SQLite (Phase 2)</p>
        <p>AI Model: YOLOv8 (Phase 3)</p>
      </div>
    </div>
  );
}
