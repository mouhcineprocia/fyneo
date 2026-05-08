'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';

interface ConnectorsSectionProps {
  scrollY: number;
}

// SVG Icons Components
const LockIcon = ({ size = 24, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const RefreshIcon = ({ size = 24, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

const ShieldCheckIcon = ({ size = 24, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const SettingsIcon = ({ size = 24, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6m3.5-5.5 4.5-4.5m-11 0L4.5 6.5m0 11 4.5-4.5m6 0 4.5 4.5"/>
  </svg>
);

const ZapIcon = ({ size = 24, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ConnectorsSection: React.FC<ConnectorsSectionProps> = ({ scrollY }) => {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [hoveredCapability, setHoveredCapability] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWindowWidth(window.innerWidth);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isMobile = windowWidth < 500;
  const isTablet = windowWidth < 1024;

  const categories = [
    { name: 'ERP', color: '#6366f1', icon: '◆' },
    { name: 'CRM', color: '#8b5cf6', icon: '◇' },
    { name: 'HRIS', color: '#d946ef', icon: '●' },
    { name: 'Accounting', color: '#06b6d4', icon: '■' },
    { name: 'Banking', color: '#10b981', icon: '▲' },
    { name: 'Document Management', color: '#f59e0b', icon: '◆' },
    { name: 'Data Warehouses', color: '#ef4444', icon: '◇' },
    { name: 'Communications', color: '#14b8a6', icon: '●' },
    { name: 'Identity', color: '#a855f7', icon: '■' },
    { name: 'DevOps', color: '#3b82f6', icon: '▲' },
    { name: 'REST/GraphQL/SQL', color: '#ec4899', icon: '◆' },
  ];

  const capabilities = [
    {
      title: 'Auth & Security',
      description: 'OAuth2, API keys, JWT, secret rotation',
      Icon: LockIcon,
      color: '#6366f1',
    },
    {
      title: 'Smart Sync',
      description: 'Pagination, cursor & delta sync, rate-limit backoff',
      Icon: RefreshIcon,
      color: '#10b981',
    },
    {
      title: 'Reliability',
      description: 'Idempotency keys, de-duplication, retries',
      Icon: ShieldCheckIcon,
      color: '#8b5cf6',
    },
    {
      title: 'Data Processing',
      description: 'Schemas & mapping, validation, transform nodes',
      Icon: SettingsIcon,
      color: '#06b6d4',
    },
    {
      title: 'Automation',
      description: 'Event triggers & schedulers (cron, bus, webhooks)',
      Icon: ZapIcon,
      color: '#f59e0b',
    },
  ];

  return (
    <section id="connectors" style={{
      padding: isMobile ? '2rem 0 3rem' : isTablet ? '2rem 0 5rem' : '2rem 0 8rem',
      background: colors.background.primary,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.02,
        transform: `translateY(${scrollY * 0.03}px)`,
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: `linear-gradient(45deg, ${colors.text.primary}10, ${colors.text.secondary}10)`,
          borderRadius: '50%',
          filter: 'blur(150px)',
          animation: 'float 8s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '250px',
          height: '250px',
          background: `linear-gradient(45deg, ${colors.text.secondary}10, ${colors.text.tertiary}10)`,
          borderRadius: '50%',
          filter: 'blur(120px)',
          animation: 'float 6s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '0 1rem' : isTablet ? '0 1.5rem' : '0 2rem',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '3rem' : isTablet ? '4rem' : '6rem',
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
              Integration Ready
            </span>
          </div>

          <h2 style={{
            fontSize: isMobile ? '28px' : isTablet ? '38px' : '50px',
            fontWeight: '400',
            fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
            lineHeight: '1.2',
            marginBottom: '1rem',
            color: colors.text.primary,
          }}>
            Native Connectors
            <span style={{
              marginLeft: '10px'
            }}>
              & APIs
            </span>
          </h2>

          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.secondary,
            lineHeight: '1.6',
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '600px',
            margin: '0 auto',
          }}>
            Connect to any system with our comprehensive library of pre-built connectors and robust APIs
          </p>
        </div>

        {/* Card Container */}
        <div style={{
          background: colors.background.primary,
          border: `1px solid ${colors.border.light}`,
          borderRadius: isMobile ? '20px' : isTablet ? '24px' : '32px',
          padding: isMobile ? '2rem' : isTablet ? '2.5rem' : '3.5rem',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: `0 20px 80px ${colors.text.primary}05, 0 8px 32px ${colors.text.primary}05`,
        }}>
          {/* Animated background gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `conic-gradient(from 0deg, ${colors.text.primary}05, ${colors.text.secondary}05, ${colors.text.tertiary}05, ${colors.text.primary}05)`,
            opacity: 0.3,
            filter: 'blur(60px)',
            animation: 'rotate 20s linear infinite',
          }} />

          {/* Two Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
            gap: isMobile ? '3rem' : isTablet ? '4rem' : '4rem',
            position: 'relative',
            zIndex: 2,
          }}>
            {/* Vertical Divider Line */}
            {!isTablet && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '0',
                bottom: '0',
                width: '1px',
                background: `linear-gradient(to bottom, transparent, ${colors.border.light}, ${colors.border.light}, transparent)`,
                transform: 'translateX(-50%)',
                zIndex: 1,
              }} />
            )}

            {/* Left Column - Integration Categories */}
            <div>
            <h3 style={{
              fontSize: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
              fontWeight: '600',
              fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
              color: colors.text.primary,
              marginBottom: isMobile ? '1.5rem' : '2rem',
            }}>
              Integration Categories
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '0.75rem' : '0.875rem',
            }}>
              {categories.map((category, index) => {
                const isHovered = hoveredCategory === index;

                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: isHovered ? colors.background.glassStrong : 'transparent',
                      border: `1px solid ${isHovered ? colors.border.medium : colors.border.light}`,
                      borderRadius: '10px',
                      padding: isMobile ? '0.75rem' : '0.875rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: isHovered && !isMobile ? 'translateX(4px)' : 'translateX(0)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={() => setHoveredCategory(index)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {/* Color accent bar */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: category.color,
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }} />

                    {/* Icon */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: `${category.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: category.color,
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                      transform: isHovered ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}>
                      {category.icon}
                    </div>

                    {/* Name */}
                    <span style={{
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      fontWeight: '500',
                      fontFamily: '"Inter", sans-serif',
                      color: colors.text.primary,
                      transition: 'color 0.3s ease',
                    }}>
                      {category.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Connector Capabilities */}
          <div>
            <h3 style={{
              fontSize: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
              fontWeight: '600',
              fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
              color: colors.text.primary,
              marginBottom: isMobile ? '1.5rem' : '2rem',
            }}>
              Connector Capabilities
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '1rem' : '0.75rem 1rem',
              rowGap: isMobile ? '1rem' : '0.75rem',
            }}>
              {capabilities.map((capability, index) => {
                const isHovered = hoveredCapability === index;
                const Icon = capability.Icon;

                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: isMobile ? '0.875rem' : '1rem',
                      padding: isMobile ? '0.875rem' : '1rem',
                      background: isHovered ? colors.background.glassStrong : 'transparent',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: isHovered && !isMobile ? 'translateX(6px)' : 'translateX(0)',
                    }}
                    onMouseEnter={() => setHoveredCapability(index)}
                    onMouseLeave={() => setHoveredCapability(null)}
                  >
                    {/* Icon */}
                    <div style={{
                      flexShrink: 0,
                      width: isMobile ? '36px' : '42px',
                      height: isMobile ? '36px' : '42px',
                      borderRadius: '10px',
                      background: `${capability.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    }}>
                      <Icon size={isMobile ? 18 : 22} color={capability.color} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: isMobile ? '0.95rem' : '1rem',
                        fontWeight: '600',
                        fontFamily: '"Inter", sans-serif',
                        color: colors.text.primary,
                        marginBottom: '0.25rem',
                      }}>
                        {capability.title}
                      </h4>

                      <p style={{
                        fontSize: isMobile ? '0.8rem' : '0.85rem',
                        fontFamily: '"Inter", sans-serif',
                        color: colors.text.secondary,
                        lineHeight: '1.5',
                        margin: 0,
                      }}>
                        {capability.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-20px);
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
};

export default ConnectorsSection;
