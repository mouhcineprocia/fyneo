'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Icons from '../../../../assets/icons';
import { SofiaProcessingJournal } from '../SofiaProcessingJournal';
import { FactureDetailsModal } from './factureDetails';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedLineItem {
  id: string; description: string; quantite: number; prixUnitaireHt: number;
  montantHt: number; montantTva: number; montantTtc: number; tauxTva?: string; devise?: string;
}
interface UiFacture {
  id: string; numeroFacture: string; status: string; typeFacture: string;
  clientName?: string; receiverName?: string; fournisseurName?: string;
  montantTtc: number; montantHt: number; montantTva: number;
  dateFacture: string; periode: string;
  parsedItems: ParsedLineItem[]; transactionsList: any[];
  showTransCard?: boolean; conditionsText?: string;
}
interface Message { role: 'user' | 'assistant'; content: string; timestamp: string; files?: { name: string; size?: number }[]; }
interface FactureModalProps { open: boolean; agent: any; agentId?: string; onClose: () => void; }
interface PriorityItem {
  id: string; title: string; description: string;
  urgency: 'haute' | 'moyenne' | 'basse';
  actionType: 'validation' | 'correction' | 'relance' | 'signature';
  facture: string; deadline: string; montant?: number;
}
interface AgentAlert { id: string; type: 'error' | 'warning' | 'success' | 'info'; title: string; message: string; time: string; facture?: string; }
interface TimelineEvent { id: string; time: string; type: 'action' | 'success' | 'warning' | 'error'; title: string; description: string; }
interface TodayActivity { id: string; action: 'processed' | 'validated' | 'rejected' | 'detected'; factureType: 'VENTE' | 'ACHAT' | 'AVOIR'; nom: string; time: string; montant: number; }
interface KpiCard { label: string; value: string | number; sub: string; color: string; icon: string; }
interface ChatMsg { id: string; from: 'sofia' | 'user'; text: string; time: string; }

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_FACTURES: UiFacture[] = [
  { id: 'wa-1', numeroFacture: 'FAC-2024-001', status: 'VALIDER', typeFacture: 'FACTURE_VENTE', clientName: 'Acme Corp', montantTtc: 5820, montantHt: 4850, montantTva: 970, dateFacture: '2024-01-15T00:00:00Z', periode: '01/2024', parsedItems: [], transactionsList: [{ id: 't1', bankDescription: 'Virement Acme Corp', amount: 5820, date: '2024-01-20' }] },
  { id: 'wa-2', numeroFacture: 'FAC-2024-002', status: 'EN_TRAITEMENT', typeFacture: 'FACTURE_ACHAT', fournisseurName: 'Tech Supplies SAS', montantTtc: -1200, montantHt: -1000, montantTva: -200, dateFacture: '2024-01-18T00:00:00Z', periode: '01/2024', parsedItems: [], transactionsList: [] },
  { id: 'wa-3', numeroFacture: 'FAC-2024-003', status: 'VALIDER', typeFacture: 'FACTURE_VENTE', clientName: 'Beta Solutions', montantTtc: 3600, montantHt: 3000, montantTva: 600, dateFacture: '2024-01-22T00:00:00Z', periode: '01/2024', parsedItems: [], transactionsList: [{ id: 't2', bankDescription: 'Paiement Beta Solutions', amount: 3600, date: '2024-01-25' }] },
  { id: 'wa-4', numeroFacture: 'FAC-2024-004', status: 'ERROR', typeFacture: 'FACTURE_ACHAT', fournisseurName: 'Office Depot', montantTtc: -540, montantHt: -450, montantTva: -90, dateFacture: '2024-02-01T00:00:00Z', periode: '02/2024', parsedItems: [], transactionsList: [] },
  { id: 'wa-5', numeroFacture: 'FAC-2024-005', status: 'VALIDER', typeFacture: 'FACTURE_VENTE', clientName: 'Gamma Industries', montantTtc: 12600, montantHt: 10500, montantTva: 2100, dateFacture: '2024-02-05T00:00:00Z', periode: '02/2024', parsedItems: [], transactionsList: [{ id: 't3', bankDescription: 'Virement Gamma Industries', amount: 12600, date: '2024-02-10' }] },
  { id: 'wa-6', numeroFacture: 'NF0988', status: 'EN_TRAITEMENT', typeFacture: 'FACTURE_VENTE', clientName: 'Delta Corp', montantTtc: 7200, montantHt: 6000, montantTva: 1200, dateFacture: '2024-02-12T00:00:00Z', periode: '02/2024', parsedItems: [], transactionsList: [] },
  { id: 'wa-7', numeroFacture: 'NF73677', status: 'ANNULER', typeFacture: 'AVOIR_VENTE', clientName: 'Epsilon SA', montantTtc: -1800, montantHt: -1500, montantTva: -300, dateFacture: '2024-02-15T00:00:00Z', periode: '02/2024', parsedItems: [], transactionsList: [] },
  { id: 'wa-8', numeroFacture: 'FAC-2024-008', status: 'VALIDER', typeFacture: 'FACTURE_ACHAT', fournisseurName: 'Zeta Services', montantTtc: -2400, montantHt: -2000, montantTva: -400, dateFacture: '2024-02-20T00:00:00Z', periode: '02/2024', parsedItems: [], transactionsList: [{ id: 't4', bankDescription: 'Prélèvement Zeta Services', amount: -2400, date: '2024-02-22' }] },
  { id: 'gm-1', numeroFacture: 'FAC-GM-001', status: 'VALIDER', typeFacture: 'FACTURE_VENTE', clientName: 'Client Gmail A', montantTtc: 4200, montantHt: 3500, montantTva: 700, dateFacture: '2024-01-10T00:00:00Z', periode: '01/2024', parsedItems: [], transactionsList: [] },
  { id: 'gm-2', numeroFacture: 'FAC-GM-002', status: 'EN_TRAITEMENT', typeFacture: 'FACTURE_ACHAT', fournisseurName: 'Supplier Gmail B', montantTtc: -960, montantHt: -800, montantTva: -160, dateFacture: '2024-01-25T00:00:00Z', periode: '01/2024', parsedItems: [], transactionsList: [] },
];

