'use client'

import React, { useState, useEffect } from 'react';
import Navigation from '../src/components/landing/Navigation';
import HeroSection from '../src/components/landing/HeroSection';
import WorkflowSection from '../src/components/landing/WorkflowSection';
import BrandSection from '../src/components/landing/BrandSection';
import FeatureSection from '../src/components/landing/FeatureSection';
import PricingSection from '../src/components/landing/PricingSection';
import NewsletterSection from '../src/components/landing/NewsletterSection';
import Footer from '../src/components/landing/Footer';
import Loader from '../src/components/landing/Loader';

const MisterLandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{
      backgroundColor: '#0a0a0f',
      color: '#ffffff',
      minHeight: '100vh',
      width: '100%',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <HeroSection scrollY={scrollY} showVideo={showVideo} setShowVideo={setShowVideo} />
      <WorkflowSection activeTab={activeTab} setActiveTab={setActiveTab} scrollY={scrollY} />
      <BrandSection scrollY={scrollY} />
      <FeatureSection scrollY={scrollY} />
      <PricingSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default MisterLandingPage;
