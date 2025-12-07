import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
}
