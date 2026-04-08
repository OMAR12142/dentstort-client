import React from 'react';

export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-base-200 border border-base rounded-lg p-4 sm:p-5 min-w-0 break-words ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-base-content mb-3 line-clamp-2">{title}</h3>
      )}
      {children}
    </div>
  );
}