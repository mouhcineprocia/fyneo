import type { Dossier, OnbDocument, Contrat, PriorityItem, AgentAlert, TimelineEvent, TodayActivity, Salarie } from './types';

export const mockDossiers: Dossier[] = [
  { id: 'd1', nom: 'Acme Corp', type: 'CLIENT', status: 'EN_COURS', progression: 65, dateCreation: '2025-01-10', responsable: 'Alice Martin', contact: 'Thomas Bernard', email: 'thomas.bernard@acme.com', telephone: '+212 6 12 34 56 78', pays: 'Maroc', ville: 'Casablanca', adresse: '45 Boulevard Zerktouni, Maarif', categorie: 'Grand compte', iceSiret: 'ICE 001234567000089', secteur: 'Industrie', siteWeb: 'www.acmecorp.ma', chiffreAffaires: '12 M€', effectif: '250', formeJuridique: 'SA', dateRelation: '2023-06-01', notes: 'Client stratégique — suivi hebdomadaire requis.', tags: ['VIP', 'Prioritaire'] },
  { id: 'd4', nom: 'Global Services', type: 'CLIENT', status: 'EN_COURS', progression: 80, dateCreation: '2024-12-20', responsable: 'David Renaud', contact: 'Nadia Fikri', email: 'nadia.fikri@globalservices.ma', telephone: '+212 5 22 98 76 54', pays: 'Maroc', ville: 'Rabat', adresse: '12 Rue Ibn Battuta, Agdal', categorie: 'PME', iceSiret: 'ICE 002345678000012', secteur: 'Services', siteWeb: 'www.globalservices.ma', chiffreAffaires: '4,5 M€', effectif: '80', formeJuridique: 'SARL', dateRelation: '2024-01-15', notes: 'Contrat commercial en cours de finalisation.', tags: ['En cours'] },
  { id: 'd6', nom: 'Nexify Digital', type: 'CLIENT', status: 'COMPLETE', progression: 100, dateCreation: '2024-11-05', responsable: 'Alice Martin', contact: 'Yassine El Amrani', email: 'yassine@nexify.ma', telephone: '+212 6 55 44 33 22', pays: 'Maroc', ville: 'Marrakech', adresse: '8 Rue de la Liberté, Guéliz', categorie: 'Start-up', iceSiret: 'ICE 003456789000034', secteur: 'Tech / Digital', siteWeb: 'www.nexify.ma', chiffreAffaires: '800 K€', effectif: '20', formeJuridique: 'SARLAU', dateRelation: '2024-11-05', notes: 'Onboarding complété. Très réactif.', tags: ['Digital', 'Complété'] },
  { id: 'd7', nom: 'Pharma Plus', type: 'CLIENT', status: 'EN_ATTENTE', progression: 40, dateCreation: '2025-01-18', responsable: 'Carol Lemaire', contact: 'Dr. Leila Mansouri', email: 'l.mansouri@pharmaplus.ma', telephone: '+212 5 37 11 22 33', pays: 'Maroc', ville: 'Fès', adresse: '3 Avenue Hassan II', categorie: 'Industrie Pharma', iceSiret: 'ICE 004567890000056', secteur: 'Santé', siteWeb: 'www.pharmaplus.ma', chiffreAffaires: '7,2 M€', effectif: '130', formeJuridique: 'SA', dateRelation: '2025-01-18', notes: 'Attente validation direction juridique.', tags: ['Santé'] },
  { id: 'd3', nom: 'Tech Supplies SAS', type: 'FOURNISSEUR', status: 'EN_ATTENTE', progression: 30, dateCreation: '2025-01-12', responsable: 'Carol Lemaire', contact: 'Omar Benali', email: 'omar.benali@techsupplies.fr', telephone: '+33 1 45 67 89 10', pays: 'France', ville: 'Paris', adresse: '22 Rue de Rivoli, 75001', categorie: 'Matériaux & équipements', iceSiret: 'SIRET 12345678900001', secteur: 'IT / Équipement', siteWeb: 'www.techsupplies.fr', chiffreAffaires: '3 M€', effectif: '45', formeJuridique: 'SAS', dateRelation: '2024-10-01', notes: 'IBAN en attente de soumission.', tags: ['France'] },
  { id: 'd8', nom: 'Immo Pro SAS', type: 'FOURNISSEUR', status: 'COMPLETE', progression: 100, dateCreation: '2024-09-15', responsable: 'Bob Dupont', contact: 'Claire Fontaine', email: 'c.fontaine@immopro.fr', telephone: '+33 4 78 90 12 34', pays: 'France', ville: 'Lyon', adresse: '10 Place Bellecour, 69002', categorie: 'Immobilier & logistique', iceSiret: 'SIRET 98765432100002', secteur: 'Immobilier', siteWeb: 'www.immopro.fr', chiffreAffaires: '8 M€', effectif: '60', formeJuridique: 'SAS', dateRelation: '2024-09-15', notes: 'Partenaire de confiance depuis 2022.', tags: ['Complété', 'Confiance'] },
  { id: 'd9', nom: 'Logistix Maroc', type: 'FOURNISSEUR', status: 'REJETE', progression: 55, dateCreation: '2025-01-02', responsable: 'Emma Petit', contact: 'Hassan Ouali', email: 'h.ouali@logistix.ma', telephone: '+212 6 77 88 99 00', pays: 'Maroc', ville: 'Tanger', adresse: '5 Zone Franche, Port de Tanger Med', categorie: 'Transport & Logistique', iceSiret: 'ICE 005678901000078', secteur: 'Logistique', siteWeb: 'www.logistix.ma', chiffreAffaires: '2,1 M€', effectif: '35', formeJuridique: 'SARL', dateRelation: '2025-01-02', notes: 'Dossier rejeté — non-conformité documents.', tags: ['Rejeté'] },
  { id: 'd2', nom: 'Jean Dupont', type: 'CONTACT', status: 'COMPLETE', progression: 100, dateCreation: '2025-01-05', responsable: 'Bob Dupont', contact: 'Jean Dupont', email: 'jean.dupont@email.com', telephone: '+33 6 12 34 56 78', pays: 'France', ville: 'Paris', adresse: '15 Rue Victor Hugo, 75016', categorie: 'Décideur', iceSiret: '—', secteur: 'Finance', siteWeb: 'linkedin.com/in/jeandupont', chiffreAffaires: '—', effectif: '—', formeJuridique: 'Particulier', dateRelation: '2024-06-10', notes: 'Contact clé chez Acme Corp. Très influent.', tags: ['VIP', 'Finance'] },
  { id: 'd5', nom: 'Marie Curie', type: 'CONTACT', status: 'REJETE', progression: 45, dateCreation: '2024-12-15', responsable: 'Emma Petit', contact: 'Marie Curie', email: 'marie.curie@outlook.com', telephone: '+33 7 98 76 54 32', pays: 'France', ville: 'Bordeaux', adresse: '7 Allées des Chartrons', categorie: 'Prescripteur', iceSiret: '—', secteur: 'Santé', siteWeb: '—', chiffreAffaires: '—', effectif: '—', formeJuridique: 'Particulier', dateRelation: '2024-12-01', notes: 'Justificatif de domicile expiré — dossier bloqué.', tags: ['Santé'] },
  { id: 'd10', nom: 'Karim Alaoui', type: 'CONTACT', status: 'EN_COURS', progression: 70, dateCreation: '2025-01-20', responsable: 'Alice Martin', contact: 'Karim Alaoui', email: 'k.alaoui@gmail.com', telephone: '+212 6 33 44 55 66', pays: 'Maroc', ville: 'Casablanca', adresse: '30 Rue Mustapha El Maani', categorie: 'Partenaire', iceSiret: '—', secteur: 'Conseil', siteWeb: 'linkedin.com/in/kbf-alaoui', chiffreAffaires: '—', effectif: '—', formeJuridique: 'Particulier', dateRelation: '2025-01-20', notes: 'Mise en relation via réseau alumni.', tags: ['Conseil', 'Réseau'] },
];

