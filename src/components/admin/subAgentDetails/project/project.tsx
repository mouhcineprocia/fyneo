'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as Icons from '../../../../assets/icons';
import { SofiaProcessingJournal } from '../SofiaProcessingJournal';
import { ProjectDetailsModal } from './projectDetails';
import { projectApi } from '../../../../lib/project/api';
import type { Project, Customer, CreateProjectInput, CreateCustomerInput } from '../../../../lib/project/types';

// ─── Local mock types (for static AlertesView / VueAgentView) ─────────────────

interface MockProject { status: string; type: string; budget: number; }
interface ProjectModalProps { open: boolean; agent: any; agentId?: string; onClose: () => void; }
interface PriorityItem {
  id: string; title: string; description: string;
  urgency: 'haute' | 'moyenne' | 'basse';
  actionType: 'validation' | 'signature' | 'revision' | 'relance';
  project: string; deadline: string; budget?: number;
}
interface AgentAlert { id: string; type: 'error' | 'warning' | 'success' | 'info'; title: string; message: string; time: string; project?: string; }
interface TimelineEvent { id: string; time: string; type: 'action' | 'success' | 'warning' | 'error'; title: string; description: string; }
interface TodayActivity { id: string; action: 'created' | 'updated' | 'completed' | 'cancelled'; projectType: 'regie' | 'negoce'; nom: string; time: string; budget: number; }
interface KpiCard { label: string; value: string | number; sub: string; color: string; icon: string; }
interface ChatMsg { id: string; from: 'sofia' | 'user'; text: string; time: string; }

// ─── Mock data (AlertesView + VueAgentView) ───────────────────────────────────

const MOCK_PROJECTS: MockProject[] = [
  { status: 'active',    type: 'regie',  budget: 120000 },
  { status: 'active',    type: 'regie',  budget: 85000  },
  { status: 'completed', type: 'regie',  budget: 34000  },
  { status: 'pending',   type: 'regie',  budget: 67000  },
  { status: 'active',    type: 'regie',  budget: 48000  },
  { status: 'cancelled', type: 'regie',  budget: 22000  },
  { status: 'completed', type: 'regie',  budget: 15000  },
  { status: 'pending',   type: 'regie',  budget: 30000  },
  { status: 'active',    type: 'negoce', budget: 54000  },
  { status: 'completed', type: 'negoce', budget: 91000  },
  { status: 'active',    type: 'negoce', budget: 76000  },
  { status: 'pending',   type: 'negoce', budget: 43000  },
  { status: 'active',    type: 'negoce', budget: 138000 },
  { status: 'cancelled', type: 'negoce', budget: 27000  },
  { status: 'completed', type: 'negoce', budget: 18500  },
  { status: 'pending',   type: 'negoce', budget: 62000  },
];

const mockPriorities: PriorityItem[] = [
  { id: 'pr1', title: 'Valider lancement Migration Cloud', description: "P4 en attente depuis 12 jours. Ressources AWS non provisionnées. Accord client requis avant démarrage.", urgency: 'haute', actionType: 'validation', project: 'Migration Cloud', deadline: '2024-04-08', budget: 67000 },
  { id: 'pr2', title: 'Signer contrat Conseil Stratégique Q2', description: "Contrat de 30 000 € non signé — démarrage prévu dans 5 jours. Signature manuelle obligatoire.", urgency: 'haute', actionType: 'signature', project: 'Conseil Stratégique Q2', deadline: '2024-03-27', budget: 30000 },
  { id: 'pr3', title: 'Réviser budget Déploiement ERP', description: "Budget consommé à 80% mais avancement à 60%. Dépassement prévu de 15 000 €. Révision nécessaire.", urgency: 'moyenne', actionType: 'revision', project: 'Déploiement ERP', deadline: '2024-04-10', budget: 85000 },
  { id: 'pr4', title: 'Relancer Delta Corp — P12', description: "Solutions Stockage Cloud : conflit de date de début détecté. Client à recontacter pour planifier.", urgency: 'moyenne', actionType: 'relance', project: 'Solutions Stockage Cloud', deadline: '2024-04-15', budget: 43000 },
  { id: 'pr5', title: 'Renouveler Licences Antivirus', description: "P15 expire dans 30 jours. Renouvellement automatique non configuré — action manuelle requise.", urgency: 'basse', actionType: 'relance', project: 'Licences Antivirus Entreprise', deadline: '2024-05-01', budget: 18500 },
];

const mockAlerts: AgentAlert[] = [
  { id: 'a1', type: 'error',   title: 'Rapport de clôture manquant', message: "P14 (Équipements Sécurité) annulé sans rapport de clôture. Obligation contractuelle non remplie.", time: '09:18', project: 'Équipements Sécurité' },
  { id: 'a2', type: 'error',   title: 'Conflit de date détecté',     message: "P12 (Solutions Stockage Cloud) — date de début chevauche la fin d'un autre contrat Beta Solutions.", time: '08:50', project: 'Solutions Stockage Cloud' },
  { id: 'a3', type: 'warning', title: 'Dépassement budget probable',  message: "P2 (Déploiement ERP) — 80% du budget consommé pour 60% d'avancement. Écart de 15 000 € estimé.", time: '08:30', project: 'Déploiement ERP' },
  { id: 'a4', type: 'warning', title: 'Contrat expirant sous 60j',    message: "P5 (Support Technique Annuel) se termine le 31/12/2024. Proposition de renouvellement à préparer.", time: '08:10', project: 'Support Technique Annuel' },
  { id: 'a5', type: 'success', title: 'Projet archivé avec succès',   message: "P3 (Audit Sécurité SI) — clôture validée. Rapport final généré et archivé dans le système.", time: '07:45', project: 'Audit Sécurité SI' },
  { id: 'a6', type: 'success', title: 'Facturation P7 confirmée',     message: "P7 (Formation DevOps) — facture finale émise et validée. Projet entièrement soldé.", time: '07:20', project: 'Formation DevOps' },
  { id: 'a7', type: 'info',    title: '4 projets en attente',         message: "Migration Cloud, Conseil Q2, Solutions Stockage Cloud et Téléphonie IP nécessitent une validation pour démarrer.", time: '07:00' },
  { id: 'a8', type: 'info',    title: 'Rapport budgétaire généré',    message: "Budget consolidé Q1 2024 : 930 500 € engagés sur 16 projets. Taux d'exécution : 68%.", time: '06:45' },
];

