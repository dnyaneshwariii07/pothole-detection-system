/**
 * Detection Page (Phase 2 — real API + S3)
 * -----------------------------------------
 * POSTs the image to /api/detect.
 * FastAPI uploads the image to S3, runs mock YOLO, saves to DB, returns results.
 * The result image (with bounding boxes) is served from the S3 URL.
 */

import { useState } from 'react';
import api from '../services/api';

export default function Detection() {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [location, setLocation]   = useState('');
  const [lat, setLat]             = useState('');
  const [lng, setLng]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [dragOver, setDragOver]   = useState(false);

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleDetect() {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add optional query params
      const params = new URLSearchParams();
      if (location) params.append('location_name', location);
      if (lat)      params.append('latitude', lat);
      if (lng)      params.append('longitude', lng);

      const res = await api.post(`/detect?${params.toString()}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Detection failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setLocation('');
    setLat('');
    setLng('');
  }

  const severityColor = { High: 'text-red-600', Medium: 'text-amber-600', Low: 'text-green-600', Critical: 'text-purple-600' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Upload area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Upload Road Image</h3>

        {!preview ? (
          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 text-slate-400 mb-3">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            <p className="text-sm font-medium text-slate-600">Drag & drop a road image here</p>
            <p className="text-xs text-slate-400 mt-1">or click to browse — JPG, PNG, WEBP (max 10 MB)</p>
            <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} className="hidden" />
          </label>
        ) : (
          <div className="space-y-4">
            {/* Show result image (from S3) if available, else original preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={result?.result_image_url || preview}
                alt="Detection preview"
                className="w-full max-h-80 object-contain"
              />
              {result && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                  {result.s3_upload ? '☁️ Stored on S3' : '💾 Stored locally'}
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 truncate">📎 {file?.name}</p>
          </div>
        )}
      </div>

      {/* Location fields */}
      {preview && !result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Location Details <span className="text-slate-400 font-normal text-sm">(optional)</span></h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Location Name</label>
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g. MG Road, Bangalore"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
              <input value={lat} onChange={e => setLat(e.target.value)} type="number" step="any"
                placeholder="12.9716"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
              <input value={lng} onChange={e => setLng(e.target.value)} type="number" step="any"
                placeholder="77.5946"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          ❌ {error}
        </div>
      )}

      {/* Detect button */}
      {preview && !result && (
        <button
          onClick={handleDetect}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity={0.3} />
                <path d="M12 3a9 9 0 0 1 9 9" />
              </svg>
              Uploading to S3 & Analysing…
            </>
          ) : '🔍 Detect Potholes'}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Detection Results</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Processed in {result.processing_time_ms} ms</span>
              {result.s3_upload && (
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded-lg">
                  ☁️ Saved to AWS S3
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{result.potholes_detected}</p>
              <p className="text-sm text-blue-600 mt-1">Potholes Found</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-slate-700">{result.avg_confidence}%</p>
              <p className="text-sm text-slate-500 mt-1">Avg Confidence</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${severityColor[result.overall_severity] ?? 'text-slate-700'}`}>
                {result.overall_severity}
              </p>
              <p className="text-sm text-slate-500 mt-1">Overall Severity</p>
            </div>
          </div>

          <div className="space-y-2">
            {result.detections.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Pothole #{d.id}</span>
                <span className={`text-sm font-semibold ${severityColor[d.severity] ?? 'text-slate-600'}`}>{d.severity}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.confidence}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-10 text-right">{d.confidence}%</span>
                </div>
              </div>
            ))}
          </div>

          {result.image_url && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                📦 S3 Image: <a href={result.image_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{result.image_url}</a>
              </p>
            </div>
          )}

          <button onClick={handleReset} className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
            Upload Another Image
          </button>
        </div>
      )}
    </div>
  );
}
