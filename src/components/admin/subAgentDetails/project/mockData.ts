import type { Prestation, Devis, Depense, Facture, Commande, Fournisseur, ChargeSociale, Cra, Fichier, WalletTransaction, Commentaire } from './types';

export const mkPrestations = (_pid: string): Prestation[] => [
  { id: 'pr1', name: 'Développement module paiement', consultant: 'Alice Martin', status: 'VALIDER', montant: 18000, dateDebut: '2024-01-02', dateFin: '2024-01-31', type: 'SERVICE', typePartenaire: 'CLIENT' },
  { id: 'pr2', name: 'Architecture Cloud', consultant: 'Bob Dupont', status: 'EN_TRAITEMENT', montant: 12500, dateDebut: '2024-02-01', dateFin: '2024-02-29', type: 'SERVICE', typePartenaire: 'CLIENT' },
  { id: 'pr3', name: 'Audit sécurité', consultant: 'Carol Lemaire', status: 'VALIDER', montant: 8400, dateDebut: '2024-02-05', dateFin: '2024-02-20', type: 'AUTRE', typePartenaire: 'FOURNISSEUR' },
  { id: 'pr4', name: 'Formation équipe DevOps', consultant: 'David Renaud', status: 'EN_TRAITEMENT', montant: 5600, dateDebut: '2024-03-04', dateFin: '2024-03-08', type: 'SERVICE', typePartenaire: 'FOURNISSEUR' },
  { id: 'pr5', name: 'Migration base de données', consultant: 'Emma Petit', status: 'CREER', montant: 9200, dateDebut: '2024-03-11', dateFin: '2024-03-29', type: 'SERVICE', typePartenaire: 'CLIENT' },
  { id: 'pr6', name: 'Intégration API tierce', consultant: 'François Bernard', status: 'VALIDER', montant: 7800, dateDebut: '2024-04-01', dateFin: '2024-04-30', type: 'SERVICE', typePartenaire: 'CLIENT' },
];

export const mkDevis = (): Devis[] => [
  { id: 'dv1', numero: 'DEV-2024-001', typeOperation: 'VENTE', status: 'VALIDER', amount: 22000, sold: 0, fournisseur: 'Acme Corp', dateDevis: '2024-01-08', dateValidation: '2024-01-15' },
  { id: 'dv2', numero: 'DEV-2024-002', typeOperation: 'ACHAT', status: 'EN_TRAITEMENT', amount: 5800, sold: 5800, fournisseur: 'Tech Supplies SAS', dateDevis: '2024-02-05', dateValidation: '' },
  { id: 'dv3', numero: 'DEV-2024-003', typeOperation: 'VENTE', status: 'CREER', amount: 11500, sold: 11500, fournisseur: 'Cloud Services Ltd', dateDevis: '2024-02-18', dateValidation: '' },
  { id: 'dv4', numero: 'DEV-2024-004', typeOperation: 'ACHAT', status: 'VALIDER', amount: 3200, sold: 1600, fournisseur: 'Hardware Pro', dateDevis: '2024-03-02', dateValidation: '2024-03-10' },
];

export const mkDepenses = (): Depense[] => [
  { id: 'd1', description: 'Déplacement client Paris', nature: 'Transport', amount: 320, dateDepense: '2024-01-15', status: 'VALIDER', consultant: 'Alice Martin' },
  { id: 'd2', description: 'Hébergement séminaire', nature: 'Hébergement', amount: 480, dateDepense: '2024-01-20', status: 'EN_TRAITEMENT', consultant: 'Bob Dupont' },
  { id: 'd3', description: 'Repas client', nature: 'Restauration', amount: 95, dateDepense: '2024-02-05', status: 'VALIDER', consultant: 'Carol Lemaire' },
  { id: 'd4', description: 'Achat matériel bureau', nature: 'Fournitures', amount: 780, dateDepense: '2024-02-12', status: 'VALIDER', consultant: 'David Renaud' },
  { id: 'd5', description: 'Formation certification AWS', nature: 'Formation', amount: 1200, dateDepense: '2024-03-01', status: 'EN_TRAITEMENT', consultant: 'Emma Petit' },
  { id: 'd6', description: 'Abonnement outil CI/CD', nature: 'Logiciel', amount: 299, dateDepense: '2024-03-10', status: 'VALIDER', consultant: 'François Bernard' },
];

export const mkFactures = (): Facture[] => [
  { id: 'f1', numeroFacture: 'FAC-2024-101', status: 'VALIDER', typeFacture: 'FACTURE_VENTE', partnerName: 'Acme Corp', montantTtc: 21600, dateFacture: '2024-01-31', statusPayement: 'PAYER' },
  { id: 'f2', numeroFacture: 'FAC-2024-102', status: 'EN_TRAITEMENT', typeFacture: 'FACTURE_VENTE', partnerName: 'Acme Corp', montantTtc: 15000, dateFacture: '2024-02-28', statusPayement: 'NON_PAYER' },
  { id: 'f3', numeroFacture: 'FAC-2024-103', status: 'VALIDER', typeFacture: 'FACTURE_ACHAT', partnerName: 'Tech Supplies SAS', montantTtc: -1440, dateFacture: '2024-02-15', statusPayement: 'PAYER' },
  { id: 'f4', numeroFacture: 'FAC-2024-104', status: 'EN_TRAITEMENT', typeFacture: 'FACTURE_VENTE', partnerName: 'Acme Corp', montantTtc: 11040, dateFacture: '2024-03-31', statusPayement: 'NON_PAYER' },
  { id: 'f5', numeroFacture: 'FAC-2024-105', status: 'VALIDER', typeFacture: 'FACTURE_ACHAT', partnerName: 'Office Depot', montantTtc: -576, dateFacture: '2024-03-20', statusPayement: 'PAYER' },
];

export const mkCommandes = (): Commande[] => [
  { id: 'co1', numero: 'BC-2024-001', typeBonCommande: 'SERVICE', typeOperation: 'VENTE', status: 'VALIDER', amount: 18000, sold: 0, fournisseur: 'Acme Corp', dateCommande: '2024-01-10', dateLivraison: '2024-01-31' },
  { id: 'co2', numero: 'BC-2024-002', typeBonCommande: 'FOURNITURE', typeOperation: 'ACHAT', status: 'EN_TRAITEMENT', amount: 4500, sold: 4500, fournisseur: 'Tech Supplies SAS', dateCommande: '2024-02-08', dateLivraison: '2024-02-28' },
  { id: 'co3', numero: 'BC-2024-003', typeBonCommande: 'SERVICE', typeOperation: 'VENTE', status: 'VALIDER', amount: 9200, sold: 2300, fournisseur: 'Cloud Services Ltd', dateCommande: '2024-02-20', dateLivraison: '2024-03-20' },
  { id: 'co4', numero: 'BC-2024-004', typeBonCommande: 'MATERIEL', typeOperation: 'ACHAT', status: 'CREER', amount: 7800, sold: 7800, fournisseur: 'Hardware Pro', dateCommande: '2024-03-05', dateLivraison: '2024-04-05' },
];

export const mkFournisseurs = (): Fournisseur[] => [
  { id: 'fo1', name: 'Tech Supplies SAS', contactName: 'Marie Girard', contactEmail: 'marie@techsupplies.fr', contactPhone: '01 23 45 67 89', city: 'Paris', pays: 'France', categorie: 'Informatique', status: 'ACTIF', ice: 'FR76 4102 5678 901', adresse: '12 Rue de la Paix', codePostal: '75001', formeJuridique: 'SAS', capital: '150 000 €', tvaIntracom: 'FR76410256789', website: 'https://techsupplies.fr', dateCreation: '2015-03-14', notes: 'Fournisseur principal matériel informatique. Délai livraison 48h.' },
  { id: 'fo2', name: 'Cloud Services Ltd', contactName: 'Jean Moreau', contactEmail: 'jean@cloudservices.com', contactPhone: '01 98 76 54 32', city: 'Lyon', pays: 'France', categorie: 'Cloud', status: 'ACTIF', ice: 'FR29 7831 2345 678', adresse: '45 Avenue des Terreaux', codePostal: '69001', formeJuridique: 'SARL', capital: '80 000 €', tvaIntracom: 'FR29783123456', website: 'https://cloudservices.com', dateCreation: '2018-07-22', notes: 'Partenaire cloud Azure & AWS. SLA 99.9%.' },
  { id: 'fo3', name: 'Hardware Pro', contactName: 'Sophie Leblanc', contactEmail: 'sophie@hardwarepro.fr', contactPhone: '04 56 78 90 12', city: 'Casablanca', pays: 'Maroc', categorie: 'Matériel', status: 'EN_ATTENTE', ice: 'ICE 001234567000089', adresse: '8 Boulevard Hassan II', codePostal: '20000', formeJuridique: 'SARL', capital: '500 000 MAD', tvaIntracom: undefined, website: 'https://hardwarepro.ma', dateCreation: '2020-01-10', notes: 'Nouveau fournisseur. En cours de validation contractuelle.' },
  { id: 'fo4', name: 'Office Depot', contactName: 'Pierre Laurent', contactEmail: 'pierre@officedepot.fr', contactPhone: '03 21 43 65 87', city: 'Toulouse', pays: 'France', categorie: 'Fournitures', status: 'INACTIF', ice: 'FR51 3002 9876 543', adresse: '22 Rue du Commerce', codePostal: '31000', formeJuridique: 'SA', capital: '2 000 000 €', tvaIntracom: 'FR51300298765', website: 'https://officedepot.fr', dateCreation: '2008-11-05', notes: 'Contrat suspendu depuis mars 2024. En renégociation tarifaire.' },
];