const mockTimeline: TimelineEvent[] = [
  { id: 't1', time: '09:18', type: 'error',   title: 'Clôture manquante',     description: 'P14 annulé sans rapport — alerte générée.' },
  { id: 't2', time: '08:50', type: 'error',   title: 'Conflit de dates',      description: 'P12 chevauchement détecté avec contrat existant.' },
  { id: 't3', time: '08:30', type: 'warning', title: 'Budget dépassé',        description: 'P2 ERP — dépassement de 15 000 € estimé.' },
  { id: 't4', time: '08:10', type: 'warning', title: 'Expiration proche',     description: 'P5 Support — fin de contrat dans 60 jours.' },
  { id: 't5', time: '07:45', type: 'success', title: 'Archivage P3',          description: 'Audit Sécurité SI clôturé et archivé.' },
  { id: 't6', time: '07:20', type: 'success', title: 'Facturation P7',        description: 'Formation DevOps soldée — facture validée.' },
  { id: 't7', time: '07:00', type: 'action',  title: 'Analyse portefeuille',  description: '16 projets analysés en 1 min 32 s.' },
  { id: 't8', time: '06:45', type: 'action',  title: 'Rapport budgétaire',    description: 'Consolidation Q1 2024 générée.' },
];

const mockActivity: TodayActivity[] = [
  { id: 'act1', action: 'completed', projectType: 'regie',  nom: 'Audit Sécurité SI',   time: '07:45', budget: 34000 },
  { id: 'act2', action: 'completed', projectType: 'regie',  nom: 'Formation DevOps',    time: '07:20', budget: 15000 },
  { id: 'act3', action: 'cancelled', projectType: 'negoce', nom: 'Équipements Sécurité',time: '09:18', budget: 27000 },
  { id: 'act4', action: 'updated',   projectType: 'regie',  nom: 'Déploiement ERP',     time: '08:30', budget: 85000 },
  { id: 'act5', action: 'created',   projectType: 'negoce', nom: 'Téléphonie IP',       time: '06:30', budget: 62000 },
];

const mockKpis: KpiCard[] = [
  { label: 'Total projets',  value: 16,       sub: 'portefeuille',    color: '#0d9394', icon: '📁' },
  { label: 'Budget engagé',  value: '930 K€', sub: 'Q1 2024',         color: '#2563eb', icon: '€'  },
  { label: 'Actifs',         value: 5,        sub: 'en exécution',    color: '#22c55e', icon: '▶'  },
  { label: 'En attente',     value: 4,        sub: 'validation req.', color: '#f59e0b', icon: '⏳' },
  { label: 'Terminés',       value: 4,        sub: 'ce trimestre',    color: '#2563eb', icon: '✓'  },
  { label: 'Taux exécution', value: '68%',    sub: 'budget utilisé',  color: '#8b5cf6', icon: '↑'  },
];

const SOFIA_MSGS = [
  "Bonjour ! J'ai analysé 16 projets ce matin. 2 actions urgentes requièrent votre validation.",
  "Recommandation : traiter en priorité la Migration Cloud (67 000 €) et le Conseil Stratégique Q2 (30 000 €).",
];

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { id: 'active',    label: 'Actif',      color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)'   },
  { id: 'pending',   label: 'En attente', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)'  },
  { id: 'completed', label: 'Terminé',    color: '#2563eb', bgColor: 'rgba(37,99,235,0.1)'   },
  { id: 'cancelled', label: 'Annulé',     color: 'var(--text2)', bgColor: 'rgba(107,114,128,0.1)' },
];

const URGENCY_META: Record<string, { color: string; bg: string; label: string }> = {
  haute:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Haute'   },
  moyenne: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Moyenne' },
  basse:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: 'Basse'   },
};

const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
  validation: { label: 'Valider',  color: '#22c55e', icon: '✓' },
  signature:  { label: 'Signer',   color: '#8b5cf6', icon: '✍' },
  revision:   { label: 'Réviser',  color: '#f59e0b', icon: '✎' },
  relance:    { label: 'Relancer', color: '#0d9394', icon: '↩' },
};

const ALERT_META: Record<string, { color: string; bg: string; border: string; icon: string; grad: string }> = {
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.18)',   icon: '✕', grad: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.18)', icon: '!', grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.05)',  border: 'rgba(34,197,94,0.18)',  icon: '✓', grad: 'linear-gradient(135deg,#22c55e,#16a34a)' },
  info:    { color: '#0d9394', bg: 'rgba(13,147,148,0.05)', border: 'rgba(13,147,148,0.18)', icon: 'i', grad: 'linear-gradient(135deg,#0d9394,#0b7a7b)' },
};

const TL_META: Record<string, { color: string; bg: string }> = {
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  action:  { color: '#0d9394', bg: 'rgba(13,147,148,0.12)' },
};

const ACTIVITY_META: Record<string, { color: string; label: string; icon: string }> = {
  created:   { color: '#22c55e', label: 'Créé',    icon: '+' },
  updated:   { color: '#0d9394', label: 'Modifié', icon: '~' },
  completed: { color: '#2563eb', label: 'Terminé', icon: '✓' },
  cancelled: { color: '#ef4444', label: 'Annulé',  icon: '✕' },
};

const glass = (accent = 'var(--border)'): React.CSSProperties => ({
  background: 'var(--bg2)', border: `1px solid ${accent}`, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
});

