'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';

interface BrandSectionProps {
  scrollY: number;
}

const BrandSection: React.FC<BrandSectionProps> = ({ scrollY }) => {
  const [windowWidth, setWindowWidth] = useState(0);

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

  const brands = [
    { name: 'OpenAI', logo: '/l1.svg' },
    { name: 'Microsoft', logo: '/l2.svg' },
    { name: 'Google', logo: '/l3.svg' },
    { name: 'Amazon', logo: '/l4.svg' },
    { name: 'Slack', logo: '/l5.svg' },
    { name: 'Notion', logo: '/l6.svg' },
    { name: 'Zapier', logo: '/ratp.png' },
    { name: 'GitHub', logo: '/l8.svg' },
  ];

  return (
    <section style={{
      padding: 'clamp(0rem, 6vw, 0rem) 0',
      background: colors.background.primary,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.02,
        transform: `translateY(${scrollY * 0.02}px)`,
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '150px',
          height: '150px',
          background: `linear-gradient(45deg, ${colors.text.primary}10, ${colors.text.secondary}10)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'float 6s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: `linear-gradient(45deg, ${colors.text.secondary}10, ${colors.text.tertiary}10)`,
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'float 8s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 1rem' : isTablet ? '0 1.5rem' : '0 2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Header */}
        <div style={{
          marginBottom: isMobile ? '2rem' : isTablet ? '3rem' : '4rem',
          marginTop: isMobile ? '60px' : isTablet ? '75px' : '90px'
        }}>
          <div style={{
            display: 'inline-block',
            background: colors.background.glassStrong,
            border: `1px solid ${colors.border.light}`,
            borderRadius: '50px',
            padding: '0.5rem 1.5rem',
            marginBottom: '1.5rem',
            backdropFilter: 'blur(20px) saturate(180%)',
          }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '600',
              fontFamily: '"Inter", sans-serif',
              color: colors.text.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Trusted Partners
            </span>
          </div>

          <h2 style={{
            fontSize: isMobile ? '28px' : isTablet ? '38px' : '50px',
            fontWeight: '400',
            fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
            marginBottom: '1rem',
            color: colors.text.primary,
          }}>
            Trusted by Industry Leaders
          </h2>
          
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.secondary,
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '600px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            Join thousands of companies already automating their workflows with our platform
          </p>
        </div>
        
        {/* Infinite Brand Slider */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          padding: isMobile ? '1.5rem 0' : '2rem 0',
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}>
          <div style={{
            display: 'flex',
            animation: 'scrollBrands 30s linear infinite',
            gap: isMobile ? '1.5rem' : isTablet ? '2.5rem' : '4rem',
            alignItems: 'center',
            width: 'max-content',
          }}>
            {/* First set of brands */}
            {brands.map((brand, index) => (
              <div
                key={`first-${index}`}
                style={{
                  minWidth: isMobile ? '100px' : isTablet ? '140px' : '180px',
                  height: isMobile ? '50px' : isTablet ? '65px' : '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: isMobile ? '0.5rem 0.75rem' : isTablet ? '0.75rem 1.5rem' : '1rem 2rem',
                  background: colors.background.glassStrong,
                  borderRadius: isMobile ? '10px' : '15px',
                  border: `1px solid ${colors.border.light}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backdropFilter: 'blur(20px) saturate(180%)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 10px 25px ${colors.text.primary}10`;
                  e.currentTarget.style.borderColor = colors.border.medium;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colors.border.light;
                }}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  style={{
                    maxWidth: isMobile ? '60px' : isTablet ? '90px' : '120px',
                    maxHeight: isMobile ? '24px' : isTablet ? '32px' : '40px',
                    filter: 'brightness(0.4) contrast(1.2)',
                    transition: 'filter 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(0.6) contrast(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(0.4) contrast(1.2)';
                  }}
                />
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {brands.map((brand, index) => (
              <div
                key={`duplicate-${index}`}
                style={{
                  minWidth: isMobile ? '100px' : isTablet ? '140px' : '180px',
                  height: isMobile ? '50px' : isTablet ? '65px' : '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: isMobile ? '0.5rem 0.75rem' : isTablet ? '0.75rem 1.5rem' : '1rem 2rem',
                  background: colors.background.glassStrong,
                  borderRadius: isMobile ? '10px' : '15px',
                  border: `1px solid ${colors.border.light}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  backdropFilter: 'blur(20px) saturate(180%)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 10px 25px ${colors.text.primary}10`;
                  e.currentTarget.style.borderColor = colors.border.medium;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colors.border.light;
                }}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  style={{
                    maxWidth: isMobile ? '60px' : isTablet ? '90px' : '120px',
                    maxHeight: isMobile ? '24px' : isTablet ? '32px' : '40px',
                    filter: 'brightness(0.4) contrast(1.2)',
                    transition: 'filter 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(0.6) contrast(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(0.4) contrast(1.2)';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

 
      </div>

      <style jsx>{`
        @keyframes scrollBrands {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
};

export default BrandSection;