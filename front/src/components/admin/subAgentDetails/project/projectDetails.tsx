'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Icons from '../../../../assets/icons';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  id: string; name: string; type: 'regie' | 'negoce';
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  budget: number; startDate: string; endDate: string;
  description: string; customerId: string;
}

interface Prestation { id: string; name: string; consultant: string; status: string; montant: number; dateDebut: string; dateFin: string; type: string; typePartenaire: 'CLIENT' | 'FOURNISSEUR'; }
interface Devis { id: string; numero: string; typeOperation: 'ACHAT' | 'VENTE'; status: string; amount: number; sold: number; fournisseur: string; dateDevis: string; dateValidation: string; }
interface Depense { id: string; description: string; nature: string; amount: number; dateDepense: string; status: string; consultant: string; }
interface Facture { id: string; numeroFacture: string; status: string; typeFacture: string; partnerName: string; montantTtc: number; dateFacture: string; statusPayement: string; }
interface Commande { id: string; numero: string; typeBonCommande: string; typeOperation: 'ACHAT' | 'VENTE'; status: string; amount: number; sold: number; fournisseur: string; dateCommande: string; dateLivraison: string; }
interface Fournisseur {
  id: string; name: string; contactName: string; contactEmail: string; contactPhone: string;
  city: string; pays: string; categorie: string; status: string; ice: string;
  adresse: string; codePostal: string; formeJuridique: string; capital?: string;
  tvaIntracom?: string; website?: string; notes?: string; dateCreation?: string;
}
interface ChargeSociale { id: string; typeChargeSocial: string; montant: number; periode: string; status: string; nameConsultant: string; statusPayement: string; }
interface Cra { id: string; consultantName: string; nbrJourPresence: number; nbrJourAbsence: number; periode: string; status: string; nbrJourTravail: number; }
interface Fichier { id: string; fileName: string; fileType: string; size: string; uploadDate: string; uploadedBy: string; }
interface WalletTransaction { id: string; description: string; amount: number; date: string; type: 'credit' | 'debit'; status: string; }
interface Commentaire { id: string; username: string; commentaire: string; time: string; }

interface ProjectDetailsProps { open: boolean; project: Project | null; onClose: () => void; }

// ─── Mock data factories ──────────────────────────────────────────────────────

const mkPrestations = (pid: string): Prestation[] => [
  { id: 'pr1', name: 'Développement module paiement', consultant: 'Alice Martin', status: 'VALIDER', montant: 18000, dateDebut: '2024-01-02', dateFin: '2024-01-31', type: 'SERVICE', typePartenaire: 'CLIENT' },
  { id: 'pr2', name: 'Architecture Cloud', consultant: 'Bob Dupont', status: 'EN_TRAITEMENT', montant: 12500, dateDebut: '2024-02-01', dateFin: '2024-02-29', type: 'SERVICE', typePartenaire: 'CLIENT' },
  { id: 'pr3', name: 'Audit sécurité', consultant: 'Carol Lemaire', status: 'VALIDER', montant: 8400, dateDebut: '2024-02-05', dateFin: '2024-02-20', type: 'AUTRE', typePartenaire: 'FOURNISSEUR' },
  { id: 'pr4', name: 'Formation équipe DevOps', consultant: 'David Renaud', status: 'EN_TRAITEMENT', montant: 5600, dateDebut: '2024-03-04', dateFin: '2024-03-08', type: 'SERVICE', typePartenaire: 'FOURNISSEUR' },
  { id: 'pr5', name: 'Migration base de données', consultant: 'Emma Petit', status: 'CREER', montant: 9200, dateDebut: '2024-03-11', dateFin: '2024-03-29', type: 'SERVICE', typePartenaire: 'CLIENT' },
  { id: 'pr6', name: 'Intégration API tierce', consultant: 'François Bernard', status: 'VALIDER', montant: 7800, dateDebut: '2024-04-01', dateFin: '2024-04-30', type: 'SERVICE', typePartenaire: 'CLIENT' },
];

const mkDevis = (): Devis[] => [
  { id: 'dv1', numero: 'DEV-2024-001', typeOperation: 'VENTE', status: 'VALIDER', amount: 22000, sold: 0, fournisseur: 'Acme Corp', dateDevis: '2024-01-08', dateValidation: '2024-01-15' },
  { id: 'dv2', numero: 'DEV-2024-002', typeOperation: 'ACHAT', status: 'EN_TRAITEMENT', amount: 5800, sold: 5800, fournisseur: 'Tech Supplies SAS', dateDevis: '2024-02-05', dateValidation: '' },
  { id: 'dv3', numero: 'DEV-2024-003', typeOperation: 'VENTE', status: 'CREER', amount: 11500, sold: 11500, fournisseur: 'Cloud Services Ltd', dateDevis: '2024-02-18', dateValidation: '' },
  { id: 'dv4', numero: 'DEV-2024-004', typeOperation: 'ACHAT', status: 'VALIDER', amount: 3200, sold: 1600, fournisseur: 'Hardware Pro', dateDevis: '2024-03-02', dateValidation: '2024-03-10' },
];

const mkDepenses = (): Depense[] => [
  { id: 'd1', description: 'Déplacement client Paris', nature: 'Transport', amount: 320, dateDepense: '2024-01-15', status: 'VALIDER', consultant: 'Alice Martin' },
  { id: 'd2', description: 'Hébergement séminaire', nature: 'Hébergement', amount: 480, dateDepense: '2024-01-20', status: 'EN_TRAITEMENT', consultant: 'Bob Dupont' },
  { id: 'd3', description: 'Repas client', nature: 'Restauration', amount: 95, dateDepense: '2024-02-05', status: 'VALIDER', consultant: 'Carol Lemaire' },
  { id: 'd4', description: 'Achat matériel bureau', nature: 'Fournitures', amount: 780, dateDepense: '2024-02-12', status: 'VALIDER', consultant: 'David Renaud' },
  { id: 'd5', description: 'Formation certification AWS', nature: 'Formation', amount: 1200, dateDepense: '2024-03-01', status: 'EN_TRAITEMENT', consultant: 'Emma Petit' },
  { id: 'd6', description: 'Abonnement outil CI/CD', nature: 'Logiciel', amount: 299, dateDepense: '2024-03-10', status: 'VALIDER', consultant: 'François Bernard' },
];

