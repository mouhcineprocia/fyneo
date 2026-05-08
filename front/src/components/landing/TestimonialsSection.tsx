'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../utils/colors';
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '../../utils/icons';

interface TestimonialsSectionProps {
  scrollY: number;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ scrollY }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
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

  const testimonials = [
    {
      id: 1,
      name: 'Amira Benali',
      role: 'Senior Developer',
      company: 'TechCorp',
      avatarColor: '#FF6B6B',
      content: 'Build complex workflows that other tools can\'t. I used other tools before. I got to know Procia and I say it properly: it is better to do everything on Procia! Congratulations on your work, you are a star!',
      rating: 5,
      background: colors.background.secondary,
    },
    {
      id: 2,
      name: 'Pierre Dubois',
      role: 'Product Manager',
      company: 'InnovateLab',
      avatarColor: '#4ECDC4',
      content: 'Thank you to the Procia community. I did the beginners course and promptly took an automation WAY beyond my skill level. The platform makes complex workflows accessible to everyone.',
      rating: 5,
      background: colors.background.secondary,
    },
    {
      id: 3,
      name: 'Youssef El Idrissi',
      role: 'DevOps Engineer',
      company: 'CloudScale',
      avatarColor: '#45B7D1',
      content: 'Procia is a beast for automation. Self-hosting and low-code make it a dev\'s dream. If you\'re not automating yet, you\'re working too hard.',
      rating: 5,
      background: colors.background.secondary,
    },
    {
      id: 4,
      name: 'Camille Martin',
      role: 'Solutions Architect',
      company: 'Enterprise Inc',
      avatarColor: '#96CEB4',
      content: 'I\'ve said it many times. But I\'ll say it again. Procia is the GOAT. Anything is possible with Procia. You just need some technical knowledge + imagination.',
      rating: 5,
      background: colors.background.secondary,
    },
    {
      id: 5,
      name: 'Omar Ziani',
      role: 'Full Stack Developer',
      company: 'StartupXYZ',
      avatarColor: '#FECA57',
      content: 'It blows my mind. I was hating on no-code tools my whole life, but Procia changed everything. Made a Slack agent that can basically do everything, in half an hour.',
      rating: 5,
      background: colors.background.secondary,
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length, isAutoPlaying]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToTestimonial = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentTestimonial(index);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section style={{
      padding: isMobile ? '2rem 0 3rem' : isTablet ? '2rem 0 4rem' : '2rem 0 5rem',
      background: colors.background.primary,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.02,
        transform: `translateY(${scrollY * 0.02}px)`,
      }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${200 + i * 50}px`,
              height: `${200 + i * 50}px`,
              background: `linear-gradient(45deg, ${colors.text.primary}10, ${colors.text.secondary}10)`,
              borderRadius: '50%',
              filter: 'blur(100px)',
              top: `${20 + i * 25}%`,
              right: `${10 + i * 15}%`,
              animation: `float ${6 + i}s ease-in-out infinite alternate`,
              animationDelay: `${i * 1}s`,
            }}
          />
        ))}
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
              Customer Stories
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
            Hear From Our
            <span style={{
              marginLeft: '10px'
            }}>
              Customers
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
            See how teams worldwide are transforming their workflows with Procia
          </p>
        </div>

        {/* Testimonial Slider */}
        <div style={{
          position: 'relative',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            style={{
              position: 'absolute',
              left: isMobile ? '0.5rem' : isTablet ? '1rem' : '-4rem',
              top: isMobile ? '-3rem' : '50%',
              transform: isMobile ? 'translateY(0)' : 'translateY(-50%)',
              background: colors.background.primary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: '50%',
              width: isMobile ? '40px' : '48px',
              height: isMobile ? '40px' : '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(20px) saturate(180%)',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.background.glassStrong;
              e.currentTarget.style.borderColor = colors.border.medium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.background.glass;
              e.currentTarget.style.borderColor = colors.border.light;
            }}
          >
            <ChevronLeftIcon size={isMobile ? 16 : 20} color={colors.text.primary} />
          </button>

          <button
            onClick={nextTestimonial}
            style={{
              position: 'absolute',
              right: isMobile ? '0.5rem' : isTablet ? '1rem' : '-4rem',
              top: isMobile ? '-3rem' : '50%',
              transform: isMobile ? 'translateY(0)' : 'translateY(-50%)',
              background: colors.background.primary,
              border: `1px solid ${colors.border.light}`,
              borderRadius: '50%',
              width: isMobile ? '40px' : '48px',
              height: isMobile ? '40px' : '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(20px) saturate(180%)',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.background.glassStrong;
              e.currentTarget.style.borderColor = colors.border.medium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.background.glass;
              e.currentTarget.style.borderColor = colors.border.light;
            }}
          >
            <ChevronRightIcon size={isMobile ? 16 : 20} color={colors.text.primary} />
          </button>

          {/* Testimonial Card */}
          <div style={{
            background: colors.background.primary,
            border: `1px solid ${colors.border.light}`,
            borderRadius: isMobile ? '16px' : '24px',
            padding: isMobile ? '1.5rem' : isTablet ? '2.25rem' : '3rem',
            paddingTop: isMobile ? '2.5rem' : isTablet ? '2.25rem' : '3rem',
            backdropFilter: 'blur(20px) saturate(180%)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: isMobile ? '280px' : '320px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            {/* Quote */}
            <div style={{
              fontSize: isMobile ? '1rem' : isTablet ? '1.15rem' : '1.25rem',
              fontFamily: '"Inter", sans-serif',
              lineHeight: '1.6',
              color: colors.text.secondary,
              marginBottom: isMobile ? '1.5rem' : '2rem',
              fontStyle: 'italic',
              position: 'relative',
            }}>
              <span style={{
                fontSize: isMobile ? '3rem' : '4rem',
                color: colors.text.primary,
                position: 'absolute',
                top: isMobile ? '-0.75rem' : '-1rem',
                left: isMobile ? '-0.75rem' : '-1rem',
                opacity: 0.1,
                fontFamily: 'serif',
              }}>
                "
              </span>
              <span style={{ position: 'relative', zIndex: 2 }}>
                {testimonials[currentTestimonial].content}
              </span>
            </div>

            {/* Author Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.75rem' : '1rem',
            }}>
              <div
                style={{
                  width: isMobile ? '50px' : '60px',
                  height: isMobile ? '50px' : '60px',
                  borderRadius: '50%',
                  backgroundColor: testimonials[currentTestimonial].avatarColor,
                  border: `2px solid ${colors.border.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '1.2rem' : '1.4rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {testimonials[currentTestimonial].name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  fontWeight: '600',
                  fontFamily: '"Aspekta 500", "Aspekta 500 Placeholder", sans-serif',
                  color: colors.text.primary,
                  margin: '0 0 0.25rem 0',
                }}>
                  {testimonials[currentTestimonial].name}
                </h4>
                <p style={{
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontFamily: '"Inter", sans-serif',
                  color: colors.text.tertiary,
                  margin: '0 0 0.5rem 0',
                }}>
                  {testimonials[currentTestimonial].role} 
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.25rem',
                }}>
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <StarIcon key={i} size={isMobile ? 14 : 16} color={colors.text.primary} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '0.375rem' : '0.5rem',
            marginTop: isMobile ? '1.5rem' : '2rem',
          }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                style={{
                  width: isMobile ? '10px' : '12px',
                  height: isMobile ? '10px' : '12px',
                  borderRadius: '50%',
                  border: 'none',
                  background: currentTestimonial === index
                    ? colors.text.primary
                    : colors.border.light,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (currentTestimonial !== index) {
                    e.currentTarget.style.background = colors.border.medium;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTestimonial !== index) {
                    e.currentTarget.style.background = colors.border.light;
                  }
                }}
              />
            ))}
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
      `}</style>
    </section>
  );
};

export default TestimonialsSection;