export const mockDocuments: OnbDocument[] = [
  { id: 'doc1', dossierId: 'd1', nom: 'Extrait Kbis', categorie: 'KYC', status: 'VALIDER', dateUpload: '2025-01-11', obligatoire: true },
  { id: 'doc2', dossierId: 'd1', nom: "Pièce d'identité dirigeant", categorie: 'KYC', status: 'VALIDER', dateUpload: '2025-01-11', obligatoire: true },
  { id: 'doc3', dossierId: 'd1', nom: 'Relevé bancaire 3 mois', categorie: 'Financier', status: 'EN_ATTENTE', dateUpload: '', obligatoire: true },
  { id: 'doc4', dossierId: 'd1', nom: 'Statuts société', categorie: 'Juridique', status: 'VALIDER', dateUpload: '2025-01-12', obligatoire: false },
  { id: 'doc5', dossierId: 'd1', nom: 'Déclaration fiscale N-1', categorie: 'Financier', status: 'MANQUANT', dateUpload: '', obligatoire: true },
  { id: 'doc6', dossierId: 'd2', nom: "Pièce d'identité", categorie: 'KYC', status: 'VALIDER', dateUpload: '2025-01-06', obligatoire: true },
  { id: 'doc7', dossierId: 'd2', nom: 'Fiche de renseignements', categorie: 'Commercial', status: 'VALIDER', dateUpload: '2025-01-06', obligatoire: true },
  { id: 'doc8', dossierId: 'd2', nom: 'Accord de confidentialité', categorie: 'Juridique', status: 'VALIDER', dateUpload: '2025-01-07', obligatoire: true },
  { id: 'doc9', dossierId: 'd3', nom: 'IBAN fournisseur', categorie: 'Financier', status: 'EN_ATTENTE', dateUpload: '', obligatoire: true },
  { id: 'doc10', dossierId: 'd3', nom: 'Extrait Kbis', categorie: 'KYC', status: 'VALIDER', dateUpload: '2025-01-13', obligatoire: true },
  { id: 'doc11', dossierId: 'd4', nom: 'Bon de commande client', categorie: 'Commercial', status: 'VALIDER', dateUpload: '2024-12-21', obligatoire: true },
  { id: 'doc12', dossierId: 'd4', nom: 'Garanties bancaires', categorie: 'Financier', status: 'EN_ATTENTE', dateUpload: '', obligatoire: false },
  { id: 'doc13', dossierId: 'd5', nom: "Pièce d'identité", categorie: 'KYC', status: 'VALIDER', dateUpload: '2024-12-16', obligatoire: true },
  { id: 'doc14', dossierId: 'd5', nom: 'Justificatif de domicile', categorie: 'KYC', status: 'REJETE', dateUpload: '2024-12-16', obligatoire: true },
  { id: 'doc15', dossierId: 'd6', nom: 'Extrait Kbis', categorie: 'KYC', status: 'VALIDER', dateUpload: '2024-11-06', obligatoire: true },
  { id: 'doc16', dossierId: 'd6', nom: 'Contrat signé', categorie: 'Juridique', status: 'VALIDER', dateUpload: '2024-11-08', obligatoire: true },
  { id: 'doc17', dossierId: 'd7', nom: 'Extrait Kbis', categorie: 'KYC', status: 'VALIDER', dateUpload: '2025-01-19', obligatoire: true },
  { id: 'doc18', dossierId: 'd7', nom: 'Autorisation DG', categorie: 'Juridique', status: 'EN_ATTENTE', dateUpload: '', obligatoire: true },
  { id: 'doc19', dossierId: 'd8', nom: 'Extrait Kbis', categorie: 'KYC', status: 'VALIDER', dateUpload: '2024-09-16', obligatoire: true },
  { id: 'doc20', dossierId: 'd8', nom: 'Contrat cadre fournisseur', categorie: 'Juridique', status: 'VALIDER', dateUpload: '2024-09-20', obligatoire: true },
  { id: 'doc21', dossierId: 'd9', nom: 'Extrait Kbis', categorie: 'KYC', status: 'VALIDER', dateUpload: '2025-01-03', obligatoire: true },
  { id: 'doc22', dossierId: 'd9', nom: 'Attestation fiscale', categorie: 'Financier', status: 'REJETE', dateUpload: '2025-01-04', obligatoire: true },
  { id: 'doc23', dossierId: 'd10', nom: "Pièce d'identité", categorie: 'KYC', status: 'VALIDER', dateUpload: '2025-01-21', obligatoire: true },
  { id: 'doc24', dossierId: 'd10', nom: 'Accord de confidentialité', categorie: 'Juridique', status: 'EN_ATTENTE', dateUpload: '', obligatoire: true },
];

export const mockContrats: Contrat[] = [
  { id: 'ct1', dossierId: 'd1', numero: 'CTR-2025-001', type: 'Contrat cadre', dateDebut: '2025-02-01', dateFin: '2026-01-31', montant: 120000, status: 'EN_ATTENTE_SIGNATURE' },
  { id: 'ct2', dossierId: 'd2', numero: 'CTR-2025-002', type: 'Accord de partenariat', dateDebut: '2025-01-15', dateFin: '2025-12-31', montant: 15000, status: 'SIGNE' },
  { id: 'ct3', dossierId: 'd4', numero: 'CTR-2025-003', type: 'Contrat commercial', dateDebut: '2025-01-01', dateFin: '2025-12-31', montant: 85000, status: 'SIGNE' },
  { id: 'ct4', dossierId: 'd3', numero: 'CTR-2024-012', type: 'Contrat fournisseur', dateDebut: '2024-12-01', dateFin: '2025-11-30', montant: 30000, status: 'BROUILLON' },
  { id: 'ct5', dossierId: 'd6', numero: 'CTR-2024-009', type: 'Contrat annuel', dateDebut: '2024-11-10', dateFin: '2025-11-09', montant: 48000, status: 'SIGNE' },
  { id: 'ct6', dossierId: 'd8', numero: 'CTR-2024-005', type: 'Contrat cadre fournisseur', dateDebut: '2024-09-20', dateFin: '2026-09-19', montant: 95000, status: 'SIGNE' },
];

