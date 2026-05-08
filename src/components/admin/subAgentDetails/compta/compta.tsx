"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as Icons from '../../../../assets/icons';
import { ComptaDetailsModal } from './comptaDetails';

// ── Existing interfaces ────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; timestamp: string; }
interface Conversation { id: string; title: string; timestamp: string; }
interface DeclarationTva { uuidDemandeTva: string; periode: string; status: string; dateCreation: string; }
interface JournalAchat { idJournalAchat: string; date: string; compte: string; libelle: string; debit: number; credit: number; idFacture: string; numFacture: string; categorie: string; sousCategorie: string; nameFournisseur: string; }
interface JournalVente { idJournalVente: string; date: string; compte: string; libelle: string; debit: number; credit: number; idFacture: string; numFacture: string; categorie: string; sousCategorie: string; nameClient: string; }
interface GrandLivre { id: string; compte: string; date: string; libelle: string; debit: number; credit: number; classe: number; rubrique: string; poste: string; numFacture: string; journal: string; solde: number; }
interface BilanItem { id: string; section: 'ACTIF' | 'PASSIF'; sousCategorie: string; categorie: string; montant: number; annee: string; }

// ── New interfaces ─────────────────────────────────────────────────────────────
interface PriorityItem { id: string; title: string; description: string; urgency: 'haute' | 'moyenne' | 'basse'; actionType: 'validation' | 'correction' | 'revision' | 'signature'; ref: string; deadline: string; montant: string; }
interface AgentAlert { id: string; type: 'error' | 'warning' | 'success' | 'info'; title: string; message: string; time: string; ref: string; }
interface TimelineEvent { id: string; type: string; label: string; desc: string; time: string; }
interface TodayActivity { id: string; action: 'validated' | 'imported' | 'created' | 'corrected' | 'rejected'; label: string; ref: string; user: string; time: string; }
interface KpiCard { id: string; label: string; value: string; sub: string; color: string; }