const mockPriorities: PriorityItem[] = [
  { id: 'p1', title: 'Valider relevé FAC-2024-001', description: 'Acme Corp — facture de 5 820 € en attente de validation manuelle depuis 2 jours.', urgency: 'haute', actionType: 'validation', facture: 'FAC-2024-001', deadline: '2025-01-28', montant: 5820 },
  { id: 'p2', title: 'Corriger erreur FAC-2024-004', description: "Office Depot — format PDF invalide. TVA non lisible. Correction requise avant intégration.", urgency: 'haute', actionType: 'correction', facture: 'FAC-2024-004', deadline: '2025-02-03', montant: 540 },
  { id: 'p3', title: 'Relancer paiement NF0988', description: 'Delta Corp — facture de 7 200 € non payée depuis 15 jours. Relance auto en échec.', urgency: 'moyenne', actionType: 'relance', facture: 'NF0988', deadline: '2025-02-05', montant: 7200 },
  { id: 'p4', title: 'Signature avoir NF73677', description: "Avoir de 1 800 € pour Epsilon SA — accord de remboursement nécessite signature manuelle.", urgency: 'moyenne', actionType: 'signature', facture: 'NF73677', deadline: '2025-02-08', montant: 1800 },
  { id: 'p5', title: 'Valider FAC-GM-002', description: 'Supplier Gmail B — facture reçue par email mais rapprochement bancaire en attente.', urgency: 'basse', actionType: 'validation', facture: 'FAC-GM-002', deadline: '2025-02-12', montant: 960 },
];

const mockAlerts: AgentAlert[] = [
  { id: 'a1', type: 'error', title: 'PDF corrompu détecté', message: "FAC-2024-004 (Office Depot) — fichier PDF non lisible. Extraction données impossible.", time: '09:22', facture: 'FAC-2024-004' },
  { id: 'a2', type: 'error', title: 'Échec rapprochement bancaire', message: "FAC-GM-002 (Supplier Gmail B) — aucune transaction correspondante trouvée.", time: '08:45', facture: 'FAC-GM-002' },
  { id: 'a3', type: 'warning', title: 'Facture non payée +15j', message: 'NF0988 (Delta Corp) — 15 jours de retard de paiement détecté. Relance programmée.', time: '08:30', facture: 'NF0988' },
  { id: 'a4', type: 'warning', title: 'Doublon potentiel', message: "FAC-GM-001 ressemble à FAC-2024-001 — même client, même montant. Vérification requise.", time: '08:12', facture: 'FAC-GM-001' },
  { id: 'a5', type: 'success', title: 'Validation automatique réussie', message: 'FAC-2024-003 (Beta Solutions) — rapprochement bancaire réussi. Montant: 3 600 €.', time: '07:55', facture: 'FAC-2024-003' },
  { id: 'a6', type: 'success', title: '3 factures WhatsApp traitées', message: 'FAC-2024-001, FAC-2024-005, FAC-2024-008 — extraction et validation automatiques réussies.', time: '07:30' },
  { id: 'a7', type: 'info', title: 'Nouvel email détecté', message: 'Gmail — 2 nouvelles factures détectées dans la boîte mail. Analyse en cours.', time: '07:15' },
  { id: 'a8', type: 'info', title: 'Synchronisation banque', message: '12 nouvelles transactions importées depuis le relevé bancaire du 20/01/2025.', time: '06:50' },
];

const mockTimeline: TimelineEvent[] = [
  { id: 't1', time: '09:22', type: 'error', title: 'PDF illisible', description: 'FAC-2024-004 rejetée — PDF corrompu.' },
  { id: 't2', time: '08:45', type: 'warning', title: 'Rapprochement échoué', description: 'FAC-GM-002 — aucune transaction correspondante.' },
  { id: 't3', time: '08:30', type: 'warning', title: 'Retard paiement', description: 'NF0988 Delta Corp — 15 jours de retard.' },
  { id: 't4', time: '07:55', type: 'success', title: 'Validation auto', description: 'FAC-2024-003 rapprochée et validée.' },
  { id: 't5', time: '07:30', type: 'success', title: '3 factures WA', description: 'Traitement automatique réussi.' },
  { id: 't6', time: '07:15', type: 'action', title: 'Scan Gmail', description: '2 nouvelles factures détectées.' },
  { id: 't7', time: '06:50', type: 'action', title: 'Import bancaire', description: '12 transactions synchronisées.' },
  { id: 't8', time: '06:30', type: 'action', title: 'Démarrage agent', description: '10 factures en file de traitement.' },
];