const CSS = `
@keyframes pr-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pr-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes pr-slide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@keyframes pr-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.95)}}
@keyframes pr-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes pr-ping{75%,100%{transform:scale(1.8);opacity:0}}
.pr-ping{animation:pr-ping 1.2s cubic-bezier(0,0,0.2,1) infinite}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusMeta = (status: string) => {
  switch (status) {
    case 'active':    return { label: 'Actif',       bg: 'rgba(34,197,94,0.1)',   color: '#22c55e',      border: 'rgba(34,197,94,0.3)'   };
    case 'pending':   return { label: 'En attente',  bg: 'rgba(245,158,11,0.1)', color: '#f59e0b',      border: 'rgba(245,158,11,0.3)'  };
    case 'completed': return { label: 'Terminé',     bg: 'rgba(37,99,235,0.1)',  color: '#2563eb',      border: 'rgba(37,99,235,0.3)'   };
    case 'cancelled': return { label: 'Annulé',      bg: 'rgba(107,114,128,0.1)',color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' };
    case 'draft':     return { label: 'Brouillon',   bg: 'rgba(107,114,128,0.1)',color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' };
    case 'on_hold':   return { label: 'En pause',    bg: 'rgba(245,158,11,0.1)', color: '#f59e0b',      border: 'rgba(245,158,11,0.3)'  };
    default:          return { label: status,        bg: 'rgba(107,114,128,0.1)',color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' };
  }
};

const getTypeMeta = (type: string) => {
  if (type === 'regie') return { label: 'Régie',  description: 'Commission',    color: '#0d9394', bg: 'rgba(13,147,148,0.1)' };
  return                       { label: 'Négoce', description: 'Achat-Revente', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
};

const fmtBudget = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

const customerName = (c: Customer) =>
  c.companyName || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || c.id.slice(0, 8);

const Skel = ({ w, h, r = 4 }: { w: number | string; h: number; r?: number }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,var(--bg2) 25%,var(--border) 50%,var(--bg2) 75%)', backgroundSize: '200% 100%', animation: 'pr-shimmer 1.5s infinite' }} />
);

// ─── Alertes View ─────────────────────────────────────────────────────────────

const AlertesView: React.FC<{ priorities: PriorityItem[]; alerts: AgentAlert[] }> = ({ priorities, alerts }) => {
  const urgentCount = priorities.filter(p => p.urgency === 'haute').length;
  const errorCount  = alerts.filter(a => a.type === 'error').length;

  return (
    <div style={{ display: 'flex', gap: 20, padding: 24, height: '100%', overflow: 'hidden', animation: 'pr-fadein 0.3s ease' }}>
      <div style={{ width: 390, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingRight: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
            <span style={{ color: 'white', fontSize: 16 }}>⚑</span>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Actions requises</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{urgentCount} urgente{urgentCount > 1 ? 's' : ''} · {priorities.length} total</div>
          </div>
          {urgentCount > 0 && (
            <span style={{ marginLeft: 'auto', position: 'relative', display: 'inline-flex', width: 28, height: 28 }}>
              <span className="pr-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', opacity: 0.35 }} />
              <span style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{urgentCount}</span>
            </span>
          )}
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,#ef444445,transparent)', marginBottom: 4 }} />
        {priorities.map(p => {
          const u = URGENCY_META[p.urgency];
          const a = ACTION_META[p.actionType];
          return (
            <div key={p.id} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: 'var(--bg)', border: `1px solid ${u.color}28`, boxShadow: `0 2px 16px ${u.color}10`, animation: 'pr-slide 0.3s ease' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg,${u.color},${u.color}77)` }} />
              <div style={{ padding: '12px 14px 12px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: u.bg, color: u.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{u.label}</span>
                  <span style={{ fontSize: '0.58rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${a.color}15`, color: a.color }}>{a.icon} {a.label}</span>
                  {p.budget && <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)', background: 'var(--bg2)', padding: '2px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>{fmtBudget(p.budget)}</span>}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 5, lineHeight: 1.3 }}>{p.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(13,147,148,0.1)', color: '#0d9394', border: '1px solid rgba(13,147,148,0.2)' }}>📁 {p.project}</span>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>📅 {new Date(p.deadline).toLocaleDateString('fr-FR')}</span>
                  <button style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.63rem', fontWeight: 700, color: 'white', background: `linear-gradient(135deg,${a.color},${a.color}bb)`, boxShadow: `0 2px 8px ${a.color}40` }}>{a.label}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ width: 1, flexShrink: 0, background: 'linear-gradient(180deg,transparent,var(--border) 20%,var(--border) 80%,transparent)', margin: '8px 0' }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingLeft: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(13,147,148,0.3)' }}>
            <span style={{ color: 'white', fontSize: 16 }}>◎</span>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Journal agent</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{errorCount} erreur{errorCount > 1 ? 's' : ''} · {alerts.length} événements</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--text3)', background: 'var(--bg2)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>Aujourd'hui</span>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(13,147,148,0.4),transparent)', marginBottom: 4 }} />
        {(['error', 'warning', 'success', 'info'] as const).map(type => {
          const group = alerts.filter(a => a.type === type);
          if (!group.length) return null;
          const m = ALERT_META[type];
          return (
            <div key={type}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: m.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: '0.52rem', fontWeight: 800 }}>{m.icon}</span>
                </div>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {type === 'error' ? 'Erreurs' : type === 'warning' ? 'Avertissements' : type === 'success' ? 'Succès' : 'Informations'}
                </span>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>{group.length}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${m.border},transparent)` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {group.map(al => (
                  <div key={al.id} style={{ borderRadius: 12, overflow: 'hidden', background: m.bg, border: `1px solid ${m.border}`, boxShadow: '0 1px 8px rgba(0,0,0,0.04)', animation: 'pr-fadein 0.3s ease' }}>
                    <div style={{ background: m.grad, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontSize: '0.58rem', fontWeight: 800 }}>{m.icon}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'white', flex: 1 }}>{al.title}</span>
                      <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.15)', padding: '1px 6px', borderRadius: 6 }}>{al.time}</span>
                    </div>
                    <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: '0.7rem', color: 'var(--text)', lineHeight: 1.5 }}>{al.message}</span>
                      {al.project && <span style={{ flexShrink: 0, fontSize: '0.56rem', fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: 'var(--bg)', color: m.color, border: `1px solid ${m.border}` }}>{al.project}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Vue Agent View ───────────────────────────────────────────────────────────

const VueAgentView: React.FC<{ kpis: KpiCard[]; timeline: TimelineEvent[]; activities: TodayActivity[] }> = ({ kpis, timeline, activities }) => {
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { id: 'm0', from: 'sofia', text: SOFIA_MSGS[0], time: '09:30' },
    { id: 'm1', from: 'sofia', text: SOFIA_MSGS[1], time: '09:30' },
  ]);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  const sendMsg = () => {
    if (!chatInput.trim()) return;
    const t = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setChatMsgs(prev => [...prev, { id: Date.now().toString(), from: 'user', text: chatInput.trim(), time: t }]);
    setChatInput('');
    setTyping(true);
    setTimeout(() => {
      const replies = ["J'analyse le portefeuille en temps réel.", "Le rapport budgétaire Q1 est disponible.", "4 projets en attente de validation cette semaine."];
      setChatMsgs(prev => [...prev, { id: Date.now().toString(), from: 'sofia', text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
      setTyping(false);
    }, 1000);
  };

  const active    = MOCK_PROJECTS.filter(p => p.status === 'active').length;
  const pending   = MOCK_PROJECTS.filter(p => p.status === 'pending').length;
  const completed = MOCK_PROJECTS.filter(p => p.status === 'completed').length;
  const total     = MOCK_PROJECTS.length;
  const totalBudget  = MOCK_PROJECTS.reduce((s, p) => s + p.budget, 0);
  const regieBudget  = MOCK_PROJECTS.filter(p => p.type === 'regie').reduce((s, p) => s + p.budget, 0);
  const negoceBudget = MOCK_PROJECTS.filter(p => p.type === 'negoce').reduce((s, p) => s + p.budget, 0);

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', animation: 'pr-fadein 0.3s ease' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ flex: '1 1 130px', ...glass(`${k.color}30`), padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 10, top: 10, fontSize: 18, opacity: 0.14 }}>{k.icon}</div>
            <span style={{ fontSize: '0.63rem', color: 'var(--text2)', fontWeight: 500 }}>{k.label}</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</span>
            <span style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>{k.sub}</span>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${k.color},${k.color}44)` }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9394', display: 'inline-block' }} />
            Timeline agent
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg,var(--border),transparent)' }} />
            {timeline.map((ev, i) => {
              const m = TL_META[ev.type];
              return (
                <div key={ev.id} style={{ display: 'flex', gap: 10, marginBottom: 14, animation: `pr-slide 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.bg, border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <span style={{ fontSize: '0.48rem', color: m.color, fontWeight: 800 }}>
                      {ev.type === 'error' ? '✕' : ev.type === 'warning' ? '!' : ev.type === 'success' ? '✓' : '⟳'}
                    </span>
                  </div>
                  <div style={{ paddingTop: 2 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text)' }}>{ev.title}</div>
                    <div style={{ fontSize: '0.58rem', color: 'var(--text3)', marginTop: 1 }}>{ev.description}</div>
                    <div style={{ fontSize: '0.55rem', color: m.color, marginTop: 2, fontWeight: 600 }}>{ev.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={glass('rgba(13,147,148,0.2)')}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)' }}>Activité du jour</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: 'rgba(13,147,148,0.1)', color: '#0d9394' }}>{activities.length}</span>
            </div>
            <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activities.map(act => {
                const am = ACTIVITY_META[act.action];
                const tm = getTypeMeta(act.projectType);
                return (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'var(--bg)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: `${am.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.6rem', color: am.color, fontWeight: 800 }}>{am.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.nom}</div>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text3)' }}>
                        <span style={{ color: tm.color, fontWeight: 600 }}>{tm.label}</span> · {act.time}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: am.color }}>{fmtBudget(act.budget)}</span>
                    <span style={{ fontSize: '0.55rem', padding: '1px 6px', borderRadius: 6, background: `${am.color}15`, color: am.color, fontWeight: 600 }}>{am.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Actifs',     val: active,    total, color: '#22c55e' },
              { label: 'En attente', val: pending,   total, color: '#f59e0b' },
              { label: 'Terminés',   val: completed, total, color: '#2563eb' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, ...glass(`${s.color}30`), padding: '10px 12px' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text2)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.val}</div>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.total > 0 ? (s.val / s.total) * 100 : 0}%`, background: s.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text3)', marginTop: 4 }}>{s.total > 0 ? Math.round((s.val / s.total) * 100) : 0}%</div>
              </div>
            ))}
          </div>

          <div style={{ ...glass('rgba(139,92,246,0.2)'), padding: '12px 14px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Répartition budgétaire</div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              {[
                { label: 'Régie',  val: regieBudget,  color: '#0d9394', pct: totalBudget > 0 ? Math.round((regieBudget  / totalBudget) * 100) : 0 },
                { label: 'Négoce', val: negoceBudget, color: '#8b5cf6', pct: totalBudget > 0 ? Math.round((negoceBudget / totalBudget) * 100) : 0 },
              ].map(b => (
                <div key={b.label} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.62rem', color: b.color, fontWeight: 600 }}>{b.label}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text2)' }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: b.color, marginTop: 4 }}>{fmtBudget(b.val)}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text3)', textAlign: 'right' }}>Total : {fmtBudget(totalBudget)}</div>
          </div>
        </div>

        <div style={{ width: 260, flexShrink: 0, ...glass('rgba(13,147,148,0.2)'), display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div onClick={() => setChatOpen(v => !v)} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: chatOpen ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '0.7rem' }}>S</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text)' }}>Sofia</div>
              <div style={{ fontSize: '0.55rem', color: '#22c55e' }}>● En ligne</div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text3)', transform: chatOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
          </div>
          {chatOpen && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280 }}>
                {chatMsgs.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', gap: 6, justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', padding: '6px 10px', borderRadius: msg.from === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: msg.from === 'user' ? '#0d9394' : 'var(--bg)', color: msg.from === 'user' ? 'white' : 'var(--text)', fontSize: '0.65rem', lineHeight: 1.5 }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div style={{ display: 'flex', gap: 4, padding: '4px 2px' }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#0d9394', animation: `pr-pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={{ padding: '6px 8px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Question à Sofia…" style={{ flex: 1, padding: '5px 8px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.65rem', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }} />
                <button onClick={sendMsg} style={{ width: 26, height: 26, borderRadius: 8, background: '#0d9394', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Send style={{ width: 11, height: 11, color: 'white' }} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Create Project Modal ─────────────────────────────────────────────────────

interface CreateProjectModalProps { onClose: () => void; onCreated: (p: Project) => void; }

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onCreated }) => {
  const [step, setStep]         = useState<1 | 2>(1);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [custTab, setCustTab]   = useState<'search' | 'new'>('search');

  // Step 1 fields
  const [type, setType]           = useState<'regie' | 'negoce'>('regie');
  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [budget, setBudget]       = useState('');
  const [currency, setCurrency]   = useState('MAD');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [priority, setPriority]   = useState('');
  const [status, setStatus]       = useState('draft');

  // Step 2 - selected customers
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);

  // Search tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New customer form
  const [newCust, setNewCust] = useState<CreateCustomerInput>({ type: 'company' });
  const [newCustSaving, setNewCustSaving] = useState(false);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await projectApi.searchCustomers(q, 20);
        setSearchResults(results.filter(r => !selectedCustomers.find(s => s.id === r.id)));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, [selectedCustomers]);

  const addCustomer = (c: Customer) => {
    if (selectedCustomers.find(s => s.id === c.id)) return;
    setSelectedCustomers(prev => [...prev, c]);
    setSearchResults(prev => prev.filter(r => r.id !== c.id));
  };

  const removeCustomer = (id: string) => setSelectedCustomers(prev => prev.filter(c => c.id !== id));

  const handleCreateCustomer = async () => {
    if (!newCust.companyName && !newCust.firstName) return;
    setNewCustSaving(true);
    try {
      const created = await projectApi.createCustomer(newCust);
      addCustomer(created);
      setNewCust({ type: 'company' });
      setCustTab('search');
    } catch (e: any) {
      setError(e.message || 'Erreur création client');
    } finally { setNewCustSaving(false); }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Le nom du projet est requis'); return; }
    setSaving(true); setError('');
    try {
      const payload: CreateProjectInput = {
        name: name.trim(), type, status,
        ...(description && { description }),
        ...(budget && { budget: parseFloat(budget) }),
        currency,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(priority && { priority }),
        customerIds: selectedCustomers.map(c => c.id),
      };
      const created = await projectApi.create(payload);
      onCreated(created);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création');
      setSaving(false);
    }
  };

  const inSt: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border)', fontSize: '0.72rem', outline: 'none', background: 'var(--bg)', color: 'var(--text)' };
  const labelSt: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 600, color: 'var(--text2)', marginBottom: 4, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 16, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', width: 520, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Briefcase style={{ width: 15, height: 15, color: 'white' }} />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', flex: 1 }}>Créer un projet</span>
          <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'var(--bg2)', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.X style={{ width: 14, height: 14, color: 'var(--text2)' }} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: 'var(--bg2)' }}>
          {([{ n: 1, label: 'Informations' }, { n: 2, label: 'Clients' }] as const).map(s => (
            <React.Fragment key={s.n}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: step >= s.n ? '#0d9394' : 'var(--border)', color: step >= s.n ? 'white' : 'var(--text3)', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.n}</div>
                <span style={{ fontSize: '0.7rem', fontWeight: step === s.n ? 700 : 500, color: step === s.n ? '#0d9394' : 'var(--text3)' }}>{s.label}</span>
              </div>
              {s.n < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? '#0d9394' : 'var(--border)' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Type selector */}
              <div>
                <label style={labelSt}>Type de projet *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['regie', 'negoce'] as const).map(t => {
                    const m = getTypeMeta(t);
                    const active = type === t;
                    return (
                      <div key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `2px solid ${active ? m.color : 'var(--border)'}`, background: active ? m.bg : 'var(--bg2)', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: active ? m.color : 'var(--text)' }}>{m.label}</div>
                        <div style={{ fontSize: '0.6rem', color: active ? m.color : 'var(--text3)', marginTop: 2 }}>{m.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelSt}>Nom du projet *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Déploiement ERP Client X" style={inSt} />
              </div>

              <div>
                <label style={labelSt}>Description</label>
                <textarea value={description} onChange={e => setDesc(e.target.value)} placeholder="Description du projet…" rows={3} style={{ ...inSt, resize: 'none', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 2 }}>
                  <label style={labelSt}>Budget</label>
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" style={inSt} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelSt}>Devise</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inSt, cursor: 'pointer' }}>
                    {['MAD', 'EUR', 'USD', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelSt}>Date début</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inSt} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelSt}>Date fin</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inSt} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelSt}>Priorité</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inSt, cursor: 'pointer' }}>
                    <option value="">— Aucune —</option>
                    <option value="haute">Haute</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="basse">Basse</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelSt}>Statut initial</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inSt, cursor: 'pointer' }}>
                    <option value="draft">Brouillon</option>
                    <option value="pending">En attente</option>
                    <option value="active">Actif</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Selected chips */}
              {selectedCustomers.length > 0 && (
                <div>
                  <label style={labelSt}>Clients sélectionnés ({selectedCustomers.length})</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedCustomers.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(13,147,148,0.1)', border: '1px solid rgba(13,147,148,0.25)', fontSize: '0.65rem', color: '#0d9394', fontWeight: 600 }}>
                        {customerName(c)}
                        <button onClick={() => removeCustomer(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#0d9394', opacity: 0.7 }}>
                          <Icons.X style={{ width: 10, height: 10 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: 0 }}>
                {([{ k: 'search', l: 'Clients existants' }, { k: 'new', l: 'Créer un client' }] as const).map(t => (
                  <button key={t.k} onClick={() => setCustTab(t.k)} style={{ padding: '8px 14px', fontSize: '0.7rem', fontWeight: custTab === t.k ? 700 : 500, color: custTab === t.k ? '#0d9394' : 'var(--text2)', border: 'none', background: 'none', cursor: 'pointer', borderBottom: custTab === t.k ? '2px solid #0d9394' : '2px solid transparent' }}>
                    {t.l}
                  </button>
                ))}
              </div>

              {custTab === 'search' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 10px', marginBottom: 10 }}>
                    <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
                    <input value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="Rechercher un client…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.7rem', color: 'var(--text)', width: '100%' }} />
                  </div>
                  <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {searching ? (
                      <div style={{ padding: 12, textAlign: 'center', fontSize: '0.68rem', color: 'var(--text3)' }}>Recherche…</div>
                    ) : searchResults.length === 0 && searchQuery ? (
                      <div style={{ padding: 12, textAlign: 'center', fontSize: '0.68rem', color: 'var(--text3)' }}>Aucun résultat. Créez un nouveau client.</div>
                    ) : searchResults.map(c => (
                      <div key={c.id} onClick={() => addCustomer(c)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d9394')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9394' }}>{customerName(c).charAt(0).toUpperCase()}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{customerName(c)}</div>
                          {c.email && <div style={{ fontSize: '0.58rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>}
                        </div>
                        <Icons.Plus style={{ width: 14, height: 14, color: '#0d9394', flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['company', 'individual'] as const).map(t => (
                      <div key={t} onClick={() => setNewCust(prev => ({ ...prev, type: t }))} style={{ flex: 1, padding: '7px', borderRadius: 7, border: `1.5px solid ${newCust.type === t ? '#0d9394' : 'var(--border)'}`, background: newCust.type === t ? 'rgba(13,147,148,0.08)' : 'var(--bg2)', cursor: 'pointer', textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: newCust.type === t ? '#0d9394' : 'var(--text2)' }}>
                        {t === 'company' ? 'Entreprise' : 'Particulier'}
                      </div>
                    ))}
                  </div>
                  {newCust.type === 'company' ? (
                    <input value={newCust.companyName || ''} onChange={e => setNewCust(p => ({ ...p, companyName: e.target.value }))} placeholder="Raison sociale *" style={inSt} />
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={newCust.firstName || ''} onChange={e => setNewCust(p => ({ ...p, firstName: e.target.value }))} placeholder="Prénom *" style={{ ...inSt, flex: 1 }} />
                      <input value={newCust.lastName || ''} onChange={e => setNewCust(p => ({ ...p, lastName: e.target.value }))} placeholder="Nom *" style={{ ...inSt, flex: 1 }} />
                    </div>
                  )}
                  <input value={newCust.email || ''} onChange={e => setNewCust(p => ({ ...p, email: e.target.value }))} placeholder="Email" style={inSt} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={newCust.phone || ''} onChange={e => setNewCust(p => ({ ...p, phone: e.target.value }))} placeholder="Téléphone" style={{ ...inSt, flex: 1 }} />
                    <input value={newCust.city || ''} onChange={e => setNewCust(p => ({ ...p, city: e.target.value }))} placeholder="Ville" style={{ ...inSt, flex: 1 }} />
                  </div>
                  <button onClick={handleCreateCustomer} disabled={newCustSaving || (!newCust.companyName && !newCust.firstName)} style={{ padding: '8px 0', borderRadius: 8, border: 'none', cursor: (newCustSaving || (!newCust.companyName && !newCust.firstName)) ? 'default' : 'pointer', background: '#0d9394', color: 'white', fontSize: '0.72rem', fontWeight: 700, opacity: (newCustSaving || (!newCust.companyName && !newCust.firstName)) ? 0.5 : 1 }}>
                    {newCustSaving ? 'Ajout…' : '+ Ajouter ce client'}
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <p style={{ margin: '10px 0 0', fontSize: '0.68rem', color: '#ef4444' }}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={step === 1 ? onClose : () => setStep(1)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>
            {step === 1 ? 'Annuler' : 'Retour'}
          </button>
          {step === 1 ? (
            <button onClick={() => { if (!name.trim()) { setError('Le nom est requis'); return; } setError(''); setStep(2); }} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: '#0d9394', color: 'white', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}>
              Suivant →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: saving ? 'var(--border)' : '#0d9394', color: 'white', fontSize: '0.72rem', cursor: saving ? 'default' : 'pointer', fontWeight: 700 }}>
              {saving ? 'Création…' : 'Créer le projet'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Details View (dynamic) ───────────────────────────────────────────────────

interface DetailsViewProps {
  setSelectedProject: (p: Project) => void;
  setDetailsOpen:     (v: boolean) => void;
}

const DetailsView: React.FC<DetailsViewProps> = ({ setSelectedProject, setDetailsOpen }) => {
  const [searchQuery, setSearchQuery]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab]           = useState<'all' | 'regie' | 'negoce'>('all');
  const [page, setPage]                     = useState(0);
  const [rowsPerPage, setRowsPerPage]       = useState(10);
  const [projects, setProjects]             = useState<Project[]>([]);
  const [total, setTotal]                   = useState(0);
  const [isLoading, setIsLoading]           = useState(true);
  const [createOpen, setCreateOpen]         = useState(false);

  const SOFIA_FULL = "Salut! Je suis Sofia, ton agent IA. Je gère tes projets en temps réel : régie et négoce. Utilise le bouton \"Créer\" pour démarrer un nouveau projet.";
  const [sofiaText, setSofiaText]     = useState('');
  const [sofiaThinking, setSofiaThinking] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSofiaThinking(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!sofiaThinking && sofiaText.length < SOFIA_FULL.length) {
      const t = setTimeout(() => setSofiaText(SOFIA_FULL.slice(0, sofiaText.length + 1)), 12);
      return () => clearTimeout(t);
    }
  }, [sofiaThinking, sofiaText]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => { setPage(0); }, [debouncedSearch, activeTab, selectedStatus]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await projectApi.list({
        page,
        limit: rowsPerPage,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(activeTab !== 'all' && { type: activeTab }),
      });
      setProjects(res.data);
      setTotal(res.total);
    } catch {
      setProjects([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, selectedStatus, activeTab]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const totalPages  = Math.ceil(total / rowsPerPage);
  const inputSt: React.CSSProperties = { flex: 1, padding: '5px 9px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.65rem', outline: 'none', background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer' };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', animation: 'pr-fadein 0.3s ease' }}>

      {/* Sofia message */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #0d9394', boxShadow: '0 0 12px rgba(13,147,148,0.4)', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>S</span>
        </div>
        <div style={{ flex: 1, background: 'linear-gradient(135deg,rgba(148,163,184,0.12),rgba(71,85,105,0.12))', backdropFilter: 'blur(8px)', borderRadius: '12px 12px 12px 0', border: '1px solid rgba(241,245,249,0.25)', padding: 14, minHeight: 60 }}>
          {sofiaThinking
            ? <span style={{ position: 'relative', display: 'inline-flex', width: 14, height: 14 }}><span className="pr-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#0d9394', opacity: 0.7 }} /><span style={{ position: 'relative', width: 14, height: 14, borderRadius: '50%', background: '#0d9394' }} /></span>
            : <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6 }}>
                {sofiaText}
                {sofiaText.length < SOFIA_FULL.length && <span style={{ display: 'inline-block', width: 2, height: 13, background: '#0d9394', marginLeft: 2, animation: 'pr-blink 1s infinite' }} />}
              </p>
          }
        </div>
        <button onClick={() => setCreateOpen(true)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', color: 'white', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(13,147,148,0.3)', whiteSpace: 'nowrap' }}>
          <Icons.Plus style={{ width: 14, height: 14 }} /> Créer un projet
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', padding: '12px 14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', minWidth: 200 }}>
            <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher un projet…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.7rem', color: 'var(--text)', width: '100%' }} />
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: 4 }}>
            {STATUS_FILTERS.map(st => (
              <div key={st.id} onClick={() => setSelectedStatus(selectedStatus === st.id ? null : st.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.62rem', fontWeight: 600, border: `1.5px solid ${selectedStatus === st.id ? st.color : 'transparent'}`, background: selectedStatus === st.id ? st.bgColor : 'var(--bg2)', color: selectedStatus === st.id ? st.color : 'var(--text2)', transition: 'all 0.15s' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />{st.label}
              </div>
            ))}
          </div>
          {(searchQuery || selectedStatus) && (
            <button onClick={() => { setSearchQuery(''); setSelectedStatus(null); }} style={{ fontSize: '0.62rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px' }}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          {([
            { id: 'all'    as const, label: 'Tous',   desc: 'Régie + Négoce' },
            { id: 'regie'  as const, label: 'Régie',  desc: 'Commission'     },
            { id: 'negoce' as const, label: 'Négoce', desc: 'Achat-Revente'  },
          ]).map(tab => (
            <div key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(0); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #0d9394' : '2px solid transparent', background: activeTab === tab.id ? 'rgba(13,147,148,0.05)' : 'transparent' }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: activeTab === tab.id ? '#0d9394' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <Icons.Briefcase style={{ width: 10, height: 10, color: activeTab === tab.id ? 'white' : 'var(--text2)' }} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? '#0d9394' : 'var(--text2)' }}>{tab.label}</span>
              <span style={{ fontSize: '0.55rem', color: activeTab === tab.id ? '#0d9394' : 'var(--text3)' }}>{tab.desc}</span>
              {!isLoading && activeTab === tab.id && (
                <span style={{ height: 16, fontSize: '0.58rem', fontWeight: 700, padding: '0 6px', borderRadius: 8, background: 'rgba(13,147,148,0.15)', color: '#0d9394', display: 'inline-flex', alignItems: 'center' }}>{total}</span>
              )}
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {['Projet', 'Type', 'Clients', 'Budget', 'Statut', 'Date début', 'Actions'].map((h, i) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: i === 6 ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--bg2)' }}>
                    <td style={{ padding: 12 }}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Skel w={26} h={26} r={6} /><div><Skel w={110} h={13} /><div style={{ marginTop: 4 }}><Skel w={70} h={10} /></div></div></div></td>
                    <td style={{ padding: 12 }}><Skel w={60} h={20} r={6} /></td>
                    <td style={{ padding: 12 }}><Skel w={90} h={13} /></td>
                    <td style={{ padding: 12 }}><Skel w={70} h={20} r={6} /></td>
                    <td style={{ padding: 12 }}><Skel w={70} h={20} r={6} /></td>
                    <td style={{ padding: 12 }}><Skel w={80} h={13} /></td>
                    <td style={{ padding: 12, textAlign: 'center' }}><div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}><Skel w={24} h={24} r={6} /><Skel w={24} h={24} r={6} /></div></td>
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text2)', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <Icons.Briefcase style={{ width: 28, height: 28, opacity: 0.3 }} />
                    <span>Aucun projet à afficher.</span>
                    <button onClick={() => setCreateOpen(true)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: 'rgba(13,147,148,0.1)', color: '#0d9394', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}>+ Créer le premier projet</button>
                  </div>
                </td></tr>
              ) : projects.map(row => {
                const sm = getStatusMeta(row.status);
                const tm = getTypeMeta(row.type);
                const custDisplay = row.customers?.length
                  ? row.customers.slice(0, 2).map(customerName).join(', ') + (row.customers.length > 2 ? ` +${row.customers.length - 2}` : '')
                  : '—';
                return (
                  <tr key={row.id} onClick={() => { setSelectedProject(row); setDetailsOpen(true); }} style={{ borderBottom: '1px solid var(--bg2)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: tm.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icons.Briefcase style={{ width: 13, height: 13, color: tm.color }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, color: 'var(--text)' }}>{row.name}</p>
                          <p style={{ margin: 0, fontSize: '0.58rem', color: 'var(--text3)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description || row.projectCode || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ height: 20, fontSize: '0.6rem', fontWeight: 700, borderRadius: 6, padding: '0 8px', display: 'inline-flex', alignItems: 'center', background: tm.bg, color: tm.color }}>{tm.label}</span>
                    </td>
                    <td style={{ padding: 12 }}><span style={{ fontSize: '0.68rem', color: 'var(--text2)' }}>{custDisplay}</span></td>
                    <td style={{ padding: 12 }}>
                      <span style={{ height: 22, fontSize: '0.65rem', fontWeight: 700, borderRadius: 6, padding: '0 8px', display: 'inline-flex', alignItems: 'center', background: 'rgba(13,147,148,0.08)', color: '#0d9394', border: '1px solid rgba(13,147,148,0.2)' }}>
                        {row.budget != null ? fmtBudget(row.budget) : '—'}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ height: 22, fontSize: '0.6rem', fontWeight: 700, borderRadius: 6, padding: '0 8px', display: 'inline-flex', alignItems: 'center', background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>{sm.label}</span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text2)' }}>
                        {row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <button onClick={e => { e.stopPropagation(); setSelectedProject(row); setDetailsOpen(true); }} style={{ width: 26, height: 26, background: 'var(--bg2)', color: 'var(--text2)', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icons.Eye style={{ width: 11, height: 11 }} />
                        </button>
                        <button onClick={e => e.stopPropagation()} style={{ width: 26, height: 26, background: 'var(--bg2)', color: 'var(--text2)', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icons.Settings style={{ width: 11, height: 11 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text2)' }}>Lignes par page:</span>
            <select value={rowsPerPage} onChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }} style={{ padding: '2px 6px', fontSize: '0.62rem', border: '1px solid var(--border)', borderRadius: 5, background: 'var(--bg)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }}>
              {[5, 10, 25, 50].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text2)' }}>
            {total === 0 ? '0' : `${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, total)}`} sur {total}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.ChevronLeft style={{ width: 11, height: 11 }} />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page + 1 >= totalPages} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', cursor: page + 1 >= totalPages ? 'default' : 'pointer', opacity: page + 1 >= totalPages ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.ChevronRight style={{ width: 11, height: 11 }} />
            </button>
          </div>
        </div>
      </div>

      {createOpen && (
        <CreateProjectModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); fetchProjects(); }}
        />
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ProjectChatModal: React.FC<ProjectModalProps> = ({ open, agent, agentId, onClose }) => {
  const [mainTab, setMainTab]         = useState<'alertes' | 'vue' | 'details'>('alertes');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailsOpen, setDetailsOpen]         = useState(false);
  const [showProcessingJournal, setShowProcessingJournal] = useState(false);
  const [processingSessionId, setProcessingSessionId]     = useState<string | null>(null);

  const urgentCount = mockPriorities.filter(p => p.urgency === 'haute').length;

  const NAV = [
    { key: 'alertes' as const, label: 'Alertes & Priorités', icon: '🔔', badge: urgentCount },
    { key: 'vue'     as const, label: 'Vue Agent',           icon: '⬡',  badge: null       },
    { key: 'details' as const, label: 'Référentiel',         icon: '☰',  badge: null        },
  ];

  if (!agent) return null;

  return (
    <>
      <style>{CSS}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 1300, display: open ? 'flex' : 'none', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ height: 52, flexShrink: 0, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, background: 'var(--bg)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(13,147,148,0.3)' }}>
            <Icons.Briefcase style={{ width: 16, height: 16, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Agent Project</div>
            <div style={{ fontSize: '0.6rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              En ligne · Projets en temps réel
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.6rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(13,147,148,0.1)', color: '#0d9394', border: '1px solid rgba(13,147,148,0.2)', fontWeight: 600 }}>IA Sofia</span>
            <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'var(--bg2)', cursor: 'pointer', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.X style={{ width: 14, height: 14, color: 'var(--text)' }} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Sidebar */}
          <div style={{ width: sidebarOpen ? 200 : 58, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', overflow: 'hidden' }}>
            <button onClick={() => setSidebarOpen(v => !v)} style={{ margin: '10px auto', width: 34, height: 34, borderRadius: 9, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text2)', fontSize: '0.8rem' }}>
              {sidebarOpen ? '◀' : '▶'}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 8px' }}>
              {NAV.map(tab => {
                const active = mainTab === tab.key;
                return (
                  <div key={tab.key} onClick={() => setMainTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sidebarOpen ? '10px 12px' : '10px', borderRadius: 10, cursor: 'pointer', background: active ? 'rgba(13,147,148,0.12)' : 'transparent', border: `1px solid ${active ? 'rgba(13,147,148,0.25)' : 'transparent'}`, transition: 'all 0.15s', position: 'relative', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {active && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#0d9394', borderRadius: '0 3px 3px 0' }} />}
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{tab.icon}</span>
                    {sidebarOpen && <span style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 500, color: active ? '#0d9394' : 'var(--text2)', flex: 1 }}>{tab.label}</span>}
                    {tab.badge != null && tab.badge > 0 && (
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, background: tab.key === 'alertes' ? '#ef4444' : '#0d9394', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', flexShrink: 0 }}>{tab.badge}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {sidebarOpen && (
              <div style={{ margin: '16px 10px 0', padding: '10px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>SANTÉ AGENT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ width: '79%', height: '100%', background: 'linear-gradient(90deg,#22c55e,#16a34a)', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#22c55e' }}>79%</span>
                </div>
                <div style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>4 projets en attente</div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {mainTab === 'alertes' && <div style={{ flex: 1, overflowY: 'auto' }}><AlertesView priorities={mockPriorities} alerts={mockAlerts} /></div>}
            {mainTab === 'vue'     && <div style={{ flex: 1, overflowY: 'auto' }}><VueAgentView kpis={mockKpis} timeline={mockTimeline} activities={mockActivity} /></div>}
            {mainTab === 'details' && <DetailsView setSelectedProject={setSelectedProject} setDetailsOpen={setDetailsOpen} />}
          </div>
        </div>
      </div>

      {showProcessingJournal && processingSessionId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', maxWidth: '90vw', width: 1000, maxHeight: '90vh', overflow: 'auto', padding: 24, position: 'relative' }}>
            <button onClick={() => { setShowProcessingJournal(false); setProcessingSessionId(null); }} style={{ position: 'absolute', right: 16, top: 16, width: 32, height: 32, borderRadius: 8, background: 'var(--bg2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
              <Icons.X style={{ width: 18, height: 18 }} />
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>Sofia analyse vos fichiers</h2>
            <SofiaProcessingJournal
              sessionId={processingSessionId}
              onComplete={() => {}}
              onError={() => {}}
              onClose={() => { setShowProcessingJournal(false); setProcessingSessionId(null); }}
            />
          </div>
        </div>
      )}

      <ProjectDetailsModal
        open={detailsOpen}
        project={selectedProject}
        onClose={() => { setDetailsOpen(false); setSelectedProject(null); }}
      />
    </>
  );
};
