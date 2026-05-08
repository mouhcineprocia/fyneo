'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';
import { MenuIcon, CloseIcon, ChevronDownIcon } from '../../utils/icons';
import { useRouter } from "next/navigation";
import Logo from '../../utils/Logo';


interface NavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      label: 'Modules',
      href: '#modules',
      dropdown: [
        { label: 'Devis & Factures', href: '#modules' },
        { label: 'Projets & Budgets', href: '#modules' },
        { label: 'Banque & Trésorerie', href: '#modules' },
        { label: 'Pré-comptabilité', href: '#modules' },
      ]
    },
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Offres', href: '#pricing' },
    { label: 'Entreprise', href: '#entreprise' },
    { label: 'Contact', href: '#newsletter' },
  ];

  const handleDropdown = (label: string) => {
    setDropdownOpen(dropdownOpen === label ? null : label);
  };

  const scrollToSection = (href: string) => {
    if (typeof document !== 'undefined') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
    setDropdownOpen(null);
  };

  const navigateTo = (path: string) => {
    if (path.startsWith('#')) {
      scrollToSection(path);
    } else {
      router.push(path);
      setIsMenuOpen(false);
      setDropdownOpen(null);
    }
  };

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0.1rem 2rem',
        height: '70px',
        background: isScrolled 
          ? `#f2f2f2` 
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: isScrolled ? `1px solid ${colors.border.light}` : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '-45px 0px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}

          <div className="logo-section"
             style={{
              height: '150px',
            }}
          >
          <Logo className="logo-icon" style={{ color: colors.text.primary }} />
          <span className="logo-text" style={{ color: colors.text.primary }}>
            Mister
          </span>
        </div>

          {/* Desktop Navigation */}
          <div style={{
            display: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'flex' : 'none',
            alignItems: 'center',
            gap: '2rem',
          }}>
            {navItems.map((item) => (
              <div key={item.label} style={{ position: 'relative' }}>
                <button
                  onClick={() => item.dropdown ? handleDropdown(item.label) : navigateTo(item.href)}
                  onMouseEnter={() => item.dropdown && setDropdownOpen(item.label)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.text.primary,
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    fontFamily: '"Inter", sans-serif',
                    padding: '0.5rem 0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = colors.text.primary}
                  onMouseOut={(e) => e.currentTarget.style.color = colors.text.primary}
                >
                  {item.label}
                  {item.dropdown && <ChevronDownIcon size={16} />}
                </button>

                {/* Dropdown */}
                {item.dropdown && dropdownOpen === item.label && (
                  <div
                    onMouseEnter={() => setDropdownOpen(item.label)}
                    onMouseLeave={() => setDropdownOpen(null)}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: colors.background.blue,
                      backdropFilter: 'blur(20px) saturate(180%)',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: '12px',
                      padding: '0.5rem',
                      minWidth: '200px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                      zIndex: 100,
                    }}
                  >
                    {item.dropdown.map((dropdownItem) => (
                      <button
                        key={dropdownItem.label}
                        onClick={() => navigateTo(dropdownItem.href)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'none',
                          border: 'none',
                          color: colors.text.wihte,
                          fontSize: '0.9rem',
                          fontFamily: '"Inter", sans-serif',
                          textAlign: 'left',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "grey";
                          e.currentTarget.style.color = "#111425";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = colors.text.wihte;
                        }}
                      >
                        {dropdownItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div style={{
            display: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'flex' : 'none',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.text.primary,
                fontSize: '0.9rem',
                fontWeight: '500',
                fontFamily: '"Inter", sans-serif',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                transition: 'color 0.3s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseOut={(e) => e.currentTarget.style.color = colors.text.primary}
            >
              Se connecter
            </button>
            <button
              onClick={() => scrollToSection('#newsletter')}
              style={{
                background: colors.text.primary,
                border: 'none',
                color: colors.background.primary,
                fontSize: '0.9rem',
                fontWeight: '600',
                fontFamily: '"Inter", sans-serif',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 15px ${colors.text.primary}20`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${colors.text.primary}30`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 15px ${colors.text.primary}20`;
              }}
            >
              Demander une démo
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: colors.text.primary,
              padding: '0.5rem',
              cursor: 'pointer',
              zIndex: 1001,
            }}
          >
            {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: `${colors.background.secondary}f0`,
          backdropFilter: 'blur(20px) saturate(180%)',
          zIndex: 999,
          paddingTop: '5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}>
          {navItems.map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <button
                onClick={() => item.dropdown ? handleDropdown(item.label) : navigateTo(item.href)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.text.primary,
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  fontFamily: '"Inter", sans-serif',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {item.label}
                {item.dropdown && <ChevronDownIcon size={20} />}
              </button>
              
              {item.dropdown && dropdownOpen === item.label && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                }}>
                  {item.dropdown.map((dropdownItem) => (
                    <button
                      key={dropdownItem.label}
                      onClick={() => navigateTo(dropdownItem.href)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: colors.text.secondary,
                        fontSize: '1rem',
                        fontFamily: '"Inter", sans-serif',
                        padding: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      {dropdownItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '2rem',
          }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                background: 'none',
                border: `1px solid ${colors.border.light}`,
                color: colors.text.primary,
                fontSize: '1rem',
                fontWeight: '500',
                fontFamily: '"Inter", sans-serif',
                padding: '1rem 2rem',
                borderRadius: '50px',
                cursor: 'pointer',
              }}
            >
              Se connecter
            </button>
            <button
              onClick={() => scrollToSection('#newsletter')}
              style={{
                background: colors.text.primary,
                border: 'none',
                color: colors.background.primary,
                fontSize: '1rem',
                fontWeight: '600',
                fontFamily: '"Inter", sans-serif',
                padding: '1rem 2rem',
                borderRadius: '50px',
                cursor: 'pointer',
              }}
            >
              Demander une démo
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;