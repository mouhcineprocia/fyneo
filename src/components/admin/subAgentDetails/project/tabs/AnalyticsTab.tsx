'use client';
import React from 'react';
import * as Icons from '../../../../../assets/icons';
import { fmtCurrency, fmtDate, StatCard, ProgressBar } from '../shared';
import type { Project, Prestation, Depense, Facture, ChargeSociale, WalletTransaction } from '../types';

interface Props {
  project: Project;
  prestations: Prestation[];
  depenses: Depense[];
  factures: Facture[];
  chargesSociales: ChargeSociale[];
  walletTxs: WalletTransaction[];
  isRegie: boolean;
}

export const AnalyticsTab: React.FC<Props> = ({ project, prestations, depenses, factures, chargesSociales, walletTxs, isRegie }) => {
  const endMs    = project.endDate   ? new Date(project.endDate).getTime()   : Date.now();
  const startMs  = project.startDate ? new Date(project.startDate).getTime() : Date.now();
  const daysLeft = Math.ceil((endMs - Date.now()) / (1000 * 60 * 60 * 24));
  const span     = endMs - startMs;
  const progress = span > 0 ? Math.min(100, Math.max(0, Math.round((Date.now() - startMs) / span * 100))) : 0;
  const walletBalance = walletTxs.reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Budget total" value={fmtCurrency(project.budget ?? 0)} color="#0d9394" icon={<Icons.DollarSign style={{ width: 16, height: 16 }} />} />
        <StatCard label="Dépenses engagées" value={fmtCurrency(depenses.reduce((s, d) => s + d.amount, 0))} sub="3% du budget" color="#f59e0b" icon={<Icons.TrendingDown style={{ width: 16, height: 16 }} />} />
        <StatCard label="CA facturé" value={fmtCurrency(factures.filter(f => f.montantTtc > 0).reduce((s, f) => s + f.montantTtc, 0))} color="#22c55e" icon={<Icons.TrendingUp style={{ width: 16, height: 16 }} />} />
        <StatCard label="Solde Wallet" value={fmtCurrency(walletBalance)} color="#8b5cf6" icon={<Icons.CreditCard style={{ width: 16, height: 16 }} />} />
        {isRegie && (
          <StatCard label="Prestations" value={`${prestations.filter(p => p.status === 'VALIDER').length} / ${prestations.length}`} sub="validées" color="#14b8a6" icon={<Icons.Briefcase style={{ width: 16, height: 16 }} />} />
        )}
        <StatCard label="Jours restants" value={daysLeft > 0 ? `${daysLeft} j` : 'Terminé'} color={daysLeft < 30 ? '#ef4444' : '#0d9394'} icon={<Icons.Calendar style={{ width: 16, height: 16 }} />} />
      </div>

      {/* Progress & info row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>Progression du projet</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9394' }}>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>Début: {project.startDate ? fmtDate(project.startDate) : '—'}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>Fin: {project.endDate ? fmtDate(project.endDate) : '—'}</span>
          </div>
        </div>

        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 10 }}>Répartition budget</span>
          {[
            { label: 'Facturé',         value: factures.filter(f => f.montantTtc > 0).reduce((s, f) => s + f.montantTtc, 0), color: '#22c55e' },
            { label: 'Dépenses',        value: depenses.reduce((s, d) => s + d.amount, 0),                                     color: '#f59e0b' },
            { label: 'Charges sociales', value: chargesSociales.reduce((s, c) => s + c.montant, 0),                           color: '#8b5cf6' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>{item.label}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text)' }}>{fmtCurrency(item.value)}</span>
              </div>
              <ProgressBar value={(item.value / project.budget) * 100} color={item.color} />
            </div>
          ))}
        </div>

        <div style={{ flex: '1 1 240px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 10 }}>Activité récente</span>
          {[
            { icon: '✅', text: isRegie ? 'Prestation validée' : 'Commande validée', time: 'Il y a 2h',  color: '#22c55e' },
            { icon: '📄', text: 'Nouvelle facture générée',                           time: 'Il y a 1j',  color: '#0d9394' },
            { icon: '⏳', text: 'Dépense en attente',                                 time: 'Il y a 3j',  color: '#f59e0b' },
            { icon: '💬', text: 'Nouveau commentaire',                                time: 'Il y a 5j',  color: '#8b5cf6' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>{a.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 500, color: 'var(--text)' }}>{a.text}</p>
                <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--text3)' }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status distribution */}
      <div style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 12 }}>Distribution des statuts</span>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Validés',        count: prestations.filter(p => p.status === 'VALIDER').length + factures.filter(f => f.status === 'VALIDER').length, color: '#22c55e' },
            { label: 'En traitement',  count: prestations.filter(p => p.status === 'EN_TRAITEMENT').length + depenses.filter(d => d.status === 'EN_TRAITEMENT').length, color: '#f59e0b' },
            { label: 'Créés',          count: prestations.filter(p => p.status === 'CREER').length, color: 'var(--text3)' },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 100px', backgroundColor: 'var(--bg2)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.count}</p>
              <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text2)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
