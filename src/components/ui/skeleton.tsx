import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({
  className = '',
  role,
  'aria-busy': ariaBusy,
  'aria-live': ariaLive,
  'aria-hidden': ariaHidden,
  children,
  ...props
}: SkeletonProps) {
  const isHidden = ariaHidden === true || ariaHidden === 'true';

  return (
    <div
      role={isHidden ? undefined : (role ?? 'status')}
      aria-busy={isHidden ? undefined : (ariaBusy ?? 'true')}
      aria-live={isHidden ? undefined : (ariaLive ?? 'polite')}
      aria-hidden={ariaHidden}
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 motion-reduce:animate-none ${className}`}
      {...props}
    >
      {!isHidden && (children ?? <span className="sr-only">Loading...</span>)}
    </div>
  );
}

export default Skeleton;
