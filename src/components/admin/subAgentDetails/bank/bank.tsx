"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from '../../../../assets/icons';
import { BankDetailsModal } from './bankDetails';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Account { id: string; titulaire: string; numeroCompte: string; banque: string; solde: number; status: 'ACTIF' | 'INACTIF' | 'EN_ATTENTE'; type: string; dateCreation: string; }
interface UiTransaction { id: string; idTransaction: string; date: string; amount: number; montant: number; bankDescription: string; typeOperation: 'CREDIT' | 'DEBIT'; categorie: string; categorieParent: string; categorieTransaction: string; statut: string; client: string; fournisseur: string; salarie: string; factureList: string[]; chargeAttacher: number; label: string; }
interface ChatSession { id: string; accountId: string; label: string; preview: string; time: string; }
interface ChatMsg { id: string; from: 'sofia' | 'user'; text: string; time: string; }
interface Releve { id: string; nom: string; banque: string; reference: string; canal: 'whatsapp' | 'gmail' | 'manuel'; date: string; taille: string; periode: string; statut: 'VALIDER' | 'EN_ATTENTE' | 'ERREUR'; }
interface PriorityItem { id: string; title: string; description: string; urgency: 'haute' | 'moyenne' | 'basse'; actionType: 'validation' | 'correction' | 'rapprochement' | 'relance'; ref: string; deadline: string; montant?: number; }
interface AgentAlert { id: string; type: 'error' | 'warning' | 'success' | 'info'; title: string; message: string; time: string; ref?: string; }
interface TimelineEvent { id: string; time: string; type: 'action' | 'success' | 'warning' | 'error'; title: string; description: string; }
interface TodayActivity { id: string; action: 'reconciled' | 'imported' | 'rejected' | 'validated'; entityType: 'transaction' | 'releve' | 'compte'; nom: string; time: string; montant?: number; }
interface KpiCard { label: string; value: string | number; sub: string; color: string; icon: string; }