// ── Existing mock data ─────────────────────────────────────────────────────────
const mockDeclarationTva: DeclarationTva[] = [
    { uuidDemandeTva: 'b3787d29-2369-410c-a09c-d70b480ab231', periode: '01/2025', status: 'VALIDER', dateCreation: '2025-01-15' },
    { uuidDemandeTva: 'c4898e30-3470-521d-b10d-e81c591bc342', periode: '12/2024', status: 'VALIDER', dateCreation: '2024-12-20' },
    { uuidDemandeTva: 'd5909f41-4581-632e-c21e-f92d602cd453', periode: '11/2024', status: 'CREATED', dateCreation: '2024-11-18' },
    { uuidDemandeTva: 'e6010g52-5692-743f-d32f-g03e713de564', periode: '10/2024', status: 'EN_TRAITEMENT', dateCreation: '2024-10-25' },
    { uuidDemandeTva: 'f7121h63-6703-854g-e43g-h14f824ef675', periode: '09/2024', status: 'VALIDER', dateCreation: '2024-09-22' },
    { uuidDemandeTva: 'g8232i74-7814-965h-f54h-i25g935fg786', periode: '08/2024', status: 'ANNULER', dateCreation: '2024-08-30' },
    { uuidDemandeTva: 'h9343j85-8925-076i-g65i-j36h046gh897', periode: '07/2024', status: 'VALIDER', dateCreation: '2024-07-28' },
    { uuidDemandeTva: 'i0454k96-9036-187j-h76j-k47i157hi908', periode: '06/2024', status: 'VALIDER', dateCreation: '2024-06-25' },
    { uuidDemandeTva: 'j1565l07-0147-298k-i87k-l58j268ij019', periode: '05/2024', status: 'CREATED', dateCreation: '2024-05-20' },
    { uuidDemandeTva: 'k2676m18-1258-309l-j98l-m69k379jk120', periode: '04/2024', status: 'VALIDER', dateCreation: '2024-04-18' },
];
const mockJournalAchat: JournalAchat[] = [
    { idJournalAchat: 'JA-001', date: '2025-01-15', compte: '401000', libelle: 'Achat marchandises ABC', debit: 1200.00, credit: 0, idFacture: 'FA-001', numFacture: 'FACT-2025-001', categorie: 'Achats', sousCategorie: 'Marchandises', nameFournisseur: 'Fournisseur ABC' },
    { idJournalAchat: 'JA-002', date: '2025-01-14', compte: '401000', libelle: 'Achat fournitures bureau', debit: 350.50, credit: 0, idFacture: 'FA-002', numFacture: 'FACT-2025-002', categorie: 'Achats', sousCategorie: 'Fournitures', nameFournisseur: 'Office Depot' },
    { idJournalAchat: 'JA-003', date: '2025-01-13', compte: '401000', libelle: 'Prestation services IT', debit: 2500.00, credit: 0, idFacture: 'FA-003', numFacture: 'FACT-2025-003', categorie: 'Services', sousCategorie: 'Informatique', nameFournisseur: 'Tech Solutions' },
    { idJournalAchat: 'JA-004', date: '2025-01-12', compte: '401000', libelle: 'Avoir sur achat', debit: 0, credit: 150.00, idFacture: 'FA-004', numFacture: 'AVOIR-2025-001', categorie: 'Achats', sousCategorie: 'Marchandises', nameFournisseur: 'Fournisseur ABC' },
    { idJournalAchat: 'JA-005', date: '2025-01-11', compte: '401000', libelle: 'Achat materiel informatique', debit: 4200.00, credit: 0, idFacture: 'FA-005', numFacture: 'FACT-2025-004', categorie: 'Achats', sousCategorie: 'Equipements', nameFournisseur: 'Dell France' },
    { idJournalAchat: 'JA-006', date: '2025-01-10', compte: '401000', libelle: 'Location vehicule', debit: 890.00, credit: 0, idFacture: 'FA-006', numFacture: 'FACT-2025-005', categorie: 'Services', sousCategorie: 'Location', nameFournisseur: 'Hertz' },
    { idJournalAchat: 'JA-007', date: '2025-01-09', compte: '401000', libelle: 'Maintenance logiciel', debit: 1500.00, credit: 0, idFacture: 'FA-007', numFacture: 'FACT-2025-006', categorie: 'Services', sousCategorie: 'Maintenance', nameFournisseur: 'Microsoft' },
    { idJournalAchat: 'JA-008', date: '2025-01-08', compte: '401000', libelle: 'Achat consommables', debit: 275.30, credit: 0, idFacture: 'FA-008', numFacture: 'FACT-2025-007', categorie: 'Achats', sousCategorie: 'Consommables', nameFournisseur: 'Amazon Business' },
    { idJournalAchat: 'JA-009', date: '2025-01-07', compte: '401000', libelle: 'Frais transport', debit: 420.00, credit: 0, idFacture: 'FA-009', numFacture: 'FACT-2025-008', categorie: 'Services', sousCategorie: 'Transport', nameFournisseur: 'DHL Express' },
    { idJournalAchat: 'JA-010', date: '2025-01-06', compte: '401000', libelle: 'Achat matieres premieres', debit: 3800.00, credit: 0, idFacture: 'FA-010', numFacture: 'FACT-2025-009', categorie: 'Achats', sousCategorie: 'Matieres premieres', nameFournisseur: 'Fournisseur XYZ' },
];
const mockJournalVente: JournalVente[] = [
    { idJournalVente: 'JV-001', date: '2025-01-15', compte: '411000', libelle: 'Vente produits Client A', debit: 0, credit: 2400.00, idFacture: 'FV-001', numFacture: 'FV-2025-001', categorie: 'Ventes', sousCategorie: 'Produits', nameClient: 'Client ABC SARL' },
    { idJournalVente: 'JV-002', date: '2025-01-14', compte: '411000', libelle: 'Prestation conseil', debit: 0, credit: 1800.00, idFacture: 'FV-002', numFacture: 'FV-2025-002', categorie: 'Services', sousCategorie: 'Conseil', nameClient: 'Entreprise XYZ' },
    { idJournalVente: 'JV-003', date: '2025-01-13', compte: '411000', libelle: 'Vente marchandises', debit: 0, credit: 5600.00, idFacture: 'FV-003', numFacture: 'FV-2025-003', categorie: 'Ventes', sousCategorie: 'Marchandises', nameClient: 'Client DEF SA' },
    { idJournalVente: 'JV-004', date: '2025-01-12', compte: '411000', libelle: 'Avoir client', debit: 320.00, credit: 0, idFacture: 'FV-004', numFacture: 'AV-2025-001', categorie: 'Ventes', sousCategorie: 'Avoir', nameClient: 'Client ABC SARL' },
    { idJournalVente: 'JV-005', date: '2025-01-11', compte: '411000', libelle: 'Formation professionnelle', debit: 0, credit: 3200.00, idFacture: 'FV-005', numFacture: 'FV-2025-004', categorie: 'Services', sousCategorie: 'Formation', nameClient: 'Institut GHI' },
    { idJournalVente: 'JV-006', date: '2025-01-10', compte: '411000', libelle: 'Maintenance annuelle', debit: 0, credit: 1200.00, idFacture: 'FV-006', numFacture: 'FV-2025-005', categorie: 'Services', sousCategorie: 'Maintenance', nameClient: 'Societe JKL' },
    { idJournalVente: 'JV-007', date: '2025-01-09', compte: '411000', libelle: 'Vente equipements', debit: 0, credit: 8500.00, idFacture: 'FV-007', numFacture: 'FV-2025-006', categorie: 'Ventes', sousCategorie: 'Equipements', nameClient: 'Client MNO' },
    { idJournalVente: 'JV-008', date: '2025-01-08', compte: '411000', libelle: 'Prestation developpement', debit: 0, credit: 4500.00, idFacture: 'FV-008', numFacture: 'FV-2025-007', categorie: 'Services', sousCategorie: 'Developpement', nameClient: 'Startup PQR' },
    { idJournalVente: 'JV-009', date: '2025-01-07', compte: '411000', libelle: 'Vente accessoires', debit: 0, credit: 680.00, idFacture: 'FV-009', numFacture: 'FV-2025-008', categorie: 'Ventes', sousCategorie: 'Accessoires', nameClient: 'Client STU' },
    { idJournalVente: 'JV-010', date: '2025-01-06', compte: '411000', libelle: 'Audit et conseil', debit: 0, credit: 2800.00, idFacture: 'FV-010', numFacture: 'FV-2025-009', categorie: 'Services', sousCategorie: 'Audit', nameClient: 'Groupe VWX' },
];
const mockGrandLivre: GrandLivre[] = [
    { id: 'GL-001', compte: '101000', date: '2025-01-15', libelle: 'Capital social', debit: 0, credit: 50000.00, classe: 1, rubrique: 'Capitaux', poste: 'Capital', numFacture: '-', journal: 'OD', solde: 50000.00 },
    { id: 'GL-002', compte: '401000', date: '2025-01-14', libelle: 'Fournisseur ABC - Facture', debit: 0, credit: 2400.00, classe: 4, rubrique: 'Tiers', poste: 'Fournisseurs', numFacture: 'FA-2025-001', journal: 'AC', solde: 2400.00 },
    { id: 'GL-003', compte: '411000', date: '2025-01-13', libelle: 'Client XYZ - Facture', debit: 3600.00, credit: 0, classe: 4, rubrique: 'Tiers', poste: 'Clients', numFacture: 'FV-2025-001', journal: 'VE', solde: 3600.00 },
    { id: 'GL-004', compte: '512000', date: '2025-01-12', libelle: 'Banque - Encaissement', debit: 3600.00, credit: 0, classe: 5, rubrique: 'Financier', poste: 'Banque', numFacture: '-', journal: 'BQ', solde: 3600.00 },
    { id: 'GL-005', compte: '606100', date: '2025-01-11', libelle: 'Fournitures bureau', debit: 450.00, credit: 0, classe: 6, rubrique: 'Charges', poste: 'Achats', numFacture: 'FA-2025-002', journal: 'AC', solde: 450.00 },
    { id: 'GL-006', compte: '607000', date: '2025-01-10', libelle: 'Achats marchandises', debit: 8500.00, credit: 0, classe: 6, rubrique: 'Charges', poste: 'Achats', numFacture: 'FA-2025-003', journal: 'AC', solde: 8500.00 },
    { id: 'GL-007', compte: '701000', date: '2025-01-09', libelle: 'Ventes produits finis', debit: 0, credit: 12000.00, classe: 7, rubrique: 'Produits', poste: 'Ventes', numFacture: 'FV-2025-002', journal: 'VE', solde: 12000.00 },
    { id: 'GL-008', compte: '706000', date: '2025-01-08', libelle: 'Prestations services', debit: 0, credit: 4500.00, classe: 7, rubrique: 'Produits', poste: 'Services', numFacture: 'FV-2025-003', journal: 'VE', solde: 4500.00 },
    { id: 'GL-009', compte: '445710', date: '2025-01-07', libelle: 'TVA collectee', debit: 0, credit: 2400.00, classe: 4, rubrique: 'Tiers', poste: 'TVA', numFacture: '-', journal: 'OD', solde: 2400.00 },
    { id: 'GL-010', compte: '445660', date: '2025-01-06', libelle: 'TVA deductible', debit: 1790.00, credit: 0, classe: 4, rubrique: 'Tiers', poste: 'TVA', numFacture: '-', journal: 'OD', solde: 1790.00 },
];
const mockBilanData: BilanItem[] = [
    { id: 'BL-001', section: 'ACTIF', sousCategorie: 'Immobilisations incorporelles', categorie: 'Actif immobilise', montant: 15000.00, annee: '2025' },
    { id: 'BL-002', section: 'ACTIF', sousCategorie: 'Immobilisations corporelles', categorie: 'Actif immobilise', montant: 85000.00, annee: '2025' },
    { id: 'BL-003', section: 'ACTIF', sousCategorie: 'Immobilisations financieres', categorie: 'Actif immobilise', montant: 25000.00, annee: '2025' },
    { id: 'BL-004', section: 'ACTIF', sousCategorie: 'Stocks et en-cours', categorie: 'Actif circulant', montant: 42000.00, annee: '2025' },
    { id: 'BL-005', section: 'ACTIF', sousCategorie: 'Creances clients', categorie: 'Actif circulant', montant: 38500.00, annee: '2025' },
    { id: 'BL-006', section: 'ACTIF', sousCategorie: 'Disponibilites', categorie: 'Actif circulant', montant: 67800.00, annee: '2025' },
    { id: 'BL-007', section: 'PASSIF', sousCategorie: 'Capital social', categorie: 'Capitaux propres', montant: 100000.00, annee: '2025' },
    { id: 'BL-008', section: 'PASSIF', sousCategorie: 'Reserves', categorie: 'Capitaux propres', montant: 45000.00, annee: '2025' },
    { id: 'BL-009', section: 'PASSIF', sousCategorie: "Resultat de l'exercice", categorie: 'Capitaux propres', montant: 28300.00, annee: '2025' },
    { id: 'BL-010', section: 'PASSIF', sousCategorie: 'Emprunts bancaires', categorie: 'Dettes', montant: 65000.00, annee: '2025' },
    { id: 'BL-011', section: 'PASSIF', sousCategorie: 'Dettes fournisseurs', categorie: 'Dettes', montant: 28000.00, annee: '2025' },
    { id: 'BL-012', section: 'PASSIF', sousCategorie: 'Dettes fiscales et sociales', categorie: 'Dettes', montant: 7000.00, annee: '2025' },
];

