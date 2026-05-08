'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';
import {
  TwitterIcon,
  LinkedInIcon,
  GitHubIcon,
  FacebookIcon,
  MailIcon,
  PhoneIcon,
  LocationIcon
} from '../../utils/icons';
import Logo from '../../utils/Logo';


const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
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

  const footerSections = [
    {
      title: 'Modules',
      links: [
        { label: 'Devis & Factures', href: '#modules' },
        { label: 'Projets & Budgets', href: '#modules' },
        { label: 'Banque & Trésorerie', href: '#modules' },
        { label: 'Pré-comptabilité', href: '#modules' },
      ],
    },
    {
      title: 'Entreprise',
      links: [
        { label: 'À propos', href: '#about' },
        { label: 'Carrières', href: '#careers' },
        { label: 'Blog', href: '#blog' },
        { label: 'Partenaires', href: '#partners' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Ressources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Centre d\'aide', href: '#help' },
        { label: 'Communauté', href: '#community' },
        { label: 'Modèles', href: '#templates' },
        { label: 'Sécurité', href: '#security' },
      ],
    },
    {
      title: 'Légal',
      links: [
        { label: 'Politique de confidentialité', href: '#privacy' },
        { label: 'Conditions d\'utilisation', href: '#terms' },
        { label: 'Cookies', href: '#cookies' },
        { label: 'RGPD', href: '#gdpr' },
        { label: 'Conformité', href: '#compliance' },
      ],
    },
  ];

  const socialLinks = [
    { icon: TwitterIcon, href: 'https://x.com/mister_?s=11', label: 'Twitter' },
    { icon: LinkedInIcon, href: 'https://www.linkedin.com/company/mistera/', label: 'LinkedIn' },
 /*    { icon: GitHubIcon, href: '#GitHub', label: 'GitHub' },
    { icon: FacebookIcon, href: '#Facebook', label: 'Facebook' }, */
  ];

  const scrollToSection = (href: string) => {
    if (typeof document !== 'undefined') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer style={{
      background: colors.background.primary,
      borderTop: `1px solid ${colors.border.light}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${colors.text.primary}03 1px, transparent 0)`,
        backgroundSize: '30px 30px',
        opacity: 0.5,
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '0 1rem' : isTablet ? '0 1.5rem' : '0 2rem',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : isTablet
              ? '1fr repeat(2, 1fr)'
              : '1fr repeat(4, 200px)',
          gap: isMobile ? '2rem' : '3rem',
          padding: isMobile ? '3rem 0 2rem' : isTablet ? '4rem 0 2rem' : '6rem 0 2rem',
        }}>
          {/* Company Info */}
          <div style={{
            gridColumn: isMobile ? '1' : isTablet ? '1 / -1' : '1',

          }}>
            {/* Logo */}
            

            <div className="logo-section"
            style={{
                height: isMobile ? '140px' : isTablet ? '145px' : '160px',
                width: 'auto',
                marginTop: isMobile ? '-20px' : isTablet ?  '-20px' : '-70px',
                cursor: 'pointer',
                objectFit: 'contain',
                imageRendering: 'crisp-edges',
                marginLeft: isMobile ? '-20px' : isTablet ?  '-20px' : '-20px',
                display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
              }}
          >
          <Logo className="logo-icon" style={{ color: colors.text.primary }} />
          <span className="logo-text" style={{ color: colors.text.primary }}>
            Mister
          </span>
        </div>
            
            {/* Description */}
            <p style={{
              color: colors.text.secondary,
              fontFamily: '"Inter", sans-serif',
              lineHeight: '1.6',
              marginBottom: isMobile ? '1.25rem' : '1.5rem',
              maxWidth: isMobile ? '100%' : isTablet ? '100%' : '350px',
              fontSize: isMobile ? '0.9rem' : '1rem',
            }}>
              Plateforme tout-en-un pour piloter la finance des PME et automatiser la pré-comptabilité avec l'IA.
            </p>

            {/* Contact Info */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '0.6rem' : '0.75rem',
              marginBottom: isMobile ? '1.5rem' : '2rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: colors.text.tertiary,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontFamily: '"Inter", sans-serif',
              }}>
                <MailIcon size={16} color={colors.text.tertiary} />
                <a href="#mail" style={{
                  color: colors.text.tertiary,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.text.primary}
                onMouseOut={(e) => e.currentTarget.style.color = colors.text.tertiary}
                >
                  contact@mister.io
                </a>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: colors.text.tertiary,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontFamily: '"Inter", sans-serif',
              }}>
                <PhoneIcon size={16} color={colors.text.tertiary} />
                <a href="#tel" style={{
                  color: colors.text.tertiary,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.text.primary}
                onMouseOut={(e) => e.currentTarget.style.color = colors.text.tertiary}
                >
                  +33 1 45 83 54 07
                </a>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: colors.text.tertiary,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontFamily: '"Inter", sans-serif',
              }}>
                <LocationIcon size={16} color={colors.text.tertiary} />
                <span>1-7 Cr Valmy, 92800 Paris, France</span>
              </div>
            </div>

            {/* Social Links */}
            <div style={{
              display: 'flex',
              gap: isMobile ? '0.75rem' : '1rem',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}>
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    aria-label={social.label}
                    style={{
                      width: isMobile ? '36px' : '40px',
                      height: isMobile ? '36px' : '40px',
                      background: colors.background.glassStrong,
                      borderRadius: isMobile ? '10px' : '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textDecoration: 'none',
                      border: `1px solid ${colors.border.light}`,
                      backdropFilter: 'blur(20px) saturate(180%)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.text.primary;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 8px 25px ${colors.text.primary}20`;
                      e.currentTarget.style.borderColor = colors.text.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.background.glassStrong;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = colors.border.light;
                    }}
                  >
                    <Icon size={isMobile ? 16 : 18} color={colors.text.secondary} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {!isMobile && footerSections.map((section, index) => (
            <div key={index}>
              <h4 style={{
                fontSize: isTablet ? '1rem' : '1.1rem',
                fontWeight: '600',
                fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
                marginBottom: isTablet ? '0.875rem' : '1rem',
                color: colors.text.primary,
              }}>
                {section.title}
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: colors.text.secondary,
                        textDecoration: 'none',
                        transition: 'color 0.3s ease',
                        fontSize: isTablet ? '0.9rem' : '0.95rem',
                        fontFamily: '"Inter", sans-serif',
                        padding: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = colors.text.primary}
                      onMouseOut={(e) => e.currentTarget.style.color = colors.text.secondary}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Mobile Footer Links */}
          {isMobile && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.5rem',
              marginTop: '1.5rem',
            }}>
              {footerSections.slice(0, 2).map((section, index) => (
                <div key={index}>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
                    marginBottom: '0.875rem',
                    color: colors.text.primary,
                  }}>
                    {section.title}
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}>
                    {section.links.slice(0, 4).map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: colors.text.secondary,
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                            fontFamily: '"Inter", sans-serif',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div style={{
          background: colors.background.glassStrong,
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
          marginBottom: isMobile ? '2rem' : '3rem',
          border: `1px solid ${colors.border.light}`,
          backdropFilter: 'blur(20px) saturate(180%)',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: '600',
            fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
            color: colors.text.primary,
            marginBottom: '0.5rem',
          }}>
            Stay up to date
          </h3>
          <p style={{
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontFamily: '"Inter", sans-serif',
            color: colors.text.secondary,
            marginBottom: isMobile ? '1.25rem' : '1.5rem',
          }}>
            Get the latest updates on new features and automation tips
          </p>
          <div style={{
            display: 'flex',
            gap: isMobile ? '0.75rem' : '1rem',
            maxWidth: isMobile ? '100%' : '400px',
            margin: '0 auto',
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: isMobile ? '0.625rem 0.875rem' : '0.75rem 1rem',
                borderRadius: isMobile ? '6px' : '8px',
                border: `1px solid ${colors.border.light}`,
                background: colors.background.glass,
                color: colors.text.primary,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontFamily: '"Inter", sans-serif',
                outline: 'none',
                backdropFilter: 'blur(20px) saturate(180%)',
              }}
            />
            <button style={{
              background: colors.text.primary,
              border: 'none',
              color: colors.background.primary,
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: '"Inter", sans-serif',
              padding: isMobile ? '0.625rem 1.25rem' : '0.75rem 1.5rem',
              borderRadius: isMobile ? '6px' : '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={{
          borderTop: `1px solid ${colors.border.light}`,
          paddingTop: isMobile ? '1.5rem' : '2rem',
          paddingBottom: isMobile ? '1.5rem' : '2rem',
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: isMobile ? '0.75rem' : '1rem',
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <p style={{
            color: colors.text.tertiary,
            fontFamily: '"Inter", sans-serif',
            margin: 0,
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            textAlign: 'center',
          }}>
            © {currentYear} Mister. All rights reserved.
          </p>
          
          <div style={{
            display: 'flex',
            gap: isMobile ? '1rem' : '2rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {['Privacy', 'Terms', 'Cookies', 'Security'].map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(`#${item.toLowerCase()}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.text.tertiary,
                  textDecoration: 'none',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontFamily: '"Inter", sans-serif',
                  transition: 'color 0.3s ease',
                  cursor: 'pointer',
                  padding: 0,
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.text.primary}
                onMouseOut={(e) => e.currentTarget.style.color = colors.text.tertiary}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
      
      </div>
    </footer>
  );
};

export default Footer;