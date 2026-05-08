'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';
import { ArrowRightIcon, MailIcon } from '../../utils/icons';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      setEmail('');
    }, 1500);
  };

  return (
    <section id="newsletter" style={{
      position: 'relative',
      minHeight: isMobile ? '450px' : isTablet ? '500px' : '600px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: isMobile ? '3rem 0' : isTablet ? '4rem 0' : '6rem 0',
      background: colors.background.primary,
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.02,
      }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          filter: 'blur(100px)',
          animation: 'float 6s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'float 8s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      {/* Animated Grid Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${colors.text.primary}05 1px, transparent 0)`,
        backgroundSize: '50px 50px',
        opacity: 0.1,
        animation: 'gridMove 20s linear infinite',
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '0 1rem' : isTablet ? '0 1.5rem' : '0 2rem',
      }}>
        <div style={{
          background: colors.background.primary,
          backdropFilter: 'blur(30px) saturate(180%)',
          border: `1px solid ${colors.border.light}`,
          borderRadius: isMobile ? '16px' : '24px',
          padding: isMobile ? '2rem' : isTablet ? '3rem' : '4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 20px 60px ${colors.text.primary}05`,
        }}>


          {/* Icon */}
          <div style={{
            width: isMobile ? '60px' : '80px',
            height: isMobile ? '60px' : '80px',
            margin: isMobile ? '0 auto 1.5rem' : '0 auto 2rem',
            background: colors.background.glassStrong,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${colors.border.light}`,
          }}>
            <MailIcon size={isMobile ? 24 : 32} color={colors.text.primary} />
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: isMobile ? '28px' : isTablet ? '38px' : '50px',
            fontWeight: '400',
            fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
            marginBottom: '1rem',
            color: colors.text.primary,
            lineHeight: '1.2',
          }}>
            Demandez une démo
            <br />
            <span style={{
              color: colors.text.primary,
            }}>
              au salon WAAM
            </span>
          </h2>

          {/* Subtitle */}
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            fontFamily: '"Inter", sans-serif',
            marginBottom: isMobile ? '1.25rem' : '1.5rem',
            color: colors.text.secondary,
            lineHeight: '1.6',
            maxWidth: isMobile ? '100%' : isTablet ? '500px' : '600px',
            margin: isMobile ? '0 auto 1.25rem' : '0 auto 1.5rem',
          }}>
            20-22 janvier 2026 — Casablanca
            <br />
            <strong style={{
              background: colors.background.glassStrong,
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              color: colors.text.primary,
              fontWeight: '600',
            }}>mister.io</strong> • contact@mister.io
          </p>

          {isSubmitted ? (
            /* Success State */
            <div style={{
              background: colors.background.glassStrong,
              border: `1px solid ${colors.border.light}`,
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '1.5rem' : '2rem',
              marginTop: isMobile ? '1.5rem' : '2rem',
            }}>
              <div style={{
                fontSize: isMobile ? '2.5rem' : '3rem',
                marginBottom: '1rem',
              }}>
                🎉
              </div>
              <h3 style={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: '600',
                fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
                color: colors.text.primary,
                marginBottom: '0.5rem',
              }}>
                Merci !
              </h3>
              <p style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontFamily: '"Inter", sans-serif',
                color: colors.text.secondary,
                margin: 0,
              }}>
                Votre demande a été enregistrée. Nous vous contactons rapidement.
              </p>
            </div>
          ) : (
            /* Newsletter Form */
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : isTablet ? 'column' : 'row',
              gap: isMobile ? '0.75rem' : '1rem',
              maxWidth: isMobile ? '100%' : '500px',
              margin: isMobile ? '1.5rem auto 0' : '2rem auto 0',
              alignItems: 'stretch',
            }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  required
                  style={{
                    width: '100%',
                    padding: isMobile ? '0.875rem 1.25rem' : '1rem 1.5rem',
                    borderRadius: isMobile ? '10px' : '12px',
                    border: `1px solid ${colors.border.light}`,
                    background: colors.background.glassStrong,
                    color: colors.text.primary,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    fontFamily: '"Inter", sans-serif',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(20px) saturate(180%)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.text.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${colors.text.primary}10`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !email}
                style={{
                  background: colors.text.primary,
                  border: 'none',
                  color: colors.background.primary,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '600',
                  fontFamily: '"Inter", sans-serif',
                  padding: isMobile ? '0.875rem 1.5rem' : '1rem 2rem',
                  borderRadius: isMobile ? '10px' : '12px',
                  cursor: isLoading || !email ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minWidth: isMobile ? '100%' : '150px',
                  opacity: isLoading || !email ? 0.7 : 1,
                  transform: isLoading ? 'scale(0.98)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && email) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 8px 25px ${colors.text.primary}20`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && email) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: `2px solid ${colors.background.primary}30`,
                      borderTop: `2px solid ${colors.background.primary}`,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Envoi...
                  </>
                ) : (
                  <>
                    Prendre RDV
                    <ArrowRightIcon size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Trust Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isMobile ? '1rem' : '2rem',
            marginTop: isMobile ? '2rem' : '3rem',
            flexWrap: 'wrap',
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: colors.text.tertiary,
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontFamily: '"Inter", sans-serif',
            }}>
              <span style={{ color: colors.text.primary }}>✓</span>
              Free 14-day trial
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: colors.text.tertiary,
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontFamily: '"Inter", sans-serif',
            }}>
              <span style={{ color: colors.text.primary }}>✓</span>
              No credit card required
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: colors.text.tertiary,
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontFamily: '"Inter", sans-serif',
            }}>
              <span style={{ color: colors.text.primary }}>✓</span>
              Cancel anytime
            </div>
          </div>

          {/* Privacy Note */}
          <p style={{
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.tertiary,
            marginTop: isMobile ? '1.5rem' : '2rem',
            lineHeight: '1.5',
          }}>
            We respect your privacy. Unsubscribe at any time.
            <br />
            By subscribing, you agree to our{' '}
            <a href="#" style={{
              color: colors.text.primary,
              textDecoration: 'underline',
              textDecorationColor: `${colors.text.primary}50`,
            }}>
              Privacy Policy
            </a>
            {' '}and{' '}
            <a href="#" style={{
              color: colors.text.primary,
              textDecoration: 'underline',
              textDecorationColor: `${colors.text.primary}50`,
            }}>
              Terms of Service
            </a>.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          100% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes spin {
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

export default NewsletterSection;