const mkFactures = (): Facture[] => [
  { id: 'f1', numeroFacture: 'FAC-2024-101', status: 'VALIDER', typeFacture: 'FACTURE_VENTE', partnerName: 'Acme Corp', montantTtc: 21600, dateFacture: '2024-01-31', statusPayement: 'PAYER' },
  { id: 'f2', numeroFacture: 'FAC-2024-102', status: 'EN_TRAITEMENT', typeFacture: 'FACTURE_VENTE', partnerName: 'Acme Corp', montantTtc: 15000, dateFacture: '2024-02-28', statusPayement: 'NON_PAYER' },
  { id: 'f3', numeroFacture: 'FAC-2024-103', status: 'VALIDER', typeFacture: 'FACTURE_ACHAT', partnerName: 'Tech Supplies SAS', montantTtc: -1440, dateFacture: '2024-02-15', statusPayement: 'PAYER' },
  { id: 'f4', numeroFacture: 'FAC-2024-104', status: 'EN_TRAITEMENT', typeFacture: 'FACTURE_VENTE', partnerName: 'Acme Corp', montantTtc: 11040, dateFacture: '2024-03-31', statusPayement: 'NON_PAYER' },
  { id: 'f5', numeroFacture: 'FAC-2024-105', status: 'VALIDER', typeFacture: 'FACTURE_ACHAT', partnerName: 'Office Depot', montantTtc: -576, dateFacture: '2024-03-20', statusPayement: 'PAYER' },
];

const mkCommandes = (): Commande[] => [
  { id: 'co1', numero: 'BC-2024-001', typeBonCommande: 'SERVICE', typeOperation: 'VENTE', status: 'VALIDER', amount: 18000, sold: 0, fournisseur: 'Acme Corp', dateCommande: '2024-01-10', dateLivraison: '2024-01-31' },
  { id: 'co2', numero: 'BC-2024-002', typeBonCommande: 'FOURNITURE', typeOperation: 'ACHAT', status: 'EN_TRAITEMENT', amount: 4500, sold: 4500, fournisseur: 'Tech Supplies SAS', dateCommande: '2024-02-08', dateLivraison: '2024-02-28' },
  { id: 'co3', numero: 'BC-2024-003', typeBonCommande: 'SERVICE', typeOperation: 'VENTE', status: 'VALIDER', amount: 9200, sold: 2300, fournisseur: 'Cloud Services Ltd', dateCommande: '2024-02-20', dateLivraison: '2024-03-20' },
  { id: 'co4', numero: 'BC-2024-004', typeBonCommande: 'MATERIEL', typeOperation: 'ACHAT', status: 'CREER', amount: 7800, sold: 7800, fournisseur: 'Hardware Pro', dateCommande: '2024-03-05', dateLivraison: '2024-04-05' },
];

const mkFournisseurs = (): Fournisseur[] => [
  { id: 'fo1', name: 'Tech Supplies SAS', contactName: 'Marie Girard', contactEmail: 'marie@techsupplies.fr', contactPhone: '01 23 45 67 89', city: 'Paris', pays: 'France', categorie: 'Informatique', status: 'ACTIF', ice: 'FR76 4102 5678 901', adresse: '12 Rue de la Paix', codePostal: '75001', formeJuridique: 'SAS', capital: '150 000 €', tvaIntracom: 'FR76410256789', website: 'https://techsupplies.fr', dateCreation: '2015-03-14', notes: 'Fournisseur principal matériel informatique. Délai livraison 48h.' },
  { id: 'fo2', name: 'Cloud Services Ltd', contactName: 'Jean Moreau', contactEmail: 'jean@cloudservices.com', contactPhone: '01 98 76 54 32', city: 'Lyon', pays: 'France', categorie: 'Cloud', status: 'ACTIF', ice: 'FR29 7831 2345 678', adresse: '45 Avenue des Terreaux', codePostal: '69001', formeJuridique: 'SARL', capital: '80 000 €', tvaIntracom: 'FR29783123456', website: 'https://cloudservices.com', dateCreation: '2018-07-22', notes: 'Partenaire cloud Azure & AWS. SLA 99.9%.' },
  { id: 'fo3', name: 'Hardware Pro', contactName: 'Sophie Leblanc', contactEmail: 'sophie@hardwarepro.fr', contactPhone: '04 56 78 90 12', city: 'Casablanca', pays: 'Maroc', categorie: 'Matériel', status: 'EN_ATTENTE', ice: 'ICE 001234567000089', adresse: '8 Boulevard Hassan II', codePostal: '20000', formeJuridique: 'SARL', capital: '500 000 MAD', tvaIntracom: undefined, website: 'https://hardwarepro.ma', dateCreation: '2020-01-10', notes: 'Nouveau fournisseur. En cours de validation contractuelle.' },
  { id: 'fo4', name: 'Office Depot', contactName: 'Pierre Laurent', contactEmail: 'pierre@officedepot.fr', contactPhone: '03 21 43 65 87', city: 'Toulouse', pays: 'France', categorie: 'Fournitures', status: 'INACTIF', ice: 'FR51 3002 9876 543', adresse: '22 Rue du Commerce', codePostal: '31000', formeJuridique: 'SA', capital: '2 000 000 €', tvaIntracom: 'FR51300298765', website: 'https://officedepot.fr', dateCreation: '2008-11-05', notes: 'Contrat suspendu depuis mars 2024. En renégociation tarifaire.' },
];

const mkChargesSociales = (): ChargeSociale[] => [
  { id: 'cs1', typeChargeSocial: 'CHARGE_SOCIALE', montant: 3240, periode: '01/2024', status: 'VALIDER', nameConsultant: 'Alice Martin', statusPayement: 'PAYER' },
  { id: 'cs2', typeChargeSocial: 'CHARGE_PATRONALE', montant: 2100, periode: '01/2024', status: 'VALIDER', nameConsultant: 'Bob Dupont', statusPayement: 'PAYER' },
  { id: 'cs3', typeChargeSocial: 'CHARGE_SOCIALE', montant: 3240, periode: '02/2024', status: 'EN_TRAITEMENT', nameConsultant: 'Alice Martin', statusPayement: 'NON_PAYER' },
  { id: 'cs4', typeChargeSocial: 'CHARGE_PATRONALE', montant: 2100, periode: '02/2024', status: 'EN_TRAITEMENT', nameConsultant: 'Carol Lemaire', statusPayement: 'NON_PAYER' },
  { id: 'cs5', typeChargeSocial: 'CHARGE_SOCIALE', montant: 3240, periode: '03/2024', status: 'CREER', nameConsultant: 'Emma Petit', statusPayement: 'NON_PAYER' },
];

