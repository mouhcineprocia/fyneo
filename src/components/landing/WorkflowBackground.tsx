'use client';

import React, { useRef, useEffect, useState } from 'react';

interface ProfessionalBackgroundProps {
  primaryColor?: string;
  backgroundColor?: string;
  opacity?: number;
}

const ProfessionalBackground: React.FC<ProfessionalBackgroundProps> = ({
  primaryColor = '#a855f7',
  backgroundColor = 'transparent',
  opacity = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: backgroundColor,
        opacity
      }}
    >
      {/* Ultra-subtle dot matrix pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${primaryColor}06 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      {/* Elegant geometric lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(90deg, ${primaryColor}04 1px, transparent 1px),
          linear-gradient(${primaryColor}04 1px, transparent 1px)
        `,
        backgroundSize: '120px 120px',
      }} />

      {/* Sophisticated diagonal accent lines */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '120%',
        height: '1px',
        background: `linear-gradient(90deg, transparent 0%, ${primaryColor}15 20%, ${primaryColor}08 50%, ${primaryColor}15 80%, transparent 100%)`,
        transform: 'rotate(-2deg)',
        animation: 'subtleFlow 20s ease-in-out infinite alternate'
      }} />

      <div style={{
        position: 'absolute',
        top: '60%',
        left: '-10%',
        width: '120%',
        height: '1px',
        background: `linear-gradient(90deg, transparent 0%, ${primaryColor}08 30%, ${primaryColor}15 70%, transparent 100%)`,
        transform: 'rotate(1deg)',
        animation: 'subtleFlow 25s ease-in-out infinite alternate-reverse'
      }} />

      {/* Minimal corner gradients for depth */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '40%',
        height: '40%',
        background: `radial-gradient(ellipse at top left, ${primaryColor}03 0%, transparent 50%)`,
        animation: 'breathe 15s ease-in-out infinite alternate'
      }} />

      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '30%',
        height: '30%',
        background: `radial-gradient(ellipse at bottom right, ${primaryColor}05 0%, transparent 60%)`,
        animation: 'breathe 18s ease-in-out infinite alternate-reverse'
      }} />

      {/* Extremely subtle mouse interaction */}
      <div
        style={{
          position: 'absolute',
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          width: '600px',
          height: '600px',
          marginLeft: '-300px',
          marginTop: '-300px',
          background: `radial-gradient(circle, ${primaryColor}02 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'all 0.8s ease',
        }}
      />

      <style jsx>{`
        @keyframes subtleFlow {
          0% {
            opacity: 0.8;
            transform: translateX(-20px) rotate(-2deg);
          }
          100% {
            opacity: 0.4;
            transform: translateX(20px) rotate(-2deg);
          }
        }

        @keyframes breathe {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            opacity: 0.2;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalBackground;