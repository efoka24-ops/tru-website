import React from 'react';

export function Textarea({ label, placeholder, rows = 4, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
      <textarea
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors resize-none"
        {...props}
      />
    </div>
  );
}
