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
  loading = false,
  onClick,
  type = 'button',
  className = '',
  children,
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary active:scale-[0.98]';
  const variants = {
    primary: 'bg-primary text-white border-0 hover:bg-primary/90 shadow-sm',
    secondary: 'bg-[#F3F2EF] text-[#191919] border border-[#E0DFDC] hover:bg-[#E0DFDC]',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-base-content hover:bg-base-200',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const isActuallyDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isActuallyDisabled}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${isActuallyDisabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''} ${className}`}
    >
      {loading && <span className="loading loading-spinner loading-xs" />}
      {children}
    </button>
  );
}
