'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';

interface IndustriesSectionProps {
  scrollY: number;
}

const IndustriesSection: React.FC<IndustriesSectionProps> = ({ scrollY }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<{ [key: number]: boolean }>({});
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

  const toggleExpand = (index: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const industries = [
    {
      badge: 'Banking',
      badgeColor: '#06b6d4',
      image: 'https://imagedelivery.net/xaKlCos5cTg_1RWzIu_h-A/6c501b78-dcd4-4ceb-a182-c219e82e5700/public',
      features: [
        {
          title: 'Transaction Reconciliation',
          description: 'AI agents automatically match banking transactions with data from internal or external systems, validating operations in real time.',
        },
        {
          title: 'Knowledge Base Intelligence',
          description: 'Creation of searchable knowledge bases from document archives — agents answer staff queries by chat or phone with precise, contextual responses.',
        },
        {
          title: 'Audit & Compliance',
          description: 'Each agent action is tracked, providing full traceability and transparency.',
        },
      ],
    },
    {
      badge: 'Insurance',
      badgeColor: '#10b981',
      image: 'https://imagedelivery.net/xaKlCos5cTg_1RWzIu_h-A/2dcd22b3-d4cc-4ae7-d6d7-cf6be4950300/public',
      features: [
        {
          title: 'Digital Subscription Journey',
          description: 'AI agents receive client requests (via chat, WhatsApp, or phone), categorize them, recommend suitable products, perform KYC, and generate customized contracts.',
        },
        {
          title: 'Real-Time Claim Management',
          description: 'Intelligent agents analyze documents and photos, identify evidence, verify clauses, and propose fair compensation instantly.',
        },
        {
          title: 'Voice Assistant for Customer Care',
          description: 'Conversational agents strengthen call centers, handle requests 24/7, and respond accurately to claim or policy inquiries.',
        },
      ],
    },
    {
      badge: 'Industry & Logistics',
      badgeColor: '#f59e0b',
      image: 'https://imagedelivery.net/xaKlCos5cTg_1RWzIu_h-A/36dcb432-e632-4018-d1d2-7b10c2e52200/publicContain',
      features: [
        {
          title: 'Smart Maintenance & Operations',
          description: 'Agents interpret data, images, or reports to suggest optimal maintenance actions and predict anomalies.',
        },
        {
          title: 'Process Optimization',
          description: 'Autonomous agents oversee document flows from procurement to delivery, ensuring accuracy and performance monitoring.',
        },
        {
          title: 'Knowledge Assistants',
          description: 'Industry-trained agents provide technicians with immediate access to operational procedures and past cases.',
        },
      ],
    },
    {
      badge: 'HR & Workforce',
      badgeColor: '#8b5cf6',
      image: 'https://imagedelivery.net/xaKlCos5cTg_1RWzIu_h-A/896842fd-1c78-44b7-76c4-8a297a508100/publicContain',
      features: [
        {
          title: 'Recruitment & Onboarding',
          description: 'AI agents conduct pre-screenings, manage digital KYC, and generate contracts dynamically.',
        },
        {
          title: 'Payroll Control & Contextual Search',
          description: 'Agents detect anomalies, cross-check pay elements, and retrieve answers from payslip or internal databases.',
        },
        {
          title: 'Employee Lifecycle Management',
          description: 'Automated onboarding, training, and offboarding — with alerts on key resources and compliance tracking.',
        },
        {
          title: 'Skills & Performance Assessment',
          description: 'Dynamic quizzes, coding tests, and interview simulations powered by generative AI.',
        },
        {
          title: 'Conversational HR Assistant',
          description: 'Employees can ask questions about leave balance, labor rights, company policies, or procedures — and get instant, compliant answers through chat or voice.',
        },
      ],
    },
    {
      badge: 'Enterprise Intelligence',
      badgeColor: '#ef4444',
      image: 'https://imagedelivery.net/xaKlCos5cTg_1RWzIu_h-A/bee976d7-f3e0-47d9-c381-115950b4c100/publicContain',
      features: [
        {
          title: 'Financial Reconciliation & Control',
          description: 'AI agents match invoices, purchase orders, and banking transactions, ensuring accuracy and compliance before payment.',
        },
        {
          title: 'Budget & Forecast Management',
          description: 'Agents compare forecasted vs. actual budgets, highlight variances, and simulate future spending scenarios.',
        },
        {
          title: 'Project & Activity Monitoring',
          description: 'Real-time tracking of projects, programs, and activities — with predictive alerts on overruns, profitability, or delays.',
        },
        {
          title: 'Accounting & Compliance Automation',
          description: 'Automated validation of entries, allocations, and VAT statements with audit-ready traceability.',
        },
        {
          title: 'Decision Intelligence & Forecasting',
          description: 'Agents generate financial insights, recommend optimizations, and support strategic decision-making for executives.',
        },
      ],
    },
  ];

  return (
    <section id="industries" style={{
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
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: `linear-gradient(45deg, ${colors.text.primary}10, ${colors.text.secondary}10)`,
          borderRadius: '50%',
          filter: 'blur(150px)',
          animation: 'float 8s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '15%',
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
          marginBottom: isMobile ? '3rem' : isTablet ? '4rem' : '5rem',
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
              Industry Solutions
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
            Built for Every Industry.
          </h2>

          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.secondary,
            lineHeight: '1.6',
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '700px',
            margin: '0 auto',
          }}>
            From banking to HR, insurance to logistics—automate intelligent workflows that eliminate manual work and deliver measurable results.
          </p>
        </div>

        {/* Industry Cards - Modern Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? '2rem' : isTablet ? '2rem' : '2rem',
        }}>
          {industries.map((industry, index) => {
            const isHovered = hoveredCard === index;
            const isExpanded = expandedCards[index] || false;
            const visibleFeatures = isExpanded ? industry.features : [industry.features[0]];

            return (
              <div
                key={index}
                style={{
                  background: colors.background.primary,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: isMobile ? '16px' : '24px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered && !isMobile ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? `0 24px 60px ${industry.badgeColor}15, 0 12px 24px ${colors.text.primary}05`
                    : `0 4px 12px ${colors.text.primary}03`,
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image Section */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: isMobile ? '200px' : isTablet ? '220px' : '240px',
                  overflow: 'hidden',
                  background: colors.background.glassStrong,
                }}>
                  {/* Image */}
                  <img
                    src={industry.image}
                    alt={industry.badge}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      filter: 'brightness(0.9) contrast(1.1)',
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 100%)`,
                  }} />

                  {/* Color Accent Overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `${industry.badgeColor}20`,
                    mixBlendMode: 'multiply',
                    opacity: isHovered ? 0.6 : 0.3,
                    transition: 'opacity 0.4s ease',
                  }} />

                  {/* Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1.25rem',
                    left: '1.25rem',
                    background: industry.badgeColor,
                    color: '#ffffff',
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    fontWeight: '700',
                    fontFamily: '"Inter", sans-serif',
                    padding: isMobile ? '0.5rem 1.25rem' : '0.6rem 1.5rem',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    boxShadow: `0 4px 12px ${industry.badgeColor}40`,
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  }}>
                    {industry.badge}
                  </div>
                </div>

                {/* Content Section */}
                <div style={{
                  padding: isMobile ? '1.75rem' : isTablet ? '2rem' : '2.5rem',
                }}>
                  {/* Features List */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '1.25rem' : '1.5rem',
                  }}>
                    {visibleFeatures.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        style={{
                          position: 'relative',
                          paddingLeft: isMobile ? '1rem' : '1.25rem',
                        }}
                      >
                        {/* Accent dot */}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: '0.4rem',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: industry.badgeColor,
                          opacity: 0.6,
                        }} />

                        <h4 style={{
                          fontSize: isMobile ? '0.95rem' : '1rem',
                          fontWeight: '600',
                          fontFamily: '"Inter", sans-serif',
                          color: colors.text.primary,
                          marginBottom: '0.4rem',
                          lineHeight: '1.4',
                        }}>
                          {feature.title}
                        </h4>
                        <p style={{
                          fontSize: isMobile ? '0.8rem' : '0.875rem',
                          fontFamily: '"Inter", sans-serif',
                          color: colors.text.secondary,
                          lineHeight: '1.6',
                          margin: 0,
                        }}>
                          {feature.description}
                        </p>
                      </div>
                    ))}

                    {/* Expand/Collapse Button */}
                    {industry.features.length > 1 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: isMobile ? '0.5rem' : '0.75rem',
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(index);
                          }}
                          style={{
                            width: isMobile ? '32px' : '36px',
                            height: isMobile ? '32px' : '36px',
                            borderRadius: '50%',
                            background: `${industry.badgeColor}15`,
                            border: `1px solid ${industry.badgeColor}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${industry.badgeColor}25`;
                            e.currentTarget.style.borderColor = industry.badgeColor;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `${industry.badgeColor}15`;
                            e.currentTarget.style.borderColor = `${industry.badgeColor}30`;
                          }}
                        >
                          <svg
                            width={isMobile ? "16" : "18"}
                            height={isMobile ? "16" : "18"}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={industry.badgeColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom accent line */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: industry.badgeColor,
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }} />
              </div>
            );
          })}
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

export default IndustriesSection;