const mockActivity: TodayActivity[] = [
  { id: 'act1', action: 'validated', factureType: 'VENTE', nom: 'FAC-2024-003 — Beta Solutions', time: '07:55', montant: 3600 },
  { id: 'act2', action: 'processed', factureType: 'ACHAT', nom: 'FAC-2024-008 — Zeta Services', time: '07:30', montant: 2400 },
  { id: 'act3', action: 'detected', factureType: 'VENTE', nom: 'FAC-GM-001 — Client Gmail A', time: '07:15', montant: 4200 },
  { id: 'act4', action: 'rejected', factureType: 'ACHAT', nom: 'FAC-2024-004 — Office Depot', time: '09:22', montant: 540 },
  { id: 'act5', action: 'validated', factureType: 'VENTE', nom: 'FAC-2024-005 — Gamma Industries', time: '07:30', montant: 12600 },
];

const mockKpis: KpiCard[] = [
  { label: 'Total factures', value: 10, sub: "aujourd'hui", color: '#0d9394', icon: '📄' },
  { label: 'Montant HT', value: '27 350 €', sub: 'total traité', color: '#2563eb', icon: '€' },
  { label: 'Validées', value: 5, sub: '50% du total', color: '#22c55e', icon: '✓' },
  { label: 'En traitement', value: 3, sub: 'en attente', color: '#f59e0b', icon: '⏳' },
  { label: 'Erreurs', value: 1, sub: 'à corriger', color: '#ef4444', icon: '✕' },
  { label: 'Taux succès', value: '83%', sub: 'ce mois', color: '#8b5cf6', icon: '↑' },
];

const SOFIA_MSGS = [
  "Bonjour ! J'ai traité 10 factures ce matin. 2 actions urgentes nécessitent votre validation.",
  "Recommandation : valider FAC-2024-001 et corriger l'erreur PDF sur FAC-2024-004 en priorité.",
];

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { id: 'VALIDER', label: 'Validé', color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)' },
  { id: 'EN_TRAITEMENT', label: 'En traitement', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  { id: 'ERROR', label: 'Erreur', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
  { id: 'ANNULER', label: 'Annulé', color: 'var(--text2)', bgColor: 'rgba(107,114,128,0.1)' },
];
const TYPE_FILTERS = [
  { id: 'FACTURE_ACHAT', label: 'Achat', icon: '📥' },
  { id: 'FACTURE_VENTE', label: 'Vente', icon: '📤' },
  { id: 'AVOIR_ACHAT', label: 'Avoir A.', icon: '↩️' },
  { id: 'AVOIR_VENTE', label: 'Avoir V.', icon: '↪️' },
];
const URGENCY_META: Record<string, { color: string; bg: string; label: string; pulse: boolean }> = {
  haute:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Haute',   pulse: true },
  moyenne: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Moyenne', pulse: false },
  basse:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: 'Basse',   pulse: false },
};
const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
  validation: { label: 'Valider',    color: '#22c55e', icon: '✓' },
  correction: { label: 'Corriger',   color: '#ef4444', icon: '✎' },
  relance:    { label: 'Relancer',   color: '#f59e0b', icon: '↩' },
  signature:  { label: 'Signer',     color: '#8b5cf6', icon: '✍' },
};
const ALERT_META: Record<string, { color: string; bg: string; border: string; icon: string; grad: string }> = {
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.18)',   icon: '✕', grad: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.18)', icon: '!', grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.05)',  border: 'rgba(34,197,94,0.18)',  icon: '✓', grad: 'linear-gradient(135deg,#22c55e,#16a34a)' },
  info:    { color: '#0d9394', bg: 'rgba(13,147,148,0.05)', border: 'rgba(13,147,148,0.18)', icon: 'i', grad: 'linear-gradient(135deg,#0d9394,#0b7a7b)' },
};
const TL_META: Record<string, { color: string; bg: string }> = {
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  action:  { color: '#0d9394', bg: 'rgba(13,147,148,0.12)' },
};
const ACTIVITY_META: Record<string, { color: string; label: string; icon: string }> = {
  validated: { color: '#22c55e', label: 'Validée',  icon: '✓' },
  processed: { color: '#0d9394', label: 'Traitée',  icon: '⟳' },
  detected:  { color: '#2563eb', label: 'Détectée', icon: '+' },
  rejected:  { color: '#ef4444', label: 'Rejetée',  icon: '✕' },
};

const glass = (accent = 'var(--border)'): React.CSSProperties => ({
  background: 'var(--bg2)', border: `1px solid ${accent}`, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
});

