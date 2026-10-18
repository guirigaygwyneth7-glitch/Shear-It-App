import React from 'react';

interface ShearItLogoProps {
  variant?: 'full' | 'compact' | 'icon';
  theme?: 'maroon' | 'light' | 'transparent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ShearItLogo: React.FC<ShearItLogoProps> = ({
  variant = 'compact',
  theme = 'transparent',
  size = 'md',
  className = '',
}) => {
  // Height / size mapping
  const heightMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
  };

  const currentHeight = heightMap[size];

  // Colors based on theme
  const isDark = theme === 'maroon';
  const textColor = isDark ? '#FFFFFF' : '#292329';
  const accentColor = '#E8A5A9'; // blush accent for 'ít'
  const subtextColor = isDark ? '#E5D6DA' : '#746B70';
  const iconBaseColor = isDark ? '#FAF6F0' : '#800000';
  const iconOutlineColor = isDark ? '#570018' : '#FAF6F0';

  if (variant === 'icon') {
    return (
      <svg
        width={currentHeight}
        height={currentHeight}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        {/* Rounded Container */}
        <rect width="100" height="100" rx="20" fill={theme === 'maroon' ? '#570018' : '#800000'} />
        
        {/* Lower Swoosh Cradling Notebook */}
        <path
          d="M 22 74 C 36 84 66 84 80 66 C 72 73 48 76 30 68 Z"
          fill="#FAF6F0"
        />

        {/* Notebook Cover */}
        <rect x="32" y="26" width="38" height="48" rx="4" fill="#FAF6F0" stroke="#570018" strokeWidth="2.5" />
        
        {/* Spiral Binder Rings on Left */}
        <ellipse cx="32" cy="33" rx="3.5" ry="1.8" fill="#570018" />
        <ellipse cx="32" cy="41" rx="3.5" ry="1.8" fill="#570018" />
        <ellipse cx="32" cy="49" rx="3.5" ry="1.8" fill="#570018" />
        <ellipse cx="32" cy="57" rx="3.5" ry="1.8" fill="#570018" />
        <ellipse cx="32" cy="65" rx="3.5" ry="1.8" fill="#570018" />

        {/* Graduation Cap Mortarboard on Notebook */}
        <path d="M 51 33 L 42 37 L 51 41 L 60 37 Z" fill="#570018" />
        <path d="M 45 38.5 V 42.5 C 45 44.5 57 44.5 57 42.5 V 38.5" fill="#570018" />
        <path d="M 58 38 L 60 43" stroke="#570018" strokeWidth="1.2" strokeLinecap="round" />

        {/* Horizontal text lines on notebook */}
        <rect x="42" y="47" width="20" height="2" rx="1" fill="#570018" />
        <rect x="42" y="52" width="20" height="2" rx="1" fill="#570018" />
        <rect x="42" y="57" width="16" height="2" rx="1" fill="#570018" />
        <rect x="42" y="62" width="18" height="2" rx="1" fill="#570018" />

        {/* Engineering Hard Hat on top right */}
        <path
          d="M 56 22 C 58 13 74 13 80 23 L 84 25 C 80 27 60 27 52 24 Z"
          fill="#FAF6F0"
          stroke="#570018"
          strokeWidth="2"
        />
        <path
          d="M 64 15 C 67 17 70 20 71 23"
          stroke="#570018"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 3-Node Sharing Icon */}
        <g transform="translate(62, 42)">
          <line x1="6" y1="12" x2="16" y2="7" stroke="#FAF6F0" strokeWidth="3" strokeLinecap="round" />
          <line x1="6" y1="12" x2="16" y2="17" stroke="#FAF6F0" strokeWidth="3" strokeLinecap="round" />
          <circle cx="6" cy="12" r="4.5" fill="#FAF6F0" stroke="#570018" strokeWidth="2" />
          <circle cx="16" cy="6" r="4" fill="#FAF6F0" stroke="#570018" strokeWidth="2" />
          <circle cx="16" cy="18" r="4" fill="#FAF6F0" stroke="#570018" strokeWidth="2" />
        </g>
      </svg>
    );
  }

  // Full / Compact Mark + Typography
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Emblem Icon */}
      <svg
        width={currentHeight}
        height={currentHeight}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="100" height="100" rx="18" fill="#570018" />
        
        {/* Swoosh */}
        <path
          d="M 22 74 C 36 84 66 84 80 66 C 72 73 48 76 30 68 Z"
          fill="#FAF6F0"
        />

        {/* Notebook Cover */}
        <rect x="32" y="26" width="38" height="48" rx="4" fill="#FAF6F0" stroke="#570018" strokeWidth="2.5" />
        
        {/* Spiral Binder Rings */}
        <ellipse cx="32" cy="33" rx="3.5" ry="1.8" fill="#570018" />
        <ellipse cx="32" cy="41" rx="3.5" ry="1.8" fill="#570018" />
        <ellipse cx="32" cy="49" rx="3.5" ry="1.8" fill="#570018" />
        <ellipse cx="32" cy="57" rx="3.5" ry="1.8" fill="#570018" />
        <ellipse cx="32" cy="65" rx="3.5" ry="1.8" fill="#570018" />

        {/* Graduation Cap */}
        <path d="M 51 33 L 42 37 L 51 41 L 60 37 Z" fill="#570018" />
        <path d="M 45 38.5 V 42.5 C 45 44.5 57 44.5 57 42.5 V 38.5" fill="#570018" />
        <path d="M 58 38 L 60 43" stroke="#570018" strokeWidth="1.2" strokeLinecap="round" />

        {/* Notebook Lines */}
        <rect x="42" y="47" width="20" height="2" rx="1" fill="#570018" />
        <rect x="42" y="52" width="20" height="2" rx="1" fill="#570018" />
        <rect x="42" y="57" width="16" height="2" rx="1" fill="#570018" />
        <rect x="42" y="62" width="18" height="2" rx="1" fill="#570018" />

        {/* Hard Hat */}
        <path
          d="M 56 22 C 58 13 74 13 80 23 L 84 25 C 80 27 60 27 52 24 Z"
          fill="#FAF6F0"
          stroke="#570018"
          strokeWidth="2"
        />
        <path
          d="M 64 15 C 67 17 70 20 71 23"
          stroke="#570018"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Share Nodes */}
        <g transform="translate(62, 42)">
          <line x1="6" y1="12" x2="16" y2="7" stroke="#FAF6F0" strokeWidth="3" strokeLinecap="round" />
          <line x1="6" y1="12" x2="16" y2="17" stroke="#FAF6F0" strokeWidth="3" strokeLinecap="round" />
          <circle cx="6" cy="12" r="4.5" fill="#FAF6F0" stroke="#570018" strokeWidth="2" />
          <circle cx="16" cy="6" r="4" fill="#FAF6F0" stroke="#570018" strokeWidth="2" />
          <circle cx="16" cy="18" r="4" fill="#FAF6F0" stroke="#570018" strokeWidth="2" />
        </g>
      </svg>

      {/* Typography Block */}
      <div className="flex flex-col text-left leading-none">
        <div className="flex items-baseline font-extrabold tracking-tight" style={{ fontSize: currentHeight * 0.58 }}>
          <span style={{ color: textColor }}>Shear</span>
          <span style={{ color: '#800000' }}>í</span>
          <span style={{ color: '#B42318' }}>t</span>
        </div>
        
        {variant === 'full' ? (
          <div className="space-y-0.5 mt-1">
            <span
              className="font-medium tracking-[0.14em] uppercase text-[10px] block"
              style={{ color: subtextColor }}
            >
              Share Notes. Build Together.
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-medium" style={{ color: subtextColor }}>
              <span className="w-4 h-[1px] bg-current opacity-40"></span>
              <span>StudEase</span>
              <span className="w-4 h-[1px] bg-current opacity-40"></span>
            </div>
          </div>
        ) : (
          <span
            className="text-[10px] font-medium tracking-wider uppercase mt-0.5"
            style={{ color: subtextColor }}
          >
            Engineering Notes
          </span>
        )}
      </div>
    </div>
  );
};
