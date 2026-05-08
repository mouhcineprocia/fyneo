'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLang } from '../contexts/LangContext';
import { ChevronLeft, ChevronRight, Layout, Users } from '../assets/icons';
import type { TKey } from '../i18n';

const menuItems: { key: TKey; href: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', href: '/dashboard', icon: <Layout width={13} height={13} /> },
  { key: 'admin', href: '/admin', icon: <Users width={13} height={13} /> },
];

export default function NavMenu() {
  const { t } = useLang();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    if (el) ro.observe(el);
    return () => { el?.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
  };

  const arrowBtn = `flex items-center justify-center shrink-0 transition-opacity duration-150`;

  return (
    <nav
      className="fixed left-0 right-0 z-[60] flex items-center px-2 gap-1"
      style={{
        top: 52, height: 38,
        background: 'var(--header)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left arrow */}
      <button
        className={arrowBtn}
        onClick={() => scroll('left')}
        style={{
          width: 22, height: 22, borderRadius: 4,
          color: 'var(--text3)',
          background: canLeft ? 'var(--border)' : 'transparent',
          opacity: canLeft ? 1 : 0.3,
          cursor: canLeft ? 'pointer' : 'default',
        }}
        disabled={!canLeft}
      >
        <ChevronLeft width={14} height={14} />
      </button>

      {/* Scrollable items */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex items-center gap-0.5 flex-1 overflow-x-auto"
      >
        {menuItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              className="shrink-0 whitespace-nowrap px-3 py-1 text-xs font-medium rounded transition-colors duration-150"
              style={{
                color: isActive ? 'var(--primary)' : 'var(--text2)',
                background: isActive ? 'var(--primaryL)' : 'transparent',
                border: isActive ? '1px solid var(--primaryB)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--border)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                {item.icon}
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Right arrow */}
      <button
        className={arrowBtn}
        onClick={() => scroll('right')}
        style={{
          width: 22, height: 22, borderRadius: 4,
          color: 'var(--text3)',
          background: canRight ? 'var(--border)' : 'transparent',
          opacity: canRight ? 1 : 0.3,
          cursor: canRight ? 'pointer' : 'default',
        }}
        disabled={!canRight}
      >
        <ChevronRight width={14} height={14} />
      </button>
    </nav>
  );
}