// ── Mock data ──────────────────────────────────────────────────────────────────
const mockAccounts: Account[] = [
    { id: 'acc-1', titulaire: 'SARL Tech Conseil', numeroCompte: 'FR76 3000 1007 9412 3456 7890 185', banque: 'BNP Paribas',       solde: 28450.00, status: 'ACTIF',      type: 'Courant', dateCreation: '2020-03-15' },
    { id: 'acc-2', titulaire: 'SARL Tech Conseil', numeroCompte: 'FR76 1820 6004 2113 4500 0080 013', banque: 'Société Générale', solde: 12300.00, status: 'ACTIF',      type: 'Courant', dateCreation: '2021-06-20' },
    { id: 'acc-3', titulaire: 'SARL Tech Conseil', numeroCompte: 'FR76 3000 4001 8200 3456 7890 143', banque: 'CIC',               solde: 5800.00,  status: 'EN_ATTENTE', type: 'Épargne', dateCreation: '2023-01-10' },
];
const mockTransactions: UiTransaction[] = [
    { id: 'tr-1',  idTransaction: 'tr-1',  date: '2025-01-15', amount: 1250.00,  montant: 1250.00,  bankDescription: 'VIREMENT RECU CLIENT ABC',           typeOperation: 'CREDIT', categorie: 'Vente services',   categorieParent: 'Recettes', categorieTransaction: 'Vente services',   statut: 'RAPPROCHER', client: 'Client ABC',      fournisseur: '',           salarie: '',          factureList: ['FACT-2025-001'], chargeAttacher: 1, label: 'Paiement facture' },
    { id: 'tr-2',  idTransaction: 'tr-2',  date: '2025-01-12', amount: -3600.00, montant: -3600.00, bankDescription: 'VIREMENT EMIS FOURNISSEUR XYZ',        typeOperation: 'DEBIT',  categorie: 'Achats',           categorieParent: 'Dépenses', categorieTransaction: 'Achats',           statut: 'EN_ATTENTE', client: '',               fournisseur: 'Fournisseur XYZ', salarie: '', factureList: [],               chargeAttacher: 0, label: 'Fournisseur'    },
    { id: 'tr-3',  idTransaction: 'tr-3',  date: '2025-01-10', amount: -2850.00, montant: -2850.00, bankDescription: 'PRELEVEMENT SALAIRE JEAN DUPONT',      typeOperation: 'DEBIT',  categorie: 'Salaires',         categorieParent: 'Charges',  categorieTransaction: 'Salaires',         statut: 'VALIDER',    client: '',               fournisseur: '',           salarie: 'Jean Dupont', factureList: [],             chargeAttacher: 1, label: 'Salaire'        },
    { id: 'tr-4',  idTransaction: 'tr-4',  date: '2025-01-08', amount: 8500.00,  montant: 8500.00,  bankDescription: 'VIREMENT CLIENT ENTERPRISE CORP',      typeOperation: 'CREDIT', categorie: 'Vente services',   categorieParent: 'Recettes', categorieTransaction: 'Vente services',   statut: 'RAPPROCHER', client: 'Enterprise Corp', fournisseur: '',          salarie: '',          factureList: ['FACT-2025-002'], chargeAttacher: 1, label: 'Paiement facture' },
    { id: 'tr-5',  idTransaction: 'tr-5',  date: '2025-01-05', amount: -2340.00, montant: -2340.00, bankDescription: 'PAIEMENT TECH SOLUTIONS',               typeOperation: 'DEBIT',  categorie: 'Logiciels',        categorieParent: 'Dépenses', categorieTransaction: 'Logiciels',        statut: 'RAPPROCHER', client: '',               fournisseur: 'Tech Solutions', salarie: '', factureList: ['FAC-F2025-045'], chargeAttacher: 1, label: 'Logiciel'       },
    { id: 'tr-6',  idTransaction: 'tr-6',  date: '2024-12-28', amount: 4200.00,  montant: 4200.00,  bankDescription: 'VIREMENT GLOBAL SERVICES SA',           typeOperation: 'CREDIT', categorie: 'Vente services',   categorieParent: 'Recettes', categorieTransaction: 'Vente services',   statut: 'VALIDER',    client: 'Global Services',  fournisseur: '',          salarie: '',          factureList: ['FACT-2024-189'], chargeAttacher: 1, label: 'Paiement facture' },
    { id: 'tr-7',  idTransaction: 'tr-7',  date: '2024-12-20', amount: -1560.00, montant: -1560.00, bankDescription: 'PAIEMENT DIGITAL AGENCY',               typeOperation: 'DEBIT',  categorie: 'Achats',           categorieParent: 'Dépenses', categorieTransaction: 'Achats',           statut: 'VALIDER',    client: '',               fournisseur: 'Digital Agency',  salarie: '', factureList: ['FAC-F2024-156'], chargeAttacher: 1, label: 'Agence'         },
    { id: 'tr-8',  idTransaction: 'tr-8',  date: '2024-12-15', amount: -156.80,  montant: -156.80,  bankDescription: 'PRELEVEMENT ABONNEMENT SaaS',           typeOperation: 'DEBIT',  categorie: 'Logiciels',        categorieParent: 'Dépenses', categorieTransaction: 'Logiciels',        statut: 'EN_ATTENTE', client: '',               fournisseur: '',           salarie: '',          factureList: [],               chargeAttacher: 0, label: 'Abonnement'     },
    { id: 'tr-9',  idTransaction: 'tr-9',  date: '2024-12-10', amount: 6800.00,  montant: 6800.00,  bankDescription: 'VIREMENT RETOUR CLIENT ABC',            typeOperation: 'CREDIT', categorie: 'Vente services',   categorieParent: 'Recettes', categorieTransaction: 'Vente services',   statut: 'VALIDER',    client: 'Client ABC',      fournisseur: '',           salarie: '',          factureList: [],               chargeAttacher: 0, label: 'Retour client'  },
    { id: 'tr-10', idTransaction: 'tr-10', date: '2024-12-05', amount: -890.00,  montant: -890.00,  bankDescription: 'FRAIS BANCAIRES ET COMMISSIONS',        typeOperation: 'DEBIT',  categorie: 'Frais bancaires',  categorieParent: 'Charges',  categorieTransaction: 'Frais bancaires',  statut: 'VALIDER',    client: '',               fournisseur: '',           salarie: '',          factureList: [],               chargeAttacher: 0, label: 'Frais'          },
    { id: 'tr-11', idTransaction: 'tr-11', date: '2024-12-02', amount: 3100.00,  montant: 3100.00,  bankDescription: 'VIREMENT RECU TECH PARTNERS',           typeOperation: 'CREDIT', categorie: 'Vente services',   categorieParent: 'Recettes', categorieTransaction: 'Vente services',   statut: 'RAPPROCHER', client: 'Tech Partners',   fournisseur: '',           salarie: '',          factureList: [],               chargeAttacher: 0, label: 'Paiement'       },
    { id: 'tr-12', idTransaction: 'tr-12', date: '2024-11-28', amount: -450.00,  montant: -450.00,  bankDescription: 'VIREMENT COTISATIONS SOCIALES',         typeOperation: 'DEBIT',  categorie: 'Charges sociales', categorieParent: 'Charges',  categorieTransaction: 'Charges sociales', statut: 'VALIDER',    client: '',               fournisseur: '',           salarie: '',          factureList: [],               chargeAttacher: 1, label: 'Cotisations'    },
];
const mockReleves: Releve[] = [
    { id: 'rl-1', nom: 'Releve_BNP_Janvier_2025.pdf',    banque: 'BNP Paribas',       reference: 'BNP-01-2025',  canal: 'whatsapp', date: '2025-01-31', taille: '245 KB', periode: '01/2025', statut: 'VALIDER'    },
    { id: 'rl-2', nom: 'Releve_BNP_Decembre_2024.pdf',   banque: 'BNP Paribas',       reference: 'BNP-12-2024',  canal: 'whatsapp', date: '2024-12-31', taille: '312 KB', periode: '12/2024', statut: 'VALIDER'    },
    { id: 'rl-3', nom: 'Releve_BNP_Novembre_2024.pdf',   banque: 'BNP Paribas',       reference: 'BNP-11-2024',  canal: 'whatsapp', date: '2024-11-30', taille: '198 KB', periode: '11/2024', statut: 'VALIDER'    },
    { id: 'rl-4', nom: 'Releve_SG_Janvier_2025.pdf',     banque: 'Société Générale',  reference: 'SG-01-2025',   canal: 'gmail',    date: '2025-01-31', taille: '276 KB', periode: '01/2025', statut: 'VALIDER'    },
    { id: 'rl-5', nom: 'Releve_SG_Decembre_2024.pdf',    banque: 'Société Générale',  reference: 'SG-12-2024',   canal: 'gmail',    date: '2024-12-31', taille: '221 KB', periode: '12/2024', statut: 'VALIDER'    },
    { id: 'rl-6', nom: 'Releve_CIC_Novembre_2024.pdf',   banque: 'CIC',               reference: 'CIC-11-2024',  canal: 'gmail',    date: '2024-11-30', taille: '189 KB', periode: '11/2024', statut: 'EN_ATTENTE' },
    { id: 'rl-7', nom: 'Releve_BNP_Octobre_2024.pdf',    banque: 'BNP Paribas',       reference: 'BNP-10-2024',  canal: 'manuel',   date: '2024-10-31', taille: '303 KB', periode: '10/2024', statut: 'VALIDER'    },
    { id: 'rl-8', nom: 'Releve_SG_Octobre_2024.pdf',     banque: 'Société Générale',  reference: 'SG-10-2024',   canal: 'manuel',   date: '2024-10-31', taille: '258 KB', periode: '10/2024', statut: 'ERREUR'     },
];
const mockSessions: ChatSession[] = [
    { id: 'sess-1', accountId: 'acc-1', label: 'BNP Paribas',       preview: 'Analyse janvier 2025',   time: '10:24' },
    { id: 'sess-2', accountId: 'acc-2', label: 'Société Générale',  preview: 'Analyse décembre 2024',  time: '09:15' },
];
const SOFIA_MSGS: Record<string, string[]> = {
    'acc-1': ["J'ai analysé votre compte BNP Paribas. 12 transactions détectées — 5 crédits (+23 750 €) et 7 débits (-11 296,80 €).", "3 transactions sont en attente de rapprochement. Je recommande de traiter en priorité le virement de 8 500 € d'Enterprise Corp."],
    'acc-2': ["Votre compte Société Générale présente un solde de 12 300 €. 4 transactions récentes à valider.", "Aucune anomalie détectée. Le solde est cohérent avec les flux de la période."],
};