const CSS = `
@keyframes fc-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes fc-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes fc-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.95)}}
@keyframes fc-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes fc-slide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@keyframes fc-ping{75%,100%{transform:scale(1.8);opacity:0}}
.fc-ping{animation:fc-ping 1.2s cubic-bezier(0,0,0.2,1) infinite}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VALIDER':      return { bg: 'rgba(34,197,94,0.1)',   color: '#22c55e', border: 'rgba(34,197,94,0.3)' };
    case 'EN_TRAITEMENT':return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
    case 'ERROR':        return { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: 'rgba(239,68,68,0.3)' };
    case 'ANNULER':      return { bg: 'rgba(107,114,128,0.1)',color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' };
    default:             return { bg: 'rgba(107,114,128,0.1)',color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' };
  }
};

const Skel = ({ w, h, r = 4 }: { w: number | string; h: number; r?: number }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,var(--bg2) 25%,var(--border) 50%,var(--bg2) 75%)', backgroundSize: '200% 100%', animation: 'fc-shimmer 1.5s infinite' }} />
);

const fmtAmt = (n: number) => `${Math.abs(n).toLocaleString('fr-FR')} €`;

// ─── Alertes View ─────────────────────────────────────────────────────────────

const AlertesView: React.FC<{ priorities: PriorityItem[]; alerts: AgentAlert[] }> = ({ priorities, alerts }) => {
  const urgentCount = priorities.filter(p => p.urgency === 'haute').length;
  const errorCount  = alerts.filter(a => a.type === 'error').length;

  return (
    <div style={{ display: 'flex', gap: 20, padding: 24, height: '100%', overflow: 'hidden', animation: 'fc-fadein 0.3s ease' }}>

      {/* ── Left: Priorities ── */}
      <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingRight: 4 }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
            <span style={{ color: 'white', fontSize: 16 }}>⚑</span>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Actions requises</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{urgentCount} urgente{urgentCount > 1 ? 's' : ''} · {priorities.length} total</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {urgentCount > 0 && (
              <span style={{ position: 'relative', display: 'inline-flex', width: 28, height: 28 }}>
                <span className="fc-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', opacity: 0.4 }} />
                <span style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{urgentCount}</span>
              </span>
            )}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,#ef444440,transparent)', marginBottom: 4 }} />

        {/* Priority cards */}
        {priorities.map(p => {
          const u = URGENCY_META[p.urgency];
          const a = ACTION_META[p.actionType];
          return (
            <div key={p.id} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: 'var(--bg)', border: `1px solid ${u.color}28`, boxShadow: `0 2px 16px ${u.color}12`, animation: 'fc-slide 0.3s ease' }}>
              {/* Colored left accent bar */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg,${u.color},${u.color}88)` }} />

              <div style={{ padding: '12px 14px 12px 18px' }}>
                {/* Top row: urgency + action type + montant */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: u.bg, color: u.color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{u.label}</span>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${a.color}15`, color: a.color }}>{a.icon} {a.label}</span>
                  {p.montant && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text)', background: 'var(--bg2)', padding: '2px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>
                      {fmtAmt(p.montant)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 5, lineHeight: 1.3 }}>{p.title}</div>

                {/* Description */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</div>

                {/* Bottom row: facture ref + deadline + CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(13,147,148,0.1)', color: '#0d9394', border: '1px solid rgba(13,147,148,0.2)' }}>
                    📄 {p.facture}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>📅 {new Date(p.deadline).toLocaleDateString('fr-FR')}</span>
                  <button style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, color: 'white', background: `linear-gradient(135deg,${a.color},${a.color}cc)`, boxShadow: `0 2px 8px ${a.color}40` }}>
                    {a.label}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Vertical divider ── */}
      <div style={{ width: 1, flexShrink: 0, background: 'linear-gradient(180deg,transparent,var(--border) 20%,var(--border) 80%,transparent)', margin: '8px 0' }} />

      {/* ── Right: Alert log ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingLeft: 4 }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(13,147,148,0.3)' }}>
            <span style={{ color: 'white', fontSize: 16 }}>◎</span>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Journal agent</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{errorCount} erreur{errorCount > 1 ? 's' : ''} · {alerts.length} événements</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text3)', background: 'var(--bg2)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>Aujourd'hui</span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,rgba(13,147,148,0.4),transparent)', marginBottom: 4 }} />

        {/* Group by type */}
        {(['error', 'warning', 'success', 'info'] as const).map(type => {
          const group = alerts.filter(a => a.type === type);
          if (!group.length) return null;
          const m = ALERT_META[type];
          return (
            <div key={type}>
              {/* Group label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: m.grad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', fontSize: '0.55rem', fontWeight: 800 }}>{m.icon}</span>
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {type === 'error' ? 'Erreurs' : type === 'warning' ? 'Avertissements' : type === 'success' ? 'Succès' : 'Informations'}
                </span>
                <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>{group.length}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${m.border},transparent)` }} />
              </div>

              {/* Alert cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {group.map(al => (
                  <div key={al.id} style={{ borderRadius: 12, overflow: 'hidden', background: m.bg, border: `1px solid ${m.border}`, boxShadow: '0 1px 8px rgba(0,0,0,0.04)', animation: 'fc-fadein 0.3s ease' }}>
                    {/* Card header strip */}
                    <div style={{ background: m.grad, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 800 }}>{m.icon}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'white', flex: 1 }}>{al.title}</span>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.15)', padding: '1px 6px', borderRadius: 6 }}>{al.time}</span>
                    </div>
                    {/* Card body */}
                    <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{ flex: 1, fontSize: '0.7rem', color: 'var(--text)', lineHeight: 1.5 }}>{al.message}</span>
                      {al.facture && (
                        <span style={{ flexShrink: 0, fontSize: '0.58rem', fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: 'var(--bg)', color: m.color, border: `1px solid ${m.border}` }}>
                          {al.facture}
                        </span>
                      )}
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

