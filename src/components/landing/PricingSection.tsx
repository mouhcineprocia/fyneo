'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';
import { CheckIcon, ArrowRightIcon } from '../../utils/icons';

const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
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

  const handleContactSales = () => {
    window.location.href = '/bookacall';
  };

  const plans = [
    {
      id: 'starter',
      name: 'PME / TPE',
      description: 'Offre Finance & Gestion - Solution simple et complète pour piloter votre activité',
      monthlyPrice: 49,
      annualPrice: 39,
      popular: false,
      features: [
        'Devis, Factures, Avoirs illimités',
        'Connexion bancaire',
        'Suivi budgets & projets',
        '1 utilisateur inclus',
      ],
      buttonText: 'Demander une démo',
      color: colors.text.primary,
    },
    {
      id: 'pro',
      name: 'Cabinet Pro',
      description: 'Offre Cabinet collaboratif - Portail client pour industrialiser la collecte des pièces',
      monthlyPrice: 149,
      annualPrice: 119,
      popular: true,
      features: [
        'Portail client illimité',
        'Drive & GED intelligent',
        'Pré-comptabilité automatisée',
        'Export cabinet comptable',
        'Agent IA Audit',
        'Support prioritaire',
        '5 utilisateurs inclus',
        'Communication cabinet ↔ client',
      ],
      buttonText: 'Demander une démo',
      color: colors.text.primary,
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      description: 'Pour les grandes organisations avec des besoins spécifiques et support dédié',
      monthlyPrice: null,
      annualPrice: null,
      popular: false,
      features: [
        'Utilisateurs illimités',
        'API & Intégrations sur mesure',
        'SSO & sécurité avancée',
        'Formation personnalisée',
        'Support dédié & SLA',
        'Déploiement sur site',
        'Contrats personnalisés',
        'Account Manager dédié',
      ],
      buttonText: 'Contacter les ventes',
      color: colors.text.primary,
    },
  ];

  return (
    <section id="pricing" style={{
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
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '20%',
          width: '300px',
          height: '300px',
          background: `linear-gradient(45deg, ${colors.text.primary}10, ${colors.text.secondary}10)`,
          borderRadius: '50%',
          filter: 'blur(150px)',
          animation: 'float 8s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '20%',
          width: '250px',
          height: '250px',
          background: `linear-gradient(45deg, ${colors.text.secondary}10, ${colors.text.tertiary}10)`,
          borderRadius: '50%',
          filter: 'blur(120px)',
          animation: 'float 6s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      <div style={{
        maxWidth: '1200px',
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
              Nos Offres
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
            Choisissez votre
            <span style={{
              marginLeft: '10px'
            }}>
              formule
            </span>
          </h2>

          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.secondary,
            lineHeight: '1.6',
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '600px',
            margin: '0 auto 2rem',
          }}>
            Des offres adaptées à vos besoins, que vous soyez PME ou Expert-Comptable. Satisfaction garantie !
          </p>

          {/* Billing Toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: colors.background.glassStrong,
            border: `1px solid ${colors.border.light}`,
            borderRadius: '50px',
            padding: isMobile ? '0.2rem' : '0.25rem',
            backdropFilter: 'blur(20px) saturate(180%)',
          }}>
            <button
              onClick={() => setIsAnnual(false)}
              style={{
                background: !isAnnual ? colors.background.glassStrong : 'transparent',
                border: 'none',
                color: !isAnnual ? colors.text.primary : colors.text.tertiary,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: '500',
                fontFamily: '"Inter", sans-serif',
                padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Mensuel
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              style={{
                background: isAnnual ? colors.background.glassStrong : 'transparent',
                border: 'none',
                color: isAnnual ? colors.text.primary : colors.text.tertiary,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: '500',
                fontFamily: '"Inter", sans-serif',
                padding: isMobile ? '0.4rem 1rem' : '0.5rem 1.5rem',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              Annuel
              <span style={{
                position: 'absolute',
                top: '-0.5rem',
                right: '-0.5rem',
                background: colors.text.primary,
                color: colors.background.primary,
                fontSize: '0.6rem',
                fontWeight: '600',
                fontFamily: '"Inter", sans-serif',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : isTablet
              ? 'repeat(2, 1fr)'
              : 'repeat(3, 1fr)',
          gap: isMobile ? '1.5rem' : '2rem',
          alignItems: 'stretch',
        }}>
          {plans.map((plan) => {
            const isHovered = hoveredPlan === plan.id;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            
            const cardContent = (
              <div style={{
                background: colors.background.glassStrong,
                border: `1px solid ${colors.border.light}`,
                borderRadius: isMobile ? '16px' : '24px',
                padding: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isHovered && !isMobile
                  ? plan.popular
                    ? 'translateY(-5px) scale(1.02)'
                    : 'translateY(-5px)'
                  : plan.popular && !isMobile
                    ? 'scale(1.02)'
                    : 'translateY(0)',
                backdropFilter: 'blur(20px) saturate(180%)',
              }}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: isMobile ? '0.75rem' : '1rem',
                  right: isMobile ? '0.75rem' : '1rem',
                  background: '#fff',
                  color: '#0d9394',
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", sans-serif',
                  padding: isMobile ? '0.2rem 0.6rem' : '0.25rem 0.75rem',
                  borderRadius: '50px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {isMobile ? 'Popular' : 'Most Popular'}
                </div>
              )}

              {/* Plan Header */}
              <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
                <h3 style={{
                  fontSize: isMobile ? '1.25rem' : isTablet ? '1.375rem' : '1.5rem',
                  fontWeight: '700',
                  fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
                  color:colors.text.primary,
                  marginBottom: '0.5rem',
                }}>
                  {plan.name}
                </h3>
                <p style={{
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontFamily: '"Inter", sans-serif',
                  color: colors.text.tertiary,
                  lineHeight: '1.5',
                  marginBottom: isMobile ? '1.25rem' : '1.5rem',
                }}>
                  {plan.description}
                </p>

                {/* Price */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                }}>
                  {price ? (
                    <>
                      <span style={{
                        fontSize: isMobile ? '2.5rem' : isTablet ? '2.75rem' : '3rem',
                        fontWeight: '700',
                        fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
                        color: colors.text.primary,
                        lineHeight: '1',
                      }}>
                        ${price}
                      </span>
                      <span style={{
                        fontSize: '1rem',
                        fontFamily: '"Inter", sans-serif',
                        color: colors.text.tertiary,
                      }}>
                        /month
                      </span>
                    </>
                  ) : (
                    <span style={{
                      fontSize: isMobile ? '1.75rem' : isTablet ? '1.875rem' : '2rem',
                      fontWeight: '700',
                      fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
                      color: colors.text.primary,
                      lineHeight: '1',
                    }}>
                      Custom
                    </span>
                  )}
                </div>
                {isAnnual && price && (
                  <p style={{
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    color: colors.text.tertiary,
                    margin: 0,
                  }}>
                    Billed annually (${price * 12}/year)
                  </p>
                )}
              </div>

              {/* Features */}
              <div style={{ flex: 1, marginBottom: isMobile ? '1.5rem' : '2rem' }}>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '0.6rem' : '0.75rem',
                }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.6rem' : '0.75rem',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontFamily: '"Inter", sans-serif',
                      color: colors.text.secondary,
                    }}>
                      <div style={{
                        width: isMobile ? '18px' : '20px',
                        height: isMobile ? '18px' : '20px',
                        borderRadius: '50%',
                        background: colors.background.glassStrong,
                        border: `1px solid ${colors.border.light}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <CheckIcon size={isMobile ? 10 : 12} color={ plan.color} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button
                style={{
                width: '100%',
                background: plan.popular
                  ? colors.text.primary
                  : 'transparent',
                border: plan.popular
                  ? 'none'
                  : `2px solid ${colors.border.medium}`,
                color: plan.popular ? colors.background.primary : colors.text.primary,
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                fontFamily: '"Inter", sans-serif',
                padding: isMobile ? '0.875rem' : '1rem',
                borderRadius: isMobile ? '10px' : '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backdropFilter: !plan.popular ? 'blur(20px) saturate(180%)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (plan.popular) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${colors.text.primary}20`;
                } else {
                  e.currentTarget.style.background = colors.background.glassStrong;
                  e.currentTarget.style.borderColor = colors.border.strong;
                }
              }}
              onMouseLeave={(e) => {
                if (plan.popular) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                } else {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = colors.border.medium;
                }
              }}
              >
                {plan.buttonText}
                <ArrowRightIcon size={16} />
              </button>
            </div>
            );

            return (
              <div key={plan.id}>
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div style={{
          textAlign: 'center',
          marginTop: isMobile ? '3rem' : isTablet ? '4rem' : '6rem',
          padding: isMobile ? '1.5rem' : '2rem',
          background: colors.background.glass,
          borderRadius: isMobile ? '16px' : '20px',
          border: `1px solid ${colors.border.light}`,
          backdropFilter: 'blur(20px) saturate(180%)',
        }}>
          <h3 style={{
            fontSize: isMobile ? '1.25rem' : isTablet ? '1.375rem' : '1.5rem',
            fontWeight: '600',
            fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
            color: colors.text.primary,
            marginBottom: '1rem',
          }}>
            Need help choosing the right plan?
          </h3>
          <p style={{
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.secondary,
            lineHeight: '1.6',
            marginBottom: isMobile ? '1.25rem' : '1.5rem',
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '600px',
            margin: isMobile ? '0 auto 1.25rem' : '0 auto 1.5rem',
          }}>
            All plans include a 14-day free trial with full access to features. 
            No credit card required. Cancel anytime.
          </p>
          <button
            style={{
            background: 'transparent',
            border: `1px solid ${colors.border.medium}`,
            color: colors.text.primary,
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: '500',
            fontFamily: '"Inter", sans-serif',
            padding: isMobile ? '0.625rem 1.5rem' : '0.75rem 2rem',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.background.glassStrong;
            e.currentTarget.style.borderColor = colors.border.strong;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = colors.border.medium;
          }}
          >
            Talk to Sales
          </button>
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
      `}</style>
    </section>
  );
};

export default PricingSection;