const mockPriorities: PriorityItem[] = [
    { id: 'p1', title: 'Rapprocher virement Fournisseur XYZ', description: "Débit de 3 600 € sans facture correspondante depuis 3 jours. Rapprochement manuel obligatoire.", urgency: 'haute', actionType: 'rapprochement', ref: 'tr-2', deadline: '2025-01-20', montant: 3600 },
    { id: 'p2', title: 'Corriger relevé SG-10-2024', description: "Relevé Société Générale d'octobre 2024 en erreur d'import. Fichier PDF potentiellement corrompu.", urgency: 'haute', actionType: 'correction', ref: 'rl-8', deadline: '2025-01-18' },
    { id: 'p3', title: 'Valider rapprochement Enterprise Corp', description: "Crédit de 8 500 € rapproché automatiquement avec FACT-2025-002. Validation humaine requise.", urgency: 'moyenne', actionType: 'validation', ref: 'tr-4', deadline: '2025-01-22', montant: 8500 },
    { id: 'p4', title: 'Traiter relevé CIC en attente', description: "Relevé CIC-11-2024 importé mais non validé. Vérification manuelle des transactions requise.", urgency: 'moyenne', actionType: 'validation', ref: 'rl-6', deadline: '2025-01-25' },
    { id: 'p5', title: 'Associer facture abonnement SaaS', description: "Prélèvement de 156,80 € sans pièce justificative. Facture fournisseur à attacher manuellement.", urgency: 'basse', actionType: 'relance', ref: 'tr-8', deadline: '2025-01-30', montant: 156.80 },
];
const mockAlerts: AgentAlert[] = [
    { id: 'a1', type: 'error',   title: 'Relevé SG corrompu',               message: "SG-10-2024 (Société Générale) — fichier PDF illisible. Extraction des transactions impossible.", time: '09:45', ref: 'rl-8'  },
    { id: 'a2', type: 'error',   title: 'Virement sans facture associée',   message: "tr-2 (Fournisseur XYZ -3 600 €) — aucune facture correspondante dans le système.",              time: '09:12', ref: 'tr-2'  },
    { id: 'a3', type: 'warning', title: 'Abonnement non justifié',           message: "tr-8 (Prélèvement SaaS -156,80 €) — pas de pièce jointe associée. Catégorie incertaine.",      time: '08:50', ref: 'tr-8'  },
    { id: 'a4', type: 'warning', title: '3 transactions en attente +5j',    message: "tr-1, tr-4 et tr-11 non rapprochées depuis plus de 5 jours. Action recommandée.",                time: '08:30'              },
    { id: 'a5', type: 'success', title: 'Rapprochement automatique réussi', message: "tr-5 (Tech Solutions -2 340 €) — facture FAC-F2025-045 rapprochée avec succès.",                time: '07:55', ref: 'tr-5'  },
    { id: 'a6', type: 'success', title: '5 relevés importés',               message: "BNP-01-2025, SG-01-2025, BNP-12-2024, SG-12-2024, BNP-11-2024 — import et validation auto.",    time: '07:30'              },
    { id: 'a7', type: 'info',    title: 'Nouveau compte CIC en attente',    message: "Compte CIC (acc-3) créé le 10/01/2023. Validation d'activation en attente depuis 2 ans.",       time: '07:10', ref: 'acc-3' },
    { id: 'a8', type: 'info',    title: 'Analyse Q1 2025 générée',          message: "Rapport de trésorerie Q1 2025 disponible. Solde consolidé: 46 550 €. Taux recouvrement: 89%.",  time: '06:45'              },
];
const mockTimeline: TimelineEvent[] = [
    { id: 't1', time: '09:45', type: 'error',   title: 'PDF corrompu',           description: 'SG-10-2024 illisible — import échoué.'     },
    { id: 't2', time: '09:12', type: 'error',   title: 'Facture manquante',      description: 'tr-2 Fournisseur XYZ sans facture associée.' },
    { id: 't3', time: '08:50', type: 'warning', title: 'Abonnement SaaS',        description: 'Prélèvement 156,80 € non justifié.'         },
    { id: 't4', time: '08:30', type: 'warning', title: '3 tx en attente',        description: 'Plus de 5 jours sans rapprochement.'        },
    { id: 't5', time: '07:55', type: 'success', title: 'Rapprochement auto',     description: 'tr-5 Tech Solutions — FAC-F2025-045.'       },
    { id: 't6', time: '07:30', type: 'success', title: '5 relevés importés',     description: 'Import et validation automatiques réussis.' },
    { id: 't7', time: '07:10', type: 'action',  title: 'Scan boîte mail',        description: '2 relevés détectés par Gmail.'               },
    { id: 't8', time: '06:45', type: 'action',  title: 'Rapport Q1 généré',      description: 'Analyse trésorerie consolidée.'              },
];
const mockActivity: TodayActivity[] = [
    { id: 'act1', action: 'reconciled', entityType: 'transaction', nom: 'tr-5 — Tech Solutions',       time: '07:55', montant: 2340  },
    { id: 'act2', action: 'imported',   entityType: 'releve',      nom: 'BNP-01-2025 — BNP Paribas',   time: '07:30'                },
    { id: 'act3', action: 'rejected',   entityType: 'releve',      nom: 'SG-10-2024 — SG (corrompu)',   time: '09:45'                },
    { id: 'act4', action: 'validated',  entityType: 'transaction', nom: 'tr-3 — Salaire Jean Dupont',   time: '07:00', montant: 2850 },
    { id: 'act5', action: 'imported',   entityType: 'releve',      nom: 'SG-01-2025 — Société Générale',time: '07:30'                },
];
const mockKpis: KpiCard[] = [
    { label: 'Transactions',   value: 12,          sub: 'total période',     color: '#0d9394', icon: '⇄'  },
    { label: 'Crédits',        value: '+23 750 €',  sub: '5 virements reçus', color: '#22c55e', icon: '↑'  },
    { label: 'Débits',         value: '-11 297 €',  sub: '7 prélèvements',    color: '#ef4444', icon: '↓'  },
    { label: 'Solde consolidé',value: '46 550 €',   sub: '3 comptes',         color: '#2563eb', icon: '€'  },
    { label: 'En attente',     value: 3,            sub: 'à rapprocher',      color: '#f59e0b', icon: '⏳' },
    { label: 'Relevés',        value: 8,            sub: '1 erreur active',   color: '#8b5cf6', icon: '📄' },
];

