import React from 'react';

/**
 * Reusable Button component following the LinkedIn‑style palette.
 * Props:
 *  - variant: 'primary' | 'secondary' | 'outline'
 *  - size: 'sm' | 'md' | 'lg'
 *  - disabled: boolean
 *  - onClick, type, className, children
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  children,
}) {
  const base = 'rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';
  const variants = {
    primary: 'bg-primary text-primary-content border-0 hover:bg-primary/90',
    secondary: 'bg-base-200 text-base-content border border-base hover:bg-base-100',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/10',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
