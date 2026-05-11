export interface Customer {
  id: string;
  organizationId?: string;
  customerCode?: string;
  type?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  status?: string;
}

export interface Project {
  id: string;
  organizationId?: string;
  projectCode?: string;
  name: string;
  type: 'regie' | 'negoce';
  status: string;
  description?: string;
  budget?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  consumedHours?: number;
  progress?: number;
  priority?: string;
  projectManagerId?: string;
  color?: string;
  tags?: any;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  customers: Customer[];
}

export interface Prestation {
  id: string; name: string; consultant: string; status: string;
  montant: number; dateDebut: string; dateFin: string;
  type: string; typePartenaire: 'CLIENT' | 'FOURNISSEUR';
}

export interface Devis {
  id: string; numero: string; typeOperation: 'ACHAT' | 'VENTE';
  status: string; amount: number; sold: number;
  fournisseur: string; dateDevis: string; dateValidation: string;
}

export interface Depense {
  id: string; description: string; nature: string;
  amount: number; dateDepense: string; status: string; consultant: string;
}

export interface Facture {
  id: string; numeroFacture: string; status: string;
  typeFacture: string; partnerName: string;
  montantTtc: number; dateFacture: string; statusPayement: string;
}

export interface Commande {
  id: string; numero: string; typeBonCommande: string;
  typeOperation: 'ACHAT' | 'VENTE'; status: string;
  amount: number; sold: number; fournisseur: string;
  dateCommande: string; dateLivraison: string;
}

export interface Fournisseur {
  id: string; name: string; contactName: string;
  contactEmail: string; contactPhone: string;
  city: string; pays: string; categorie: string;
  status: string; ice: string; adresse: string;
  codePostal: string; formeJuridique: string;
  capital?: string; tvaIntracom?: string;
  website?: string; notes?: string; dateCreation?: string;
}

export interface ChargeSociale {
  id: string; typeChargeSocial: string; montant: number;
  periode: string; status: string; nameConsultant: string; statusPayement: string;
}

export interface Cra {
  id: string; consultantName: string; nbrJourPresence: number;
  nbrJourAbsence: number; periode: string; status: string; nbrJourTravail: number;
}

export interface Fichier {
  id: string; fileName: string; fileType: string;
  size: string; uploadDate: string; uploadedBy: string;
}

export interface WalletTransaction {
  id: string; description: string; amount: number;
  date: string; type: 'credit' | 'debit'; status: string;
}

export interface Commentaire {
  id: string; username: string; commentaire: string; time: string;
}