export const mockSalaries: Salarie[] = [
  { id: 's1', nom: 'Martin',  prenom: 'Alice',  poste: 'Responsable Comptabilité', departement: 'Finance',    contratType: 'CDI',      dateEmbauche: '2022-03-01', salaireBrut: 42000, cnss: 'CNSS-001234', email: 'a.martin@mister.ma',  telephone: '+212 6 11 22 33 44', status: 'ACTIF',            progression: 100, responsable: 'Direction'    },
  { id: 's2', nom: 'Dupont',  prenom: 'Bob',    poste: 'Chargé de clientèle',      departement: 'Commercial', contratType: 'CDI',      dateEmbauche: '2021-09-15', salaireBrut: 35000, cnss: 'CNSS-001235', email: 'b.dupont@mister.ma',  telephone: '+212 6 22 33 44 55', status: 'ACTIF',            progression: 100, responsable: 'Alice Martin' },
  { id: 's3', nom: 'Lemaire', prenom: 'Carol',  poste: 'Assistante Administrative', departement: 'RH',        contratType: 'CDD',      dateEmbauche: '2024-11-01', salaireBrut: 28000, cnss: 'CNSS-001236', email: 'c.lemaire@mister.ma', telephone: '+212 6 33 44 55 66', status: 'EN_PERIODE_ESSAI', progression: 60,  responsable: 'Alice Martin' },
  { id: 's4', nom: 'Renaud',  prenom: 'David',  poste: 'Développeur Full Stack',   departement: 'IT',         contratType: 'CDI',      dateEmbauche: '2023-06-10', salaireBrut: 55000, cnss: 'CNSS-001237', email: 'd.renaud@mister.ma',  telephone: '+212 6 44 55 66 77', status: 'ACTIF',            progression: 100, responsable: 'Direction'    },
  { id: 's5', nom: 'Petit',   prenom: 'Emma',   poste: 'Stagiaire Marketing',      departement: 'Marketing',  contratType: 'STAGE',    dateEmbauche: '2025-01-06', salaireBrut: 6000,  cnss: '—',           email: 'e.petit@mister.ma',  telephone: '+212 6 55 66 77 88', status: 'EN_PERIODE_ESSAI', progression: 35,  responsable: 'Bob Dupont'  },
  { id: 's6', nom: 'Ouali',   prenom: 'Fatima', poste: 'Consultante RH',           departement: 'RH',         contratType: 'FREELANCE', dateEmbauche: '2024-07-01', salaireBrut: 0,     cnss: '—',           email: 'f.ouali@gmail.com',  telephone: '+212 6 66 77 88 99', status: 'ACTIF',            progression: 100, responsable: 'Direction'    },
];

export const mockPriorities: PriorityItem[] = [
  { id: 'p1', title: 'Signature contrat Acme Corp', description: 'CTR-2025-001 en attente de signature depuis 3 jours. Deadline approche.', urgency: 'haute', actionType: 'signature', dossier: 'Acme Corp', deadline: '2025-02-05' },
  { id: 'p2', title: 'Valider relevé bancaire', description: 'Acme Corp a soumis un relevé bancaire — validation humaine requise avant traitement.', urgency: 'haute', actionType: 'validation', dossier: 'Acme Corp', deadline: '2025-01-28' },
  { id: 'p3', title: 'Relancer Tech Supplies SAS', description: "IBAN fournisseur manquant depuis 5 jours. Aucune réponse à l'email automatique.", urgency: 'moyenne', actionType: 'relance', dossier: 'Tech Supplies SAS', deadline: '2025-01-30' },
  { id: 'p4', title: 'Vérifier statut Pharma Plus', description: "Autorisation DG non soumise. Direction juridique à contacter directement.", urgency: 'moyenne', actionType: 'verification', dossier: 'Pharma Plus', deadline: '2025-02-01' },
  { id: 'p5', title: 'Rouvrir dossier Marie Curie', description: 'Justificatif de domicile expiré. Demander un nouveau document au contact.', urgency: 'basse', actionType: 'relance', dossier: 'Marie Curie', deadline: '2025-02-10' },
];

