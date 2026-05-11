'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from '../../../../assets/icons';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const fmtCurrency = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const getFileIcon = (t: string) => {
  if (t.includes('pdf')) return '📄';
  if (t.includes('doc')) return '📝';
  if (t.includes('xls')) return '📊';
  if (t.includes('png') || t.includes('jpg')) return '🖼️';
  return '📁';
};

// ─── Status badge ─────────────────────────────────────────────────────────────

export const statusBadge = (status: string) => {
  const m: Record<string, { label: string; bg: string; color: string; border: string }> = {
    VALIDER:       { label: 'Validé',        bg: 'rgba(34,197,94,0.1)',   color: '#22c55e',      border: 'rgba(34,197,94,0.3)'   },
    EN_TRAITEMENT: { label: 'En traitement', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b',      border: 'rgba(245,158,11,0.3)'  },
    CREER:         { label: 'Créé',          bg: 'rgba(107,114,128,0.1)',color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
    PAYER:         { label: 'Payé',          bg: 'rgba(20,184,166,0.1)', color: '#14b8a6',      border: 'rgba(20,184,166,0.3)'  },
    NON_PAYER:     { label: 'Non payé',      bg: 'rgba(239,68,68,0.1)',  color: '#ef4444',      border: 'rgba(239,68,68,0.3)'   },
    ANNULER:       { label: 'Annulé',        bg: 'rgba(107,114,128,0.1)',color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
  };
  const s = m[status] || { label: status, bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' };
  return (
    <span style={{ height: 20, fontSize: '0.6rem', fontWeight: 600, borderRadius: 4, padding: '0 7px', display: 'inline-flex', alignItems: 'center', backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
};

// ─── Shared primitives ────────────────────────────────────────────────────────

export const Skel = ({ w, h, r = 4 }: { w: number | string; h: number; r?: number }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, var(--bg2) 25%, var(--border) 50%, var(--bg2) 75%)', backgroundSize: '200% 100%', animation: 'od-shimmer 1.5s infinite' }} />
);

export const StatCard = ({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: React.ReactNode }) => (
  <div style={{ flex: '1 1 160px', minWidth: 140, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text3)', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--text3)' }}>{sub}</p>}
    </div>
  </div>
);

export const ProgressBar = ({ value, color = '#0d9394' }: { value: number; color?: string }) => (
  <div style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, value)}%`, height: '100%', borderRadius: 3, backgroundColor: color, transition: 'width 0.8s ease' }} />
  </div>
);

export const TableWrap = ({ headers, children, empty }: { headers: string[]; children?: React.ReactNode; empty?: boolean }) => (
  <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
      <thead>
        <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
          {headers.map((h, i) => (
            <th key={h} style={{ padding: '9px 12px', textAlign: i === headers.length - 1 && h === 'Actions' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {empty
          ? <tr><td colSpan={headers.length} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)', fontSize: '0.7rem' }}>Aucune donnée à afficher.</td></tr>
          : children}
      </tbody>
    </table>
  </div>
);

export const TdRow = ({ children, last }: { children: React.ReactNode; last?: boolean }) => (
  <tr
    style={{ borderBottom: last ? 'none' : '1px solid var(--bg2)', transition: 'background 0.1s' }}
    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
    {children}
  </tr>
);

export const ActionBtn = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
  <button title={title} style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
    {icon}
  </button>
);

export const Pagination = ({ page, setPage, rowsPerPage, total }: {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  total: number;
}) => {
  const start = total === 0 ? 0 : page * rowsPerPage + 1;
  const end = Math.min((page + 1) * rowsPerPage, total);
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>{total === 0 ? '0' : `${start}-${end} sur ${total}`}</span>
      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
        style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronLeft style={{ width: 12, height: 12 }} />
      </button>
      <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * rowsPerPage >= total}
        style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', cursor: (page + 1) * rowsPerPage >= total ? 'default' : 'pointer', opacity: (page + 1) * rowsPerPage >= total ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight style={{ width: 12, height: 12 }} />
      </button>
    </div>
  );
};

export const SearchBar = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', flex: 1, maxWidth: 320 }}>
      <Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="Rechercher..."
        style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.7rem', color: 'var(--text)', width: '100%' }} />
      {value && (
        <button onClick={() => onChange('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 0 }}>
          <X style={{ width: 12, height: 12 }} />
        </button>
      )}
    </div>
  </div>
);

// ─── AI Insight messages per tab ──────────────────────────────────────────────

export const TAB_AI_INSIGHTS: Record<string, string> = {
  analytics:     "Analyse IA: Ce projet affiche un taux de progression de 68%. Le budget est maîtrisé à 94%, avec 3 jalons validés sur 5. Je recommande de surveiller les dépenses de mars qui sont en hausse de 12%.",
  prestations:   "Analyse IA: 4 prestations sur 6 sont validées, représentant 76% du budget prévu. 2 prestations sont en cours de traitement. Le taux de validation mensuel est excellent.",
  depenses:      "Analyse IA: Les dépenses totales s'élèvent à 3 174 €. La catégorie Formation représente 38% des dépenses. 4 dépenses validées, 2 en attente. Aucune anomalie détectée.",
  factures:      "Analyse IA: 3 factures validées pour un total de 45 216 €. 1 facture en attente de paiement (15 000 €). Le taux de recouvrement est de 75% ce trimestre.",
  commandes:     "Analyse IA: 4 bons de commande actifs pour un montant total de 39 500 €. 2 commandes validées, 1 en traitement, 1 en création. Délai moyen de traitement: 5 jours.",
  fournisseurs:  "Analyse IA: 4 fournisseurs référencés. Catégories: Informatique, Cloud, Matériel, Fournitures. Tous les fournisseurs ont un contact actif. Aucun contrat expiré détecté.",
  chargesociale: "Analyse IA: 5 charges sociales enregistrées pour un total de 13 920 €. 2 charges de janvier entièrement payées. 3 charges de février/mars en attente de règlement.",
  cra:           "Analyse IA: 5 CRA analysés. Moyenne de présence: 19,6 jours/mois. Taux d'absentéisme: 6,7%. 3 CRA validés, 1 en traitement, 1 en création. Performance globale: excellente.",
  fichiers:      "Analyse IA: 5 fichiers projet indexés. 2 PDF, 2 Excel, 1 Word. Dernier document ajouté il y a 2 mois. Tous les documents sont conformes aux exigences contractuelles.",
  wallet:        "Analyse IA: Solde wallet: +21 849 €. Entrées totales: 29 100 € — Sorties totales: 8 251 €. 6 transactions traitées. Flux de trésorerie positif et stable ce trimestre.",
  commentaires:  "Analyse IA: 4 commentaires actifs sur le projet. Dernière activité il y a 2 jours. Les échanges indiquent une bonne coordination entre les intervenants.",
};

export const AiInsight = ({ tabKey, active }: { tabKey: string; active: boolean }) => {
  const full = TAB_AI_INSIGHTS[tabKey] || '';
  const [displayed, setDisplayed] = useState('');
  const [thinking, setThinking] = useState(true);

  useEffect(() => {
    if (!active) return;
    setThinking(true);
    setDisplayed('');
    const t = setTimeout(() => setThinking(false), 600);
    return () => clearTimeout(t);
  }, [active, tabKey]);

  useEffect(() => {
    if (thinking || !active || displayed.length >= full.length) return;
    const t = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 2)), 8);
    return () => clearTimeout(t);
  }, [thinking, displayed, full, active]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'linear-gradient(135deg, rgba(13,147,148,0.06), rgba(13,147,148,0.02))', border: '1px solid rgba(13,147,148,0.2)', marginBottom: 16 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0d9394, #0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 11 }}>S</span>
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#0d9394' }}>Sofia IA · Analyse automatique</span>
        <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: 'var(--text)', lineHeight: 1.55 }}>
          {thinking ? (
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="od-dot1" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9394', display: 'inline-block' }} />
              <span className="od-dot2" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9394', display: 'inline-block' }} />
              <span className="od-dot3" style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9394', display: 'inline-block' }} />
            </span>
          ) : (
            <>
              {displayed}
              {displayed.length < full.length && (
                <span style={{ display: 'inline-block', width: 2, height: 12, backgroundColor: '#0d9394', marginLeft: 1, animation: 'od-blink 1s infinite' }} />
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
};
