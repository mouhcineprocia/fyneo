export interface Dossier {
  id: string; nom: string; type: 'CLIENT' | 'FOURNISSEUR' | 'CONTACT';
  status: 'EN_COURS' | 'COMPLETE' | 'EN_ATTENTE' | 'REJETE';
  progression: number; dateCreation: string; responsable: string;
  contact: string; email: string; telephone: string;
  pays: string; ville: string; adresse: string;
  categorie: string; iceSiret: string; secteur: string;
  siteWeb: string; chiffreAffaires: string; effectif: string;
  formeJuridique: string; dateRelation: string; notes: string; tags: string[];
}

export interface OnbDocument {
  id: string; dossierId: string; nom: string; categorie: string;
  status: 'VALIDER' | 'EN_ATTENTE' | 'MANQUANT' | 'REJETE';
  dateUpload: string; obligatoire: boolean;
}

export interface Contrat {
  id: string; dossierId: string; numero: string; type: string;
  dateDebut: string; dateFin: string; montant: number;
  status: 'SIGNE' | 'EN_ATTENTE_SIGNATURE' | 'BROUILLON' | 'EXPIRE';
}

export interface ChatMsg { id: string; from: 'sofia' | 'user'; text: string; time: string; }

export interface PriorityItem {
  id: string; title: string; description: string;
  urgency: 'haute' | 'moyenne' | 'basse';
  actionType: 'validation' | 'relance' | 'signature' | 'verification';
  dossier: string; deadline: string;
}

export interface AgentAlert {
  id: string; type: 'error' | 'warning' | 'success' | 'info';
  title: string; message: string; time: string; dossier?: string;
}

export interface TimelineEvent {
  id: string; time: string; type: 'action' | 'success' | 'warning' | 'error';
  title: string; description: string;
}

export interface TodayActivity {
  id: string; action: 'added' | 'modified' | 'completed' | 'rejected';
  entityType: 'CLIENT' | 'FOURNISSEUR' | 'CONTACT'; nom: string; time: string;
}

export interface KpiCard { label: string; value: string | number; sub: string; color: string; icon: string; }

export interface Salarie {
  id: string; nom: string; prenom: string; poste: string; departement: string;
  contratType: 'CDI' | 'CDD' | 'STAGE' | 'FREELANCE';
  dateEmbauche: string; salaireBrut: number; cnss: string;
  email: string; telephone: string;
  status: 'ACTIF' | 'EN_PERIODE_ESSAI' | 'SUSPENDU' | 'INACTIF';
  progression: number; responsable: string;
}