// ── New mock data ──────────────────────────────────────────────────────────────
const mockPriorities: PriorityItem[] = [
    { id: 'p1', title: 'TVA 11/2024', description: 'Déclaration créée non soumise — clôture mensuelle bloquée', urgency: 'haute', actionType: 'validation', ref: 'TVA-2024-11', deadline: '2025-02-05', montant: '2 400 €' },
    { id: 'p2', title: 'Grand Livre GL-009', description: 'Anomalie débit/crédit détectée — écart de 610 € non justifié', urgency: 'haute', actionType: 'correction', ref: 'GL-009', deadline: '2025-02-03', montant: '610 €' },
    { id: 'p3', title: 'Journal Achat JA-005', description: 'Catégorisation incorrecte à corriger (Equipements → Investissements)', urgency: 'moyenne', actionType: 'revision', ref: 'JA-005', deadline: '2025-02-15', montant: '4 200 €' },
    { id: 'p4', title: 'Bilan Q4 2024', description: 'Validation comptable en attente de signature du directeur financier', urgency: 'moyenne', actionType: 'signature', ref: 'BILAN-2025', deadline: '2025-02-20', montant: '273 300 €' },
    { id: 'p5', title: 'TVA 05/2024', description: 'Déclaration créée jamais traitée — risque de pénalité fiscale', urgency: 'basse', actionType: 'validation', ref: 'TVA-2024-05', deadline: '2025-02-28', montant: '1 790 €' },
];
const mockAlerts: AgentAlert[] = [
    { id: 'a1', type: 'error', title: 'Écriture déséquilibrée', message: 'L\'écriture GL-009 présente un écart débit/crédit de 610 €. Intervention manuelle requise avant clôture.', time: '08:22', ref: 'GL-009' },
    { id: 'a2', type: 'error', title: 'TVA non soumise', message: 'La déclaration TVA 11/2024 n\'a pas été soumise avant la date limite initiale. Risque de pénalité.', time: '09:45', ref: 'TVA-2024-11' },
    { id: 'a3', type: 'warning', title: 'Délai TVA imminent', message: 'La période TVA 01/2025 expire dans 3 jours. Soumettez la déclaration dès maintenant pour éviter les pénalités.', time: '07:30', ref: 'TVA-2025-01' },
    { id: 'a4', type: 'warning', title: 'Solde compte suspect', message: 'Le compte 512000 (Banque) présente un solde 2× supérieur à la moyenne mensuelle. Vérifier les encaissements.', time: '11:00', ref: '512000' },
    { id: 'a5', type: 'success', title: 'Clôture mensuelle effectuée', message: 'Clôture comptable de janvier 2025 effectuée avec succès. 20 écritures validées, balance équilibrée.', time: '06:00', ref: 'CLOTURE-2025-01' },
    { id: 'a6', type: 'success', title: 'Import journal achat', message: '10 lignes importées depuis FACT-2025-BATCH.csv. Catégorisation automatique appliquée à 8 lignes.', time: '05:45', ref: 'JA-BATCH' },
    { id: 'a7', type: 'info', title: 'Nouvelle règle TVA', message: 'Le taux TVA intracommunautaire a été mis à jour pour les comptes 445xxx. Prochaines déclarations impactées.', time: '12:00', ref: 'TVA-RULE-2025' },
    { id: 'a8', type: 'info', title: 'Plan comptable rechargé', message: 'Le plan comptable 2025 a été rechargé. 3 nouveaux comptes ajoutés (6161, 7082, 4456).', time: '10:30', ref: 'PCG-2025' },
];
const mockTimeline: TimelineEvent[] = [
    { id: 't1', type: 'validated', label: 'Clôture mensuelle', desc: 'Janvier 2025 clôturé — 20 écritures', time: '06:00' },
    { id: 't2', type: 'imported', label: 'Import JA batch', desc: '10 lignes J. Achat importées', time: '05:45' },
    { id: 't3', type: 'error', label: 'Écriture déséquilibrée', desc: 'GL-009 : écart 610 €', time: '08:22' },
    { id: 't4', type: 'warning', label: 'Délai TVA', desc: 'TVA 01/2025 expire dans 3 j', time: '07:30' },
    { id: 't5', type: 'validated', label: 'Journal Vente', desc: 'JV-010 Groupe VWX validé', time: '09:00' },
    { id: 't6', type: 'created', label: 'Décl. TVA créée', desc: 'TVA 01/2025 initialisée', time: '10:00' },
    { id: 't7', type: 'corrected', label: 'Compte corrigé', desc: '445710 — ajustement OD', time: '11:30' },
    { id: 't8', type: 'info', label: 'Plan comptable', desc: '3 comptes ajoutés au PCG 2025', time: '10:30' },
];
const mockActivity: TodayActivity[] = [
    { id: 'act1', action: 'validated', label: 'Clôture jan 2025', ref: 'CLOTURE-2025-01', user: 'Sofia IA', time: '06:00' },
    { id: 'act2', action: 'imported', label: 'JA-BATCH (10 lignes)', ref: 'Journal Achat', user: 'Sofia IA', time: '05:45' },
    { id: 'act3', action: 'created', label: 'TVA 01/2025', ref: 'Décl. TVA', user: 'Alice Martin', time: '10:00' },
    { id: 'act4', action: 'corrected', label: 'GL-009 ajustement', ref: 'Grand Livre', user: 'Sofia IA', time: '11:30' },
    { id: 'act5', action: 'rejected', label: 'JA-005 catégorie', ref: 'Journal Achat', user: 'Alice Martin', time: '12:15' },
];
const mockKpis: KpiCard[] = [
    { id: 'k1', label: 'Décl. TVA', value: '10', sub: '2 en attente', color: '#0d9394' },
    { id: 'k2', label: 'J. Achat', value: '10', sub: '11 335 € débit', color: '#ef4444' },
    { id: 'k3', label: 'J. Vente', value: '10', sub: '34 680 € crédit', color: '#22c55e' },
    { id: 'k4', label: 'Grand Livre', value: '10', sub: '10 écritures', color: '#3b82f6' },
    { id: 'k5', label: 'Total Actif', value: '273 300 €', sub: 'bilan 2025', color: '#f59e0b' },
    { id: 'k6', label: 'Erreurs', value: '2', sub: '1 critique', color: '#ef4444' },
];

const SOFIA_VUE_MSGS = [
    "Bonjour ! Ce mois de janvier 2025 : 10 déclarations TVA traitées, 2 en attente. J'ai détecté 1 anomalie dans le Grand Livre (GL-009).",
    "La clôture de janvier 2025 a été effectuée avec succès. Souhaitez-vous que je génère le rapport de synthèse mensuel ?",
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtCurrency = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

function getStatusMeta(status: string) {
    switch (status) {
        case 'VALIDER': return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', label: 'Validé' };
        case 'CREATED': return { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', label: 'Créé' };
        case 'EN_TRAITEMENT': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'En traitement' };
        case 'ANNULER': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'Annulé' };
        default: return { color: 'var(--text2)', bg: 'var(--bg2)', border: 'var(--border)', label: status };
    }
}
function getClasseMeta(classe: number) {
    const map: Record<number, { color: string; bg: string }> = {
        1: { color: 'var(--primary)', bg: 'var(--primaryL)' },
        4: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        5: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        6: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        7: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    };
    return map[classe] || { color: 'var(--text2)', bg: 'var(--bg2)' };
}

