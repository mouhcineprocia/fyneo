'use client';
import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';
import { PlayIcon, ArrowRightIcon } from '../../utils/icons';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  scrollY: number;
  showVideo: boolean;
  setShowVideo: (show: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ scrollY, showVideo, setShowVideo }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWindowWidth(window.innerWidth);
      handleResize(); // Set initial width
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isMobile = windowWidth < 500;
  const isTablet = windowWidth < 1024;

  return (
    <section id="hero" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isTablet ? 'center' : 'space-between',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 1)',
      backgroundRepeat: 'no-repeat',
      padding: isMobile ? '0 1rem' : isTablet ? '0 2rem' : '0 4rem',
      flexDirection: isTablet ? 'column' : 'row',
      textAlign: isTablet ? 'center' : 'left',
    }}>

      {/* Left Content */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        flex: isTablet ? 'none' : '1.5',
        maxWidth: isTablet ? '100%' : '750px',
        textAlign: isTablet ? 'center' : 'left',
        transform: `translateY(${scrollY * 0.1}px)`,
        width: '100%',
      }}>
        {/* Main Heading */}
        <h1 style={{
          fontSize: isMobile ? '32px' : isTablet ? '48px' : '72px',
          marginTop: isMobile ? '80px' : isTablet ? '100px' : '120px',
          fontWeight: '400',
          fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
          lineHeight: '1.1',
          marginBottom: '1.5rem',
          color: colors.text.primary,
          animation: 'fadeInUp 1s ease-out 0.4s both',
        }}>
          Finance & Gestion
          <br />
          <span style={{
            color: colors.text.primary,
            WebkitBackgroundClip: 'text',
          }}>
            augmentée par IA
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: isMobile ? '14px' : '16px',
          fontFamily: '"Inter", sans-serif',
          color: colors.text.darkBlue,
          lineHeight: '1.6',
          marginBottom: '3rem',
          maxWidth: isTablet ? '100%' : '400px',
          animation: 'fadeInUp 1s ease-out 0.6s both',
          margin: isTablet ? '0 auto 3rem auto' : '0 0 3rem 0',
        }}>
          La plateforme tout-en-un pour piloter la finance des PME et automatiser la pré-comptabilité. Centralisez vos documents, connectez la banque, et laissez notre agent IA préparer vos données.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: isMobile ? '0.75rem' : '1rem',
          justifyContent: isTablet ? 'center' : 'flex-start',
          flexWrap: 'wrap',
          marginBottom: '4rem',
          animation: 'fadeInUp 1s ease-out 0.8s both',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'flex-start',
        }}>
          <button
            onClick={() => router.push('/login')}
            onMouseEnter={() => setHoveredButton('primary')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: colors.text.primary,
              border: 'none',
              color: colors.background.primary,
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '600',
              fontFamily: '"Inter", sans-serif',
              padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 8px 25px ${colors.text.primary}20`,
              transform: hoveredButton === 'primary' ? 'translateY(-2px)' : 'translateY(0)',
              minWidth: isMobile ? '180px' : '200px',
              justifyContent: 'center',
            }}
          >
            Se connecter
            <ArrowRightIcon size={20} />
          </button>

          <button
            // onClick={() => setShowVideo(true)}
            onMouseEnter={() => setHoveredButton('secondary')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              border: `2px solid ${colors.border.medium}`,
              color: colors.text.primary,
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: '600',
              fontFamily: '"Inter", sans-serif',
              padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(20px) saturate(180%)',
              transform: hoveredButton === 'secondary' ? 'translateY(-2px)' : 'translateY(0)',
              minWidth: isMobile ? '180px' : '200px',
              justifyContent: 'center',
            }}
          >
            <PlayIcon size={20} />
            Demander une démo
          </button>
        </div>
      </div>

      {/* Right Graphic Section */}
      {!isTablet && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '72%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <svg
            viewBox="0 0 500 1000"
            preserveAspectRatio="none"
            style={{
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(-15px 0 30px rgba(0,0,0,0.08))',
            }}
          >
            <path
              d="M500,180 C400,20 250,220 180,350 C100,500 350,700 120,850 C50,950 100,1000 0,1000 L500,1000 L500,120 Z"
              fill={colors.text.primary}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '68%',
            transform: 'translate(-50%, -50%)',
            width: '45%',
            zIndex: 2,
          }}>
            <img
              src="/graphic-1.png"
              alt="Mister AI Graphics"
              style={{
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.15))',
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