export const mockAlerts: AgentAlert[] = [
  { id: 'a1', type: 'error', title: 'Document rejeté automatiquement', message: "L'attestation fiscale de Logistix Maroc ne correspond pas au format attendu (PDF corrompu).", time: '09:14', dossier: 'Logistix Maroc' },
  { id: 'a2', type: 'error', title: 'Échec envoi email relance', message: "L'email de relance à Tech Supplies SAS a bounced — adresse invalide.", time: '08:52', dossier: 'Tech Supplies SAS' },
  { id: 'a3', type: 'warning', title: 'Contrat expirant sous 30 jours', message: 'CTR-2024-009 (Nexify Digital) expire le 09/11/2025. Renouvellement à planifier.', time: '08:30', dossier: 'Nexify Digital' },
  { id: 'a4', type: 'warning', title: 'Progression stagnante', message: "Pharma Plus est à 40% depuis 10 jours sans progression. Intervention recommandée.", time: '08:15', dossier: 'Pharma Plus' },
  { id: 'a5', type: 'success', title: 'Dossier complété', message: 'Nexify Digital — onboarding 100% validé. Contrat annuel actif.', time: '07:48', dossier: 'Nexify Digital' },
  { id: 'a6', type: 'success', title: 'Accord de partenariat signé', message: "Jean Dupont a signé l'accord de confidentialité CTR-2025-002.", time: '07:30', dossier: 'Jean Dupont' },
  { id: 'a7', type: 'info', title: 'Nouveau contact ajouté', message: 'Karim Alaoui (Contact — Conseil) a été ajouté et son onboarding est en cours à 70%.', time: '07:12', dossier: 'Karim Alaoui' },
  { id: 'a8', type: 'info', title: 'Analyse dossier terminée', message: 'Analyse KYC de Global Services complétée. 1 document en attente de validation humaine.', time: '06:55', dossier: 'Global Services' },
];

export const mockTimeline: TimelineEvent[] = [
  { id: 't1', time: '09:14', type: 'error',   title: 'Rejet doc Logistix',    description: 'Attestation fiscale corrompue — rejetée automatiquement.' },
  { id: 't2', time: '08:52', type: 'warning',  title: 'Email bounce détecté',  description: 'Relance Tech Supplies SAS en échec — adresse email invalide.' },
  { id: 't3', time: '08:30', type: 'action',   title: 'Analyse contrats',      description: '6 contrats analysés — 1 expiration détectée dans 30 jours.' },
  { id: 't4', time: '08:15', type: 'warning',  title: 'Alerte progression',    description: 'Pharma Plus stagnant à 40% depuis 10 jours.' },
  { id: 't5', time: '07:48', type: 'success',  title: 'Dossier validé',        description: 'Nexify Digital — onboarding complété à 100%.' },
  { id: 't6', time: '07:30', type: 'success',  title: 'Contrat signé',         description: 'Accord de partenariat Jean Dupont confirmé.' },
  { id: 't7', time: '07:12', type: 'action',   title: 'Nouveau contact',       description: 'Karim Alaoui créé et indexé dans la base.' },
  { id: 't8', time: '06:55', type: 'action',   title: 'Analyse KYC',           description: 'Global Services — analyse KYC terminée en 2 min 14 s.' },
  { id: 't9', time: '06:30', type: 'action',   title: 'Synchronisation',       description: '10 dossiers synchronisés avec le CRM central.' },
];

export const mockActivity: TodayActivity[] = [
  { id: 'act1', action: 'added',     entityType: 'CONTACT',     nom: 'Karim Alaoui',   time: '07:12' },
  { id: 'act2', action: 'completed', entityType: 'CLIENT',      nom: 'Nexify Digital',  time: '07:48' },
  { id: 'act3', action: 'modified',  entityType: 'CLIENT',      nom: 'Global Services', time: '06:55' },
  { id: 'act4', action: 'rejected',  entityType: 'FOURNISSEUR', nom: 'Logistix Maroc',  time: '09:14' },
  { id: 'act5', action: 'modified',  entityType: 'CLIENT',      nom: 'Acme Corp',       time: '08:10' },
];

export const SOFIA_MSGS: Record<string, string[]> = {
  default: [
    "Bonjour ! J'ai analysé 10 dossiers ce matin. 2 actions urgentes nécessitent votre validation.",
    "Je recommande de traiter en priorité la signature Acme Corp et le relevé bancaire en attente.",
  ],
};
