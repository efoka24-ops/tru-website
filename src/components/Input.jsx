import React from 'react';

export function Input({ label, placeholder, type = 'text', ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
        {...props}
      />
    </div>
  );
}
