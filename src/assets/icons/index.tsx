import React from 'react';

export type IconProps = {
  width?: number;
  height?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

const s = (w: number, h: number, c?: string, sw = 2, st?: React.CSSProperties) => ({
  width: w, height: h, className: c, style: st,
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const User = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg width={width} height={height} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Bell = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const Sun = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

export const Moon = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const Globe = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const Mail = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const Settings = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const LogOut = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const ChevronLeft = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronRight = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const X = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const FileText = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />
  </svg>
);

export const Users = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Building2 = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
  </svg>
);

export const Briefcase = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M2 14h20" />
  </svg>
);

export const Landmark = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
);

export const TrendingUp = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export const TrendingDown = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

export const DollarSign = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const Clock = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const BarChart2 = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const Plus = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M5 12h14M12 5v14" />
  </svg>
);

export const Search = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Sparkles = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
  </svg>
);

export const CheckCircle = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export const AlertCircle = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const Download = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const Eye = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const Filter = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const ArrowUpRight = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M7 7h10v10M7 17 17 7" />
  </svg>
);

export const Zap = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const Palette = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const Type = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const Layout = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

export const Paperclip = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

export const Send = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const Calendar = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const SlidersHorizontal = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <line x1="21" y1="4" x2="14" y2="4" /><line x1="10" y1="4" x2="3" y2="4" />
    <line x1="21" y1="12" x2="12" y2="12" /><line x1="8" y1="12" x2="3" y2="12" />
    <line x1="21" y1="20" x2="16" y2="20" /><line x1="12" y1="20" x2="3" y2="20" />
    <line x1="14" y1="2" x2="14" y2="6" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="16" y1="18" x2="16" y2="22" />
  </svg>
);

export const ChevronDown = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Link = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const ArrowLeft = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);

export const Check = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const Trash = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const CreditCard = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <rect width="22" height="16" x="1" y="4" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export const Phone = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const Star = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const RotateCw = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M21 2v6h-6" /><path d="M21 13a9 9 0 1 1-3-7.7L21 8" />
  </svg>
);

export const Loader2 = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
  <svg {...s(width, height, className, strokeWidth, style)}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const  Edit = ({ width = 24, height = 24, className, strokeWidth = 2, style }: IconProps) => (
    <svg width={width} height={height} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
      <path d="M15 5l4 4"></path>
    </svg>
  );