// ── Constants & helpers ────────────────────────────────────────────────────────
const URGENCY_META: Record<string, { color: string; bg: string; label: string }> = {
    haute:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Haute'   },
    moyenne: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Moyenne' },
    basse:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: 'Basse'   },
};
const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
    validation:     { label: 'Valider',      color: '#22c55e', icon: '✓' },
    correction:     { label: 'Corriger',     color: '#ef4444', icon: '✎' },
    rapprochement:  { label: 'Rapprocher',   color: '#0d9394', icon: '⇌' },
    relance:        { label: 'Associer',     color: '#8b5cf6', icon: '🔗' },
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
    reconciled: { color: '#0d9394', label: 'Rapproché', icon: '⇌' },
    imported:   { color: '#22c55e', label: 'Importé',   icon: '+' },
    rejected:   { color: '#ef4444', label: 'Rejeté',    icon: '✕' },
    validated:  { color: '#2563eb', label: 'Validé',    icon: '✓' },
};
const statusMeta: Record<string, { color: string; bg: string; label: string }> = {
    RAPPROCHER:  { color: '#0d9394',       bg: 'rgba(13,147,148,0.1)',  label: 'Rapproché'  },
    VALIDER:     { color: '#22c55e',       bg: 'rgba(34,197,94,0.1)',   label: 'Validé'     },
    EN_ATTENTE:  { color: '#f59e0b',       bg: 'rgba(245,158,11,0.1)', label: 'En attente' },
    ERREUR:      { color: '#ef4444',       bg: 'rgba(239,68,68,0.1)',   label: 'Erreur'     },
};
const glass = (accent = 'var(--border)'): React.CSSProperties => ({ background: 'var(--bg2)', border: `1px solid ${accent}`, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' });
const fmtAmt = (n: number) => `${Math.abs(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;

const CSS = `
@keyframes bk-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes bk-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes bk-slide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@keyframes bk-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.95)}}
@keyframes bk-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes bk-ping{75%,100%{transform:scale(1.8);opacity:0}}
@keyframes bk-dot1{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes bk-dot2{0%,20%,100%{transform:scale(0)}60%{transform:scale(1)}}
@keyframes bk-dot3{0%,40%,100%{transform:scale(0)}80%{transform:scale(1)}}
.bk-ping{animation:bk-ping 1.2s cubic-bezier(0,0,0.2,1) infinite}
`;

// ── Alertes View ───────────────────────────────────────────────────────────────
const AlertesView: React.FC<{ priorities: PriorityItem[]; alerts: AgentAlert[] }> = ({ priorities, alerts }) => {
    const urgentCount = priorities.filter(p => p.urgency === 'haute').length;
    const errorCount  = alerts.filter(a => a.type === 'error').length;
    return (
        <div style={{ display: 'flex', gap: 20, padding: 24, height: '100%', overflow: 'hidden', animation: 'bk-fadein 0.3s ease' }}>

            {/* Priorities */}
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
                            <span className="bk-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ef4444', opacity: 0.35 }} />
                            <span style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '0.62rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{urgentCount}</span>
                        </span>
                    )}
                </div>
                <div style={{ height: 1, background: 'linear-gradient(90deg,#ef444445,transparent)', marginBottom: 4 }} />

                {priorities.map(p => {
                    const u = URGENCY_META[p.urgency];
                    const a = ACTION_META[p.actionType];
                    return (
                        <div key={p.id} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: 'var(--bg)', border: `1px solid ${u.color}28`, boxShadow: `0 2px 16px ${u.color}10`, animation: 'bk-slide 0.3s ease' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: `linear-gradient(180deg,${u.color},${u.color}77)` }} />
                            <div style={{ padding: '12px 14px 12px 18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: u.bg, color: u.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{u.label}</span>
                                    <span style={{ fontSize: '0.58rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${a.color}15`, color: a.color }}>{a.icon} {a.label}</span>
                                    {p.montant != null && (
                                        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)', background: 'var(--bg2)', padding: '2px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>
                                            {fmtAmt(p.montant)}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 5, lineHeight: 1.3 }}>{p.title}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 }}>{p.description}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '0.58rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(13,147,148,0.1)', color: '#0d9394', border: '1px solid rgba(13,147,148,0.2)' }}>🏦 {p.ref}</span>
                                    <span style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>📅 {new Date(p.deadline).toLocaleDateString('fr-FR')}</span>
                                    <button style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.63rem', fontWeight: 700, color: 'white', background: `linear-gradient(135deg,${a.color},${a.color}bb)`, boxShadow: `0 2px 8px ${a.color}40` }}>
                                        {a.label}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, flexShrink: 0, background: 'linear-gradient(180deg,transparent,var(--border) 20%,var(--border) 80%,transparent)', margin: '8px 0' }} />

            {/* Alert log */}
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
                                    <div key={al.id} style={{ borderRadius: 12, overflow: 'hidden', background: m.bg, border: `1px solid ${m.border}`, animation: 'bk-fadein 0.3s ease' }}>
                                        <div style={{ background: m.grad, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ color: 'white', fontSize: '0.58rem', fontWeight: 800 }}>{m.icon}</span>
                                            </div>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'white', flex: 1 }}>{al.title}</span>
                                            <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.15)', padding: '1px 6px', borderRadius: 6 }}>{al.time}</span>
                                        </div>
                                        <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                                            <span style={{ flex: 1, fontSize: '0.7rem', color: 'var(--text)', lineHeight: 1.5 }}>{al.message}</span>
                                            {al.ref && <span style={{ flexShrink: 0, fontSize: '0.56rem', fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: 'var(--bg)', color: m.color, border: `1px solid ${m.border}` }}>{al.ref}</span>}
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

