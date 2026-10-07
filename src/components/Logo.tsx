import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'monochrome' | 'reversed';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "h-8", 
  variant = "default", 
  showText = true 
}) => {
  const isDark = variant === 'reversed';
  const isMono = variant === 'monochrome';
  
  const fillLeft = isMono ? "currentColor" : "url(#prep-grad-left)";
  const fillRight = isMono ? "currentColor" : "url(#prep-grad-right)";
  const textColor = isMono ? "currentColor" : (isDark ? "#ffffff" : "#111827");
  const aiColor = isMono ? "currentColor" : "url(#prep-grad-right)";

  return (
    <svg 
      className={className} 
      viewBox={showText ? "0 0 240 48" : "0 0 48 48"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {!isMono && (
        <defs>
          <linearGradient id="prep-grad-left" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5B3DF5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="prep-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B3DF5" />
          </linearGradient>
        </defs>
      )}
      
      <g transform="translate(0, 0)">
        {/* Abstract P Icon - Left Stroke */}
        <path 
          d="M 6 42 L 18 42 L 18 24 C 18 14 26 6 40 6 L 34 18 C 26 18 24 22 24 28 L 24 42 Z" 
          fill={fillLeft} 
        />
        {/* Abstract P Icon - Right Stroke */}
        <path 
          d="M 18 22 L 30 22 C 40 22 46 28 46 38 L 38 46 C 38 38 34 32 24 32 L 18 32 Z" 
          fill={fillRight} 
        />
      </g>
      
      {showText && (
        <g transform="translate(54, 34)">
          <text 
            fontSize="28" 
            fontWeight="800" 
            fontFamily="Inter, system-ui, -apple-system, sans-serif" 
            letterSpacing="-0.5"
          >
            <tspan fill={textColor}>PrepPilot</tspan>
            <tspan fill={aiColor} dx="6">AI</tspan>
          </text>
        </g>
      )}
    </svg>
  );
};
