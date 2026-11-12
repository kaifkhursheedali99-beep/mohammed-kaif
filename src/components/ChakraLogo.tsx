import React from 'react';

interface ChakraLogoProps {
  size?: number;
  className?: string;
  showRings?: boolean;
}

export const ChakraLogo: React.FC<ChakraLogoProps> = ({
  size = 32,
  className = '',
  showRings = true,
}) => {
  // Ashoka Chakra has 24 spokes (360 / 24 = 15 degrees each)
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-label="BharatGPT Ashoka Chakra Emblem"
    >
      {/* Subtle tricolour outer glow ring */}
      {showRings && (
        <div
          className="absolute inset-0 rounded-full p-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
          }}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-[#0c0f17]" />
        </div>
      )}

      {/* Ashoka Chakra SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-[82%] h-[82%] relative z-10 text-[#000080] dark:text-[#38bdf8] transition-colors"
        fill="none"
        stroke="currentColor"
      >
        {/* Outer Circular Rim */}
        <circle cx="50" cy="50" r="44" strokeWidth="4" />
        {/* Inner Hub Circle */}
        <circle cx="50" cy="50" r="10" strokeWidth="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="50" cy="50" r="4" fill="currentColor" />

        {/* 24 Spokes */}
        {spokes.map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + 10 * Math.cos(rad);
          const y1 = 50 + 10 * Math.sin(rad);
          const x2 = 50 + 44 * Math.cos(rad);
          const y2 = 50 + 44 * Math.sin(rad);

          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );
};
