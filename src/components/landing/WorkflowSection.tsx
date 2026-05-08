'use client';

import React, { useEffect, useRef, useState } from 'react';

// Mister colors
const colors = {
  primary: { 400: '#12abb0', 500: '#0d9394' },
  secondary: { 500: '#f59e0b' },
  accent: { cyan: '#0d9394' },
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    glass: 'rgba(0, 0, 0, 0.02)',
    glassStrong: 'rgba(0, 0, 0, 0.05)'
  },
  border: {
    light: 'rgba(0, 0, 0, 0.08)',
    medium: 'rgba(0, 0, 0, 0.15)'
  },
  text: {
    primary: '#0d9394',
    secondary: '#475569',
    tertiary: '#64748b'
  },
  gradients: {
    text: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
    primary: 'linear-gradient(135deg, #0d9394 0%, #12abb0 100%)'
  }
};

// Mock icons
const DevisIcon = ({ size = 20, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

const BudgetIcon = ({ size = 20, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

const BanqueIcon = ({ size = 20, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

const ComptaIcon = ({ size = 20, color = colors.text.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M9 9h6v2H9V9zM9 13h6v2H9v-2z" fill={color}/>
  </svg>
);

interface WorkflowSectionProps {
  activeTab?: number;
  setActiveTab?: (tab: number) => void;
  scrollY?: number;
}

const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  scrollY = 0
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use prop values if provided, otherwise use internal state
  const activeTab = propActiveTab ?? internalActiveTab;
  const setActiveTab = propSetActiveTab ?? setInternalActiveTab;

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

  const tabs = [
    {
      icon: DevisIcon,
      title: 'Devis & Factures',
      description: 'Créez rapidement devis, BC, factures, avoirs. Envoi client, suivi statut, relances automatiques.',
      image: '/mg1.png',
      color: colors.primary[500],
    },
    {
      icon: BudgetIcon,
      title: 'Projets & Budgets',
      description: 'Suivi rentabilité, coûts et marges par projet. Alertes dépassement budget en temps réel.',
      image: '/mg2.png',
      color: colors.accent.cyan,
    },
    {
      icon: BanqueIcon,
      title: 'Banque & Trésorerie',
      description: 'Connexion / import relevés, classement transactions, rapprochement factures ↔ virements.',
      image: '/mg3.png',
      color: colors.secondary[500],
    },
    {
      icon: ComptaIcon,
      title: 'Pré-comptabilité',
      description: 'Classement intelligent (TVA, charges, immobilisations) + exports adaptés cabinet comptable.',
      image: '/mg4.png',
      color: colors.primary[400],
    },
  ];

  useEffect(() => {
    // Auto-advance tabs every 5 seconds
    intervalRef.current = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setActiveTab, tabs.length]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    // Reset auto-advance timer when user clicks
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length);
    }, 5000);
  };

  return (
    <section style={{
      padding: isMobile ? '60px 0 50px' : isTablet ? '80px 0 70px' : '120px 0 100px',
      background: colors.background.primary,
      position: 'relative',
      overflow: 'hidden',
      borderBottom: `1px solid ${colors.border.light}`,
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        transform: `translateY(${scrollY * 0.05}px)`,
      }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              background: `linear-gradient(45deg, ${colors.primary[500]}20, ${colors.secondary[500]}20)`,
              borderRadius: '50%',
              filter: 'blur(100px)',
              top: `${20 + i * 30}%`,
              left: `${10 + i * 25}%`,
              animation: `float ${4 + i}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : isTablet ? '0 24px' : '0 40px',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? '24px' : isTablet ? '32px' : '40px',
        }}>
          <div style={{
            display: 'inline-block',
            background: colors.background.glassStrong,
            border: `1px solid ${colors.border.light}`,
            borderRadius: '50px',
            padding: '8px 24px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Modules Mister
          </div>

          <h2 style={{
            fontSize: isMobile ? '32px' : isTablet ? '42px' : '58px',
            fontWeight: '300',
            fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
            lineHeight: '1.06',
            marginBottom: '16px',
            color: colors.text.primary,
            WebkitBackgroundClip: 'text',
            letterSpacing: '-0.03em',
          }}>
            Plateforme tout-en-un
          </h2>

          <p style={{
            fontSize: isMobile ? '14px' : '16px',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.secondary,
            lineHeight: '1.8',
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '600px',
            margin: '0 auto',
            letterSpacing: '0.015em',
          }}>
            Automatisez vos processus financiers avec Mister et rendez votre entreprise plus efficace grâce à l'IA.
          </p>
        </div>

        {/* Workflow Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: isMobile ? '24px' : isTablet ? '32px' : '56px',
          alignItems: 'center',
        }}>
          {/* Vertical Tabs */}
          <div style={{
            display: isMobile ? 'none' : 'flex',
            flexDirection: 'column',
            gap: '4px',
            position: 'relative',
            minWidth: isTablet ? 'auto' : '500px',
          }}>
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === index;

              return (
                <div key={index} style={{ position: 'relative' }}>
                  <button
                    onClick={() => handleTabClick(index)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0',
                      padding: '0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                      position: 'relative',
                    }}
                  >
                    {/* Progress indicator for active tab */}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        left: '0',
                        top: '0',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: `2px solid ${colors.text.primary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: colors.background.primary,
                        zIndex: 3,
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: tab.color,
                        }} />
                      </div>
                    )}

                    {/* Inactive dot */}
                    {!isActive && (
                      <div style={{
                        position: 'absolute',
                        left: '6px',
                        top: '6px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: colors.border.medium,
                        zIndex: 3,
                      }} />
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      paddingLeft: '32px',
                      paddingRight: '0',
                      paddingTop: '0',
                      paddingBottom: isActive ? '20px' : '12px',
                      borderLeft: isActive ? `2px solid ${tab.color}` : `2px solid ${colors.border.light}`,
                      marginLeft: '7px',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isActive ? `${tab.color}15` : colors.background.glassStrong,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '4px',
                      }}>
                        <Icon size={16} color={isActive ? tab.color : colors.text.tertiary} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          fontFamily: '"Inter", sans-serif',
                          color: isActive ? colors.text.primary : colors.text.secondary,
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {tab.title}
                        </h3>

                        {isActive && (
                          <p style={{
                            fontSize: '14px',
                            fontFamily: '"Inter", sans-serif',
                            color: colors.text.secondary,
                            lineHeight: '1.5',
                            margin: 0,
                            opacity: 0.8,
                            fontWeight: '300',
                          }}>
                            {tab.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Content Display */}
          <div style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            background: colors.background.secondary,
            border: `1px solid ${colors.border.light}`,
            aspectRatio: isMobile ? '4/3' : isTablet ? '3/2' : '16/10',
            minHeight: isMobile ? '250px' : isTablet ? '300px' : '400px',
          }}>
            <img
              src={tabs[activeTab].image}
              alt={tabs[activeTab].title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'opacity 0.5s ease',
              }}
            />
          </div>
        </div>

        {/* Mobile Tab Selector & Progress Dots */}
        {isMobile && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginTop: '24px',
          }}>
            {/* Active Tab Info */}
            <div style={{
              textAlign: 'center',
              padding: '16px',
              background: colors.background.glassStrong,
              border: `1px solid ${colors.border.light}`,
              borderRadius: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
{(() => {
                  const IconComponent = tabs[activeTab].icon;
                  return <IconComponent size={20} color={tabs[activeTab].color} />;
                })()}
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: '"Inter", sans-serif',
                  color: colors.text.primary,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {tabs[activeTab].title}
                </h3>
              </div>
              <p style={{
                fontSize: '13px',
                fontFamily: '"Inter", sans-serif',
                color: colors.text.secondary,
                lineHeight: '1.5',
                margin: 0,
                fontWeight: '300',
              }}>
                {tabs[activeTab].description}
              </p>
            </div>

            {/* Progress Dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
            }}>
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    background: activeTab === index ? tab.color : colors.border.medium,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Progress Dots for Tablet */}
        {isTablet && !isMobile && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '32px',
          }}>
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(index)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: 'none',
                  background: activeTab === index ? tab.color : colors.border.medium,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
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
      `}</style>
    </section>
  );
};

export default WorkflowSection;