const mkCras = (): Cra[] => [
  { id: 'cr1', consultantName: 'Alice Martin', nbrJourPresence: 20, nbrJourAbsence: 1, periode: '01/2024', status: 'VALIDER', nbrJourTravail: 21 },
  { id: 'cr2', consultantName: 'Bob Dupont', nbrJourPresence: 18, nbrJourAbsence: 3, periode: '01/2024', status: 'VALIDER', nbrJourTravail: 21 },
  { id: 'cr3', consultantName: 'Carol Lemaire', nbrJourPresence: 21, nbrJourAbsence: 0, periode: '02/2024', status: 'VALIDER', nbrJourTravail: 21 },
  { id: 'cr4', consultantName: 'David Renaud', nbrJourPresence: 19, nbrJourAbsence: 2, periode: '02/2024', status: 'EN_TRAITEMENT', nbrJourTravail: 21 },
  { id: 'cr5', consultantName: 'Emma Petit', nbrJourPresence: 20, nbrJourAbsence: 1, periode: '03/2024', status: 'CREER', nbrJourTravail: 21 },
];

const mkFichiers = (): Fichier[] => [
  { id: 'fi1', fileName: 'Contrat_Projet_2024', fileType: '.pdf', size: '1.2 MB', uploadDate: '2024-01-05', uploadedBy: 'Admin' },
  { id: 'fi2', fileName: 'Cahier_des_charges', fileType: '.docx', size: '856 KB', uploadDate: '2024-01-08', uploadedBy: 'Chef de projet' },
  { id: 'fi3', fileName: 'Budget_previsionnel', fileType: '.xlsx', size: '320 KB', uploadDate: '2024-01-10', uploadedBy: 'Comptabilité' },
  { id: 'fi4', fileName: 'Planning_Gantt_Q1', fileType: '.xlsx', size: '540 KB', uploadDate: '2024-01-15', uploadedBy: 'Chef de projet' },
  { id: 'fi5', fileName: 'Rapport_Avancement_Fev', fileType: '.pdf', size: '2.1 MB', uploadDate: '2024-03-01', uploadedBy: 'Admin' },
];

const mkWalletTransactions = (): WalletTransaction[] => [
  { id: 'wt1', description: 'Paiement Acme Corp FAC-2024-101', amount: 21600, date: '2024-02-05', type: 'credit', status: 'VALIDER' },
  { id: 'wt2', description: 'Règlement fournisseur Tech Supplies', amount: -1440, date: '2024-02-20', type: 'debit', status: 'VALIDER' },
  { id: 'wt3', description: 'Charges sociales Jan', amount: -5340, date: '2024-02-28', type: 'debit', status: 'VALIDER' },
  { id: 'wt4', description: 'Acompte client Acme Corp', amount: 7500, date: '2024-03-10', type: 'credit', status: 'VALIDER' },
  { id: 'wt5', description: 'Frais déplacement remboursement', amount: -895, date: '2024-03-15', type: 'debit', status: 'VALIDER' },
  { id: 'wt6', description: 'Paiement Office Depot', amount: -576, date: '2024-03-22', type: 'debit', status: 'EN_TRAITEMENT' },
];

