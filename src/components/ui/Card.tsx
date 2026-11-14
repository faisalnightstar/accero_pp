import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  bordered?: boolean;
}

export function Card({
  children,
  hoverEffect = false,
  bordered = true,
  className = '',
  ...props
}: CardProps) {
  const baseClasses = 'bg-white rounded-2xl transition-all duration-200';
  const borderClasses = bordered ? 'border border-slate-200/90 shadow-xs' : 'shadow-card';
  const hoverClasses = hoverEffect
    ? 'hover:border-slate-300 hover:shadow-card hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`${baseClasses} ${borderClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`p-6 pb-4 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`p-6 pt-4 border-t border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
