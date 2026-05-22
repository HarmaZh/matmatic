import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'square',
  'aria-hidden': true,
};

/** Outer rect + inner rect — represents mat-around-aperture */
export function IconCalc() {
  return (
    <svg {...base}>
      <rect x="3" y="3" width="18" height="18" />
      <rect x="8" y="8" width="8" height="8" />
    </svg>
  );
}

/** Clock circle + minute hand + hour hand. No tick marks. */
export function IconHistory() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="12" x2="12" y2="6" />
      <line x1="12" y1="12" x2="16" y2="14" />
    </svg>
  );
}

/** 3 horizontal lines at y=8/12/16, varying widths — printed-card stack */
export function IconPresets() {
  return (
    <svg {...base}>
      <line x1="4" y1="8"  x2="18" y2="8"  />
      <line x1="4" y1="12" x2="14" y2="12" />
      <line x1="4" y1="16" x2="20" y2="16" />
    </svg>
  );
}

/** Half-circle arch + horizontal base line — bust silhouette abstracted */
export function IconAccount() {
  return (
    <svg {...base}>
      <path d="M 6 14 A 6 6 0 0 1 18 14" />
      <line x1="6" y1="18" x2="18" y2="18" />
    </svg>
  );
}