const mkCommentaires = (): Commentaire[] => [
  { id: 'cm1', username: 'Mouhcine', commentaire: 'Le projet avance bien, toutes les prestations du mois de janvier ont été validées.', time: 'Il y a 2 jours' },
  { id: 'cm2', username: 'Alice Martin', commentaire: 'J\'ai soumis le CRA de février, en attente de validation.', time: 'Il y a 4 jours' },
  { id: 'cm3', username: 'Bob Dupont', commentaire: 'La migration cloud est planifiée pour la semaine prochaine. Toutes les ressources sont prêtes.', time: 'Il y a 1 semaine' },
  { id: 'cm4', username: 'Admin', commentaire: 'Rappel: les dépenses du T1 doivent être soumises avant fin mars.', time: 'Il y a 2 semaines' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const statusBadge = (status: string) => {
  const m: Record<string, { label: string; bg: string; color: string; border: string }> = {
    VALIDER: { label: 'Validé', bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    EN_TRAITEMENT: { label: 'En traitement', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
    CREER: { label: 'Créé', bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
    PAYER: { label: 'Payé', bg: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: 'rgba(20,184,166,0.3)' },
    NON_PAYER: { label: 'Non payé', bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' },
    ANNULER: { label: 'Annulé', bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
  };
  const s = m[status] || { label: status, bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' };
  return (
    <span style={{ height: 20, fontSize: '0.6rem', fontWeight: 600, borderRadius: 4, padding: '0 7px', display: 'inline-flex', alignItems: 'center', backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
};

const getFileIcon = (t: string) => {
  if (t.includes('pdf')) return '📄';
  if (t.includes('doc')) return '📝';
  if (t.includes('xls')) return '📊';
  if (t.includes('png') || t.includes('jpg')) return '🖼️';
  return '📁';
};

const Skel = ({ w, h, r = 4 }: { w: number | string; h: number; r?: number }) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, var(--bg2) 25%, var(--border) 50%, var(--bg2) 75%)', backgroundSize: '200% 100%', animation: 'od-shimmer 1.5s infinite' }} />
);

// ─── AI insight messages per tab ──────────────────────────────────────────────

const TAB_AI_INSIGHTS: Record<string, string> = {
  analytics: "Analyse IA: Ce projet affiche un taux de progression de 68%. Le budget est maîtrisé à 94%, avec 3 jalons validés sur 5. Je recommande de surveiller les dépenses de mars qui sont en hausse de 12%.",
  prestations: "Analyse IA: 4 prestations sur 6 sont validées, représentant 76% du budget prévu. 2 prestations sont en cours de traitement. Le taux de validation mensuel est excellent.",
  depenses: "Analyse IA: Les dépenses totales s'élèvent à 3 174 €. La catégorie Formation représente 38% des dépenses. 4 dépenses validées, 2 en attente. Aucune anomalie détectée.",
  factures: "Analyse IA: 3 factures validées pour un total de 45 216 €. 1 facture en attente de paiement (15 000 €). Le taux de recouvrement est de 75% ce trimestre.",
  commandes: "Analyse IA: 4 bons de commande actifs pour un montant total de 39 500 €. 2 commandes validées, 1 en traitement, 1 en création. Délai moyen de traitement: 5 jours.",
  fournisseurs: "Analyse IA: 4 fournisseurs référencés. Catégories: Informatique, Cloud, Matériel, Fournitures. Tous les fournisseurs ont un contact actif. Aucun contrat expiré détecté.",
  chargesociale: "Analyse IA: 5 charges sociales enregistrées pour un total de 13 920 €. 2 charges de janvier entièrement payées. 3 charges de février/mars en attente de règlement.",
  cra: "Analyse IA: 5 CRA analysés. Moyenne de présence: 19,6 jours/mois. Taux d'absentéisme: 6,7%. 3 CRA validés, 1 en traitement, 1 en création. Performance globale: excellente.",
  fichiers: "Analyse IA: 5 fichiers projet indexés. 2 PDF, 2 Excel, 1 Word. Dernier document ajouté il y a 2 mois. Tous les documents sont conformes aux exigences contractuelles.",
  wallet: "Analyse IA: Solde wallet: +21 849 €. Entrées totales: 29 100 € — Sorties totales: 8 251 €. 6 transactions traitées. Flux de trésorerie positif et stable ce trimestre.",
  commentaires: "Analyse IA: 4 commentaires actifs sur le projet. Dernière activité il y a 2 jours. Les échanges indiquent une bonne coordination entre les intervenants.",
};

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: React.ReactNode }) => (
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

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ value, color = '#0d9394' }: { value: number; color?: string }) => (
  <div style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, value)}%`, height: '100%', borderRadius: 3, backgroundColor: color, transition: 'width 0.8s ease' }} />
  </div>
);

// ─── Table wrapper ────────────────────────────────────────────────────────────

const TableWrap = ({ headers, children, empty }: { headers: string[]; children: React.ReactNode; empty?: boolean }) => (
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
        {empty ? (
          <tr><td colSpan={headers.length} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)', fontSize: '0.7rem' }}>Aucune donnée à afficher.</td></tr>
        ) : children}
      </tbody>
    </table>
  </div>
);

const TdRow = ({ children, last }: { children: React.ReactNode; last?: boolean }) => (
  <tr style={{ borderBottom: last ? 'none' : '1px solid var(--bg2)', transition: 'background 0.1s' }}
    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
    {children}
  </tr>
);

// ─── AI Insight Banner ────────────────────────────────────────────────────────

const AiInsight = ({ tabKey, active }: { tabKey: string; active: boolean }) => {
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
    if (thinking || !active) return;
    if (displayed.length >= full.length) return;
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
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9394', animation: 'od-dot1 1.2s infinite' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9394', animation: 'od-dot2 1.2s infinite' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0d9394', animation: 'od-dot3 1.2s infinite' }} />
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

// ─── Component ────────────────────────────────────────────────────────────────

export const ProjectDetailsModal: React.FC<ProjectDetailsProps> = ({ open, project, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<Commentaire[]>(mkCommentaires());
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);

  const prestations = useMemo(() => mkPrestations(project?.id || ''), [project?.id]);
  const devis = useMemo(() => mkDevis(), []);
  const depenses = useMemo(() => mkDepenses(), []);
  const factures = useMemo(() => mkFactures(), []);
  const commandes = useMemo(() => mkCommandes(), []);
  const fournisseurs = useMemo(() => mkFournisseurs(), []);
  const chargesSociales = useMemo(() => mkChargesSociales(), []);
  const cras = useMemo(() => mkCras(), []);
  const fichiers = useMemo(() => mkFichiers(), []);
  const walletTxs = useMemo(() => mkWalletTransactions(), []);

  const isRegie = project?.type === 'regie';

  const TABS = useMemo(() => {
    const base = [
      { key: 'analytics', label: 'Analytics' },
      ...(isRegie ? [{ key: 'prestations', label: `Prestations (${prestations.length})` }] : []),
      { key: 'devis', label: `Devis (${devis.length})` },
      { key: 'commandes', label: `Commandes (${commandes.length})` },
      { key: 'factures', label: `Factures (${factures.length})` },
      { key: 'fournisseurs', label: `Fournisseurs (${fournisseurs.length})` },
      { key: 'chargesociale', label: `Charge Sociale (${chargesSociales.length})` },
      { key: 'cra', label: `CRA (${cras.length})` },
      { key: 'wallet', label: 'Wallet' },
      { key: 'fichiers', label: `Fichiers (${fichiers.length})` },
      { key: 'commentaires', label: `Commentaires (${comments.length})` },
    ];
    return base;
  }, [isRegie, prestations.length, devis.length, factures.length, commandes.length, fournisseurs.length, chargesSociales.length, cras.length, fichiers.length, comments.length]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setActiveTab(0);
      setSearchQuery('');
      setPage(0);
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => { setPage(0); }, [activeTab, searchQuery]);

  const currentTabKey = TABS[activeTab]?.key || 'analytics';

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment: Commentaire = { id: `cm${Date.now()}`, username: 'Mouhcine', commentaire: commentInput.trim(), time: "À l'instant" };
    setComments(prev => [newComment, ...prev]);
    setCommentInput('');
  };

  if (!open || !project) return null;

  const typeMeta = project.type === 'regie'
    ? { label: 'Régie', color: '#0d9394', bg: 'rgba(13,147,148,0.1)' }
    : { label: 'Négoce', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };

  const statusMeta: Record<string, string> = { active: 'Actif', pending: 'En attente', completed: 'Terminé', cancelled: 'Annulé' };
  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.max(0, Math.round((Date.now() - new Date(project.startDate).getTime()) / (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) * 100)));

  const walletBalance = walletTxs.reduce((s, t) => s + t.amount, 0);

  // Filter helpers
  const filteredPrestations = prestations.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.consultant.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDevis = devis.filter(d => !searchQuery || d.numero.toLowerCase().includes(searchQuery.toLowerCase()) || d.fournisseur.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDepenses = depenses.filter(d => !searchQuery || d.description.toLowerCase().includes(searchQuery.toLowerCase()) || d.nature.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFactures = factures.filter(f => !searchQuery || f.numeroFacture.toLowerCase().includes(searchQuery.toLowerCase()) || f.partnerName.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCommandes = commandes.filter(c => !searchQuery || c.numero.toLowerCase().includes(searchQuery.toLowerCase()) || c.fournisseur.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFournisseurs = fournisseurs.filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCS = chargesSociales.filter(c => !searchQuery || c.nameConsultant.toLowerCase().includes(searchQuery.toLowerCase()) || c.typeChargeSocial.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredCras = cras.filter(c => !searchQuery || c.consultantName.toLowerCase().includes(searchQuery.toLowerCase()));

  const paged = <T,>(arr: T[]) => arr.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const Pagination = ({ total }: { total: number }) => {
    const start = total === 0 ? 0 : page * rowsPerPage + 1;
    const end = Math.min((page + 1) * rowsPerPage, total);
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>{total === 0 ? '0' : `${start}-${end} sur ${total}`}</span>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
          style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', cursor: page === 0 ? 'default' : 'pointer', opacity: page === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.ChevronLeft style={{ width: 12, height: 12 }} />
        </button>
        <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * rowsPerPage >= total}
          style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', cursor: (page + 1) * rowsPerPage >= total ? 'default' : 'pointer', opacity: (page + 1) * rowsPerPage >= total ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.ChevronRight style={{ width: 12, height: 12 }} />
        </button>
      </div>
    );
  };

  const ActionBtn = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <button title={title} style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>{icon}</button>
  );

  // ── Tab content renderers ──

  const renderAnalytics = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Budget total" value={fmtCurrency(project.budget)} color="#0d9394" icon={<Icons.DollarSign style={{ width: 16, height: 16 }} />} />
        <StatCard label="Dépenses engagées" value={fmtCurrency(depenses.reduce((s, d) => s + d.amount, 0))} sub="3% du budget" color="#f59e0b" icon={<Icons.TrendingDown style={{ width: 16, height: 16 }} />} />
        <StatCard label="CA facturé" value={fmtCurrency(factures.filter(f => f.montantTtc > 0).reduce((s, f) => s + f.montantTtc, 0))} color="#22c55e" icon={<Icons.TrendingUp style={{ width: 16, height: 16 }} />} />
        <StatCard label="Solde Wallet" value={fmtCurrency(walletBalance)} color="#8b5cf6" icon={<Icons.CreditCard style={{ width: 16, height: 16 }} />} />
        {isRegie && <StatCard label="Prestations" value={`${prestations.filter(p => p.status === 'VALIDER').length} / ${prestations.length}`} sub="validées" color="#14b8a6" icon={<Icons.Briefcase style={{ width: 16, height: 16 }} />} />}
        <StatCard label="Jours restants" value={daysLeft > 0 ? `${daysLeft} j` : 'Terminé'} color={daysLeft < 30 ? '#ef4444' : '#0d9394'} icon={<Icons.Calendar style={{ width: 16, height: 16 }} />} />
      </div>

      {/* Progress & info row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Project progress */}
        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>Progression du projet</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9394' }}>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>Début: {fmtDate(project.startDate)}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>Fin: {fmtDate(project.endDate)}</span>
          </div>
        </div>

        {/* Budget breakdown */}
        <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 10 }}>Répartition budget</span>
          {[
            { label: 'Facturé', value: factures.filter(f => f.montantTtc > 0).reduce((s, f) => s + f.montantTtc, 0), color: '#22c55e' },
            { label: 'Dépenses', value: depenses.reduce((s, d) => s + d.amount, 0), color: '#f59e0b' },
            { label: 'Charges sociales', value: chargesSociales.reduce((s, c) => s + c.montant, 0), color: '#8b5cf6' },
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

        {/* Activity feed */}
        <div style={{ flex: '1 1 240px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 10 }}>Activité récente</span>
          {[
            { icon: '✅', text: isRegie ? 'Prestation validée' : 'Commande validée', time: 'Il y a 2h', color: '#22c55e' },
            { icon: '📄', text: 'Nouvelle facture générée', time: 'Il y a 1j', color: '#0d9394' },
            { icon: '⏳', text: 'Dépense en attente', time: 'Il y a 3j', color: '#f59e0b' },
            { icon: '💬', text: 'Nouveau commentaire', time: 'Il y a 5j', color: '#8b5cf6' },
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
            { label: 'Validés', count: prestations.filter(p => p.status === 'VALIDER').length + factures.filter(f => f.status === 'VALIDER').length, color: '#22c55e' },
            { label: 'En traitement', count: prestations.filter(p => p.status === 'EN_TRAITEMENT').length + depenses.filter(d => d.status === 'EN_TRAITEMENT').length, color: '#f59e0b' },
            { label: 'Créés', count: prestations.filter(p => p.status === 'CREER').length, color: 'var(--text3)' },
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

  const renderPrestations = () => (
    <>
      <TableWrap headers={['Prestation', 'Consultant', 'Catégorie', 'Type', 'Montant', 'Date début', 'Date fin', 'Statut', 'Actions']} empty={filteredPrestations.length === 0}>
        {paged(filteredPrestations).map((p, i) => (
          <TdRow key={p.id} last={i === paged(filteredPrestations).length - 1}>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{p.name}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{p.consultant}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.65rem', fontWeight: 500, padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(13,147,148,0.1)', color: '#0d9394' }}>{p.type}</span></td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: p.typePartenaire === 'CLIENT' ? 'rgba(37,99,235,0.1)' : 'rgba(139,92,246,0.1)', color: p.typePartenaire === 'CLIENT' ? '#2563eb' : '#8b5cf6' }}>
                {p.typePartenaire === 'CLIENT' ? 'Client' : 'Fournisseur'}
              </span>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{fmtCurrency(p.montant)}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(p.dateDebut)}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(p.dateFin)}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(p.status)}</td>
            <td style={{ padding: '10px 12px', textAlign: 'center' }}><div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}><ActionBtn title="Voir" icon={<Icons.Eye style={{ width: 12, height: 12 }} />} /><ActionBtn title="Modifier" icon={<Icons.Settings style={{ width: 12, height: 12 }} />} /></div></td>
          </TdRow>
        ))}
      </TableWrap>
      <Pagination total={filteredPrestations.length} />
    </>
  );

  const renderDevis = () => (
    <>
      <TableWrap headers={['N° Devis', 'Type', 'Fournisseur/Client', 'Montant', 'Sold', 'Date devis', 'Date validation', 'Statut', 'Actions']} empty={filteredDevis.length === 0}>
        {paged(filteredDevis).map((d, i) => (
          <TdRow key={d.id} last={i === paged(filteredDevis).length - 1}>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{d.numero}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: d.typeOperation === 'VENTE' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: d.typeOperation === 'VENTE' ? '#16a34a' : '#dc2626' }}>{d.typeOperation === 'VENTE' ? 'Vente' : 'Achat'}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{d.fournisseur}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{fmtCurrency(d.amount)}</span></td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: d.sold === 0 ? '#22c55e' : d.sold < d.amount ? '#f59e0b' : '#ef4444' }}>
                {fmtCurrency(d.sold)}
              </span>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(d.dateDevis)}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: d.dateValidation ? 'var(--text2)' : 'var(--text3)' }}>{d.dateValidation ? fmtDate(d.dateValidation) : '—'}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(d.status)}</td>
            <td style={{ padding: '10px 12px', textAlign: 'center' }}><div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}><ActionBtn title="Voir" icon={<Icons.Eye style={{ width: 12, height: 12 }} />} /><ActionBtn title="Supprimer" icon={<Icons.Trash style={{ width: 12, height: 12 }} />} /></div></td>
          </TdRow>
        ))}
      </TableWrap>
      <Pagination total={filteredDevis.length} />
    </>
  );

  const renderFactures = () => (
    <>
      <TableWrap headers={['N° Facture', 'Type', 'Partenaire', 'Montant TTC', 'Date', 'Statut', 'Paiement', 'Actions']} empty={filteredFactures.length === 0}>
        {paged(filteredFactures).map((f, i) => (
          <TdRow key={f.id} last={i === paged(filteredFactures).length - 1}>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{f.numeroFacture}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: f.typeFacture.includes('ACHAT') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: f.typeFacture.includes('ACHAT') ? '#ef4444' : '#22c55e' }}>{f.typeFacture.replace('FACTURE_', '')}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{f.partnerName}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: f.montantTtc < 0 ? '#ef4444' : '#22c55e' }}>{fmtCurrency(f.montantTtc)}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(f.dateFacture)}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(f.status)}</td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(f.statusPayement)}</td>
            <td style={{ padding: '10px 12px', textAlign: 'center' }}><ActionBtn title="Voir" icon={<Icons.Eye style={{ width: 12, height: 12 }} />} /></td>
          </TdRow>
        ))}
      </TableWrap>
      <Pagination total={filteredFactures.length} />
    </>
  );

  const renderCommandes = () => (
    <>
      <TableWrap headers={['N° Commande', 'Type', 'Fournisseur/Client', 'Montant', 'Sold', 'Date commande', 'Date livraison', 'Statut', 'Actions']} empty={filteredCommandes.length === 0}>
        {paged(filteredCommandes).map((c, i) => (
          <TdRow key={c.id} last={i === paged(filteredCommandes).length - 1}>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{c.numero}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: c.typeOperation === 'VENTE' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: c.typeOperation === 'VENTE' ? '#16a34a' : '#dc2626' }}>{c.typeOperation === 'VENTE' ? 'Vente' : 'Achat'}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{c.fournisseur}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{fmtCurrency(c.amount)}</span></td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c.sold === 0 ? '#22c55e' : c.sold < c.amount ? '#f59e0b' : '#ef4444' }}>
                {fmtCurrency(c.sold)}
              </span>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(c.dateCommande)}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(c.dateLivraison)}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(c.status)}</td>
            <td style={{ padding: '10px 12px', textAlign: 'center' }}><div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}><ActionBtn title="Voir" icon={<Icons.Eye style={{ width: 12, height: 12 }} />} /><ActionBtn title="Supprimer" icon={<Icons.Trash style={{ width: 12, height: 12 }} />} /></div></td>
          </TdRow>
        ))}
      </TableWrap>
      <Pagination total={filteredCommandes.length} />
    </>
  );

  const renderFournisseurs = () => (
    <>
      <TableWrap headers={['Fournisseur', 'Contact', 'Email', 'Téléphone', 'Pays/Ville', 'Catégorie', 'ICE/SIRET', 'Statut', 'Actions']} empty={filteredFournisseurs.length === 0}>
        {paged(filteredFournisseurs).map((f, i) => (
          <tr key={f.id}
            onClick={() => setSelectedFournisseur(f)}
            style={{ borderBottom: i === paged(filteredFournisseurs).length - 1 ? 'none' : '1px solid var(--bg2)', cursor: 'pointer', transition: 'background 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <td style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Building2 style={{ width: 13, height: 13, color: '#0d9394' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)', display: 'block' }}>{f.name}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{f.formeJuridique}</span>
                </div>
              </div>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{f.contactName}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{f.contactEmail}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{f.contactPhone}</span></td>
            <td style={{ padding: '10px 12px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: 'var(--text2)' }}>{f.pays}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text3)', display: 'block' }}>{f.city}</span>
              </div>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>{f.categorie}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.65rem', color: 'var(--text2)', fontFamily: 'monospace' }}>{f.ice}</span></td>
            <td style={{ padding: '10px 12px' }}>
              {(() => {
                const sm: Record<string, { label: string; bg: string; color: string }> = {
                  ACTIF: { label: 'Actif', bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
                  INACTIF: { label: 'Inactif', bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)' },
                  EN_ATTENTE: { label: 'En attente', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
                };
                const s = sm[f.status] || sm.EN_ATTENTE;
                return <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
              })()}
            </td>
            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
              <button onClick={e => { e.stopPropagation(); setSelectedFournisseur(f); }} title="Voir" style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                <Icons.Eye style={{ width: 12, height: 12 }} />
              </button>
            </td>
          </tr>
        ))}
      </TableWrap>
      <Pagination total={filteredFournisseurs.length} />
    </>
  );

  const renderChargeSociale = () => (
    <>
      <TableWrap headers={['Consultant', 'Type', 'Montant', 'Période', 'Statut', 'Paiement', 'Actions']} empty={filteredCS.length === 0}>
        {paged(filteredCS).map((c, i) => (
          <TdRow key={c.id} last={i === paged(filteredCS).length - 1}>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{c.nameConsultant}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(245,158,11,0.1)', color: '#d97706' }}>{c.typeChargeSocial.replace('_', ' ')}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{fmtCurrency(c.montant)}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{c.periode}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(c.status)}</td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(c.statusPayement)}</td>
            <td style={{ padding: '10px 12px', textAlign: 'center' }}><ActionBtn title="Voir" icon={<Icons.Eye style={{ width: 12, height: 12 }} />} /></td>
          </TdRow>
        ))}
      </TableWrap>
      <Pagination total={filteredCS.length} />
    </>
  );

  const renderCra = () => (
    <>
      <TableWrap headers={['Consultant', 'Jours travail', 'Présence', 'Absence', 'Taux', 'Période', 'Statut', 'Actions']} empty={filteredCras.length === 0}>
        {paged(filteredCras).map((c, i) => (
          <TdRow key={c.id} last={i === paged(filteredCras).length - 1}>
            <td style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.User style={{ width: 13, height: 13, color: '#0d9394' }} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{c.consultantName}</span>
              </div>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{c.nbrJourTravail} j</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#22c55e' }}>{c.nbrJourPresence} j</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: c.nbrJourAbsence > 2 ? '#ef4444' : 'var(--text2)' }}>{c.nbrJourAbsence} j</span></td>
            <td style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ProgressBar value={Math.round(c.nbrJourPresence / c.nbrJourTravail * 100)} />
                <span style={{ fontSize: '0.6rem', color: 'var(--text2)', minWidth: 30 }}>{Math.round(c.nbrJourPresence / c.nbrJourTravail * 100)}%</span>
              </div>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{c.periode}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(c.status)}</td>
            <td style={{ padding: '10px 12px', textAlign: 'center' }}><ActionBtn title="Voir" icon={<Icons.Eye style={{ width: 12, height: 12 }} />} /></td>
          </TdRow>
        ))}
      </TableWrap>
      <Pagination total={filteredCras.length} />
    </>
  );

  const renderFichiers = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
      {fichiers.map(f => (
        <div key={f.id} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 28, textAlign: 'center' }}>{getFileIcon(f.fileType)}</div>
          <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)', textAlign: 'center', wordBreak: 'break-all' }}>{f.fileName}{f.fileType}</p>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text3)', textAlign: 'center' }}>{f.size} · {fmtDate(f.uploadDate)}</p>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text3)', textAlign: 'center' }}>Par {f.uploadedBy}</p>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            <button style={{ flex: 1, fontSize: '0.65rem', padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)', backgroundColor: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Icons.Eye style={{ width: 11, height: 11 }} /> Voir
            </button>
            <button style={{ flex: 1, fontSize: '0.65rem', padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)', backgroundColor: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Icons.Download style={{ width: 11, height: 11 }} /> DL
            </button>
          </div>
        </div>
      ))}
      {/* Add file card */}
      <div style={{ backgroundColor: 'transparent', border: '2px dashed var(--border)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 160 }}>
        <Icons.Plus style={{ width: 24, height: 24, color: 'var(--text3)' }} />
        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text3)', textAlign: 'center' }}>Ajouter un fichier</p>
      </div>
    </div>
  );

  const renderWallet = () => {
    const credit = walletTxs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const debit = walletTxs.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Balance cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px', backgroundColor: 'var(--bg)', border: '1px solid rgba(13,147,148,0.3)', borderRadius: 8, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text3)' }}>Solde actuel</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 700, color: walletBalance >= 0 ? '#22c55e' : '#ef4444' }}>{fmtCurrency(walletBalance)}</p>
          </div>
          <div style={{ flex: '1 1 140px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text3)' }}>Entrées</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>+{fmtCurrency(credit)}</p>
          </div>
          <div style={{ flex: '1 1 140px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text3)' }}>Sorties</p>
            <p style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>-{fmtCurrency(debit)}</p>
          </div>
        </div>
        {/* Transactions */}
        <TableWrap headers={['Description', 'Montant', 'Date', 'Type', 'Statut']}>
          {walletTxs.map((t, i) => (
            <TdRow key={t.id} last={i === walletTxs.length - 1}>
              <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text)' }}>{t.description}</span></td>
              <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 700, color: t.type === 'credit' ? '#22c55e' : '#ef4444' }}>{t.type === 'credit' ? '+' : ''}{fmtCurrency(t.amount)}</span></td>
              <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(t.date)}</span></td>
              <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: t.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: t.type === 'credit' ? '#22c55e' : '#ef4444' }}>{t.type === 'credit' ? 'Crédit' : 'Débit'}</span></td>
              <td style={{ padding: '10px 12px' }}>{statusBadge(t.status)}</td>
            </TdRow>
          ))}
        </TableWrap>
      </div>
    );
  };

  const renderCommentaires = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#0d9394', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 11 }}>M</span>
        </div>
        <input
          type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
          placeholder="Ajouter un commentaire..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '0.72rem', outline: 'none' }}
        />
        <button onClick={handleAddComment} disabled={!commentInput.trim()}
          style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: commentInput.trim() ? 'pointer' : 'default', backgroundColor: commentInput.trim() ? '#0d9394' : 'var(--bg2)', color: commentInput.trim() ? 'white' : 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icons.Send style={{ width: 14, height: 14 }} />
        </button>
      </div>
      {/* Comment list */}
      {comments.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: 'rgba(13,147,148,0.1)', border: '1px solid rgba(13,147,148,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9394' }}>{c.username.charAt(0).toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0 8px 8px 8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{c.username}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{c.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.5 }}>{c.commentaire}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    const key = currentTabKey;
    if (loading) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(5)].map((_, i) => <Skel key={i} w="100%" h={44} r={6} />)}
      </div>
    );
    if (key === 'analytics') return renderAnalytics();
    if (key === 'prestations') return renderPrestations();
    if (key === 'devis') return renderDevis();
    if (key === 'factures') return renderFactures();
    if (key === 'commandes') return renderCommandes();
    if (key === 'fournisseurs') return renderFournisseurs();
    if (key === 'chargesociale') return renderChargeSociale();
    if (key === 'cra') return renderCra();
    if (key === 'fichiers') return renderFichiers();
    if (key === 'wallet') return renderWallet();
    if (key === 'commentaires') return renderCommentaires();
    return null;
  };

  const hasSearch = ['prestations', 'devis', 'factures', 'commandes', 'fournisseurs', 'chargesociale', 'cra'].includes(currentTabKey);

  return (
    <>
      <style>{`
        @keyframes od-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes od-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        @keyframes od-dot1 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        @keyframes od-dot2 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} animation-delay: 0.16s; }
        @keyframes od-dot3 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} animation-delay: 0.32s; }
        .od-dot1 { animation: od-dot1 1.2s infinite ease-in-out; animation-delay: 0s; }
        .od-dot2 { animation: od-dot1 1.2s infinite ease-in-out; animation-delay: 0.16s; }
        .od-dot3 { animation: od-dot1 1.2s infinite ease-in-out; animation-delay: 0.32s; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ flexShrink: 0, padding: '0 16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 12, height: 52 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: typeMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.Briefcase style={{ width: 15, height: 15, color: typeMeta.color }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 3, backgroundColor: typeMeta.bg, color: typeMeta.color, fontWeight: 600 }}>{typeMeta.label}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>·</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{statusMeta[project.status] || project.status}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>·</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{fmtCurrency(project.budget)}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, backgroundColor: 'rgba(13,147,148,0.1)', color: '#0d9394', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icons.Sparkles style={{ width: 10, height: 10 }} /> Sofia IA
            </span>
            <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, color: 'var(--text2)' }}>
              <Icons.X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ flexShrink: 0, display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg2)', overflowX: 'auto' }} className="no-scrollbar">
          {TABS.map((tab, idx) => (
            <button key={tab.key} onClick={() => { setActiveTab(idx); setPage(0); setSearchQuery(''); }}
              style={{ flexShrink: 0, padding: '10px 14px', fontSize: '0.7rem', fontWeight: activeTab === idx ? 600 : 500, color: activeTab === idx ? '#0d9394' : 'var(--text2)', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === idx ? '2px solid #0d9394' : '2px solid transparent', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {/* Search bar (for applicable tabs) */}
          {hasSearch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', flex: 1, maxWidth: 320 }}>
                <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..."
                  style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.7rem', color: 'var(--text)', width: '100%' }} />
                {searchQuery && <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 0 }}><Icons.X style={{ width: 12, height: 12 }} /></button>}
              </div>
            </div>
          )}

          {/* AI Insight */}
          {!loading && <AiInsight tabKey={currentTabKey} active={true} />}

          {/* Tab content */}
          {renderTabContent()}
        </div>
      </div>

      {/* ── Fournisseur Detail Popup ── */}
      {selectedFournisseur && (() => {
        const f = selectedFournisseur;
        const sm: Record<string, { label: string; bg: string; color: string; border: string }> = {
          ACTIF: { label: 'Actif', bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
          INACTIF: { label: 'Inactif', bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
          EN_ATTENTE: { label: 'En attente', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
        };
        const s = sm[f.status] || sm.EN_ATTENTE;
        const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d9394', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>{children}</div>
          </div>
        );
        const Field = ({ label, value, mono }: { label: string; value?: string; mono?: boolean }) => (
          <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 6, padding: '10px 12px' }}>
            <p style={{ margin: 0, fontSize: '0.58rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{label}</p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: value ? 'var(--text)' : 'var(--text3)', fontWeight: value ? 500 : 400, fontFamily: mono ? 'monospace' : undefined }}>{value || '—'}</p>
          </div>
        );
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 }}
            onClick={() => setSelectedFournisseur(null)}>
            <div style={{ backgroundColor: 'var(--bg)', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', width: '100%', maxWidth: 780, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Building2 style={{ width: 20, height: 20, color: '#0d9394' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{f.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>{f.formeJuridique}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>·</span>
                    <span style={{ fontSize: '0.62rem', padding: '1px 7px', borderRadius: 4, backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb', fontWeight: 600 }}>{f.categorie}</span>
                    <span style={{ fontSize: '0.62rem', padding: '1px 7px', borderRadius: 4, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 600 }}>{s.label}</span>
                  </div>
                </div>
                {f.website && (
                  <a href={f.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    style={{ fontSize: '0.65rem', color: '#0d9394', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(13,147,148,0.3)', backgroundColor: 'rgba(13,147,148,0.05)' }}>
                    <Icons.Globe style={{ width: 11, height: 11 }} /> Site web
                  </a>
                )}
                <button onClick={() => setSelectedFournisseur(null)}
                  style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)', flexShrink: 0 }}>
                  <Icons.X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                <Section title="Informations générales">
                  <Field label="Raison sociale" value={f.name} />
                  <Field label="Forme juridique" value={f.formeJuridique} />
                  <Field label="Capital" value={f.capital} />
                  <Field label="Date de création" value={f.dateCreation ? fmtDate(f.dateCreation) : undefined} />
                  <Field label="Catégorie" value={f.categorie} />
                  <Field label="Statut" value={s.label} />
                </Section>

                <Section title="Identité légale">
                  <Field label="ICE / SIRET" value={f.ice} mono />
                  <Field label="TVA Intracommunautaire" value={f.tvaIntracom} mono />
                </Section>

                <Section title="Localisation">
                  <Field label="Adresse" value={f.adresse} />
                  <Field label="Code postal" value={f.codePostal} />
                  <Field label="Ville" value={f.city} />
                  <Field label="Pays" value={f.pays} />
                </Section>

                <Section title="Contact">
                  <Field label="Nom du contact" value={f.contactName} />
                  <Field label="Email" value={f.contactEmail} />
                  <Field label="Téléphone" value={f.contactPhone} />
                  <Field label="Site web" value={f.website} />
                </Section>

                {f.notes && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d9394', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</span>
                      <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
                    </div>
                    <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 6, padding: '12px 14px' }}>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.6 }}>{f.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};
