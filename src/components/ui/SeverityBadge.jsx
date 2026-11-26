/**
 * SeverityBadge
 * -------------
 * Colour-coded pill for pothole severity levels.
 * Also used for status labels (Pending / Resolved / In Progress).
 */

const SEVERITY_STYLES = {
  Critical:    'bg-purple-100 text-purple-700 border-purple-200',
  High:        'bg-red-100    text-red-700    border-red-200',
  Medium:      'bg-amber-100  text-amber-700  border-amber-200',
  Low:         'bg-green-100  text-green-700  border-green-200',
  Pending:     'bg-orange-100 text-orange-700 border-orange-200',
  Resolved:    'bg-green-100  text-green-700  border-green-200',
  'In Progress': 'bg-blue-100 text-blue-700  border-blue-200',
  'Under Review': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Acknowledged: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export default function SeverityBadge({ label }) {
  const style = SEVERITY_STYLES[label] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${style}`}>
      {label}
    </span>
  );
}
