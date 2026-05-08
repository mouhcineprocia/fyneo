'use client';
import React from 'react';
import { useLang } from '../contexts/LangContext';
import { Sparkles } from '../assets/icons';

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer
      className="flex items-center justify-between px-4"
      style={{
        height: 38,
        borderTop: '1px solid var(--border)',
        background: 'var(--header)',
      }}
    >
      <div className="flex items-center gap-1.5">
        <Sparkles width={12} height={12} style={{ color: 'var(--primary)' }} />
        <span className="font-bold text-xs" style={{ color: 'var(--text)' }}>
          mister<span style={{ color: 'var(--primary)' }}>.</span>ai
        </span>
      </div>
      <span className="text-xs" style={{ color: 'var(--text3)' }}>
        © {year} Mister · {t('footerRights')}
      </span>
      <div className="flex items-center gap-3">
        {['Privacy', 'Terms'].map(link => (
          <a
            key={link}
            href="#"
            className="text-xs transition-colors"
            style={{ color: 'var(--text3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}