const CSS_ANIM = `
@keyframes ct-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes ct-dot1{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes ct-dot2{0%,20%,100%{transform:scale(0)}60%{transform:scale(1)}}
@keyframes ct-dot3{0%,40%,100%{transform:scale(0)}80%{transform:scale(1)}}
@keyframes ct-ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}}
@keyframes ct-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
`;

const ROWS_PER_PAGE = 5;

// ── Shared sub-components ──────────────────────────────────────────────────────
function Paginator({ page, total, rowsPerPage, onPage }: { page: number; total: number; rowsPerPage: number; onPage: (p: number) => void }) {
    const totalPages = Math.ceil(total / rowsPerPage);
    if (totalPages <= 1) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, total)} sur {total}
            </span>
            <div style={{ display: 'flex', gap: 3 }}>
                {[
                    { lbl: <Icons.ChevronLeft style={{ width: 12, height: 12 }} />, p: 1, dis: page === 1 },
                    { lbl: <Icons.ChevronLeft style={{ width: 12, height: 12 }} />, p: page - 1, dis: page === 1 },
                    ...Array.from({ length: totalPages }, (_, i) => ({ lbl: <span style={{ fontSize: '0.72rem' }}>{i + 1}</span>, p: i + 1, dis: false, act: page === i + 1 })),
                    { lbl: <Icons.ChevronRight style={{ width: 12, height: 12 }} />, p: page + 1, dis: page >= totalPages },
                    { lbl: <Icons.ChevronRight style={{ width: 12, height: 12 }} />, p: totalPages, dis: page >= totalPages },
                ].map((b, i) => (
                    <button key={i} onClick={b.dis ? undefined : () => onPage(b.p)} disabled={b.dis} style={{ width: 24, height: 24, borderRadius: 5, border: (b as any).act ? 'none' : '1px solid var(--border)', background: (b as any).act ? 'var(--primary)' : 'var(--card)', color: (b as any).act ? 'white' : 'var(--text)', cursor: b.dis ? 'not-allowed' : 'pointer', opacity: b.dis ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                        {b.lbl}
                    </button>
                ))}
            </div>
        </div>
    );
}

function FilterBar({ search, onSearch, placeholder, children }: { search: string; onSearch: (v: string) => void; placeholder: string; children?: React.ReactNode }) {
    return (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', minWidth: 180 }}>
                <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
                <input type="text" value={search} onChange={e => onSearch(e.target.value)} placeholder={placeholder} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.75rem', color: 'var(--text)', width: '100%' }} />
            </div>
            {children}
        </div>
    );
}

