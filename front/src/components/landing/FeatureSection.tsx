'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';
import { RobotIcon, AnalyticsIcon, DesignIcon, ChatIcon } from '../../utils/icons';

interface FeatureSectionProps {
  scrollY: number;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ scrollY }) => {
  const [hoveredElement, setHoveredElement] = useState<number | null>(null);
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

  const features = [
    {
      icon: RobotIcon,
      title: 'Agent IA Audit financier',
      description: 'Détection automatique des anomalies, doublons, incohérences et dépenses inhabituelles avec rapport audit complet.',
      color: colors.text.primary,
      gradientFrom: colors.text.primary,
      gradientTo: colors.text.secondary,
      stats: [
        { label: 'Anomalies détectées', icon: '✓', status: 'success' },
        { label: 'Doublons identifiés', icon: '⚠', status: 'warning' },
        { label: 'Rapport généré', icon: '📧', status: 'info' },
      ]
    },
    {
      icon: AnalyticsIcon,
      title: 'Vision 360° en temps réel',
      description: 'Suivez cash, budget et marge en temps réel. Tableau de bord complet pour piloter votre activité financière.',
      color: colors.text.primary,
      gradientFrom: colors.text.primary,
      gradientTo: colors.text.secondary,
      stats: [
        { label: 'Temps gagné', value: '70%' },
        { label: 'Pièces centralisées', value: '100%' },
        { label: 'Mises à jour', value: 'Temps réel' },
        { label: 'Disponibilité', value: '24/7' },
      ]
    },
    {
      icon: DesignIcon,
      title: 'Drive intelligent & GED',
      description: 'Drive structuré avec recherche par montant, fournisseur ou date. Tags, validation et organisation automatique.',
      color: colors.text.primary,
      gradientFrom: colors.text.primary,
      gradientTo: colors.text.secondary,
      workflow: [
        { label: 'Import', color: colors.text.primary },
        { label: 'Classement IA', color: colors.text.secondary },
        { label: 'Validation', color: colors.text.tertiary },
      ]
    },
    {
      icon: ChatIcon,
      title: 'Communication Cabinet ↔ Client',
      description: 'Portail collaboratif pour échanger avec votre expert-comptable. Checklist pièces, relances et suivi en temps réel.',
      color: colors.text.primary,
      gradientFrom: colors.text.primary,
      gradientTo: colors.text.secondary,
      chatExample: {
        question: 'Où en est ma déclaration TVA du T4 ?',
        action: 'Envoi des pièces manquantes...'
      }
    },
  ];

  return (
    <section id="features" style={{
      padding: isMobile ? '3rem 0' : isTablet ? '5rem 0' : '8rem 0',
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
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              background: `linear-gradient(45deg, ${colors.text.primary}10, ${colors.text.secondary}10)`,
              borderRadius: '50%',
              filter: 'blur(120px)',
              top: `${10 + i * 20}%`,
              left: `${5 + i * 20}%`,
              animation: `float ${5 + i}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
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
              Fonctionnalités
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
            Automatisation
            <span style={{
              marginLeft: '10px'
            }}>
              Intelligente
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
            Des outils puissants pilotés par l'IA pour automatiser votre gestion financière
          </p>
        </div>

        {/* Unified Feature Card */}
        <div style={{
          background: colors.background.primary,
          border: `1px solid ${colors.border.light}`,
          borderRadius: isMobile ? '20px' : isTablet ? '24px' : '32px',
          padding: isMobile ? '1.5rem' : isTablet ? '2.5rem' : '4rem',
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

          {/* Feature Elements Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '2rem' : isTablet ? '3rem' : '4rem',
            position: 'relative',
            zIndex: 2,
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isHovered = hoveredElement === index;
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered && !isMobile ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                  }}
                  onMouseEnter={() => setHoveredElement(index)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  {/* Individual element background */}
                  <div style={{
                    position: 'absolute',
                    inset: '-1rem',
                    background: `radial-gradient(circle at center, ${colors.border.light} 0%, transparent 70%)`,
                    borderRadius: '20px',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    border: `1px solid ${colors.border.light}`,
                  }} />

                  <div style={{ position: 'relative', zIndex: 3 }}>
                    {/* Icon */}
                    <div style={{
                      width: isMobile ? '45px' : isTablet ? '55px' : '60px',
                      height: isMobile ? '45px' : isTablet ? '55px' : '60px',
                      borderRadius: isMobile ? '12px' : '16px',
                      background: colors.background.glassStrong,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: isMobile ? '1rem' : '1.5rem',
                      border: `1px solid ${colors.border.light}`,
                      transition: 'all 0.3s ease',
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    }}>
                      <Icon size={isMobile ? 20 : isTablet ? 24 : 28} color={feature.color} />
                    </div>
                    
                    {/* Title */}
                    <h3 style={{
                      fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem',
                      fontWeight: '700',
                      fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
                      color: colors.text.primary,
                      marginBottom: isMobile ? '0.75rem' : '1rem',
                      lineHeight: '1.3',
                    }}>
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p style={{
                      fontSize: isMobile ? '0.85rem' : isTablet ? '0.95rem' : '1rem',
                      fontFamily: '"Inter", sans-serif',
                      color: colors.text.secondary,
                      lineHeight: '1.6',
                      marginBottom: isMobile ? '1.5rem' : '2rem',
                    }}>
                      {feature.description}
                    </p>

                    {/* Feature-specific content */}
                    <div style={{
                      background: colors.background.glassStrong,
                      borderRadius: isMobile ? '8px' : '12px',
                      padding: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem',
                      border: `1px solid ${colors.border.light}`,
                      backdropFilter: 'blur(10px)',
                    }}>
                      {/* Stats for monitoring card */}
                      {feature.stats && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                          gap: isMobile ? '0.75rem' : '1rem',
                          fontSize: isMobile ? '0.75rem' : isTablet ? '0.8rem' : '0.9rem',
                        }}>
                          {feature.stats.map((stat, statIndex) => (
                            <div key={statIndex}>
                              <div style={{
                                color: colors.text.primary,
                                fontWeight: '600',
                                fontFamily: '"Inter", sans-serif',
                                marginBottom: '0.25rem',
                              }}>
                                {stat.value || stat.label}
                              </div>
                              <div style={{ 
                                color: colors.text.tertiary, 
                                fontSize: '0.8rem',
                                fontFamily: '"Inter", sans-serif'
                              }}>
                                {stat.value ? stat.label : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Workflow for design card */}
                      {feature.workflow && (
                        <div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem',
                            overflowX: 'auto',
                            paddingBottom: '0.5rem',
                          }}>
                            {feature.workflow.map((step, stepIndex) => (
                              <div key={stepIndex} style={{display: 'contents'}}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  flexShrink: 0,
                                }}>
                                  <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: step.color,
                                  }} />
                                  <span style={{
                                    color: colors.text.tertiary,
                                    fontSize: '0.9rem',
                                    fontFamily: '"Inter", sans-serif',
                                    whiteSpace: 'nowrap',
                                  }}>
                                    {step.label}
                                  </span>
                                </div>
                                {stepIndex < feature.workflow.length - 1 && (
                                  <div style={{
                                    width: '20px',
                                    height: '2px',
                                    background: `linear-gradient(to right, ${step.color}, ${feature.workflow[stepIndex + 1].color})`,
                                    flexShrink: 0,
                                  }} />
                                )}
                              </div>
                            ))}
                          </div>
                          <div style={{
                            fontSize: '0.9rem',
                            fontFamily: '"Inter", sans-serif',
                            color: colors.text.tertiary,
                          }}>
                            Connect 500+ apps and services with simple drag-and-drop
                          </div>
                        </div>
                      )}

                      {/* Chat example for chat card */}
                      {feature.chatExample && (
                        <div>
                          <div style={{
                            fontSize: isMobile ? '0.8rem' : isTablet ? '0.9rem' : '1rem',
                            color: colors.text.primary,
                            fontWeight: '600',
                            fontFamily: '"Inter", sans-serif',
                            marginBottom: isMobile ? '0.75rem' : '1rem',
                            fontStyle: 'italic',
                          }}>
                            "{feature.chatExample.question}"
                          </div>
                          <div style={{
                            background: colors.background.glassStrong,
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: `1px solid ${colors.border.light}`,
                          }}>
                            <div style={{
                              fontSize: '0.85rem',
                              fontFamily: '"Inter", sans-serif',
                              color: colors.text.primary,
                              marginBottom: '0.25rem',
                            }}>
                              ✨ {feature.chatExample.action}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connecting lines between elements (visible on larger screens) */}
          {!isTablet && (
            <>
              {/* Horizontal line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '60px',
                height: '2px',
                background: colors.border.medium,
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
              }} />
              {/* Vertical line */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2px',
                height: '60px',
                background: colors.border.medium,
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
              }} />
            </>
          )}
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

export default FeatureSection;