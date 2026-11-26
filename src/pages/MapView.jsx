/**
 * Map View Page
 * -------------
 * Shows all pothole locations on an OpenStreetMap via react-leaflet.
 * Clicking a marker shows location details in a popup.
 */

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SeverityBadge from '../components/ui/SeverityBadge';
import { potholes } from '../data/mockData';

// Fix the default marker icon path that Vite breaks
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom coloured markers per severity
function markerIcon(severity) {
  const color = { Critical: '#7c3aed', High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' }[severity] ?? '#3b82f6';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24S24 21 24 12C24 5.37 18.63 0 12 0z" fill="${color}"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

export default function MapView() {
  // Centre map on India
  const center = [20.5937, 78.9629];

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4">
        {[
          { label: 'Critical', color: '#7c3aed' },
          { label: 'High',     color: '#ef4444' },
          { label: 'Medium',   color: '#f59e0b' },
          { label: 'Low',      color: '#22c55e' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
            <span className="text-sm text-slate-600">{item.label}</span>
          </div>
        ))}
        <span className="ml-auto text-sm text-slate-400">{potholes.length} potholes plotted</span>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '540px' }}>
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {potholes.map(p => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={markerIcon(p.severity)}>
              <Popup>
                <div className="text-sm space-y-1 min-w-44">
                  <p className="font-semibold text-slate-800">{p.location}</p>
                  <div className="flex gap-2">
                    <SeverityBadge label={p.severity} />
                    <SeverityBadge label={p.status} />
                  </div>
                  <p className="text-slate-500">Confidence: {p.confidence}%</p>
                  <p className="text-slate-400 text-xs">{p.detectedAt}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