function FilterChips({ items, selected, onSelect }: { items: { id: string | number; label: string; color: string; bg: string }[]; selected: any; onSelect: (v: any) => void }) {
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {items.map(item => (
                <button key={item.id} onClick={() => onSelect(selected === item.id ? null : item.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 7, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 500, border: selected === item.id ? `1.5px solid ${item.color}` : '1.5px solid transparent', background: selected === item.id ? item.bg : 'var(--card)', color: selected === item.id ? item.color : 'var(--text2)' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                    {item.label}
                </button>
            ))}
        </div>
    );
}

function THead({ cols }: { cols: string[] }) {
    return (
        <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {cols.map(c => <th key={c} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{c}</th>)}
            </tr>
        </thead>
    );
}

const glass = (accent: string): React.CSSProperties => ({
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: `0 2px 12px ${accent}18`,
});

// ── Constants ──────────────────────────────────────────────────────────────────
const URGENCY_META = {
    haute:   { label: 'Haute',   bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
    moyenne: { label: 'Moyenne', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    basse:   { label: 'Basse',   bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
};
const ACTION_META = {
    validation: { label: 'Validation', bg: 'rgba(13,147,148,0.12)', color: '#0d9394' },
    correction: { label: 'Correction', bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
    revision:   { label: 'Révision',   bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    signature:  { label: 'Signature',  bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
};
const ALERT_META = {
    error:   { label: 'Erreurs',        icon: '✕', grad: 'linear-gradient(135deg,#ef4444,#dc2626)', badge: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
    warning: { label: 'Avertissements', icon: '⚠', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', badge: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    success: { label: 'Succès',         icon: '✓', grad: 'linear-gradient(135deg,#22c55e,#16a34a)', badge: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
    info:    { label: 'Informations',   icon: 'ℹ', grad: 'linear-gradient(135deg,#3b82f6,#2563eb)', badge: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
};
const TL_META: Record<string, { icon: string; color: string }> = {
    validated: { icon: '✓', color: '#22c55e' },
    imported:  { icon: '↑', color: '#0d9394' },
    error:     { icon: '✕', color: '#ef4444' },
    warning:   { icon: '⚠', color: '#f59e0b' },
    created:   { icon: '+', color: '#3b82f6' },
    corrected: { icon: '↺', color: '#a855f7' },
    info:      { icon: 'ℹ', color: '#6b7280' },
};
const ACTIVITY_META: Record<string, { label: string; color: string }> = {
    validated: { label: 'Validé',   color: '#22c55e' },
    imported:  { label: 'Importé',  color: '#0d9394' },
    created:   { label: 'Créé',     color: '#3b82f6' },
    corrected: { label: 'Corrigé',  color: '#a855f7' },
    rejected:  { label: 'Rejeté',   color: '#ef4444' },
};

// ── AlertesView ────────────────────────────────────────────────────────────────
const AlertesView: React.FC<{ priorities: PriorityItem[]; alerts: AgentAlert[] }> = ({ priorities, alerts }) => {
    const urgentCount = priorities.filter(p => p.urgency === 'haute').length;
    const alertGroups = (['error', 'warning', 'success', 'info'] as const)
        .map(type => ({ type, items: alerts.filter(a => a.type === type) }))
        .filter(g => g.items.length > 0);

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Priorités */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Priorités actives</div>
                    {urgentCount > 0 && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#ef4444', opacity: 0.4, animation: 'ct-ping 1.5s ease-out infinite' }} />
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', position: 'relative' }}>{urgentCount}</div>
                        </div>
                    )}
                    <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>{priorities.length} éléments en attente</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {priorities.map(p => {
                        const um = URGENCY_META[p.urgency];
                        const am = ACTION_META[p.actionType];
                        const accentGrad = p.urgency === 'haute' ? 'linear-gradient(180deg,#ef4444,#dc2626)' : p.urgency === 'moyenne' ? 'linear-gradient(180deg,#f59e0b,#d97706)' : 'linear-gradient(180deg,#22c55e,#16a34a)';
                        return (
                            <div key={p.id} style={{ ...glass(um.color), position: 'relative', overflow: 'hidden', display: 'flex' }}>
                                <div style={{ width: 4, flexShrink: 0, background: accentGrad, borderRadius: '14px 0 0 14px' }} />
                                <div style={{ flex: 1, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{p.title}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.description}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: um.bg, color: um.color }}>{um.label}</span>
                                            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: am.bg, color: am.color }}>{am.label}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 5, border: '1px solid var(--border)', fontFamily: 'monospace' }}>#{p.ref}</span>
                                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)' }}>{p.montant}</span>
                                        <span style={{ fontSize: 10, color: '#ef4444', marginLeft: 'auto', fontWeight: 500 }}>⏰ {fmtDate(p.deadline)}</span>
                                        <button style={{ height: 28, padding: '0 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${um.color},${am.color})`, color: 'white', fontSize: 11, fontWeight: 600 }}>
                                            {am.label} →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Alertes */}
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Journal des alertes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {alertGroups.map(group => {
                        const meta = ALERT_META[group.type];
                        return (
                            <div key={group.type}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 10, background: meta.badge, color: meta.color }}>{meta.label}</span>
                                    <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg2)', padding: '1px 7px', borderRadius: 8, border: '1px solid var(--border)' }}>{group.items.length}</span>
                                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${meta.color}40,transparent)` }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {group.items.map(alert => (
                                        <div key={alert.id} style={{ ...glass(meta.color), overflow: 'hidden' }}>
                                            <div style={{ background: meta.grad, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', flexShrink: 0 }}>{meta.icon}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.title}</div>
                                                </div>
                                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', flexShrink: 0 }}>{alert.time}</span>
                                            </div>
                                            <div style={{ padding: '10px 14px' }}>
                                                <p style={{ margin: 0, fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{alert.message}</p>
                                                {alert.ref && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <span style={{ fontSize: 10, color: meta.color, background: meta.badge, padding: '2px 8px', borderRadius: 5, fontFamily: 'monospace' }}>#{alert.ref}</span>
                                                    </div>
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
        </div>
    );
};

// ── VueAgentView ───────────────────────────────────────────────────────────────
const VueAgentView: React.FC<{ kpis: KpiCard[]; timeline: TimelineEvent[]; activities: TodayActivity[] }> = ({ kpis, timeline, activities }) => {
    const [chatMsgs, setChatMsgs] = useState<{ id: string; from: 'sofia' | 'user'; text: string; time: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isSofiaTyping, setIsSofiaTyping] = useState(true);
    const [sofiaTyped, setSofiaTyped] = useState('');
    const [sofiaQueue] = useState(SOFIA_VUE_MSGS);
    const [sofiaIdx, setSofiaIdx] = useState(0);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isSofiaTyping || sofiaIdx >= sofiaQueue.length) return;
        const target = sofiaQueue[sofiaIdx];
        if (sofiaTyped.length < target.length) {
            const t = setTimeout(() => setSofiaTyped(target.slice(0, sofiaTyped.length + 1)), 14);
            return () => clearTimeout(t);
        } else {
            const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            setChatMsgs(prev => [...prev, { id: `s${Date.now()}`, from: 'sofia', text: target, time: now }]);
            const nextIdx = sofiaIdx + 1; setSofiaIdx(nextIdx); setSofiaTyped('');
            if (nextIdx >= sofiaQueue.length) setIsSofiaTyping(false);
        }
    }, [isSofiaTyping, sofiaTyped, sofiaIdx, sofiaQueue]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs, sofiaTyped]);

    const sendMsg = () => {
        if (!userInput.trim()) return;
        const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setChatMsgs(prev => [...prev, { id: `u${Date.now()}`, from: 'user', text: userInput.trim(), time: now }]);
        setUserInput(''); setIsSofiaTyping(true); setSofiaTyped(''); setSofiaIdx(0);
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {kpis.map(k => (
                    <div key={k.id} style={{ ...glass(k.color), padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{k.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{k.value}</div>
                        <div style={{ fontSize: 10, color: k.color }}>{k.sub}</div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${k.color},${k.color}40)`, borderRadius: '0 0 14px 14px' }} />
                    </div>
                ))}
            </div>

            {/* 3 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {/* Timeline */}
                <div style={{ ...glass('#0d9394'), padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Timeline</div>
                    <div style={{ position: 'relative', paddingLeft: 20 }}>
                        <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
                        {timeline.map((ev, i) => {
                            const m = TL_META[ev.type] || { icon: '●', color: '#6b7280' };
                            return (
                                <div key={ev.id} style={{ position: 'relative', marginBottom: i < timeline.length - 1 ? 14 : 0 }}>
                                    <div style={{ position: 'absolute', left: -16, top: 2, width: 16, height: 16, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', fontWeight: 700 }}>{m.icon}</div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{ev.label}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{ev.desc}</div>
                                    <div style={{ fontSize: 9, color: m.color, marginTop: 2 }}>{ev.time}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Activity */}
                <div style={{ ...glass('#22c55e'), padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Activité du jour</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {activities.map(act => {
                            const meta = ACTIVITY_META[act.action];
                            return (
                                <div key={act.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{meta.label.slice(0, 2)}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.label}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{act.ref} · {act.user}</div>
                                        <div style={{ fontSize: 9, color: meta.color, marginTop: 1 }}>{act.time} · {meta.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sofia mini-chat */}
                <div style={{ ...glass('#0d9394'), display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>S</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>Sofia</div>
                            <div style={{ fontSize: 9, color: '#22c55e' }}>● En ligne</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280 }}>
                        {chatMsgs.map(msg => (
                            <div key={msg.id} style={{ animation: 'ct-fadein 0.3s ease-out', display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 5 }}>
                                {msg.from === 'sofia' && <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700, flexShrink: 0 }}>S</div>}
                                <div style={{ maxWidth: '80%', padding: '7px 9px', borderRadius: msg.from === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: msg.from === 'user' ? 'var(--primary)' : 'var(--bg2)', border: msg.from === 'sofia' ? '1px solid var(--border)' : 'none' }}>
                                    <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: msg.from === 'user' ? 'white' : 'var(--text)' }}>{msg.text}</p>
                                    <span style={{ fontSize: 9, color: msg.from === 'user' ? 'rgba(255,255,255,0.65)' : 'var(--text3)', marginTop: 2, display: 'block' }}>{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        {isSofiaTyping && (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700 }}>S</div>
                                <div style={{ padding: '7px 9px', borderRadius: '10px 10px 10px 2px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                                    {sofiaTyped
                                        ? <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: 'var(--text)' }}>{sofiaTyped}<span style={{ animation: 'ct-blink 1s step-start infinite', display: 'inline-block', width: 2, height: '1em', background: 'var(--primary)', marginLeft: 1 }} /></p>
                                        : <div style={{ display: 'flex', gap: 3, padding: '2px 0' }}>{[1,2,3].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text3)', animation: `ct-dot${i} 1.2s ease-in-out infinite` }} />)}</div>
                                    }
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 5, flexShrink: 0 }}>
                        <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Demander à Sofia…" style={{ flex: 1, height: 30, padding: '0 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 11 }} />
                        <button onClick={sendMsg} style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--primary)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Send style={{ width: 12, height: 12 }} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── DetailsView (preserves existing 3-column layout) ───────────────────────────
const DetailsView: React.FC = () => {
    const [chatMessage, setChatMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([{ id: 'conv-1', title: 'Nouvelle conversation', timestamp: new Date().toISOString() }]);
    const [selectedConvId, setSelectedConvId] = useState('conv-1');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('declaration-tva');
    const [isSofiaThinking, setIsSofiaThinking] = useState(true);
    const [sofiaDisplayed, setSofiaDisplayed] = useState('');
    const sofiaFull = "Salut! Je suis Sofia, ton agent IA. D'apres mon sous-agent Comptabilite, on a traite 10 declarations TVA, 8 journaux d'achat et 5 journaux de vente. Tout est en ordre pour ce mois!";
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationTva | null>(null);

    const [tvaSearch, setTvaSearch] = useState(''); const [tvaStatus, setTvaStatus] = useState<string | null>(null); const [tvaPage, setTvaPage] = useState(1);
    const [jaSearch, setJaSearch] = useState(''); const [jaCat, setJaCat] = useState<string | null>(null); const [jaPage, setJaPage] = useState(1);
    const [jvSearch, setJvSearch] = useState(''); const [jvCat, setJvCat] = useState<string | null>(null); const [jvPage, setJvPage] = useState(1);
    const [glSearch, setGlSearch] = useState(''); const [glClasse, setGlClasse] = useState<number | null>(null); const [glPage, setGlPage] = useState(1);
    const [bilanSearch, setBilanSearch] = useState(''); const [bilanSection, setBilanSection] = useState<'ACTIF' | 'PASSIF' | null>(null); const [bilanAnnee, setBilanAnnee] = useState('2025'); const [bilanPage, setBilanPage] = useState(1);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsSofiaThinking(true); setSofiaDisplayed('');
        const t = setTimeout(() => setIsSofiaThinking(false), 1000);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!isSofiaThinking && sofiaDisplayed.length < sofiaFull.length) {
            const t = setTimeout(() => setSofiaDisplayed(sofiaFull.slice(0, sofiaDisplayed.length + 4)), 12);
            return () => clearTimeout(t);
        }
    }, [isSofiaThinking, sofiaDisplayed, sofiaFull]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

    const handleSend = () => {
        if (!chatMessage.trim() || isProcessing) return;
        const msg = chatMessage.trim(); setChatMessage('');
        setChatHistory(p => [...p, { role: 'user', content: msg, timestamp: new Date().toISOString() }]);
        setIsProcessing(true);
        setTimeout(() => {
            setChatHistory(p => [...p, { role: 'assistant', content: "Je suis le sous-agent Comptabilite. Je peux vous aider avec la gestion de vos declarations TVA, journaux d'achat et de vente. Comment puis-je vous aider?", timestamp: new Date().toISOString() }]);
            setIsProcessing(false);
        }, 1000);
    };

    const handleNewConv = () => {
        const c: Conversation = { id: `conv-${Date.now()}`, title: `Conversation ${conversations.length + 1}`, timestamp: new Date().toISOString() };
        setConversations(p => [c, ...p]); setSelectedConvId(c.id); setChatHistory([]);
    };

    const filteredTva = mockDeclarationTva.filter(d => (!tvaSearch || d.periode.includes(tvaSearch) || d.uuidDemandeTva.includes(tvaSearch)) && (!tvaStatus || d.status === tvaStatus));
    const filteredJa  = mockJournalAchat.filter(d => (!jaSearch || d.libelle.toLowerCase().includes(jaSearch.toLowerCase()) || d.numFacture.toLowerCase().includes(jaSearch.toLowerCase()) || d.nameFournisseur.toLowerCase().includes(jaSearch.toLowerCase())) && (!jaCat || d.categorie === jaCat));
    const filteredJv  = mockJournalVente.filter(d => (!jvSearch || d.libelle.toLowerCase().includes(jvSearch.toLowerCase()) || d.numFacture.toLowerCase().includes(jvSearch.toLowerCase()) || d.nameClient.toLowerCase().includes(jvSearch.toLowerCase())) && (!jvCat || d.categorie === jvCat));
    const filteredGl  = mockGrandLivre.filter(d => (!glSearch || d.libelle.toLowerCase().includes(glSearch.toLowerCase()) || d.compte.includes(glSearch) || d.numFacture.toLowerCase().includes(glSearch.toLowerCase())) && (!glClasse || d.classe === glClasse));
    const filteredBilan = mockBilanData.filter(d => (!bilanSearch || d.sousCategorie.toLowerCase().includes(bilanSearch.toLowerCase()) || d.categorie.toLowerCase().includes(bilanSearch.toLowerCase())) && (!bilanSection || d.section === bilanSection) && d.annee === bilanAnnee);
    const bilanActif  = filteredBilan.filter(i => i.section === 'ACTIF').reduce((s, i) => s + i.montant, 0);
    const bilanPassif = filteredBilan.filter(i => i.section === 'PASSIF').reduce((s, i) => s + i.montant, 0);

    const tabs = [
        { id: 'declaration-tva', label: 'Décl. TVA',  icon: <Icons.FileText style={{ width: 12, height: 12 }} />,    count: filteredTva.length },
        { id: 'journal-achat',   label: 'J. Achat',   icon: <Icons.TrendingDown style={{ width: 12, height: 12 }} />, count: filteredJa.length },
        { id: 'journal-vente',   label: 'J. Vente',   icon: <Icons.TrendingUp style={{ width: 12, height: 12 }} />,   count: filteredJv.length },
        { id: 'grand-livre',     label: 'Grand Livre', icon: <Icons.BarChart2 style={{ width: 12, height: 12 }} />,    count: filteredGl.length },
        { id: 'bilan',           label: 'Bilan',       icon: <Icons.DollarSign style={{ width: 12, height: 12 }} />,   count: filteredBilan.length },
    ];
    const tvaStatusFilters = [
        { id: 'VALIDER', label: 'Validé', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
        { id: 'CREATED', label: 'Créé', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { id: 'EN_TRAITEMENT', label: 'En cours', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { id: 'ANNULER', label: 'Annulé', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    ];

    const SofiaAvatar = (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>S</span>
        </div>
    );

    return (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* LEFT — conversations (160px) */}
            <div style={{ width: 160, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg2)', flexShrink: 0 }}>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
                    <button onClick={handleNewConv} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)' }}>
                        <Icons.Plus style={{ width: 12, height: 12 }} />
                        Nouvelle session
                    </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.map(conv => {
                        const active = selectedConvId === conv.id;
                        return (
                            <div key={conv.id} onClick={() => { setSelectedConvId(conv.id); setChatHistory([]); }} style={{ padding: '9px 12px', cursor: 'pointer', borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent', background: active ? 'var(--primaryL)' : 'transparent' }} onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)'; }} onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 5, background: active ? 'var(--primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icons.BarChart2 style={{ width: 10, height: 10, color: active ? 'white' : 'var(--text2)' }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: active ? 'var(--primary)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</span>
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{new Date(conv.timestamp).toLocaleDateString('fr-FR')}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CENTER — chat (420px) */}
            <div style={{ width: 420, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--card)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {SofiaAvatar}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>Sofia — Agent IA</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>Comptabilité automatisée</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', background: 'var(--primaryL)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 12, fontWeight: 600 }}>En ligne</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        {SofiaAvatar}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Sofia</div>
                            <div style={{ background: 'var(--bg2)', borderRadius: '0 10px 10px 10px', padding: '10px 12px', border: '1px solid var(--border)' }}>
                                {isSofiaThinking ? (
                                    <div style={{ display: 'flex', gap: 4 }}>{[1,2,3].map(n => <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: `ct-dot${n} 1.2s infinite ease-in-out` }} />)}</div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6 }}>
                                        {sofiaDisplayed}
                                        {sofiaDisplayed.length < sofiaFull.length && <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--primary)', marginLeft: 1, animation: 'ct-blink 1s infinite' }} />}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    {chatHistory.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                            {msg.role === 'assistant' ? SofiaAvatar : (
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icons.User style={{ width: 14, height: 14, color: 'var(--text2)' }} />
                                </div>
                            )}
                            <div style={{ maxWidth: '75%' }}>
                                <div style={{ background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg2)', color: msg.role === 'user' ? 'white' : 'var(--text)', borderRadius: msg.role === 'user' ? '10px 0 10px 10px' : '0 10px 10px 10px', padding: '10px 12px', fontSize: '0.82rem', lineHeight: 1.5, border: msg.role === 'user' ? 'none' : '1px solid var(--border)' }}>
                                    {msg.content}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text3)', marginTop: 2, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            {SofiaAvatar}
                            <div style={{ background: 'var(--bg2)', borderRadius: '0 10px 10px 10px', padding: '10px 12px', border: '1px solid var(--border)', display: 'flex', gap: 4 }}>
                                {[1,2,3].map(n => <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: `ct-dot${n} 1.2s infinite ease-in-out` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg2)', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)' }}>
                        <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Poser une question à Sofia..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.82rem', color: 'var(--text)' }} />
                        <button onClick={handleSend} disabled={!chatMessage.trim() || isProcessing} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: chatMessage.trim() && !isProcessing ? 'pointer' : 'not-allowed', background: chatMessage.trim() && !isProcessing ? 'var(--primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icons.Send style={{ width: 14, height: 14, color: chatMessage.trim() && !isProcessing ? 'white' : 'var(--text3)' }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT — data tables */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--card)', padding: '0 14px', flexShrink: 0 }}>
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 14px', border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: activeTab === t.id ? 'var(--primary)' : 'var(--text2)', whiteSpace: 'nowrap', marginBottom: -1 }}>
                            <span style={{ color: activeTab === t.id ? 'var(--primary)' : 'var(--text3)' }}>{t.icon}</span>
                            {t.label}
                            <span style={{ padding: '1px 6px', borderRadius: 10, fontSize: '0.65rem', fontWeight: 700, background: activeTab === t.id ? 'var(--primaryL)' : 'var(--bg2)', color: activeTab === t.id ? 'var(--primary)' : 'var(--text3)' }}>{t.count}</span>
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Declaration TVA */}
                    {activeTab === 'declaration-tva' && (
                        <>
                            <FilterBar search={tvaSearch} onSearch={v => { setTvaSearch(v); setTvaPage(1); }} placeholder="Rechercher période...">
                                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                                <FilterChips items={tvaStatusFilters} selected={tvaStatus} onSelect={v => { setTvaStatus(v); setTvaPage(1); }} />
                                {tvaStatus && <button onClick={() => setTvaStatus(null)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', fontSize: '0.7rem' }}><Icons.X style={{ width: 10, height: 10 }} />Reset</button>}
                            </FilterBar>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                    <THead cols={['Période', 'Date création', 'Status', 'Actions']} />
                                    <tbody>
                                        {filteredTva.slice((tvaPage - 1) * ROWS_PER_PAGE, tvaPage * ROWS_PER_PAGE).map(d => {
                                            const sm = getStatusMeta(d.status);
                                            return (
                                                <tr key={d.uuidDemandeTva} onClick={() => { setSelectedDeclaration(d); setDetailsOpen(true); }} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                    <td style={{ padding: '10px 12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--primaryL)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <Icons.FileText style={{ width: 13, height: 13, color: 'var(--primary)' }} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.8rem' }}>{d.periode}</div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{d.uuidDemandeTva.slice(0, 16)}...</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>{fmtDate(d.dateCreation)}</td>
                                                    <td style={{ padding: '10px 12px' }}><span style={{ padding: '3px 9px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>{sm.label}</span></td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                        <button onClick={e => { e.stopPropagation(); setSelectedDeclaration(d); setDetailsOpen(true); }} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--primaryL)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg2)')}>
                                                            <Icons.Eye style={{ width: 13, height: 13, color: 'var(--text2)' }} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Paginator page={tvaPage} total={filteredTva.length} rowsPerPage={ROWS_PER_PAGE} onPage={setTvaPage} />
                        </>
                    )}

                    {/* Journal Achat */}
                    {activeTab === 'journal-achat' && (
                        <>
                            <FilterBar search={jaSearch} onSearch={v => { setJaSearch(v); setJaPage(1); }} placeholder="Rechercher libellé, fournisseur...">
                                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                                <FilterChips items={[{ id: 'Achats', label: 'Achats', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }, { id: 'Services', label: 'Services', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' }]} selected={jaCat} onSelect={v => { setJaCat(v); setJaPage(1); }} />
                            </FilterBar>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                    <THead cols={['Date', 'N° Facture', 'Libellé', 'Fournisseur', 'Débit', 'Crédit', 'Catégorie']} />
                                    <tbody>
                                        {filteredJa.slice((jaPage - 1) * ROWS_PER_PAGE, jaPage * ROWS_PER_PAGE).map(d => (
                                            <tr key={d.idJournalAchat} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                <td style={{ padding: '9px 12px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtDate(d.date)}</td>
                                                <td style={{ padding: '9px 12px' }}><span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.72rem' }}>{d.numFacture}</span></td>
                                                <td style={{ padding: '9px 12px', maxWidth: 200 }}><div style={{ color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.libelle}</div><div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{d.compte}</div></td>
                                                <td style={{ padding: '9px 12px', color: 'var(--text2)', fontSize: '0.72rem' }}>{d.nameFournisseur}</td>
                                                <td style={{ padding: '9px 12px' }}>{d.debit > 0 ? <span style={{ fontWeight: 600, color: '#ef4444' }}>{fmtCurrency(d.debit)}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                                                <td style={{ padding: '9px 12px' }}>{d.credit > 0 ? <span style={{ fontWeight: 600, color: '#22c55e' }}>{fmtCurrency(d.credit)}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                                                <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{d.categorie}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Paginator page={jaPage} total={filteredJa.length} rowsPerPage={ROWS_PER_PAGE} onPage={setJaPage} />
                        </>
                    )}

                    {/* Journal Vente */}
                    {activeTab === 'journal-vente' && (
                        <>
                            <FilterBar search={jvSearch} onSearch={v => { setJvSearch(v); setJvPage(1); }} placeholder="Rechercher libellé, client...">
                                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                                <FilterChips items={[{ id: 'Ventes', label: 'Ventes', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }, { id: 'Services', label: 'Services', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }]} selected={jvCat} onSelect={v => { setJvCat(v); setJvPage(1); }} />
                            </FilterBar>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                    <THead cols={['Date', 'N° Facture', 'Libellé', 'Client', 'Débit', 'Crédit', 'Catégorie']} />
                                    <tbody>
                                        {filteredJv.slice((jvPage - 1) * ROWS_PER_PAGE, jvPage * ROWS_PER_PAGE).map(d => (
                                            <tr key={d.idJournalVente} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                <td style={{ padding: '9px 12px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtDate(d.date)}</td>
                                                <td style={{ padding: '9px 12px' }}><span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.72rem' }}>{d.numFacture}</span></td>
                                                <td style={{ padding: '9px 12px', maxWidth: 200 }}><div style={{ color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.libelle}</div><div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{d.compte}</div></td>
                                                <td style={{ padding: '9px 12px', color: 'var(--text2)', fontSize: '0.72rem' }}>{d.nameClient}</td>
                                                <td style={{ padding: '9px 12px' }}>{d.debit > 0 ? <span style={{ fontWeight: 600, color: '#ef4444' }}>{fmtCurrency(d.debit)}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                                                <td style={{ padding: '9px 12px' }}>{d.credit > 0 ? <span style={{ fontWeight: 600, color: '#22c55e' }}>{fmtCurrency(d.credit)}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                                                <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>{d.categorie}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Paginator page={jvPage} total={filteredJv.length} rowsPerPage={ROWS_PER_PAGE} onPage={setJvPage} />
                        </>
                    )}

                    {/* Grand Livre */}
                    {activeTab === 'grand-livre' && (
                        <>
                            <FilterBar search={glSearch} onSearch={v => { setGlSearch(v); setGlPage(1); }} placeholder="Rechercher compte, libellé...">
                                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                                <FilterChips items={[1,4,5,6,7].map(c => { const m = getClasseMeta(c); return { id: c, label: `Cl.${c}`, color: m.color, bg: m.bg }; })} selected={glClasse} onSelect={v => { setGlClasse(v); setGlPage(1); }} />
                            </FilterBar>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                    <THead cols={['Compte', 'Date', 'Libellé', 'Débit', 'Crédit', 'Solde', 'Cl.', 'Journal']} />
                                    <tbody>
                                        {filteredGl.slice((glPage - 1) * ROWS_PER_PAGE, glPage * ROWS_PER_PAGE).map(d => {
                                            const cm = getClasseMeta(d.classe);
                                            return (
                                                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                    <td style={{ padding: '9px 12px' }}><span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{d.compte}</span></td>
                                                    <td style={{ padding: '9px 12px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtDate(d.date)}</td>
                                                    <td style={{ padding: '9px 12px', maxWidth: 180 }}><div style={{ color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.libelle}</div><div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{d.numFacture}</div></td>
                                                    <td style={{ padding: '9px 12px' }}>{d.debit > 0 ? <span style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.78rem' }}>{fmtCurrency(d.debit)}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                                                    <td style={{ padding: '9px 12px' }}>{d.credit > 0 ? <span style={{ fontWeight: 600, color: '#22c55e', fontSize: '0.78rem' }}>{fmtCurrency(d.credit)}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                                                    <td style={{ padding: '9px 12px' }}><span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.78rem' }}>{fmtCurrency(d.solde)}</span></td>
                                                    <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 6px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 700, background: cm.bg, color: cm.color }}>{d.classe}</span></td>
                                                    <td style={{ padding: '9px 12px' }}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: 'var(--bg2)', color: 'var(--text2)', fontFamily: 'monospace' }}>{d.journal}</span></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Paginator page={glPage} total={filteredGl.length} rowsPerPage={ROWS_PER_PAGE} onPage={setGlPage} />
                        </>
                    )}

                    {/* Bilan */}
                    {activeTab === 'bilan' && (
                        <>
                            <FilterBar search={bilanSearch} onSearch={v => { setBilanSearch(v); setBilanPage(1); }} placeholder="Rechercher catégorie...">
                                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                                <FilterChips items={[{ id: 'ACTIF', label: 'Actif', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }, { id: 'PASSIF', label: 'Passif', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' }]} selected={bilanSection} onSelect={v => { setBilanSection(v); setBilanPage(1); }} />
                                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                                <select value={bilanAnnee} onChange={e => setBilanAnnee(e.target.value)} style={{ padding: '4px 8px', fontSize: '0.72rem', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }}>
                                    {['2025', '2024', '2023', '2022'].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </FilterBar>
                            <div style={{ padding: '8px 14px', background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexShrink: 0 }}>
                                {[{ label: 'Total Actif', v: bilanActif, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }, { label: 'Total Passif', v: bilanPassif, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' }, { label: 'Équilibre', v: bilanActif - bilanPassif, color: Math.abs(bilanActif - bilanPassif) < 1 ? '#22c55e' : '#ef4444', bg: 'var(--bg2)' }].map(s => (
                                    <div key={s.label} style={{ flex: 1, background: s.bg, borderRadius: 8, padding: '8px 12px' }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: s.color }}>{fmtCurrency(s.v)}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                    <THead cols={['Section', 'Catégorie', 'Sous-catégorie', 'Montant']} />
                                    <tbody>
                                        {filteredBilan.slice((bilanPage - 1) * ROWS_PER_PAGE, bilanPage * ROWS_PER_PAGE).map(d => (
                                            <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                                <td style={{ padding: '9px 12px' }}><span style={{ padding: '3px 9px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: d.section === 'ACTIF' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)', color: d.section === 'ACTIF' ? '#3b82f6' : '#8b5cf6' }}>{d.section}</span></td>
                                                <td style={{ padding: '9px 12px', color: 'var(--text2)', fontSize: '0.75rem' }}>{d.categorie}</td>
                                                <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 500 }}>{d.sousCategorie}</td>
                                                <td style={{ padding: '9px 12px' }}><span style={{ fontWeight: 700, fontSize: '0.82rem', color: d.montant >= 0 ? 'var(--text)' : '#ef4444' }}>{fmtCurrency(d.montant)}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Paginator page={bilanPage} total={filteredBilan.length} rowsPerPage={ROWS_PER_PAGE} onPage={setBilanPage} />
                        </>
                    )}
                </div>
            </div>

            {detailsOpen && selectedDeclaration && (
                <ComptaDetailsModal open={detailsOpen} declaration={selectedDeclaration} onClose={() => { setDetailsOpen(false); setSelectedDeclaration(null); }} />
            )}
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const ComptaChatModal: React.FC<{ open: boolean; agent: any; agentId?: string; onClose: () => void }> = ({ open, agent, onClose }) => {
    const [tab, setTab] = useState<'alertes' | 'vue' | 'details'>('alertes');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [hoverToggle, setHoverToggle] = useState(false);

    if (!open) return null;

    const urgentCount = mockPriorities.filter(p => p.urgency === 'haute').length;

    const NAV = [
        { id: 'alertes' as const, icon: '🔔', label: 'Alertes & Priorités', badge: urgentCount > 0 ? String(urgentCount) : null, badgeColor: '#ef4444' },
        { id: 'vue'     as const, icon: '⬡',  label: 'Vue Agent',           badge: null,                                          badgeColor: '' },
        { id: 'details' as const, icon: '☰',  label: 'Référentiel',             badge: String(mockDeclarationTva.length),             badgeColor: '#0d9394' },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{CSS_ANIM}</style>

            {/* Header */}
            <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'var(--header)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primaryL)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.BarChart2 style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{agent?.name || 'Sous Agent Comptabilité'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>Comptabilité automatisée · IA</div>
                    </div>
                </div>
                {/* Agent health */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Santé</div>
                    <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg,#22c55e,#0d9394)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>82%</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>2 erreurs · 10 décl. TVA</span>
                </div>
                <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.X style={{ width: 16, height: 16, color: 'var(--text)' }} />
                </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Collapsible sidebar */}
                <div style={{ width: sidebarOpen ? 200 : 58, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.25s ease', overflow: 'hidden', background: 'var(--bg2)' }}>
                    {/* Toggle */}
                    <div style={{ padding: sidebarOpen ? '10px 12px' : '10px 8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: sidebarOpen ? 'flex-end' : 'center' }}>
                        <button
                            onClick={() => setSidebarOpen(v => !v)}
                            onMouseEnter={() => setHoverToggle(true)}
                            onMouseLeave={() => setHoverToggle(false)}
                            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: hoverToggle ? 'var(--bg)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}
                            title={sidebarOpen ? 'Réduire' : 'Agrandir'}
                        >
                            {sidebarOpen
                                ? <Icons.ChevronLeft style={{ width: 14, height: 14, color: 'var(--text3)' }} />
                                : <Icons.ChevronRight style={{ width: 14, height: 14, color: 'var(--text3)' }} />
                            }
                        </button>
                    </div>

                    {/* Nav items */}
                    <div style={{ flex: 1, padding: '8px 0' }}>
                        {NAV.map(item => {
                            const isActive = tab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setTab(item.id)}
                                    title={!sidebarOpen ? item.label : undefined}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: sidebarOpen ? '9px 14px' : '9px 0', justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                        background: isActive ? 'rgba(13,147,148,0.08)' : 'none',
                                        border: 'none', cursor: 'pointer', textAlign: 'left',
                                        borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                                    }}
                                >
                                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                                    {sidebarOpen && (
                                        <>
                                            <span style={{ fontSize: 12, color: isActive ? 'var(--primary)' : 'var(--text)', fontWeight: isActive ? 600 : 400, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                                            {item.badge && (
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: item.badgeColor, color: 'white', flexShrink: 0 }}>{item.badge}</span>
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sofia status */}
                    <div style={{ padding: sidebarOpen ? '12px' : '8px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>S</span>
                            </div>
                            {sidebarOpen && (
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>Sofia</div>
                                    <div style={{ fontSize: 10, color: '#22c55e' }}>● En ligne</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    {tab === 'alertes' && <AlertesView priorities={mockPriorities} alerts={mockAlerts} />}
                    {tab === 'vue'     && <VueAgentView kpis={mockKpis} timeline={mockTimeline} activities={mockActivity} />}
                    {tab === 'details' && <DetailsView />}
                </div>
            </div>
        </div>
    );
};
