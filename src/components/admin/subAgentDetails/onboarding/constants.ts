import React from 'react';

export const CSS = `
@keyframes onb-dot1{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes onb-dot2{0%,20%,100%{transform:scale(0)}60%{transform:scale(1)}}
@keyframes onb-dot3{0%,40%,100%{transform:scale(0)}80%{transform:scale(1)}}
@keyframes onb-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes onb-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes onb-popup{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
@keyframes onb-slide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@keyframes onb-pulse{0%,100%{opacity:1}50%{opacity:0.5}}
`;

export const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
export const fmtCurrency = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const glass = (accent = 'var(--border)'): React.CSSProperties => ({
  background: 'var(--bg2)',
  border: `1px solid ${accent}`,
  borderRadius: 12,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
});

export const TYPE_META: Record<string, { color: string; bg: string; label: string }> = {
  CLIENT:      { color: '#2563eb', bg: 'rgba(37,99,235,0.1)',   label: 'Client' },
  FOURNISSEUR: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Fournisseur' },
  CONTACT:     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Contact' },
  SALARIE:     { color: '#0d9394', bg: 'rgba(13,147,148,0.1)', label: 'Salarié' },
};

export const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  EN_COURS:   { color: '#2563eb', bg: 'rgba(37,99,235,0.1)',  label: 'En cours' },
  COMPLETE:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: 'Complété' },
  EN_ATTENTE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'En attente' },
  REJETE:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Rejeté' },
};

export const SAL_STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  ACTIF:            { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Actif' },
  EN_PERIODE_ESSAI: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: "Période d'essai" },
  SUSPENDU:         { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Suspendu' },
  INACTIF:          { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Inactif' },
};

export const CONTRAT_META: Record<string, { color: string; bg: string }> = {
  CDI:      { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  CDD:      { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  STAGE:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  FREELANCE:{ color: '#0d9394', bg: 'rgba(13,147,148,0.1)' },
};

export const ALERT_META: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)',   icon: '✕' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', icon: '!' },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.2)',  icon: '✓' },
  info:    { color: '#0d9394', bg: 'rgba(13,147,148,0.06)', border: 'rgba(13,147,148,0.2)', icon: 'i' },
};

export const ALERT_GRAD: Record<string, { grad: string; color: string; badge: string; label: string; icon: string }> = {
  error:   { grad: 'linear-gradient(90deg,#ef4444,#dc2626)', color: '#ef4444', badge: 'rgba(239,68,68,0.1)',   label: 'Erreurs',        icon: '✕' },
  warning: { grad: 'linear-gradient(90deg,#f59e0b,#d97706)', color: '#f59e0b', badge: 'rgba(245,158,11,0.1)', label: 'Avertissements', icon: '⚠' },
  success: { grad: 'linear-gradient(90deg,#22c55e,#16a34a)', color: '#22c55e', badge: 'rgba(34,197,94,0.1)',   label: 'Succès',         icon: '✓' },
  info:    { grad: 'linear-gradient(90deg,#0d9394,#0b7a7b)', color: '#0d9394', badge: 'rgba(13,147,148,0.1)', label: 'Informations',   icon: 'ℹ' },
};

export const URGENCY_META: Record<string, { color: string; bg: string; label: string }> = {
  haute:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Haute' },
  moyenne:{ color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Moyenne' },
  basse:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: 'Basse' },
};

export const ACTION_ICONS: Record<string, string> = { validation: '✓', relance: '↩', signature: '✍', verification: '?' };

export const TL_META: Record<string, { color: string; bg: string }> = {
  error:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  success: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  action:  { color: '#0d9394', bg: 'rgba(13,147,148,0.12)' },
};

export const ACTIVITY_META: Record<string, { color: string; label: string; icon: string }> = {
  added:     { color: '#22c55e', label: 'Ajouté',   icon: '+' },
  modified:  { color: '#0d9394', label: 'Modifié',  icon: '~' },
  completed: { color: '#2563eb', label: 'Complété', icon: '✓' },
  rejected:  { color: '#ef4444', label: 'Rejeté',   icon: '✕' },
};

export const DOC_STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  VALIDER:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Validé' },
  EN_ATTENTE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'En attente' },
  MANQUANT:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Manquant' },
  REJETE:     { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Rejeté' },
};

export const CONTRAT_STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  SIGNE:               { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    label: 'Signé' },
  EN_ATTENTE_SIGNATURE:{ color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'En attente' },
  BROUILLON:           { color: '#64748b', bg: 'rgba(100,116,139,0.1)', label: 'Brouillon' },
  EXPIRE:              { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Expiré' },
};