const VueAgentView: React.FC<{ kpis: KpiCard[]; timeline: TimelineEvent[]; activities: TodayActivity[]; factures: UiFacture[] }> = ({ kpis, timeline, activities, factures }) => {
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
    const userMsg: ChatMsg = { id: Date.now().toString(), from: 'user', text: chatInput.trim(), time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    setChatMsgs(prev => [...prev, userMsg]);
    setChatInput('');
    setTyping(true);
    setTimeout(() => {
      const replies = ["J'analyse vos factures en temps réel.", "Le rapprochement bancaire est en cours.", "Rapport disponible dans quelques instants."];
      setChatMsgs(prev => [...prev, { id: Date.now().toString(), from: 'sofia', text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
      setTyping(false);
    }, 1000);
  };

  const validated = factures.filter(f => f.status === 'VALIDER').length;
  const pending   = factures.filter(f => f.status === 'EN_TRAITEMENT').length;
  const errors    = factures.filter(f => f.status === 'ERROR').length;
  const totalHT   = factures.reduce((s, f) => s + Math.abs(f.montantHt), 0);

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', animation: 'fc-fadein 0.3s ease' }}>

      {/* KPI bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ flex: '1 1 130px', ...glass(`${k.color}30`), padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 10, top: 10, fontSize: 18, opacity: 0.15 }}>{k.icon}</div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text2)', fontWeight: 500 }}>{k.label}</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{k.sub}</span>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${k.color},${k.color}44)` }} />
          </div>
        ))}
      </div>

      {/* 3-column grid */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* Col 1: Timeline */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9394', display: 'inline-block' }} />
            Timeline
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg,var(--border),transparent)' }} />
            {timeline.map((ev, i) => {
              const m = TL_META[ev.type];
              return (
                <div key={ev.id} style={{ display: 'flex', gap: 10, marginBottom: 14, animation: `fc-slide 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.bg, border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <span style={{ fontSize: '0.5rem', color: m.color, fontWeight: 800 }}>
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

        {/* Col 2: Activity + stats cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Today's activity */}
          <div style={glass('rgba(13,147,148,0.2)')}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)' }}>Activité du jour</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '1px 7px', borderRadius: 10, background: 'rgba(13,147,148,0.1)', color: '#0d9394' }}>{activities.length}</span>
            </div>
            <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activities.map(act => {
                const am = ACTIVITY_META[act.action];
                return (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'var(--bg)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: `${am.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.6rem', color: am.color, fontWeight: 800 }}>{am.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.nom}</div>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text3)' }}>{act.factureType} · {act.time}</div>
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: am.color }}>{fmtAmt(act.montant)}</span>
                    <span style={{ fontSize: '0.55rem', padding: '1px 6px', borderRadius: 6, background: `${am.color}15`, color: am.color, fontWeight: 600 }}>{am.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Validées', val: validated, total: factures.length, color: '#22c55e' },
              { label: 'En attente', val: pending, total: factures.length, color: '#f59e0b' },
              { label: 'Erreurs', val: errors, total: factures.length, color: '#ef4444' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, ...glass(`${s.color}30`), padding: '10px 12px' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text2)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.val}</div>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.total > 0 ? (s.val / s.total) * 100 : 0}%`, background: s.color, borderRadius: 4, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text3)', marginTop: 4 }}>{s.total > 0 ? Math.round((s.val / s.total) * 100) : 0}% du total</div>
              </div>
            ))}
          </div>

          {/* Volume HT card */}
          <div style={{ ...glass('rgba(37,99,235,0.2)'), padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>€</span>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>Volume total HT traité</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2563eb' }}>{totalHT.toLocaleString('fr-FR')} €</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>Taux de succès</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#22c55e' }}>83%</div>
            </div>
          </div>
        </div>

        {/* Col 3: Mini Sofia chatbot */}
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
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260 }}>
                {chatMsgs.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', gap: 6, justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', padding: '6px 10px', borderRadius: msg.from === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: msg.from === 'user' ? '#0d9394' : 'var(--bg)', color: msg.from === 'user' ? 'white' : 'var(--text)', fontSize: '0.65rem', lineHeight: 1.5 }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#0d9394', animation: `fc-pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
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

// ─── Details View (existing facture table) ────────────────────────────────────

interface DetailsViewProps {
  facturesData: UiFacture[];
  setFacturesData: React.Dispatch<React.SetStateAction<UiFacture[]>>;
  setSelectedFacture: (f: UiFacture) => void;
  setDetailsModalOpen: (v: boolean) => void;
}

const DetailsView: React.FC<DetailsViewProps> = ({ facturesData, setFacturesData, setSelectedFacture, setDetailsModalOpen }) => {
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType]     = useState<string | null>(null);
  const [todayOnly, setTodayOnly]           = useState(false);
  const [dateDebut, setDateDebut]           = useState('');
  const [dateFin, setDateFin]               = useState('');
  const [showAdvanced, setShowAdvanced]     = useState(false);
  const [activeTab, setActiveTab]           = useState<'all' | 'whatsapp' | 'gmail'>('all');
  const [amountMode, setAmountMode]         = useState<'ttc' | 'ht' | 'tva'>('ttc');
  const [page, setPage]                     = useState(0);
  const [rowsPerPage, setRowsPerPage]       = useState(5);

  const SOFIA_FULL_MESSAGE = "Salut! Je suis Procia, ton agent IA. Aujourd'hui j'ai traité 10 factures: 8 par WhatsApp et 2 par Gmail. 2 factures nécessitent ton attention (NF0988 et FAC-2024-004).";
  const [isSofiaThinking, setIsSofiaThinking] = useState(true);
  const [sofiaText, setSofiaText]             = useState('');

  useEffect(() => {
    const t = setTimeout(() => setIsSofiaThinking(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isSofiaThinking && sofiaText.length < SOFIA_FULL_MESSAGE.length) {
      const t = setTimeout(() => setSofiaText(SOFIA_FULL_MESSAGE.slice(0, sofiaText.length + 1)), 12);
      return () => clearTimeout(t);
    }
  }, [isSofiaThinking, sofiaText]);

  const baseFiltered = useMemo(() => facturesData.filter(f => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!(f.numeroFacture || '').toLowerCase().includes(q) && !(f.clientName || '').toLowerCase().includes(q) && !(f.fournisseurName || '').toLowerCase().includes(q)) return false;
    }
    if (selectedStatus && f.status !== selectedStatus) return false;
    if (selectedType && f.typeFacture !== selectedType) return false;
    if (todayOnly) { const today = new Date().toDateString(); if (!f.dateFacture || new Date(f.dateFacture).toDateString() !== today) return false; }
    if (dateDebut && f.dateFacture < dateDebut) return false;
    if (dateFin && f.dateFacture > dateFin + 'T23:59:59Z') return false;
    return true;
  }), [facturesData, searchQuery, selectedStatus, selectedType, todayOnly, dateDebut, dateFin]);

  const filteredData = useMemo(() => {
    if (activeTab === 'all') return baseFiltered;
    const prefix = activeTab === 'whatsapp' ? 'wa-' : 'gm-';
    return baseFiltered.filter(f => f.id.startsWith(prefix));
  }, [baseFiltered, activeTab]);

  const waCount   = useMemo(() => baseFiltered.filter(f => f.id.startsWith('wa-')).length, [baseFiltered]);
  const gmCount   = useMemo(() => baseFiltered.filter(f => f.id.startsWith('gm-')).length, [baseFiltered]);
  const tabCount  = filteredData.length;
  const tableData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const toggleTransCard = (id: string) => setFacturesData(prev => prev.map(f => f.id === id ? { ...f, showTransCard: !f.showTransCard } : { ...f, showTransCard: false }));

  const inputStyle: React.CSSProperties = { flex: 1, padding: '6px 10px', borderRadius: 5, border: '1px solid var(--border)', fontSize: '0.65rem', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text)', cursor: 'pointer' };

  return (
    <div style={{ padding: 20, overflowY: 'auto', height: '100%', animation: 'fc-fadein 0.3s ease' }}>

      {/* Sofia message */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #0d9394', boxShadow: '0 0 12px rgba(13,147,148,0.4)', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>S</span>
        </div>
        <div style={{ flex: 1, background: 'linear-gradient(135deg,rgba(148,163,184,0.12),rgba(71,85,105,0.12))', backdropFilter: 'blur(8px)', borderRadius: '12px 12px 12px 0', border: '1px solid rgba(241,245,249,0.25)', padding: 14, minHeight: 60 }}>
          {isSofiaThinking
            ? <span style={{ position: 'relative', display: 'inline-flex', width: 14, height: 14 }}><span className="fc-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#0d9394', opacity: 0.7 }} /><span style={{ position: 'relative', width: 14, height: 14, borderRadius: '50%', background: '#0d9394' }} /></span>
            : <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6 }}>
                {sofiaText}
                {sofiaText.length < SOFIA_FULL_MESSAGE.length && <span style={{ display: 'inline-block', width: 2, height: 13, background: '#0d9394', marginLeft: 2, animation: 'fc-blink 1s infinite' }} />}
              </p>
          }
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', padding: '12px 14px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', minWidth: 200 }}>
            <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)' }} />
            <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(0); }} placeholder="Rechercher une facture…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.7rem', color: 'var(--text)', width: '100%' }} />
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: 4 }}>
            {STATUS_FILTERS.map(st => (
              <div key={st.id} onClick={() => setSelectedStatus(selectedStatus === st.id ? null : st.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.62rem', fontWeight: 600, border: `1.5px solid ${selectedStatus === st.id ? st.color : 'transparent'}`, background: selectedStatus === st.id ? st.bgColor : 'var(--bg2)', color: selectedStatus === st.id ? st.color : 'var(--text2)', transition: 'all 0.15s' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />{st.label}
              </div>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div onClick={() => setTodayOnly(!todayOnly)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.62rem', fontWeight: 600, background: todayOnly ? 'rgba(13,147,148,0.1)' : 'var(--bg2)', color: todayOnly ? '#0d9394' : 'var(--text2)', border: `1.5px solid ${todayOnly ? '#0d9394' : 'transparent'}` }}>
            <Icons.Calendar style={{ width: 11, height: 11 }} />Ce jour
          </div>
          <div onClick={() => setShowAdvanced(!showAdvanced)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.62rem', fontWeight: 600, background: showAdvanced ? 'rgba(13,147,148,0.1)' : 'var(--bg2)', color: showAdvanced ? '#0d9394' : 'var(--text2)', border: `1.5px solid ${showAdvanced ? '#0d9394' : 'transparent'}` }}>
            <Icons.SlidersHorizontal style={{ width: 11, height: 11 }} />Filtres
            <Icons.ChevronDown style={{ width: 9, height: 9, transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.58rem', color: 'var(--text3)', fontWeight: 600 }}>Type:</span>
          {TYPE_FILTERS.map(tp => (
            <div key={tp.id} onClick={() => setSelectedType(selectedType === tp.id ? null : tp.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.62rem', fontWeight: 600, border: `1.5px solid ${selectedType === tp.id ? '#0d9394' : 'var(--border)'}`, background: selectedType === tp.id ? 'rgba(13,147,148,0.1)' : 'var(--bg)', color: selectedType === tp.id ? '#0d9394' : 'var(--text2)' }}>
              <span style={{ fontSize: '0.7rem' }}>{tp.icon}</span>{tp.label}
            </div>
          ))}
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>De:</span>
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={{ ...inputStyle, minWidth: 110 }} />
          <span style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>À:</span>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} style={{ ...inputStyle, minWidth: 110 }} />
        </div>
      </div>

      {/* Factures table card */}
      <div style={{ background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
          {([
            { id: 'all' as const, label: 'Toutes', count: baseFiltered.length },
            { id: 'whatsapp' as const, label: 'WhatsApp', count: waCount },
            { id: 'gmail' as const, label: 'Gmail', count: gmCount },
          ]).map(tab => (
            <div key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(0); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #0d9394' : '2px solid transparent', background: activeTab === tab.id ? 'rgba(13,147,148,0.05)' : 'transparent' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? '#0d9394' : 'var(--text2)' }}>{tab.label}</span>
              <span style={{ height: 16, fontSize: '0.58rem', fontWeight: 700, padding: '0 6px', borderRadius: 8, background: activeTab === tab.id ? 'rgba(13,147,148,0.15)' : 'var(--border)', color: activeTab === tab.id ? '#0d9394' : 'var(--text2)', display: 'inline-flex', alignItems: 'center' }}>{tab.count}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {['Période', 'Type', 'Client / Fournisseur'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.7rem' }}>{h}</th>
                ))}
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.7rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Montant
                    <div style={{ display: 'flex', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg)' }}>
                      {(['ttc', 'ht', 'tva'] as const).map(mode => (
                        <button key={mode} onClick={e => { e.stopPropagation(); setAmountMode(mode); }} style={{ padding: '2px 6px', fontSize: '0.52rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: amountMode === mode ? '#0d9394' : 'transparent', color: amountMode === mode ? 'white' : 'var(--text2)', textTransform: 'uppercase' }}>{mode}</button>
                      ))}
                    </div>
                  </div>
                </th>
                {['N° Facture', 'Status', 'Paiement'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.7rem' }}>{h}</th>
                ))}
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--text)', fontSize: '0.7rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: 'var(--text2)', fontSize: '0.72rem' }}>Aucune facture à afficher.</td></tr>
              ) : tableData.map(row => {
                const ttc  = Number(row.montantTtc ?? 0);
                const name = row.clientName || row.receiverName || row.fournisseurName || '—';
                const per  = row.periode || (row.dateFacture ? new Date(row.dateFacture).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' }) : '—');
                const sc   = getStatusColor(row.status || '');
                const tf   = (row.typeFacture || '').toUpperCase();
                const isV  = tf.includes('VENTE'), isA = tf.includes('AVOIR');
                const tLabel = isA ? (isV ? 'Avoir V.' : 'Avoir A.') : (isV ? 'Vente' : 'Achat');
                const tColor = isV ? '#16a34a' : '#dc2626';
                const tBg    = isV ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
                const val  = amountMode === 'ht' ? Number(row.montantHt ?? 0) : amountMode === 'tva' ? Number(row.montantTva ?? 0) : ttc;

                return (
                  <React.Fragment key={row.id}>
                    <tr onClick={() => { setSelectedFacture(row); setDetailsModalOpen(true); }} style={{ borderBottom: '1px solid var(--bg2)', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: 12 }}><span style={{ fontWeight: 600, color: 'var(--text)' }}>{per}</span></td>
                      <td style={{ padding: 12 }}><span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 5, background: tBg, color: tColor, fontWeight: 700 }}>{tLabel}</span></td>
                      <td style={{ padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icons.User style={{ width: 13, height: 13, color: '#0d9394' }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{name}</span>
                        </div>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ height: 22, fontSize: '0.65rem', fontWeight: 700, borderRadius: 6, padding: '0 8px', display: 'inline-flex', alignItems: 'center', background: val < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: val < 0 ? '#ef4444' : '#22c55e', border: `1px solid ${val < 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                          {val.toFixed(2)} €
                        </span>
                      </td>
                      <td style={{ padding: 12 }}><span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{row.numeroFacture || '—'}</span></td>
                      <td style={{ padding: 12 }}>
                        <span style={{ height: 22, fontSize: '0.58rem', fontWeight: 700, borderRadius: 6, padding: '0 8px', display: 'inline-flex', alignItems: 'center', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{row.status}</span>
                      </td>
                      <td style={{ padding: 12 }}>
                        {row.transactionsList?.length > 0
                          ? <span style={{ height: 22, fontSize: '0.58rem', fontWeight: 700, borderRadius: 6, padding: '0 8px', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>✓ Payé</span>
                          : <span style={{ height: 22, fontSize: '0.58rem', fontWeight: 700, borderRadius: 6, padding: '0 8px', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>⏳ Non payé</span>
                        }
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <button onClick={e => { e.stopPropagation(); if (row.transactionsList?.length) toggleTransCard(row.id); }} disabled={!row.transactionsList?.length}
                            style={{ width: 26, height: 26, background: row.transactionsList?.length ? '#0d9394' : 'var(--bg2)', color: row.transactionsList?.length ? 'white' : 'var(--text3)', border: row.transactionsList?.length ? 'none' : '1px solid var(--border)', borderRadius: 6, cursor: row.transactionsList?.length ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Link style={{ width: 11, height: 11 }} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setSelectedFacture(row); setDetailsModalOpen(true); }} style={{ width: 26, height: 26, background: 'var(--bg2)', color: 'var(--text2)', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Eye style={{ width: 11, height: 11 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {row.showTransCard && row.transactionsList?.length > 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: 0, position: 'relative' }}>
                          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', width: '50%', right: '5%', zIndex: 100, top: -20, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
                            <div style={{ height: 32, background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
                              <Icons.Link style={{ width: 11, height: 11, color: 'white' }} />
                              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.68rem' }}>Transactions liées ({row.transactionsList.length})</span>
                            </div>
                            {row.transactionsList.map((trans: any, i: number) => {
                              const ta = Number(trans.amount ?? 0);
                              return (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: i < row.transactionsList.length - 1 ? '1px solid var(--bg2)' : 'none' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Icons.FileText style={{ width: 11, height: 11, color: '#0d9394' }} />
                                    </div>
                                    <div>
                                      <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 500, color: 'var(--text)' }}>{trans.bankDescription || trans.description || 'Transaction'}</p>
                                      <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--text3)' }}>{trans.date || ''}</p>
                                    </div>
                                  </div>
                                  <span style={{ height: 20, fontSize: '0.6rem', fontWeight: 700, borderRadius: 5, padding: '0 6px', display: 'inline-flex', alignItems: 'center', background: ta < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: ta < 0 ? '#ef4444' : '#22c55e', border: `1px solid ${ta < 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>{ta.toFixed(2)} €</span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
              <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
            </select>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text2)' }}>
            {tabCount === 0 ? '0' : `${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, tabCount)}`} sur {tabCount}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.ChevronLeft style={{ width: 11, height: 11 }} />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * rowsPerPage >= tabCount} style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', cursor: (page + 1) * rowsPerPage >= tabCount ? 'default' : 'pointer', opacity: (page + 1) * rowsPerPage >= tabCount ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.ChevronRight style={{ width: 11, height: 11 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const FactureChatModal: React.FC<FactureModalProps> = ({ open, agent, agentId, onClose }) => {
  const [mainTab, setMainTab]             = useState<'alertes' | 'vue' | 'details'>('alertes');
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [facturesData, setFacturesData]   = useState<UiFacture[]>(MOCK_FACTURES.map(f => ({ ...f, showTransCard: false })));
  const [selectedFacture, setSelectedFacture] = useState<UiFacture | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [showProcessingJournal, setShowProcessingJournal]   = useState(false);
  const [processingSessionId, setProcessingSessionId]       = useState<string | null>(null);

  const urgentCount = mockPriorities.filter(p => p.urgency === 'haute').length;

  const NAV = [
    { key: 'alertes' as const, label: 'Alertes & Priorités', icon: '🔔', badge: urgentCount },
    { key: 'vue'     as const, label: 'Vue Agent',           icon: '⬡',  badge: null },
    { key: 'details' as const, label: 'Référentiel',             icon: '☰',  badge: facturesData.length },
  ];

  if (!agent) return null;

  return (
    <>
      <style>{CSS}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 1300, display: open ? 'flex' : 'none', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ height: 52, flexShrink: 0, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, background: 'var(--bg)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(13,147,148,0.3)' }}>
            <Icons.FileText style={{ width: 16, height: 16, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Agent Facture</div>
            <div style={{ fontSize: '0.6rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              En ligne · 10 factures traitées
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.6rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(13,147,148,0.1)', color: '#0d9394', border: '1px solid rgba(13,147,148,0.2)', fontWeight: 600 }}>IA Procia</span>
            <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'var(--bg2)', cursor: 'pointer', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.X style={{ width: 14, height: 14, color: 'var(--text)' }} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Sidebar */}
          <div style={{ width: sidebarOpen ? 200 : 58, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', overflow: 'hidden' }}>
            {/* Toggle btn */}
            <button onClick={() => setSidebarOpen(v => !v)} style={{ margin: '10px auto', width: 34, height: 34, borderRadius: 9, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text2)', fontSize: '0.8rem', transition: 'transform 0.25s' }}>
              {sidebarOpen ? '◀' : '▶'}
            </button>

            {/* Nav items */}
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

            {/* Agent health */}
            {sidebarOpen && (
              <div style={{ margin: '16px 10px 0', padding: '10px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>SANTÉ AGENT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ width: '83%', height: '100%', background: 'linear-gradient(90deg,#22c55e,#16a34a)', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#22c55e' }}>83%</span>
                </div>
                <div style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>1 erreur active</div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {mainTab === 'alertes' && <div style={{ flex: 1, overflowY: 'auto' }}><AlertesView priorities={mockPriorities} alerts={mockAlerts} /></div>}
            {mainTab === 'vue'     && <div style={{ flex: 1, overflowY: 'auto' }}><VueAgentView kpis={mockKpis} timeline={mockTimeline} activities={mockActivity} factures={facturesData} /></div>}
            {mainTab === 'details' && (
              <DetailsView
                facturesData={facturesData}
                setFacturesData={setFacturesData}
                setSelectedFacture={setSelectedFacture}
                setDetailsModalOpen={setDetailsModalOpen}
              />
            )}
          </div>
        </div>
      </div>

      {/* Processing journal overlay */}
      {showProcessingJournal && processingSessionId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, boxShadow: '0 24px 64px rgba(0,0,0,0.15)', maxWidth: '90vw', width: 1000, maxHeight: '90vh', overflow: 'auto', padding: 24, position: 'relative' }}>
            <button onClick={() => { setShowProcessingJournal(false); setProcessingSessionId(null); }} style={{ position: 'absolute', right: 16, top: 16, width: 32, height: 32, borderRadius: 8, background: 'var(--bg2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
              <Icons.X style={{ width: 18, height: 18 }} />
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>Sofia analyse vos fichiers</h2>
            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--text2)' }}>Intelligence artificielle en action</p>
            <SofiaProcessingJournal
              sessionId={processingSessionId}
              onComplete={() => {}}
              onError={() => {}}
              onClose={() => { setShowProcessingJournal(false); setProcessingSessionId(null); }}
            />
          </div>
        </div>
      )}

      <FactureDetailsModal
        open={detailsModalOpen}
        facture={selectedFacture}
        onClose={() => { setDetailsModalOpen(false); setSelectedFacture(null); }}
      />
    </>
  );
};