export const mkChargesSociales = (): ChargeSociale[] => [
  { id: 'cs1', typeChargeSocial: 'CHARGE_SOCIALE', montant: 3240, periode: '01/2024', status: 'VALIDER', nameConsultant: 'Alice Martin', statusPayement: 'PAYER' },
  { id: 'cs2', typeChargeSocial: 'CHARGE_PATRONALE', montant: 2100, periode: '01/2024', status: 'VALIDER', nameConsultant: 'Bob Dupont', statusPayement: 'PAYER' },
  { id: 'cs3', typeChargeSocial: 'CHARGE_SOCIALE', montant: 3240, periode: '02/2024', status: 'EN_TRAITEMENT', nameConsultant: 'Alice Martin', statusPayement: 'NON_PAYER' },
  { id: 'cs4', typeChargeSocial: 'CHARGE_PATRONALE', montant: 2100, periode: '02/2024', status: 'EN_TRAITEMENT', nameConsultant: 'Carol Lemaire', statusPayement: 'NON_PAYER' },
  { id: 'cs5', typeChargeSocial: 'CHARGE_SOCIALE', montant: 3240, periode: '03/2024', status: 'CREER', nameConsultant: 'Emma Petit', statusPayement: 'NON_PAYER' },
];

export const mkCras = (): Cra[] => [
  { id: 'cr1', consultantName: 'Alice Martin', nbrJourPresence: 20, nbrJourAbsence: 1, periode: '01/2024', status: 'VALIDER', nbrJourTravail: 21 },
  { id: 'cr2', consultantName: 'Bob Dupont', nbrJourPresence: 18, nbrJourAbsence: 3, periode: '01/2024', status: 'VALIDER', nbrJourTravail: 21 },
  { id: 'cr3', consultantName: 'Carol Lemaire', nbrJourPresence: 21, nbrJourAbsence: 0, periode: '02/2024', status: 'VALIDER', nbrJourTravail: 21 },
  { id: 'cr4', consultantName: 'David Renaud', nbrJourPresence: 19, nbrJourAbsence: 2, periode: '02/2024', status: 'EN_TRAITEMENT', nbrJourTravail: 21 },
  { id: 'cr5', consultantName: 'Emma Petit', nbrJourPresence: 20, nbrJourAbsence: 1, periode: '03/2024', status: 'CREER', nbrJourTravail: 21 },
];

export const mkFichiers = (): Fichier[] => [
  { id: 'fi1', fileName: 'Contrat_Projet_2024', fileType: '.pdf', size: '1.2 MB', uploadDate: '2024-01-05', uploadedBy: 'Admin' },
  { id: 'fi2', fileName: 'Cahier_des_charges', fileType: '.docx', size: '856 KB', uploadDate: '2024-01-08', uploadedBy: 'Chef de projet' },
  { id: 'fi3', fileName: 'Budget_previsionnel', fileType: '.xlsx', size: '320 KB', uploadDate: '2024-01-10', uploadedBy: 'Comptabilité' },
  { id: 'fi4', fileName: 'Planning_Gantt_Q1', fileType: '.xlsx', size: '540 KB', uploadDate: '2024-01-15', uploadedBy: 'Chef de projet' },
  { id: 'fi5', fileName: 'Rapport_Avancement_Fev', fileType: '.pdf', size: '2.1 MB', uploadDate: '2024-03-01', uploadedBy: 'Admin' },
];

export const mkWalletTransactions = (): WalletTransaction[] => [
  { id: 'wt1', description: 'Paiement Acme Corp FAC-2024-101', amount: 21600, date: '2024-02-05', type: 'credit', status: 'VALIDER' },
  { id: 'wt2', description: 'Règlement fournisseur Tech Supplies', amount: -1440, date: '2024-02-20', type: 'debit', status: 'VALIDER' },
  { id: 'wt3', description: 'Charges sociales Jan', amount: -5340, date: '2024-02-28', type: 'debit', status: 'VALIDER' },
  { id: 'wt4', description: 'Acompte client Acme Corp', amount: 7500, date: '2024-03-10', type: 'credit', status: 'VALIDER' },
  { id: 'wt5', description: 'Frais déplacement remboursement', amount: -895, date: '2024-03-15', type: 'debit', status: 'VALIDER' },
  { id: 'wt6', description: 'Paiement Office Depot', amount: -576, date: '2024-03-22', type: 'debit', status: 'EN_TRAITEMENT' },
];

export const mkCommentaires = (): Commentaire[] => [
  { id: 'cm1', username: 'Mouhcine', commentaire: 'Le projet avance bien, toutes les prestations du mois de janvier ont été validées.', time: 'Il y a 2 jours' },
  { id: 'cm2', username: 'Alice Martin', commentaire: "J'ai soumis le CRA de février, en attente de validation.", time: 'Il y a 4 jours' },
  { id: 'cm3', username: 'Bob Dupont', commentaire: 'La migration cloud est planifiée pour la semaine prochaine. Toutes les ressources sont prêtes.', time: 'Il y a 1 semaine' },
  { id: 'cm4', username: 'Admin', commentaire: 'Rappel: les dépenses du T1 doivent être soumises avant fin mars.', time: 'Il y a 2 semaines' },
];
