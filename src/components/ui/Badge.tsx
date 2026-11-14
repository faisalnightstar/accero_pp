import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'gold'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  ...props
}: BadgeProps) {
  const baseClasses =
    'inline-flex items-center font-medium rounded-full border transition-colors select-none';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }[size];

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-[#1D3557]/10 text-[#1D3557] border-[#1D3557]/20',
    secondary: 'bg-[#8B1E2D]/10 text-[#8B1E2D] border-[#8B1E2D]/20',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-300',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    gold: 'bg-amber-100/80 text-amber-950 border-amber-300',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  }[variant];

  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
