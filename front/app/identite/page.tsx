'use client';
import React from 'react';
import { useLang } from '../../src/contexts/LangContext';
import * as Icons from '../../src/assets/icons';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="font-bold text-sm mb-3 pb-2" style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
      {title}
    </h2>
    {children}
  </section>
);

const Swatch = ({ label, color, text = 'white' }: { label: string; color: string; text?: string }) => (
  <div className="flex flex-col gap-1">
    <div
      className="rounded flex items-end p-2"
      style={{ height: 64, background: color }}
    />
    <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{label}</span>
    <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{color}</span>
  </div>
);

export default function IdentitePage() {
  const { t, lang } = useLang();

  const colorRows = [
    {
      title: t('primary'),
      swatches: [
        { label: 'Primary 700', color: '#3d6242' },
        { label: 'Primary 600', color: '#4a7b51' },
        { label: 'Primary 500', color: '#598c60' },
        { label: 'Primary 400', color: '#72a879' },
        { label: 'Primary 200', color: 'rgba(89,140,96,0.2)' },
        { label: 'Primary 100', color: 'rgba(89,140,96,0.1)' },
      ],
    },
    {
      title: lang === 'fr' ? 'Sémantique' : 'Semantic',
      swatches: [
        { label: t('success'), color: '#16a34a' },
        { label: t('warning'), color: '#d97706' },
        { label: t('danger'), color: '#dc2626' },
        { label: t('info'), color: '#2563eb' },
      ],
    },
    {
      title: t('neutral'),
      swatches: [
        { label: 'Near Black', color: '#0b0b0e' },
        { label: 'Dark 100', color: '#121215' },
        { label: 'Dark 200', color: '#1c1c20' },
        { label: 'Light BG', color: '#f0f2f7' },
        { label: 'White', color: '#ffffff' },
      ],
    },
  ];

  const typeScale = [
    { label: 'Display', size: '28px', weight: '700', sample: 'Facturation IA' },
    { label: 'Heading 1', size: '20px', weight: '700', sample: 'Tableau de bord' },
    { label: 'Heading 2', size: '16px', weight: '600', sample: 'Factures récentes' },
    { label: 'Heading 3', size: '14px', weight: '600', sample: 'Statut du paiement' },
    { label: 'Body', size: '13px', weight: '400', sample: 'Le texte courant utilise cette taille pour une lisibilité optimale.' },
    { label: 'Small', size: '12px', weight: '400', sample: 'Métadonnées, horodatages, étiquettes secondaires' },
    { label: 'XSmall', size: '11px', weight: '500', sample: 'BADGES · TAGS · LABELS' },
  ];

  const iconList = Object.entries(Icons).filter(([k]) => k !== 'IconProps') as [string, React.FC<Icons.IconProps>][];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-bold text-base" style={{ color: 'var(--text)' }}>{t('identityTitle')}</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
          {lang === 'fr' ? 'Palette, typographie, composants et icônes du design system.' : 'Design system palette, typography, components and icons.'}
        </p>
      </div>

      {/* Colors */}
      <Section title={t('colors')}>
        <div className="flex flex-col gap-5">
          {colorRows.map(row => (
            <div key={row.title}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text2)' }}>{row.title}</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
                {row.swatches.map(sw => <Swatch key={sw.label} {...sw} />)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title={t('typography')}>
        <div className="glass-card overflow-hidden">
          {typeScale.map((ts, i) => (
            <div
              key={ts.label}
              className="flex items-baseline gap-4 px-4 py-3"
              style={{ borderBottom: i < typeScale.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div style={{ width: 80, flexShrink: 0 }}>
                <span className="text-xs font-mono" style={{ color: 'var(--text3)' }}>{ts.label}</span>
              </div>
              <div style={{ width: 80, flexShrink: 0 }}>
                <span className="text-xs font-mono" style={{ color: 'var(--primary)' }}>{ts.size} / {ts.weight}</span>
              </div>
              <span
                style={{
                  fontSize: ts.size,
                  fontWeight: ts.weight,
                  color: 'var(--text)',
                  lineHeight: 1.3,
                  fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
                }}
              >
                {ts.sample}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Components */}
      <Section title={t('components')}>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>

          {/* Buttons */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text2)' }}>{t('buttons')}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: lang === 'fr' ? 'Primaire' : 'Primary', bg: 'var(--primary)', color: 'white', hbg: 'var(--primaryH)' },
                { label: lang === 'fr' ? 'Secondaire' : 'Secondary', bg: 'var(--border)', color: 'var(--text)', hbg: 'var(--card-b)' },
                { label: lang === 'fr' ? 'Fantôme' : 'Ghost', bg: 'transparent', color: 'var(--text2)', hbg: 'var(--border)', border: '1px solid var(--border)' },
                { label: lang === 'fr' ? 'Danger' : 'Danger', bg: 'var(--dangerL)', color: 'var(--danger)', hbg: 'var(--danger)', hcolor: 'white', border: '1px solid rgba(220,38,38,0.2)' },
              ].map(btn => (
                <button
                  key={btn.label}
                  className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                  style={{ background: btn.bg, color: btn.color, border: btn.border || 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = btn.hbg; if (btn.hcolor) e.currentTarget.style.color = btn.hcolor; }}
                  onMouseLeave={e => { e.currentTarget.style.background = btn.bg; if (btn.hcolor) e.currentTarget.style.color = btn.color; }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text2)' }}>{t('badges')}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: lang === 'fr' ? 'Payée' : 'Paid', bg: 'var(--successL)', color: 'var(--success)' },
                { label: lang === 'fr' ? 'En attente' : 'Pending', bg: 'var(--warnL)', color: 'var(--warn)' },
                { label: lang === 'fr' ? 'En retard' : 'Overdue', bg: 'var(--dangerL)', color: 'var(--danger)' },
                { label: lang === 'fr' ? 'Brouillon' : 'Draft', bg: 'var(--border)', color: 'var(--text3)' },
                { label: 'AI', bg: 'var(--primaryL)', color: 'var(--primary)', border: '1px solid var(--primaryB)' },
              ].map(b => (
                <span
                  key={b.label}
                  className="inline-flex px-2 py-0.5 rounded text-xs font-semibold"
                  style={{ background: b.bg, color: b.color, border: (b as any).border }}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Stat card demo */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text2)' }}>{t('cards')}</p>
            <div className="glass-card p-3">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--text3)' }}>
                  {lang === 'fr' ? 'Total Factures' : 'Total Invoices'}
                </span>
                <div className="flex items-center justify-center rounded" style={{ width: 26, height: 26, background: 'var(--primaryL)', color: 'var(--primary)' }}>
                  <Icons.FileText width={14} height={14} />
                </div>
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>1 247</p>
              <div className="flex items-center gap-1 mt-1">
                <Icons.TrendingUp width={11} height={11} style={{ color: 'var(--success)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>+12%</span>
                <span className="text-xs" style={{ color: 'var(--text3)' }}>vs mois dernier</span>
              </div>
            </div>
          </div>

          {/* Input demo */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text2)' }}>{lang === 'fr' ? 'Champs de saisie' : 'Input Fields'}</p>
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs" style={{ color: 'var(--text3)' }}>{lang === 'fr' ? 'Nom du client' : 'Client name'}</span>
                <input
                  type="text"
                  placeholder="Acme Corporation"
                  className="text-xs px-3 py-2 rounded outline-none transition-colors"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    width: '100%',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs" style={{ color: 'var(--text3)' }}>{lang === 'fr' ? 'Montant' : 'Amount'}</span>
                <input
                  type="text"
                  placeholder="2 400,00 €"
                  className="text-xs px-3 py-2 rounded outline-none transition-colors"
                  style={{
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    width: '100%',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
              </label>
            </div>
          </div>
        </div>
      </Section>

      {/* Icons */}
      <Section title={t('iconsTitle')}>
        <div className="glass-card p-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {iconList.map(([name, Icon]) => (
              <div
                key={name}
                className="flex flex-col items-center gap-1.5 p-2 rounded transition-colors cursor-pointer"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.borderColor = 'var(--card-b)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                title={name}
              >
                <Icon width={18} height={18} style={{ color: 'var(--text2)' }} />
                <span className="text-center font-mono" style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.3 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
