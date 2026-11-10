import React from 'react';

export interface SkeletonPrimitiveProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  color?: string;
  highlightColor?: string;
}

const PULSE_CSS = `
@keyframes auto-skeleton-pulse {
  0%, 100% { background-color: var(--auto-skeleton-c); }
  50% { background-color: var(--auto-skeleton-h); }
}
.auto-skeleton { animation: auto-skeleton-pulse 1.5s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .auto-skeleton { animation: none; }
}
`;

export const SkeletonPrimitive: React.FC<SkeletonPrimitiveProps> = ({
  width,
  height,
  borderRadius = '4px',
  color = 'var(--auto-skeleton-color, #eee)',
  highlightColor = 'var(--auto-skeleton-highlight, #f5f5f5)',
  className,
  style,
  ...props
}) => {
  return (
    <>
      {/* React 19 hoists this into <head> and dedupes it by href */}
      <style href="auto-skeleton-pulse" precedence="default">
        {PULSE_CSS}
      </style>
      <div
        className={className ? `auto-skeleton ${className}` : 'auto-skeleton'}
        style={
          {
            width,
            height,
            borderRadius,
            backgroundColor: color,
            '--auto-skeleton-c': color,
            '--auto-skeleton-h': highlightColor,
            ...style,
          } as React.CSSProperties
        }
        data-testid="skeleton"
        {...props}
      />
    </>
  );
};