// ── Vue Agent View ─────────────────────────────────────────────────────────────
const VueAgentView: React.FC<{ kpis: KpiCard[]; timeline: TimelineEvent[]; activities: TodayActivity[] }> = ({ kpis, timeline, activities }) => {
    const [chatOpen, setChatOpen]   = useState(true);
    const [chatInput, setChatInput] = useState('');
    const [selectedSession, setSelectedSession] = useState(mockSessions[0]);
    const [selectedAccount, setSelectedAccount] = useState(mockAccounts[0]);
    const [typing, setTyping]       = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [msgIndex, setMsgIndex]   = useState(0);
    const [isSofiaThinking, setIsSofiaThinking] = useState(true);
    const [chatMsgs, setChatMsgs]   = useState<ChatMsg[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const currentMsg = SOFIA_MSGS[selectedAccount.id]?.[msgIndex] || '';

    useEffect(() => {
        setIsSofiaThinking(true); setDisplayedText(''); setMsgIndex(0);
        const t = setTimeout(() => setIsSofiaThinking(false), 1000);
        return () => clearTimeout(t);
    }, [selectedAccount.id]);

    useEffect(() => {
        if (!isSofiaThinking && displayedText.length < currentMsg.length) {
            const t = setTimeout(() => setDisplayedText(currentMsg.slice(0, displayedText.length + 3)), 14);
            return () => clearTimeout(t);
        }
        if (!isSofiaThinking && displayedText === currentMsg && currentMsg.length > 0 && msgIndex < (SOFIA_MSGS[selectedAccount.id]?.length || 1) - 1) {
            const t = setTimeout(() => { setDisplayedText(''); setMsgIndex(i => i + 1); }, 800);
            return () => clearTimeout(t);
        }
    }, [isSofiaThinking, displayedText, currentMsg, msgIndex, selectedAccount.id]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs, displayedText]);

    const sendMsg = () => {
        if (!chatInput.trim()) return;
        const t = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setChatMsgs(prev => [...prev, { id: Date.now().toString(), from: 'user', text: chatInput.trim(), time: t }]);
        setChatInput('');
        setTyping(true);
        setTimeout(() => {
            setChatMsgs(prev => [...prev, { id: Date.now().toString(), from: 'sofia', text: "Je prends note de votre demande et j'analyse les transactions correspondantes.", time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
            setTyping(false);
        }, 1000);
    };

    const handleSessionSelect = (sess: ChatSession) => {
        const acc = mockAccounts.find(a => a.id === sess.accountId) || mockAccounts[0];
        setSelectedSession(sess); setSelectedAccount(acc); setChatMsgs([]);
    };

    const totalCredit = mockTransactions.filter(t => t.typeOperation === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalDebit  = mockTransactions.filter(t => t.typeOperation === 'DEBIT').reduce((s, t) => s + Math.abs(t.amount), 0);
    const reconciled  = mockTransactions.filter(t => t.statut === 'RAPPROCHER').length;
    const pending     = mockTransactions.filter(t => t.statut === 'EN_ATTENTE').length;

    return (
        <div style={{ padding: 24, overflowY: 'auto', height: '100%', animation: 'bk-fadein 0.3s ease' }}>

            {/* KPI bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {kpis.map((k, i) => (
                    <div key={i} style={{ flex: '1 1 130px', ...glass(`${k.color}30`), padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: 10, top: 10, fontSize: 18, opacity: 0.14 }}>{k.icon}</div>
                        <span style={{ fontSize: '0.63rem', color: 'var(--text2)', fontWeight: 500 }}>{k.label}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</span>
                        <span style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>{k.sub}</span>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${k.color},${k.color}44)` }} />
                    </div>
                ))}
            </div>

            {/* 3-column grid */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                {/* Col 1: Timeline */}
                <div style={{ width: 230, flexShrink: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9394', display: 'inline-block' }} />
                        Timeline agent
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg,var(--border),transparent)' }} />
                        {timeline.map((ev, i) => {
                            const m = TL_META[ev.type];
                            return (
                                <div key={ev.id} style={{ display: 'flex', gap: 10, marginBottom: 14, animation: `bk-slide 0.3s ease ${i * 0.05}s both` }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.bg, border: `2px solid ${m.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                                        <span style={{ fontSize: '0.48rem', color: m.color, fontWeight: 800 }}>{ev.type === 'error' ? '✕' : ev.type === 'warning' ? '!' : ev.type === 'success' ? '✓' : '⟳'}</span>
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

                {/* Col 2: Activity + stats */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Today's activity */}
                    <div style={glass('rgba(13,147,148,0.2)')}>
                        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)' }}>Activité du jour</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: 'rgba(13,147,148,0.1)', color: '#0d9394' }}>{activities.length}</span>
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
                                            <div style={{ fontSize: '0.55rem', color: 'var(--text3)' }}>{act.entityType} · {act.time}</div>
                                        </div>
                                        {act.montant != null && <span style={{ fontSize: '0.62rem', fontWeight: 700, color: am.color }}>{fmtAmt(act.montant)}</span>}
                                        <span style={{ fontSize: '0.55rem', padding: '1px 6px', borderRadius: 6, background: `${am.color}15`, color: am.color, fontWeight: 600 }}>{am.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        {[
                            { label: 'Rapprochés', val: reconciled, total: mockTransactions.length, color: '#0d9394' },
                            { label: 'En attente',  val: pending,    total: mockTransactions.length, color: '#f59e0b' },
                            { label: 'Validés',     val: mockTransactions.filter(t => t.statut === 'VALIDER').length, total: mockTransactions.length, color: '#22c55e' },
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

                    {/* Balance card */}
                    <div style={{ ...glass('rgba(37,99,235,0.2)'), padding: '12px 14px', display: 'flex', gap: 16 }}>
                        {[
                            { label: 'Crédits totaux',  val: totalCredit, color: '#22c55e', sign: '+' },
                            { label: 'Débits totaux',   val: totalDebit,  color: '#ef4444', sign: '-' },
                            { label: 'Solde consolidé', val: mockAccounts.reduce((s, a) => s + a.solde, 0), color: '#2563eb', sign: '' },
                        ].map((b, i) => (
                            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text2)', marginBottom: 4 }}>{b.label}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: b.color }}>{b.sign}{fmtAmt(b.val)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Col 3: Account selector + Sofia chat */}
                <div style={{ width: 270, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Account switcher */}
                    <div style={glass('rgba(13,147,148,0.2)')}>
                        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comptes</div>
                        {mockSessions.map(sess => {
                            const acc = mockAccounts.find(a => a.id === sess.accountId)!;
                            const active = selectedSession.id === sess.id;
                            return (
                                <div key={sess.id} onClick={() => handleSessionSelect(sess)} style={{ padding: '8px 12px', cursor: 'pointer', background: active ? 'rgba(13,147,148,0.1)' : 'transparent', borderLeft: active ? '3px solid #0d9394' : '3px solid transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: 7, background: active ? '#0d9394' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icons.Landmark style={{ width: 12, height: 12, color: active ? 'white' : 'var(--text2)' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: active ? '#0d9394' : 'var(--text)' }}>{acc.banque}</div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#22c55e' }}>{acc.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sofia mini chat */}
                    <div style={{ ...glass('rgba(13,147,148,0.2)'), display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div onClick={() => setChatOpen(v => !v)} style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: chatOpen ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: 'white', fontWeight: 800, fontSize: '0.65rem' }}>S</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)' }}>Sofia — {selectedAccount.banque}</div>
                                <div style={{ fontSize: '0.55rem', color: '#22c55e' }}>● En ligne</div>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text3)', transform: chatOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌄</span>
                        </div>
                        {chatOpen && (
                            <>
                                <div style={{ maxHeight: 220, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {/* Sofia typewriter */}
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <div style={{ maxWidth: '85%', padding: '7px 10px', borderRadius: '10px 10px 10px 2px', background: 'var(--bg)', fontSize: '0.65rem', lineHeight: 1.5, color: 'var(--text)', border: '1px solid var(--border)' }}>
                                            {isSofiaThinking
                                                ? <div style={{ display: 'flex', gap: 4 }}>{[1, 2, 3].map(n => <span key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9394', display: 'inline-block', animation: `bk-dot${n} 1.2s infinite ease-in-out` }} />)}</div>
                                                : <>{displayedText}{displayedText.length < currentMsg.length && <span style={{ display: 'inline-block', width: 2, height: '1em', background: '#0d9394', marginLeft: 1, animation: 'bk-blink 1s infinite' }} />}</>
                                            }
                                        </div>
                                    </div>
                                    {chatMsgs.map(msg => (
                                        <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                                            <div style={{ maxWidth: '85%', padding: '7px 10px', borderRadius: msg.from === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: msg.from === 'user' ? '#0d9394' : 'var(--bg)', color: msg.from === 'user' ? 'white' : 'var(--text)', fontSize: '0.65rem', lineHeight: 1.5 }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {typing && <div style={{ display: 'flex', gap: 4, padding: '4px 2px' }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#0d9394', animation: `bk-pulse 1.2s ease ${i * 0.2}s infinite` }} />)}</div>}
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
        </div>
    );
};

// ── Details View (existing 3-tab panel) ───────────────────────────────────────
interface DetailsViewProps { setSelectedTx: (tx: UiTransaction) => void; setDetailsOpen: (v: boolean) => void; }
const DetailsView: React.FC<DetailsViewProps> = ({ setSelectedTx, setDetailsOpen }) => {
    const [searchQ, setSearchQ]           = useState('');
    const [typeFilter, setTypeFilter]     = useState<'CREDIT' | 'DEBIT' | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [page, setPage]                 = useState(0);
    const [rightTab, setRightTab]         = useState<'transactions' | 'releves' | 'comptes'>('transactions');
    const [relevePage, setRelevePage]     = useState(0);
    const [comptes, setComptes]           = useState<Account[]>(mockAccounts);
    const rowsPerPage   = 8;
    const relevesPerPage = 6;

    const filtered = mockTransactions
        .filter(t => t.bankDescription.toLowerCase().includes(searchQ.toLowerCase()) || t.client.toLowerCase().includes(searchQ.toLowerCase()) || t.fournisseur.toLowerCase().includes(searchQ.toLowerCase()) || t.categorie.toLowerCase().includes(searchQ.toLowerCase()))
        .filter(t => typeFilter ? t.typeOperation === typeFilter : true)
        .filter(t => statusFilter ? t.statut === statusFilter : true);

    const paginated  = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const totalCredit = mockTransactions.filter(t => t.typeOperation === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalDebit  = mockTransactions.filter(t => t.typeOperation === 'DEBIT').reduce((s, t) => s + Math.abs(t.amount), 0);
    const selectedAccount = mockAccounts[0];

    const canalM: Record<string, { color: string; bg: string; label: string }> = { whatsapp: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'WhatsApp' }, gmail: { color: '#ea4335', bg: 'rgba(234,67,53,0.1)', label: 'Gmail' }, manuel: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Manuel' } };
    const statM:  Record<string, { color: string; bg: string; label: string }> = { VALIDER: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Validé' }, EN_ATTENTE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'En attente' }, ERREUR: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Erreur' } };
    const smC:    Record<string, { color: string; bg: string; label: string }> = { ACTIF: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Actif' }, INACTIF: { color: 'var(--text2)', bg: 'var(--bg2)', label: 'Inactif' }, EN_ATTENTE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'En attente' } };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'bk-fadein 0.3s ease' }}>
            {/* Tab switcher */}
            <div style={{ height: 44, padding: '0 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {([['transactions', 'Transactions', mockTransactions.length], ['releves', 'Relevés', mockReleves.length], ['comptes', 'Comptes', comptes.length]] as const).map(([key, label, count]) => (
                    <button key={key} onClick={() => setRightTab(key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: '100%', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, background: 'transparent', color: rightTab === key ? '#0d9394' : 'var(--text2)', borderBottom: rightTab === key ? '2px solid #0d9394' : '2px solid transparent', transition: 'color 0.15s' }}>
                        {label}
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 8, fontWeight: 700, background: rightTab === key ? '#0d9394' : 'var(--border)', color: rightTab === key ? 'white' : 'var(--text2)' }}>{count}</span>
                    </button>
                ))}
            </div>

            {/* TRANSACTIONS TAB */}
            {rightTab === 'transactions' && <>
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', gap: 10, flexShrink: 0 }}>
                    {[
                        { icon: <Icons.TrendingUp style={{ width: 13, height: 13 }} />,   label: 'Crédits',    value: `+${totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
                        { icon: <Icons.TrendingDown style={{ width: 13, height: 13 }} />, label: 'Débits',     value: `-${totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
                        { icon: <Icons.DollarSign style={{ width: 13, height: 13 }} />,   label: 'Solde',      value: `${selectedAccount.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, color: '#0d9394', bg: 'rgba(13,147,148,0.1)' },
                        { icon: <Icons.Clock style={{ width: 13, height: 13 }} />,        label: 'En attente', value: `${mockTransactions.filter(t => t.statut === 'EN_ATTENTE').length} tx`,     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                    ].map((stat, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: stat.bg, borderRadius: 8, padding: '6px 10px', flex: 1 }}>
                            <span style={{ color: stat.color }}>{stat.icon}</span>
                            <div>
                                <div style={{ fontSize: '0.58rem', color: 'var(--text3)', fontWeight: 500 }}>{stat.label}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', flex: '0 0 200px' }}>
                        <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
                        <input type="text" value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(0); }} placeholder="Rechercher..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.75rem', color: 'var(--text)', width: '100%' }} />
                    </div>
                    <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                    {([['CREDIT', '#22c55e', 'rgba(34,197,94,0.1)', '+ Crédits'], ['DEBIT', '#ef4444', 'rgba(239,68,68,0.1)', '- Débits']] as const).map(([type, color, bg, label]) => (
                        <button key={type} onClick={() => { setTypeFilter(typeFilter === type ? null : type); setPage(0); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, border: typeFilter === type ? `1.5px solid ${color}` : '1.5px solid transparent', background: typeFilter === type ? bg : 'var(--bg)', color: typeFilter === type ? color : 'var(--text2)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />{label}
                        </button>
                    ))}
                    <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                    {Object.entries(statusMeta).map(([id, meta]) => (
                        <button key={id} onClick={() => { setStatusFilter(statusFilter === id ? null : id); setPage(0); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 7, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 500, border: statusFilter === id ? `1.5px solid ${meta.color}` : '1.5px solid transparent', background: statusFilter === id ? meta.bg : 'var(--bg)', color: statusFilter === id ? meta.color : 'var(--text2)' }}>
                            {meta.label}
                        </button>
                    ))}
                    {(typeFilter || statusFilter || searchQ) && (
                        <button onClick={() => { setTypeFilter(null); setStatusFilter(null); setSearchQ(''); setPage(0); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.72rem' }}>
                            <Icons.X style={{ width: 11, height: 11 }} /> Réinitialiser
                        </button>
                    )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                            <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                                {['Date', 'Libellé', 'Client / Fournisseur', 'Montant', 'Type', 'Catégorie', 'Statut', ''].map(h => (
                                    <th key={h} style={{ padding: '9px 12px', textAlign: h === '' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center' }}><Icons.Landmark style={{ width: 32, height: 32, color: 'var(--border)', margin: '0 auto 8px', display: 'block' }} /><span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Aucune transaction trouvée</span></td></tr>
                            ) : paginated.map(tx => {
                                const sm = statusMeta[tx.statut] || { color: 'var(--text2)', bg: 'var(--bg2)', label: tx.statut };
                                const isCredit = tx.typeOperation === 'CREDIT';
                                const name = tx.client || tx.fournisseur || tx.salarie;
                                const isClient = !!tx.client; const isFourn = !!tx.fournisseur;
                                return (
                                    <tr key={tx.id} onClick={() => { setSelectedTx(tx); setDetailsOpen(true); }} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                        <td style={{ padding: '9px 12px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</td>
                                        <td style={{ padding: '9px 12px', maxWidth: 200 }}><div style={{ fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.bankDescription}</div></td>
                                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                                            {!name ? <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>—</span> : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{name}</span>
                                                    <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 3, alignSelf: 'flex-start', background: isClient ? 'rgba(37,99,235,0.1)' : isFourn ? 'rgba(139,92,246,0.1)' : 'rgba(107,114,128,0.1)', color: isClient ? '#2563eb' : isFourn ? '#8b5cf6' : 'var(--text2)', fontWeight: 600 }}>{isClient ? 'Client' : isFourn ? 'Fournisseur' : 'Salarié'}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}><span style={{ fontWeight: 700, fontSize: '0.82rem', color: isCredit ? '#22c55e' : '#ef4444' }}>{isCredit ? '+' : ''}{tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span></td>
                                        <td style={{ padding: '9px 12px' }}><span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: isCredit ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: isCredit ? '#22c55e' : '#ef4444' }}>{tx.typeOperation}</span></td>
                                        <td style={{ padding: '9px 12px' }}><div style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{tx.categorieParent}</div><div style={{ fontSize: '0.67rem', color: 'var(--text3)' }}>{tx.categorie}</div></td>
                                        <td style={{ padding: '9px 12px' }}>
                                            <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: sm.bg, color: sm.color }}>{sm.label}</span>
                                            {tx.chargeAttacher > 0 && <span style={{ marginLeft: 4, padding: '2px 6px', borderRadius: 4, fontSize: '0.6rem', background: 'rgba(13,147,148,0.1)', color: '#0d9394', fontWeight: 600 }}>{tx.chargeAttacher} pj</span>}
                                        </td>
                                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                                            <button onClick={e => { e.stopPropagation(); setSelectedTx(tx); setDetailsOpen(true); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(13,147,148,0.1)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}>
                                                <Icons.Eye style={{ width: 13, height: 13, color: 'var(--text2)' }} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length > rowsPerPage && (
                    <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} sur {filtered.length}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[{ lbl: <Icons.ChevronLeft style={{ width: 13, height: 13 }} />, fn: () => setPage(0), dis: page === 0 }, { lbl: <Icons.ChevronLeft style={{ width: 13, height: 13 }} />, fn: () => setPage(p => p - 1), dis: page === 0 }, ...Array.from({ length: totalPages }, (_, i) => ({ lbl: <span style={{ fontSize: '0.72rem' }}>{i + 1}</span>, fn: () => setPage(i), dis: false, act: page === i })), { lbl: <Icons.ChevronRight style={{ width: 13, height: 13 }} />, fn: () => setPage(p => p + 1), dis: page >= totalPages - 1 }, { lbl: <Icons.ChevronRight style={{ width: 13, height: 13 }} />, fn: () => setPage(totalPages - 1), dis: page >= totalPages - 1 }].map((b, i) => (
                                <button key={i} onClick={b.dis ? undefined : b.fn} disabled={b.dis} style={{ width: 26, height: 26, borderRadius: 6, border: (b as any).act ? 'none' : '1px solid var(--border)', background: (b as any).act ? '#0d9394' : 'var(--bg)', color: (b as any).act ? 'white' : 'var(--text)', cursor: b.dis ? 'not-allowed' : 'pointer', opacity: b.dis ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{b.lbl}</button>
                            ))}
                        </div>
                    </div>
                )}
            </>}

            {/* RELEVÉS TAB */}
            {rightTab === 'releves' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text2)', fontWeight: 500 }}>{mockReleves.length} relevés importés</span>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1.5px solid #0d9394', background: 'rgba(13,147,148,0.1)', color: '#0d9394', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                            <Icons.Plus style={{ width: 13, height: 13 }} /> Importer un relevé
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                                    {['Banque', 'Nom du fichier', 'Référence', 'Canal', 'Période', 'Taille', 'Date import', 'Statut', ''].map(h => (
                                        <th key={h} style={{ padding: '9px 12px', textAlign: h === '' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {mockReleves.slice(relevePage * relevesPerPage, (relevePage + 1) * relevesPerPage).map((rl, i, arr) => {
                                    const cm = canalM[rl.canal];
                                    const sm2 = statM[rl.statut] || statM.EN_ATTENTE;
                                    return (
                                        <tr key={rl.id} style={{ borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                            <td style={{ padding: '9px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                    <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Icons.Landmark style={{ width: 12, height: 12, color: '#0d9394' }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{rl.banque}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '9px 12px', maxWidth: 200 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ width: 26, height: 30, borderRadius: 4, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, gap: 1 }}>
                                                        <Icons.FileText style={{ width: 11, height: 11, color: '#ef4444' }} />
                                                        <span style={{ fontSize: '0.42rem', color: '#ef4444', fontWeight: 800 }}>PDF</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{rl.nom}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '9px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)', fontFamily: 'monospace' }}>{rl.reference}</span></td>
                                            <td style={{ padding: '9px 12px' }}><span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: cm.bg, color: cm.color }}>{cm.label}</span></td>
                                            <td style={{ padding: '9px 12px' }}><span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{rl.periode}</span></td>
                                            <td style={{ padding: '9px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{rl.taille}</span></td>
                                            <td style={{ padding: '9px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{new Date(rl.date).toLocaleDateString('fr-FR')}</span></td>
                                            <td style={{ padding: '9px 12px' }}><span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: sm2.bg, color: sm2.color }}>{sm2.label}</span></td>
                                            <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                                    <button style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(13,147,148,0.1)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}>
                                                        <Icons.Eye style={{ width: 12, height: 12, color: 'var(--text2)' }} />
                                                    </button>
                                                    <button style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(13,147,148,0.1)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}>
                                                        <Icons.Download style={{ width: 12, height: 12, color: 'var(--text2)' }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {mockReleves.length > relevesPerPage && (
                        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{relevePage * relevesPerPage + 1}–{Math.min((relevePage + 1) * relevesPerPage, mockReleves.length)} sur {mockReleves.length}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => setRelevePage(p => Math.max(0, p - 1))} disabled={relevePage === 0} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: relevePage === 0 ? 'not-allowed' : 'pointer', opacity: relevePage === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.ChevronLeft style={{ width: 13, height: 13 }} /></button>
                                <button onClick={() => setRelevePage(p => p + 1)} disabled={(relevePage + 1) * relevesPerPage >= mockReleves.length} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: (relevePage + 1) * relevesPerPage >= mockReleves.length ? 'not-allowed' : 'pointer', opacity: (relevePage + 1) * relevesPerPage >= mockReleves.length ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.ChevronRight style={{ width: 13, height: 13 }} /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* COMPTES TAB */}
            {rightTab === 'comptes' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text2)', fontWeight: 500 }}>{comptes.length} compte{comptes.length > 1 ? 's' : ''} bancaire{comptes.length > 1 ? 's' : ''}</span>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1.5px solid #0d9394', background: 'rgba(13,147,148,0.1)', color: '#0d9394', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                            <Icons.Plus style={{ width: 13, height: 13 }} /> Créer un compte
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                                <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                                    {['Banque', 'Titulaire', 'N° de compte / IBAN', 'Type', 'Solde', 'Statut', 'Créé le', ''].map(h => (
                                        <th key={h} style={{ padding: '9px 12px', textAlign: h === '' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {comptes.length === 0 ? (
                                    <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center' }}><Icons.Landmark style={{ width: 32, height: 32, color: 'var(--border)', margin: '0 auto 8px', display: 'block' }} /><span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Aucun compte bancaire</span></td></tr>
                                ) : comptes.map((acc, i) => {
                                    const sm3 = smC[acc.status] || smC.EN_ATTENTE;
                                    return (
                                        <tr key={acc.id} style={{ borderBottom: i === comptes.length - 1 ? 'none' : '1px solid var(--border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                            <td style={{ padding: '10px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Icons.Landmark style={{ width: 14, height: 14, color: '#0d9394' }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>{acc.banque}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{acc.titulaire}</span></td>
                                            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.68rem', color: 'var(--text2)', fontFamily: 'monospace', letterSpacing: '0.3px' }}>{acc.numeroCompte}</span></td>
                                            <td style={{ padding: '10px 12px' }}><span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(13,147,148,0.1)', color: '#0d9394' }}>{acc.type}</span></td>
                                            <td style={{ padding: '10px 12px' }}><span style={{ fontWeight: 700, fontSize: '0.82rem', color: acc.solde >= 0 ? '#22c55e' : '#ef4444' }}>{acc.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span></td>
                                            <td style={{ padding: '10px 12px' }}><span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: sm3.bg, color: sm3.color }}>{sm3.label}</span></td>
                                            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{new Date(acc.dateCreation).toLocaleDateString('fr-FR')}</span></td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                <button onClick={() => setComptes(prev => prev.filter(a => a.id !== acc.id))} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}>
                                                    <Icons.Trash style={{ width: 12, height: 12, color: '#ef4444' }} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const BankChatModal: React.FC<{ open: boolean; agent: any; agentId?: string; onClose: () => void; }> = ({ open, agent, onClose }) => {
    const [mainTab, setMainTab]         = useState<'alertes' | 'vue' | 'details'>('alertes');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedTx, setSelectedTx]   = useState<UiTransaction | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const urgentCount = mockPriorities.filter(p => p.urgency === 'haute').length;

    const NAV = [
        { key: 'alertes' as const, label: 'Alertes & Priorités', icon: '🔔', badge: urgentCount },
        { key: 'vue'     as const, label: 'Vue Agent',           icon: '⬡',  badge: null        },
        { key: 'details' as const, label: 'Référentiel',             icon: '☰',  badge: mockTransactions.length },
    ];

    if (!open) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{CSS}</style>

            {/* Header */}
            <div style={{ height: 52, flexShrink: 0, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, background: 'var(--bg)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(13,147,148,0.3)' }}>
                    <Icons.Landmark style={{ width: 16, height: 16, color: 'white' }} />
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Agent Banque</div>
                    <div style={{ fontSize: '0.6rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                        En ligne · 3 comptes · 12 transactions
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

                    {/* Toggle arrow button */}
                    <button
                        onClick={() => setSidebarOpen(v => !v)}
                        title={sidebarOpen ? 'Réduire' : 'Agrandir'}
                        style={{ margin: '10px auto', width: 34, height: 34, borderRadius: 9, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text2)', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(13,147,148,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}
                    >
                        {sidebarOpen
                            ? <Icons.ChevronLeft style={{ width: 15, height: 15 }} />
                            : <Icons.ChevronRight style={{ width: 15, height: 15 }} />
                        }
                    </button>

                    {/* Nav items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 8px' }}>
                        {NAV.map(tab => {
                            const active = mainTab === tab.key;
                            return (
                                <div key={tab.key} onClick={() => setMainTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sidebarOpen ? '10px 12px' : '10px', borderRadius: 10, cursor: 'pointer', background: active ? 'rgba(13,147,148,0.12)' : 'transparent', border: `1px solid ${active ? 'rgba(13,147,148,0.25)' : 'transparent'}`, transition: 'all 0.15s', position: 'relative', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(13,147,148,0.05)'; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
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
                                    <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg,#22c55e,#16a34a)', borderRadius: 4 }} />
                                </div>
                                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#22c55e' }}>75%</span>
                            </div>
                            <div style={{ fontSize: '0.58rem', color: 'var(--text3)' }}>3 tx en attente · 1 erreur</div>
                        </div>
                    )}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {mainTab === 'alertes' && <div style={{ flex: 1, overflowY: 'auto' }}><AlertesView priorities={mockPriorities} alerts={mockAlerts} /></div>}
                    {mainTab === 'vue'     && <div style={{ flex: 1, overflowY: 'auto' }}><VueAgentView kpis={mockKpis} timeline={mockTimeline} activities={mockActivity} /></div>}
                    {mainTab === 'details' && <DetailsView setSelectedTx={setSelectedTx} setDetailsOpen={setDetailsOpen} />}
                </div>
            </div>

            {detailsOpen && selectedTx && (
                <BankDetailsModal open={detailsOpen} transaction={selectedTx} onClose={() => { setDetailsOpen(false); setSelectedTx(null); }} />
            )}
        </div>
    );
};
