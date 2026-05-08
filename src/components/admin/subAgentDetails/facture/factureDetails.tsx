"use client";

import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from '../../../../assets/icons';

interface Article {
    idArticle: string;
    libelle: string;
    quantite: number;
    prixUnitaireHT: number;
}

interface ParsedLineItem {
    id?: string;
    description?: string;
    quantite?: number;
    prixUnitaireHt?: number;
    montantHt?: number;
    montantTtc?: number;
    montantTva?: number;
    tauxTva?: string;
    devise?: string;
}

interface FactureData {
    id: string;
    periode?: string;
    numeroFacture?: string;
    clientName?: string;
    fournisseurName?: string;
    receiverName?: string;
    typeFacture?: string;
    montantTtc?: number;
    montantHt?: number;
    montantTva?: number;
    status?: string;
    statusPayement?: string;
    dateFacture?: string;
    dateEcheance?: string;
    parsedItems?: ParsedLineItem[];
    conditionsText?: string;
    transactionsList?: Array<{
        id?: string;
        bankDescription?: string;
        description?: string;
        amount?: number;
        date?: string;
    }>;
}

interface Consultant {
    id: string;
    name: string;
    email: string;
    phone: string;
    speciality: string;
}

interface Project {
    id: string;
    name: string;
    client: string;
    status: string;
    startDate: string;
    endDate: string;
    budget: number;
}

interface Prestation {
    id: string;
    reference: string;
    description: string;
    projectId: string;
    consultantId: string;
    montantHT: number;
    montantTTC: number;
    status: string;
    dateDebut: string;
    dateFin: string;
    type: string;
}

interface Depense {
    id: string;
    reference: string;
    description: string;
    projectId: string;
    consultantId: string;
    montantHT: number;
    montantTTC: number;
    status: string;
    dateDepense: string;
    categorie: string;
    type: string;
}

interface ClientFournisseur {
    id: string;
    name: string;
    type: 'client' | 'fournisseur';
}

interface FactureDetailsModalProps {
    open: boolean;
    facture: FactureData | null;
    onClose: () => void;
}

const years = ['2025', '2024', '2023', '2022'];
const months = [
    { periode: '01/2025' }, { periode: '02/2025' }, { periode: '03/2025' }, { periode: '04/2025' },
    { periode: '05/2025' }, { periode: '06/2025' }, { periode: '07/2025' }, { periode: '08/2025' },
    { periode: '09/2025' }, { periode: '10/2025' }, { periode: '11/2025' }, { periode: '12/2025' },
    { periode: '01/2024' }, { periode: '02/2024' }, { periode: '03/2024' }, { periode: '04/2024' },
    { periode: '05/2024' }, { periode: '06/2024' }, { periode: '07/2024' }, { periode: '08/2024' },
    { periode: '09/2024' }, { periode: '10/2024' }, { periode: '11/2024' }, { periode: '12/2024' },
];
const categoriesFactureParent = [
    { parentCategory: 'Services' },
    { parentCategory: 'Produits' },
    { parentCategory: 'Consulting' },
    { parentCategory: 'Maintenance' },
];
const categoriesFacture = [
    { category: 'Développement' },
    { category: 'Design' },
    { category: 'Marketing' },
    { category: 'Support' },
];

const categoriesComptables = [
    { value: '706', label: 'Ventes de prestations (706)' },
    { value: '707', label: 'Ventes de marchandises (707)' },
    { value: '601', label: 'Achats de matières (601)' },
    { value: '604', label: 'Achats d\'études (604)' },
    { value: '611', label: 'Sous-traitance (611)' },
    { value: '613', label: 'Locations (613)' },
    { value: '622', label: 'Honoraires & commissions (622)' },
    { value: '625', label: 'Déplacements & missions (625)' },
    { value: '626', label: 'Frais postaux & télécom (626)' },
    { value: '627', label: 'Services bancaires (627)' },
    { value: '628', label: 'Divers services extérieurs (628)' },
    { value: '641', label: 'Rémunérations du personnel (641)' },
    { value: '645', label: 'Charges sociales (645)' },
];

const consultantsData: Consultant[] = [
    { id: 'cons-1', name: 'Jean Dupont', email: 'jean.dupont@email.com', phone: '+33 6 12 34 56 78', speciality: 'Développement Web' },
    { id: 'cons-2', name: 'Marie Martin', email: 'marie.martin@email.com', phone: '+33 6 98 76 54 32', speciality: 'Design UX/UI' },
    { id: 'cons-3', name: 'Pierre Bernard', email: 'pierre.bernard@email.com', phone: '+33 6 11 22 33 44', speciality: 'Data Science' },
    { id: 'cons-4', name: 'Sophie Laurent', email: 'sophie.laurent@email.com', phone: '+33 6 55 66 77 88', speciality: 'Marketing Digital' },
];

const projectsData: Project[] = [
    { id: 'proj-1', name: 'Refonte Site Web ABC', client: 'Client ABC', status: 'En cours', startDate: '01/01/2025', endDate: '30/06/2025', budget: 50000 },
    { id: 'proj-2', name: 'Application Mobile XYZ', client: 'Enterprise Corp', status: 'En cours', startDate: '15/11/2024', endDate: '15/05/2025', budget: 75000 },
    { id: 'proj-3', name: 'Plateforme E-commerce DEF', client: 'Client DEF', status: 'Terminé', startDate: '01/06/2024', endDate: '31/12/2024', budget: 120000 },
    { id: 'proj-4', name: 'Dashboard Analytics GHI', client: 'Client GHI', status: 'En pause', startDate: '01/09/2024', endDate: '28/02/2025', budget: 35000 },
];

const prestationsData: Prestation[] = [
    { id: 'prest-1', reference: 'PREST-2025-001', description: 'Développement module paiement', projectId: 'proj-1', consultantId: 'cons-1', montantHT: 5000, montantTTC: 6000, status: 'Validée', dateDebut: '01/01/2025', dateFin: '31/01/2025', type: 'Développement' },
    { id: 'prest-2', reference: 'PREST-2024-156', description: 'Design interface utilisateur', projectId: 'proj-3', consultantId: 'cons-2', montantHT: 3500, montantTTC: 4200, status: 'Facturée', dateDebut: '01/12/2024', dateFin: '20/12/2024', type: 'Design' },
    { id: 'prest-3', reference: 'PREST-2024-120', description: 'Intégration API externe', projectId: 'proj-2', consultantId: 'cons-1', montantHT: 4666.67, montantTTC: 5600, status: 'Facturée', dateDebut: '01/10/2024', dateFin: '25/10/2024', type: 'Développement' },
];

const depensesData: Depense[] = [
    { id: 'dep-1', reference: 'DEP-2025-001', description: 'Licences logiciels annuelles', projectId: 'proj-1', consultantId: 'cons-1', montantHT: 742.08, montantTTC: 890.50, status: 'En attente', dateDepense: '15/01/2025', categorie: 'Logiciels', type: 'Récurrente' },
    { id: 'dep-2', reference: 'DEP-2024-157', description: 'Matériel informatique', projectId: 'proj-2', consultantId: 'cons-3', montantHT: 375, montantTTC: 450, status: 'Validée', dateDepense: '18/12/2024', categorie: 'Matériel', type: 'Ponctuelle' },
    { id: 'dep-3', reference: 'DEP-2024-125', description: 'Formation équipe', projectId: 'proj-3', consultantId: 'cons-4', montantHT: 1500, montantTTC: 1800, status: 'Annulée', dateDepense: '10/10/2024', categorie: 'Formation', type: 'Ponctuelle' },
];

const clientsFournisseurs: ClientFournisseur[] = [
    { id: 'cf-1', name: 'Client ABC', type: 'client' },
    { id: 'cf-2', name: 'Client DEF', type: 'client' },
    { id: 'cf-3', name: 'Client GHI', type: 'client' },
    { id: 'cf-4', name: 'Client JKL', type: 'client' },
    { id: 'cf-5', name: 'Enterprise Corp', type: 'client' },
    { id: 'cf-6', name: 'Fournisseur XYZ', type: 'fournisseur' },
    { id: 'cf-7', name: 'Fournisseur ABC', type: 'fournisseur' },
    { id: 'cf-8', name: 'Fournisseur LMN', type: 'fournisseur' },
];

const factureAttachments: Record<string, { type: 'prestation' | 'depense' | null; attachmentId: string | null }> = {
    'wa-1': { type: 'prestation', attachmentId: 'prest-1' },
    'wa-2': { type: 'depense', attachmentId: 'dep-1' },
    'wa-3': { type: 'prestation', attachmentId: 'prest-2' },
    'wa-4': { type: 'depense', attachmentId: 'dep-2' },
    'wa-5': { type: null, attachmentId: null },
    'wa-6': { type: null, attachmentId: null },
    'wa-7': { type: 'depense', attachmentId: 'dep-3' },
    'wa-8': { type: 'prestation', attachmentId: 'prest-3' },
    'gm-1': { type: null, attachmentId: null },
    'gm-2': { type: null, attachmentId: null },
};

const getSofiaMessage = (factureId: string): string => {
    const messages: Record<string, string> = {
        'wa-1': "Salut! J'ai attaché cette facture à une prestation et des transactions avec succès. Tout est bien lié au projet Refonte Site Web ABC.",
        'wa-2': "Salut! Cette facture a été attachée à une dépense pour les licences logiciels. Les transactions sont en attente de validation.",
        'wa-3': "Salut! J'ai lié cette facture à une prestation de design et à plusieurs transactions validées. Le paiement a bien été reçu.",
        'wa-4': "Salut! Cette facture est attachée à une dépense de matériel informatique et une transaction validée. Tout est en ordre!",
        'wa-5': "Salut! Cette facture n'est pas encore attachée à une prestation ou dépense. Voulez-vous que je vous aide à faire le lien?",
        'wa-6': "Salut! C'est un avoir de vente. Il n'est pas encore lié à une prestation. Souhaitez-vous l'attacher à quelque chose?",
        'wa-7': "Salut! Cette facture était attachée à une dépense de formation, mais elle a été annulée. Aucune transaction n'est associée.",
        'wa-8': "Salut! J'ai attaché cette facture à une prestation d'intégration API et à une transaction validée. Le client JKL a bien payé!",
        'gm-1': "Salut! Cette facture vient de Gmail et n'est pas encore liée. Je peux vous aider à l'attacher à un projet existant.",
        'gm-2': "Salut! Facture Gmail non attachée. Voulez-vous la lier à une prestation ou une dépense?",
    };
    return messages[factureId] || "Salut! Je suis Sofia, votre assistant IA. Comment puis-je vous aider avec cette facture?";
};

interface AttachmentItem {
    type: 'transaction' | 'prestation' | 'depense';
    label: string;
    status: 'success' | 'pending' | 'error';
}

const getFactureItems = (factureId: string): AttachmentItem[] => {
    const items: Record<string, AttachmentItem[]> = {
        'wa-1': [
            { type: 'transaction', label: 'Virement Client ABC - 1 250,00 €', status: 'success' },
            { type: 'prestation', label: 'PREST-2025-001 - Développement module paiement', status: 'success' },
        ],
        'wa-2': [
            { type: 'depense', label: 'DEP-2025-001 - Licences logiciels annuelles', status: 'pending' },
        ],
        'wa-3': [
            { type: 'transaction', label: 'Paiement facture DEF - 3 500,00 €', status: 'success' },
            { type: 'transaction', label: 'Complement paiement - 0,00 €', status: 'success' },
            { type: 'prestation', label: 'PREST-2024-156 - Design interface utilisateur', status: 'success' },
        ],
        'wa-4': [
            { type: 'transaction', label: 'Paiement fournisseur - 450,00 €', status: 'success' },
            { type: 'depense', label: 'DEP-2024-157 - Matériel informatique', status: 'success' },
        ],
        'wa-5': [],
        'wa-6': [],
        'wa-7': [
            { type: 'depense', label: 'DEP-2024-125 - Formation équipe (Annulée)', status: 'error' },
        ],
        'wa-8': [
            { type: 'transaction', label: 'Virement JKL - 5 600,00 €', status: 'success' },
            { type: 'prestation', label: 'PREST-2024-120 - Intégration API externe', status: 'success' },
        ],
        'gm-1': [],
        'gm-2': [],
    };
    return items[factureId] || [];
};

const getSuggestionMessage = (factureId: string): string | null => {
    const suggestions: Record<string, string | null> = {
        'wa-1': "Pour cette facture, je te propose d'ajouter d'autres transactions si nécessaire. Tu peux aussi la lier manuellement à d'autres éléments.",
        'wa-2': "Pour cette facture, je te propose d'ajouter des transactions pour suivre le paiement. Tu peux le faire manuellement dans l'onglet supplémentaire.",
        'wa-3': null,
        'wa-4': "Pour cette facture, je te propose d'ajouter une prestation associée si ce matériel est lié à un projet. Tu peux le lier manuellement.",
        'wa-5': "Pour cette facture, je te propose des transactions, une prestation ou une dépense. Tu peux la lier manuellement dans l'onglet informations supplémentaires.",
        'wa-6': null,
        'wa-7': "Pour cette facture annulée, je te propose de vérifier s'il y a des transactions à annuler également. Tu peux gérer ça manuellement.",
        'wa-8': null,
        'gm-1': "Pour cette facture, je te propose des transactions et une prestation ou dépense. Tu peux la lier manuellement depuis l'onglet supplémentaire.",
        'gm-2': "Pour cette facture, je te propose de l'attacher à des transactions et une dépense. Tu peux le faire manuellement si tu veux.",
    };
    return suggestions[factureId] !== undefined ? suggestions[factureId] : null;
};

interface CarouselItem {
    id: string;
    description: string;
    amount: number;
    date: string;
    reference?: string;
}

interface CarouselSlide {
    type: 'transaction' | 'prestation' | 'depense';
    title: string;
    items: CarouselItem[];
}

const getCarouselPropositions = (factureId: string): CarouselSlide[] => {
    const propositions: Record<string, CarouselSlide[]> = {
        'wa-1': [{ type: 'transaction', title: 'Transactions proposées', items: [{ id: 'prop-t1', description: 'Virement SEPA Client ABC', amount: 625.00, date: '16/01/2025' }, { id: 'prop-t2', description: 'Paiement CB Client ABC', amount: 625.00, date: '17/01/2025' }] }],
        'wa-2': [{ type: 'transaction', title: 'Transactions proposées', items: [{ id: 'prop-t3', description: 'Prélèvement automatique licence', amount: -890.50, date: '20/01/2025' }] }, { type: 'depense', title: 'Dépenses proposées', items: [{ id: 'dep-prop-1', description: 'Abonnement cloud supplementaire', amount: 299.00, date: '18/01/2025', reference: 'DEP-2025-002' }] }],
        'wa-4': [{ type: 'prestation', title: 'Prestations proposées', items: [{ id: 'prest-prop-1', description: 'Installation matériel - Jean Dupont', amount: 450.00, date: '15/12/2024', reference: 'PREST-2024-158' }] }],
        'wa-5': [{ type: 'transaction', title: 'Transactions proposées', items: [{ id: 'prop-t4', description: 'Relance Client GHI', amount: 2100.00, date: '20/12/2024' }, { id: 'prop-t5', description: 'Paiement partiel GHI', amount: 1050.00, date: '22/12/2024' }] }, { type: 'prestation', title: 'Prestations proposées', items: [{ id: 'prest-prop-2', description: 'Audit sécurité - Pierre Bernard', amount: 2100.00, date: '15/11/2024', reference: 'PREST-2024-145' }] }],
        'wa-7': [{ type: 'transaction', title: 'Transactions proposées', items: [{ id: 'prop-t6', description: 'Remboursement formation', amount: 1800.00, date: '15/10/2024' }] }],
        'gm-1': [{ type: 'transaction', title: 'Transactions proposées', items: [{ id: 'prop-t7', description: 'Acompte supplémentaire Enterprise', amount: 4250.00, date: '12/01/2025' }] }, { type: 'prestation', title: 'Prestations proposées', items: [{ id: 'prest-prop-3', description: 'Développement backend - Jean Dupont', amount: 8500.00, date: '01/01/2025', reference: 'PREST-2025-002' }] }],
        'gm-2': [{ type: 'depense', title: 'Dépenses proposées', items: [{ id: 'dep-prop-2', description: 'Serveur cloud Tech Solutions', amount: 2340.00, date: '10/01/2025', reference: 'DEP-2025-003' }] }],
    };
    return propositions[factureId] || [];
};

const buildDataTextFromArticles = (articles: Article[], tauxTva?: string) => {
    const normalizeRate = (val?: string | number | null) => {
        if (val === undefined || val === null || val === '') return 0;
        const parsed = parseFloat(String(val).replace('%', ''));
        return Number.isFinite(parsed) ? parsed / 100 : 0;
    };
    const defaultRate = normalizeRate(tauxTva);
    const normalized = (articles || []).map((article, idx) => {
        const quantity = Number(article.quantite ?? 0);
        const unitPrice = Number((article as any).prixUnitaireHT ?? (article as any).prix_unitaire_ht ?? 0);
        const rate = (article as any).tauxTva ? normalizeRate((article as any).tauxTva) : defaultRate;
        const montantHt = Number((quantity * unitPrice).toFixed(2));
        const montantTva = Number((montantHt * rate).toFixed(2));
        const montantTtc = Number((montantHt + montantTva).toFixed(2));
        return {
            id: article.idArticle || `item-${idx}`,
            description: (article as any).description || article.libelle || '',
            quantite: quantity,
            prix_unitaire_ht: unitPrice,
            montant_ht: montantHt,
            montant_tva: montantTva,
            montant_ttc: montantTtc,
            taux_tva: (article as any).tauxTva || tauxTva || null,
            devise: (article as any).devise || null,
        };
    });
    return JSON.stringify(normalized);
};

// ── native style helpers ──────────────────────────────────────────────────────

const iStyle: React.CSSProperties = {
    width: '100%', padding: '7px 12px', fontSize: '0.85rem', color: 'var(--text)',
    backgroundColor: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px',
    outline: 'none', boxSizing: 'border-box',
};

const sStyle: React.CSSProperties = {
    width: '100%', padding: '7px 12px', fontSize: '0.85rem', color: 'var(--text)',
    backgroundColor: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px',
    outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '10px 16px', backgroundColor: '#0d9394', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
    cursor: 'pointer', textAlign: 'center',
};

const btnOutline: React.CSSProperties = {
    width: '100%', padding: '8px 16px', backgroundColor: 'transparent', color: 'var(--text2)',
    border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500,
    cursor: 'pointer',
};

const FieldWrap = ({ half, children }: { half?: boolean; children: React.ReactNode }) => (
    <div style={{ width: half ? 'calc(50% - 8px)' : '100%' }}>{children}</div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '4px', fontWeight: 500 }}>
        {children}
    </label>
);

const MoneyInput = ({ name, value, onChange }: { name: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div style={{ position: 'relative' }}>
        <input name={name} type="number" value={value} onChange={onChange} style={{ ...iStyle, paddingRight: '28px' }} />
        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: '0.8rem', pointerEvents: 'none' }}>€</span>
    </div>
);

const SofiaAvatar = () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d9394, #0b7a7b)', borderRadius: '50%' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>S</span>
    </div>
);

// ── component ─────────────────────────────────────────────────────────────────

export const FactureDetailsModal: React.FC<FactureDetailsModalProps> = ({ open, facture, onClose }) => {
    const [activeTab, setActiveTab] = useState<'base' | 'supplementaire'>('base');
    const [formData, setFormData] = useState({
        numeroFacture: '', typeFacture: '', annee: '', periode: '',
        montantTtc: 0, montantHt: 0, montantTva: 0,
        status: '', statusPayement: '', dateEcheance: '', dateFacture: '',
        categorie: '', sousCategorie: '', categorieComptable: '', quantite: 1,
        articles: [] as Article[], conditionsText: '',
    });

    const [selectedArticles, setSelectedArticles] = useState<Record<string, boolean>>({});
    const [isValidationDone, setIsValidationDone] = useState(false);

    useEffect(() => {
        if (open && facture?.parsedItems) {
            const initial: Record<string, boolean> = {};
            facture.parsedItems.forEach((item, idx) => { initial[item.id || `item-${idx}`] = true; });
            setSelectedArticles(initial);
            setIsValidationDone(false);
        }
    }, [facture?.id, open]);

    const handleToggleArticle = (id: string) => setSelectedArticles(prev => ({ ...prev, [id]: !prev[id] }));
    const handleValidateArticles = () => { setIsValidationDone(true); };

    const isPrestationInvoice = useMemo(() => (facture?.numeroFacture || '').toUpperCase().startsWith('REG'), [facture?.numeroFacture]);
    const itemsSectionLabel = isPrestationInvoice ? 'Prestations' : 'Articles';
    const itemLabel = isPrestationInvoice ? 'Prestation' : 'Article';
    const allowedTypeFactures = ['factureAchat', 'factureVente', 'avoirVente', 'avoirAchat'];
    const allowedStatuses = ['VALIDER', 'PAYER', 'OCR_AUTO_DONE', 'DUPLICATION', 'EN_TRAITEMENT', 'ANNULER', 'DELETE'];
    const [showChildSelect, setShowChildSelect] = useState(false);

    const [infoTab, setInfoTab] = useState<'projet' | 'prestation' | 'depense' | 'consultant'>('projet');
    const [showAttachInterface, setShowAttachInterface] = useState(false);
    const [attachType, setAttachType] = useState<'prestation' | 'depense' | null>(null);
    const [selectedClientFournisseur, setSelectedClientFournisseur] = useState<ClientFournisseur | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedPrestation, setSelectedPrestation] = useState<Prestation | null>(null);
    const [selectedDepense, setSelectedDepense] = useState<Depense | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const [isSofiaThinking, setIsSofiaThinking] = useState(true);
    const [sofiaDisplayedText, setSofiaDisplayedText] = useState('');
    const [itemsDisplayed, setItemsDisplayed] = useState(0);

    const sofiaMessage = useMemo(() => {
        if (!facture) return '';
        const numero = facture.numeroFacture || facture.id;
        const count = facture.parsedItems?.length || 0;
        const amount = typeof facture.montantTtc === 'number' ? facture.montantTtc.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00';
        return `Bonjour ! Voici les prestations pour la facture n° ${numero}. J'ai détecté ${count} prestation(s) pour un montant total de ${amount} € TTC. Ce résultat a été obtenu grâce à une tâche OCR exécutée précédemment.`;
    }, [facture]);

    const factureItems = facture ? getFactureItems(facture.id) : [];

    const [suggestionDisplayedText, setSuggestionDisplayedText] = useState('');
    const [showSuggestionCard, setShowSuggestionCard] = useState(false);
    const [acceptedItemIds, setAcceptedItemIds] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [savingDialogOpen, setSavingDialogOpen] = useState(false);
    const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const rawSuggestionMessage = useMemo(() => facture ? getSuggestionMessage(facture.id) : null, [facture?.id]);
    const rawCarouselPropositions = useMemo(() => facture ? getCarouselPropositions(facture.id) : [], [facture?.id]);

    const carouselPropositions = useMemo(() =>
        rawCarouselPropositions.map(slide => ({
            ...slide,
            items: slide.items.filter(item => !acceptedItemIds.includes(item.id))
        })).filter(slide => slide.items.length > 0),
        [rawCarouselPropositions, acceptedItemIds]
    );

    const suggestionMessage = useMemo(() => {
        if (!rawSuggestionMessage) return null;
        if (rawCarouselPropositions.length > 0 && carouselPropositions.length === 0) return "Pour cette facture, il n'y a plus de proposition maintenant.";
        return rawSuggestionMessage;
    }, [rawSuggestionMessage, rawCarouselPropositions.length, carouselPropositions.length]);

    const [showCarousel, setShowCarousel] = useState(false);
    const [carouselSlide, setCarouselSlide] = useState(0);
    const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
    const [selectedPrestations, setSelectedPrestations] = useState<string[]>([]);
    const [selectedDepenses, setSelectedDepenses] = useState<string[]>([]);

    useEffect(() => {
        if (open && facture) {
            setIsSofiaThinking(true);
            setSofiaDisplayedText('');
            setItemsDisplayed(0);
            setSuggestionDisplayedText('');
            setShowSuggestionCard(false);
            const t = setTimeout(() => setIsSofiaThinking(false), 1000);
            return () => clearTimeout(t);
        }
    }, [open, facture?.id]);

    useEffect(() => {
        if (!isSofiaThinking && sofiaDisplayedText.length < sofiaMessage.length) {
            const t = setTimeout(() => setSofiaDisplayedText(sofiaMessage.slice(0, sofiaDisplayedText.length + 3)), 1);
            return () => clearTimeout(t);
        }
    }, [isSofiaThinking, sofiaDisplayedText, sofiaMessage]);

    useEffect(() => {
        if (sofiaDisplayedText === sofiaMessage && sofiaMessage.length > 0 && itemsDisplayed < factureItems.length) {
            const t = setTimeout(() => setItemsDisplayed(prev => prev + 1), 300);
            return () => clearTimeout(t);
        }
    }, [sofiaDisplayedText, sofiaMessage, itemsDisplayed, factureItems.length]);

    useEffect(() => {
        const allItemsShown = itemsDisplayed >= factureItems.length;
        const messageComplete = sofiaDisplayedText === sofiaMessage && sofiaMessage.length > 0;
        if (messageComplete && allItemsShown && suggestionMessage && !showSuggestionCard) {
            const t = setTimeout(() => setShowSuggestionCard(true), 500);
            return () => clearTimeout(t);
        }
    }, [itemsDisplayed, factureItems.length, sofiaDisplayedText, sofiaMessage, suggestionMessage, showSuggestionCard]);

    useEffect(() => {
        if (showSuggestionCard && suggestionMessage) {
            if (!suggestionMessage.startsWith(suggestionDisplayedText)) { setSuggestionDisplayedText(''); return; }
            if (suggestionDisplayedText.length < suggestionMessage.length) {
                const t = setTimeout(() => setSuggestionDisplayedText(suggestionMessage.slice(0, suggestionDisplayedText.length + 3)), 1);
                return () => clearTimeout(t);
            }
        }
    }, [showSuggestionCard, suggestionMessage, suggestionDisplayedText]);

    useEffect(() => {
        if (carouselPropositions.length > 0) {
            const transactions: string[] = [];
            const prestations: string[] = [];
            const depenses: string[] = [];
            carouselPropositions.forEach(slide => {
                if (slide.type === 'transaction') transactions.push(...slide.items.map(i => i.id));
                else if (slide.type === 'prestation') prestations.push(...slide.items.map(i => i.id));
                else if (slide.type === 'depense') depenses.push(...slide.items.map(i => i.id));
            });
            setSelectedTransactions(transactions);
            setSelectedPrestations(prestations);
            setSelectedDepenses(depenses);
        }
    }, [carouselPropositions]);

    useEffect(() => {
        const suggestionComplete = suggestionDisplayedText === suggestionMessage && suggestionMessage && suggestionMessage.length > 0;
        if (suggestionComplete && carouselPropositions.length > 0 && !showCarousel) {
            const t = setTimeout(() => setShowCarousel(true), 500);
            return () => clearTimeout(t);
        }
    }, [suggestionDisplayedText, suggestionMessage, carouselPropositions.length, showCarousel]);

    const attachmentInfo = facture ? (factureAttachments[facture.id] || { type: null, attachmentId: null }) : { type: null, attachmentId: null };

    const validationChecks = useMemo(() => {
        if (!facture) return [];
        const ttc = Number(facture.montantTtc ?? 0);
        const ht = Number(facture.montantHt ?? 0);
        const tva = Number(facture.montantTva ?? 0);
        const hasClient = !!(facture.clientName || facture.fournisseurName || facture.receiverName);
        const ttcOk = Math.abs(ttc - (ht + tva)) < 0.02;
        return [
            { label: 'Client / Fournisseur présent', ok: hasClient, agent: 'Nom du client ou fournisseur manquant. Vérifiez les informations.' },
            { label: 'Numéro de facture présent', ok: !!facture.numeroFacture, agent: 'Le numéro de facture est absent. Saisissez-le dans les informations de base.' },
            { label: 'Type de facture défini', ok: !!facture.typeFacture, agent: "Le type de facture (achat/vente) n'est pas défini." },
            { label: 'Montant TTC renseigné', ok: ttc !== 0, agent: 'Le montant TTC est manquant ou nul.' },
            { label: 'Montant HT renseigné', ok: ht !== 0, agent: 'Le montant HT est manquant ou nul.' },
            { label: 'Montant TVA renseigné', ok: tva !== 0, agent: 'La TVA est manquante ou nulle.' },
            { label: `TTC = HT + TVA (${ht.toFixed(2)} + ${tva.toFixed(2)} = ${(ht + tva).toFixed(2)})`, ok: ttcOk, agent: `Incohérence: TTC (${ttc.toFixed(2)}€) ≠ HT + TVA (${(ht + tva).toFixed(2)}€). Vérifiez les montants.` },
            { label: 'Date de facture présente', ok: !!facture.dateFacture, agent: 'La date de la facture est manquante.' },
        ];
    }, [facture]);

    const allChecksGreen = validationChecks.every(c => c.ok);
    const failedChecks = validationChecks.filter(c => !c.ok);

    const getAttachedPrestation = () => attachmentInfo.type === 'prestation' && attachmentInfo.attachmentId ? prestationsData.find(p => p.id === attachmentInfo.attachmentId) || null : null;
    const getAttachedDepense = () => attachmentInfo.type === 'depense' && attachmentInfo.attachmentId ? depensesData.find(d => d.id === attachmentInfo.attachmentId) || null : null;
    const getAttachedProject = () => { const p = getAttachedPrestation(); const d = getAttachedDepense(); const id = p?.projectId || d?.projectId; return id ? projectsData.find(pr => pr.id === id) || null : null; };
    const getAttachedConsultant = () => { const p = getAttachedPrestation(); const d = getAttachedDepense(); const id = p?.consultantId || d?.consultantId; return id ? consultantsData.find(c => c.id === id) || null : null; };

    useEffect(() => {
        if (facture) {
            const anneeFromPeriode = facture.periode ? facture.periode.split('/')[1] : '';
            const dateFactureValue = facture.dateFacture ? facture.dateFacture.slice(0, 10) : '';
            const dateEcheanceValue = facture.dateEcheance ? facture.dateEcheance.slice(0, 10) : '';
            const parsedItems = facture.parsedItems || [];
            const mappedArticles: Article[] = parsedItems.map((item, idx) => ({
                idArticle: item.id || `item-${idx}`,
                libelle: item.description || '',
                quantite: item.quantite ?? 0,
                prixUnitaireHT: item.prixUnitaireHt ?? 0,
            }));
            const safePeriode = facture.periode || (dateFactureValue ? new Date(dateFactureValue).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' }) : '');
            setFormData({
                numeroFacture: facture.numeroFacture || '',
                typeFacture: facture.typeFacture || '',
                annee: (facture as any).annee || anneeFromPeriode || (dateFactureValue ? new Date(dateFactureValue).getFullYear().toString() : ''),
                periode: safePeriode,
                montantTtc: Number(facture.montantTtc ?? 0),
                montantHt: Number(facture.montantHt ?? 0),
                montantTva: Number(facture.montantTva ?? 0),
                status: facture.status || '',
                statusPayement: facture.statusPayement || '',
                dateEcheance: dateEcheanceValue,
                dateFacture: dateFactureValue,
                categorie: (facture as any).categorie || '',
                sousCategorie: (facture as any).sousCategorie || '',
                categorieComptable: (facture as any).categorieComptable || '',
                quantite: mappedArticles[0]?.quantite ?? 1,
                articles: mappedArticles.length > 0 ? mappedArticles : [],
                conditionsText: facture.conditionsText || '',
            });
        }
    }, [facture]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'categorie' && value) setShowChildSelect(true);
    };

    const handleArticleChange = (index: number, field: string, value: string | number) => {
        const newArticles = [...formData.articles];
        newArticles[index] = { ...newArticles[index], [field]: value };
        setFormData(prev => ({ ...prev, articles: newArticles }));
    };

    const handleAddArticle = () => {
        setFormData(prev => ({
            ...prev,
            articles: [...prev.articles, { idArticle: Date.now().toString(), libelle: '', quantite: 1, prixUnitaireHT: 0 }],
        }));
    };

    const handleDeleteArticle = (_: string, index: number) => {
        setFormData(prev => ({ ...prev, articles: prev.articles.filter((__, i) => i !== index) }));
    };

    const handleSave = () => {
        if (!facture?.id) return;
        setSavingDialogOpen(true);
        setSavingStatus('saving');
        setIsSaving(true);
        setSaveMessage(null);
        setTimeout(() => {
            setSaveMessage('Facture enregistrée avec succès.');
            setSavingStatus('success');
            setIsSaving(false);
            setTimeout(() => setSavingDialogOpen(false), 1200);
        }, 1500);
    };

    const handleCheckboxToggle = (itemId: string, type: 'transaction' | 'prestation' | 'depense') => {
        if (type === 'transaction') setSelectedTransactions(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
        else if (type === 'prestation') setSelectedPrestations(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
        else setSelectedDepenses(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    };

    const handleNextSlide = () => { if (carouselSlide < carouselPropositions.length - 1) setCarouselSlide(prev => prev + 1); };
    const handlePrevSlide = () => { if (carouselSlide > 0) setCarouselSlide(prev => prev - 1); };

    const handleAccept = () => {
        const currentSlide = carouselPropositions[carouselSlide];
        let itemsToAccept: string[] = [];
        if (currentSlide.type === 'transaction') itemsToAccept = currentSlide.items.map(i => i.id).filter(id => selectedTransactions.includes(id));
        else if (currentSlide.type === 'prestation') itemsToAccept = currentSlide.items.map(i => i.id).filter(id => selectedPrestations.includes(id));
        else itemsToAccept = currentSlide.items.map(i => i.id).filter(id => selectedDepenses.includes(id));
        if (itemsToAccept.length === 0) return;
        processAcceptance(itemsToAccept);
    };

    const handleAcceptAll = () => {
        const all: string[] = [];
        rawCarouselPropositions.forEach(slide => slide.items.forEach(item => { if (!acceptedItemIds.includes(item.id)) all.push(item.id); }));
        if (all.length === 0) return;
        processAcceptance(all);
    };

    const processAcceptance = (itemsToAccept: string[]) => {
        setIsProcessing(true);
        setProcessingStep(1);
        setTimeout(() => {
            setProcessingStep(2);
            setTimeout(() => {
                setProcessingStep(3);
                setAcceptedItemIds(prev => [...prev, ...itemsToAccept]);
                setTimeout(() => {
                    setIsProcessing(false);
                    setProcessingStep(0);
                    if (carouselSlide >= carouselPropositions.length - (carouselPropositions.length > 0 ? 0 : 1)) {
                        setCarouselSlide(Math.max(0, carouselPropositions.length - 1));
                    }
                }, 2000);
            }, 3000);
        }, 2000);
    };

    const filteredMonths = formData.annee ? months.filter(m => m.periode.endsWith(formData.annee)) : months;

    if (!facture) return null;

    const typeIsVente = (facture?.typeFacture || '').includes('Vente') || (facture?.typeFacture || '').includes('vente');

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1300, backgroundColor: 'var(--bg)', display: open ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{`
                @keyframes fd-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fd-slideUpModal { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes fd-fadeInScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes fd-processingPulse { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
                @keyframes fd-successPop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
                @keyframes fd-blinkCursor { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }
                @keyframes fd-sofiaPing { 75%,100% { transform: scale(2); opacity: 0; } }
                @keyframes fd-fadeInItem { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .fd-fade-in-item { animation: fd-fadeInItem 0.3s ease-out forwards; }
                .fd-sofia-ping { animation: fd-sofiaPing 1s cubic-bezier(0,0,0.2,1) infinite; }
                .fd-blink-cursor { animation: fd-blinkCursor 1s infinite; display: inline-block; width: 2px; height: 14px; background-color: #0d9394; margin-left: 2px; vertical-align: middle; }
                .fd-spin { animation: fd-spin 2s linear infinite; }
                .fd-processing-pulse { animation: fd-processingPulse 1.5s infinite ease-in-out; }
                .fd-success-pop { animation: fd-successPop 0.5s cubic-bezier(0.17,0.89,0.32,1.49); }
                .fd-slide-up-modal { animation: fd-slideUpModal 0.4s cubic-bezier(0.16,1,0.3,1); }
                .fd-tr-hover:hover { background-color: rgba(0,0,0,0.03); }
                .fd-tab-btn { background: none; border: none; cursor: pointer; transition: all 0.2s; }
                .fd-tab-btn:hover { background-color: var(--bg2); }
                .fd-icon-btn { display: inline-flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: background 0.2s; }
                .fd-icon-btn:hover { background-color: var(--border) !important; }
                .fd-input:focus { border-color: #0d9394; }
                .fd-select:focus { border-color: #0d9394; }
                .fd-textarea:focus { border-color: #0d9394; }
                .fd-info-btn { background: none; border: none; cursor: pointer; border-radius: 6px; padding: 4px 12px; font-size: 0.75rem; transition: all 0.2s; }
                .fd-carousel-item:hover { background-color: rgba(255,255,255,0.8) !important; }
            `}</style>

            {/* ── Header ── */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="fd-icon-btn" onClick={onClose} style={{ width: 32, height: 32, backgroundColor: 'var(--bg2)', borderRadius: '8px' }}>
                        <Icons.ArrowLeft width={16} height={16} style={{ color: 'var(--text)' }} />
                    </button>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>Facture {facture.numeroFacture}</span>
                </div>
                <button className="fd-icon-btn" onClick={onClose} style={{ width: 32, height: 32, backgroundColor: 'var(--bg2)', borderRadius: '8px' }}>
                    <Icons.X width={16} height={16} style={{ color: 'var(--text)' }} />
                </button>
            </div>

            {/* ── Main Content ── */}
            <div style={{ marginTop: '50px', display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ── LEFT SIDE ── */}
                <div style={{ width: '50%', padding: '16px', overflow: 'auto' }}>

                    {/* Sofia Message Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                        {/* Avatar */}
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #0d9394', boxShadow: '0 0 12px rgba(13,147,148,0.4)', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)' }}>
                            <SofiaAvatar />
                        </div>

                        {/* Message Bubble */}
                        <div style={{ flex: 1, background: 'linear-gradient(to top right, rgba(148,163,184,0.15), rgba(156,163,175,0.15), rgba(71,85,105,0.15))', backdropFilter: 'blur(8px)', borderRadius: '12px 12px 12px 0', border: '1px solid rgba(241,245,249,0.3)', padding: '16px', minHeight: '80px' }}>
                            {isSofiaThinking ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px' }}>
                                    <span style={{ position: 'relative', display: 'inline-flex', height: '16px', width: '16px' }}>
                                        <span className="fd-sofia-ping" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#0d9394', opacity: 0.75 }} />
                                        <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '16px', width: '16px', backgroundColor: '#0d9394' }} />
                                    </span>
                                </div>
                            ) : (
                                <span style={{ color: 'var(--text)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    {sofiaDisplayedText}
                                    {sofiaDisplayedText.length < sofiaMessage.length && <span className="fd-blink-cursor" />}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Attached Items Card */}
                    {factureItems.length > 0 && sofiaDisplayedText === sofiaMessage && (
                        <div className="fd-fade-in-item" style={{ background: 'linear-gradient(to top right, rgba(148,163,184,0.3), rgba(156,163,175,0.3), rgba(71,85,105,0.3))', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(241,245,249,0.3)', padding: '16px' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Éléments attachés</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {factureItems.slice(0, 3).map((item, index) => (
                                    <div key={index} className={index < itemsDisplayed ? 'fd-fade-in-item' : ''} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '12px', opacity: index < itemsDisplayed ? 1 : 0 }}>
                                        {/* Checkbox */}
                                        <input type="checkbox" checked readOnly style={{ width: '16px', height: '16px', accentColor: item.status === 'success' ? '#22c55e' : item.status === 'pending' ? '#f59e0b' : '#ef4444', flexShrink: 0 }} />
                                        {/* Status icon */}
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: item.status === 'success' ? '#dcfce7' : item.status === 'pending' ? '#fef3c7' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {item.status === 'success' ? <Icons.Check width={12} height={12} style={{ color: '#22c55e' }} /> : item.status === 'pending' ? <Icons.Clock width={12} height={12} style={{ color: '#f59e0b' }} /> : <Icons.X width={12} height={12} style={{ color: '#ef4444' }} />}
                                        </div>
                                        {/* Type badge */}
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: item.type === 'transaction' ? '#dbeafe' : item.type === 'prestation' ? '#f3e8ff' : '#ffedd5', fontSize: '0.65rem', fontWeight: 600, color: item.type === 'transaction' ? '#2563eb' : item.type === 'prestation' ? '#9333ea' : '#ea580c', flexShrink: 0, textTransform: 'capitalize' }}>
                                            {item.type}
                                        </span>
                                        {/* Label */}
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Agent Validation Checklist ── */}
                    {validationChecks.length > 0 && sofiaDisplayedText === sofiaMessage && (
                        <div className="fd-fade-in-item" style={{ marginTop: '16px' }}>
                            {/* Checklist header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: allChecksGreen ? '#22c55e' : '#ef4444' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
                                    Contrôle automatique ({validationChecks.filter(c => c.ok).length}/{validationChecks.length} validés)
                                </span>
                            </div>

                            {/* Checks */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {validationChecks.map((check, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, backgroundColor: check.ok ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)', border: `1px solid ${check.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: check.ok ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {check.ok
                                                ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            }
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: check.ok ? '#15803d' : '#b91c1c', fontWeight: 500, flex: 1 }}>{check.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Warning alert if any red */}
                            {!allChecksGreen && (
                                <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626' }}>{failedChecks.length} point{failedChecks.length > 1 ? 's' : ''} nécessite{failedChecks.length > 1 ? 'nt' : ''} votre attention</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {failedChecks.map((c, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                                <span style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: 1, flexShrink: 0 }}>›</span>
                                                <span style={{ fontSize: '0.72rem', color: '#7f1d1d' }}>{c.agent}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                                {!allChecksGreen && (
                                    <button style={{ flex: 1, padding: '10px 16px', backgroundColor: 'transparent', color: '#dc2626', border: '1.5px solid #dc2626', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                                        Rejeter
                                    </button>
                                )}
                                <button onClick={handleSave} style={{ flex: allChecksGreen ? undefined : 1, width: allChecksGreen ? '100%' : undefined, padding: '10px 16px', backgroundColor: '#0d9394', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                                    {allChecksGreen ? 'Valider' : 'Valider quand même'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Validation list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0d9394' }}>Validation des {itemsSectionLabel.toLowerCase()}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{Object.values(selectedArticles).filter(Boolean).length} sélectionné(s)</span>
                        </div>

                        {(facture?.parsedItems?.length ?? 0) > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {facture?.parsedItems?.map((item, idx) => {
                                    const itemId = item.id || `item-${idx}`;
                                    const isChecked = !!selectedArticles[itemId];
                                    return (
                                        <div key={itemId} onClick={() => handleToggleArticle(itemId)} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: isChecked ? 'rgba(13,147,148,0.1)' : 'var(--bg)', borderRadius: '12px', border: isChecked ? '2px solid #0d9394' : '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: isChecked ? '0 4px 6px -1px rgba(13,147,148,0.1)' : '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
                                            <input type="checkbox" checked={isChecked} readOnly style={{ width: '16px', height: '16px', accentColor: '#0d9394', marginTop: '2px', flexShrink: 0, pointerEvents: 'none' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.description || `${itemLabel} ${idx + 1}`}</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                                                    <div><div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Qté</div><div style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 500 }}>{item.quantite ?? '—'}</div></div>
                                                    <div><div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>PU HT</div><div style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 500 }}>{item.prixUnitaireHt ? `${item.prixUnitaireHt} €` : '—'}</div></div>
                                                    <div><div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>Total TTC</div><div style={{ fontSize: '0.85rem', color: '#0d9394', fontWeight: 700 }}>{item.montantTtc ? `${item.montantTtc} €` : '—'}</div></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <button onClick={handleValidateArticles} disabled={isValidationDone || Object.values(selectedArticles).filter(Boolean).length === 0} style={{ ...btnPrimary, marginTop: '8px', padding: '12px 16px', opacity: (isValidationDone || Object.values(selectedArticles).filter(Boolean).length === 0) ? 0.5 : 1, cursor: (isValidationDone || Object.values(selectedArticles).filter(Boolean).length === 0) ? 'not-allowed' : 'pointer' }}>
                                    {isValidationDone ? 'Articles Validés ✓' : `Valider la sélection (${Object.values(selectedArticles).filter(Boolean).length})`}
                                </button>

                                {isValidationDone && <div style={{ fontSize: '0.75rem', color: '#059669', textAlign: 'center', fontWeight: 500 }}>La sélection a bien été enregistrée.</div>}
                            </div>
                        ) : (
                            <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text3)' }}>
                                <Icons.Search width={32} height={32} style={{ opacity: 0.5, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                                <div style={{ fontSize: '0.8rem' }}>Aucun élément détecté</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT SIDE ── */}
                <div style={{ width: '50%', padding: '16px', overflow: 'auto' }}>
                    <div style={{ backgroundColor: 'var(--bg)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg2)' }}>
                            {(['base', 'supplementaire'] as const).map(tab => (
                                <button key={tab} className="fd-tab-btn" onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 16px', textAlign: 'center', borderBottom: activeTab === tab ? '2px solid #0d9394' : '2px solid transparent', backgroundColor: activeTab === tab ? 'var(--bg)' : 'transparent', fontSize: '0.8rem', fontWeight: activeTab === tab ? 600 : 500, color: activeTab === tab ? '#0d9394' : 'var(--text2)', transition: 'all 0.2s ease' }}>
                                    {tab === 'base' ? 'Informations de base' : 'Informations supplementaires'}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={{ flex: 1, padding: '16px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

                            {activeTab === 'base' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>

                                        {/* Numéro de facture */}
                                        <FieldWrap half>
                                            <FieldLabel>Numéro de facture</FieldLabel>
                                            <input className="fd-input" style={iStyle} name="numeroFacture" value={formData.numeroFacture} onChange={handleInputChange} placeholder="NF00001" />
                                        </FieldWrap>

                                        {/* Type facture */}
                                        <FieldWrap half>
                                            <FieldLabel>Type facture</FieldLabel>
                                            <select className="fd-select" style={sStyle} name="typeFacture" value={formData.typeFacture} onChange={handleInputChange}>
                                                <option value="">Sélectionner type</option>
                                                <option value="factureAchat">Facture Achat</option>
                                                <option value="factureVente">Facture Vente</option>
                                                <option value="avoirVente">Avoir Vente</option>
                                                <option value="avoirAchat">Avoir Achat</option>
                                                {formData.typeFacture && !allowedTypeFactures.includes(formData.typeFacture) && <option value={formData.typeFacture}>{formData.typeFacture}</option>}
                                            </select>
                                        </FieldWrap>

                                        {/* Catégorie comptable */}
                                        <FieldWrap>
                                            <FieldLabel>Catégorie comptable</FieldLabel>
                                            <select className="fd-select" style={sStyle} name="categorieComptable" value={formData.categorieComptable} onChange={handleInputChange}>
                                                <option value="">Sélectionner une catégorie comptable</option>
                                                {categoriesComptables.map((c, i) => <option key={i} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </FieldWrap>

                                        {/* Année */}
                                        <FieldWrap half>
                                            <FieldLabel>Année</FieldLabel>
                                            <select className="fd-select" style={sStyle} name="annee" value={formData.annee} onChange={handleInputChange}>
                                                <option value="">Sélectionner Année</option>
                                                {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
                                            </select>
                                        </FieldWrap>

                                        {/* Période */}
                                        <FieldWrap half>
                                            <FieldLabel>Période</FieldLabel>
                                            <select className="fd-select" style={{ ...sStyle, opacity: (!formData.annee && !formData.periode) ? 0.5 : 1 }} name="periode" value={formData.periode} onChange={handleInputChange} disabled={!formData.annee && !formData.periode}>
                                                <option value="">{!formData.annee && !formData.periode ? "Sélectionner d'abord une année" : 'Sélectionner Période'}</option>
                                                {filteredMonths.map((m, i) => <option key={i} value={m.periode}>{m.periode}</option>)}
                                            </select>
                                        </FieldWrap>

                                        {/* Montant TTC */}
                                        <FieldWrap half>
                                            <FieldLabel>Montant TTC</FieldLabel>
                                            <MoneyInput name="montantTtc" value={formData.montantTtc} onChange={handleInputChange} />
                                        </FieldWrap>

                                        {/* Montant HT */}
                                        <FieldWrap half>
                                            <FieldLabel>Montant HT</FieldLabel>
                                            <MoneyInput name="montantHt" value={formData.montantHt} onChange={handleInputChange} />
                                        </FieldWrap>

                                        {/* Montant TVA */}
                                        <FieldWrap half>
                                            <FieldLabel>Montant TVA</FieldLabel>
                                            <MoneyInput name="montantTva" value={formData.montantTva} onChange={handleInputChange} />
                                        </FieldWrap>

                                        {/* Status */}
                                        <FieldWrap half>
                                            <FieldLabel>Status</FieldLabel>
                                            <select className="fd-select" style={sStyle} name="status" value={formData.status} onChange={handleInputChange}>
                                                <option value="">Sélectionner</option>
                                                <option value="VALIDER">VALIDER</option>
                                                <option value="PAYER">PAYER</option>
                                                <option value="OCR_AUTO_DONE">OCR_AUTO_DONE</option>
                                                <option value="DUPLICATION">DUPLICATION</option>
                                                <option value="EN_TRAITEMENT">EN_TRAITEMENT</option>
                                                <option value="ANNULER">ANNULER</option>
                                                <option value="DELETE">DELETE</option>
                                                {formData.status && !allowedStatuses.includes(formData.status) && <option value={formData.status}>{formData.status}</option>}
                                            </select>
                                        </FieldWrap>

                                        {/* Status Payement */}
                                        <FieldWrap half>
                                            <FieldLabel>Status Payement</FieldLabel>
                                            <select className="fd-select" style={sStyle} name="statusPayement" value={formData.statusPayement} onChange={handleInputChange}>
                                                <option value="">Sélectionner</option>
                                                <option value="PAYER">PAYER</option>
                                                <option value="NON_PAYER">NON_PAYER</option>
                                            </select>
                                        </FieldWrap>

                                        {/* Date Échéance */}
                                        <FieldWrap half>
                                            <FieldLabel>Date d'échéance</FieldLabel>
                                            <input className="fd-input" style={iStyle} type="date" name="dateEcheance" value={formData.dateEcheance} onChange={handleInputChange} />
                                        </FieldWrap>

                                        {/* Date Facture */}
                                        <FieldWrap half>
                                            <FieldLabel>Date Facture</FieldLabel>
                                            <input className="fd-input" style={iStyle} type="date" name="dateFacture" value={formData.dateFacture} onChange={handleInputChange} />
                                        </FieldWrap>

                                        {/* Conditions */}
                                        <FieldWrap>
                                            <FieldLabel>Conditions / modalités (contentText)</FieldLabel>
                                            <textarea className="fd-textarea" style={{ ...iStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} name="conditionsText" value={formData.conditionsText} onChange={handleInputChange} placeholder="Conditions de paiement, mode de règlement..." />
                                        </FieldWrap>

                                        {/* Categorie Parent */}
                                        <FieldWrap half>
                                            <FieldLabel>Categorie Parent</FieldLabel>
                                            <select className="fd-select" style={sStyle} name="categorie" value={formData.categorie} onChange={handleInputChange}>
                                                <option value="">Sélectionner</option>
                                                {categoriesFactureParent.map((c, i) => <option key={i} value={c.parentCategory}>{c.parentCategory}</option>)}
                                            </select>
                                        </FieldWrap>

                                        {/* Sous Categorie */}
                                        {showChildSelect && (
                                            <FieldWrap half>
                                                <FieldLabel>Sous Categorie</FieldLabel>
                                                <select className="fd-select" style={sStyle} name="sousCategorie" value={formData.sousCategorie} onChange={handleInputChange}>
                                                    <option value="">Sélectionner</option>
                                                    {categoriesFacture.map((c, i) => <option key={i} value={c.category}>{c.category}</option>)}
                                                </select>
                                            </FieldWrap>
                                        )}

                                        {/* Quantité */}
                                        <FieldWrap half>
                                            <FieldLabel>Quantité</FieldLabel>
                                            <input className="fd-input" style={iStyle} type="number" name="quantite" value={formData.quantite} onChange={handleInputChange} placeholder="1" />
                                        </FieldWrap>

                                        {/* Articles Section */}
                                        <FieldWrap>
                                            {formData.articles.map((article, index) => (
                                                <div key={article.idArticle} style={{ display: 'flex', position: 'relative', marginBottom: '16px', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginTop: index !== 0 ? '16px' : '8px', backgroundColor: 'var(--bg2)' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', width: '100%', paddingBottom: '8px' }}>
                                                        {/* Article Name */}
                                                        <div style={{ width: '50%' }}>
                                                            <FieldLabel>{itemLabel}</FieldLabel>
                                                            <textarea className="fd-textarea" style={{ ...iStyle, minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }} placeholder={itemLabel === 'Article' ? "Nom de l'article" : 'Description de la prestation'} value={article.libelle} onChange={(e) => handleArticleChange(index, 'libelle', e.target.value)} />
                                                        </div>
                                                        {/* Quantité */}
                                                        <div style={{ width: 'calc(25% - 8px)' }}>
                                                            <FieldLabel>Quantité</FieldLabel>
                                                            <input className="fd-input" style={{ ...iStyle, marginBottom: '8px' }} type="number" placeholder="0" value={article.quantite} onChange={(e) => handleArticleChange(index, 'quantite', parseFloat(e.target.value) || 0)} min={0} />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ color: 'var(--text2)', fontSize: '0.7rem' }}>Discount:</span>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <span title="Tax 1" style={{ color: 'var(--text2)', fontSize: '0.7rem' }}>0%</span>
                                                                    <span title="Tax 2" style={{ color: 'var(--text2)', fontSize: '0.7rem' }}>0%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Prix unitaire HT */}
                                                        <div style={{ width: 'calc(25% - 16px)' }}>
                                                            <FieldLabel>Prix unitaire HT</FieldLabel>
                                                            <div style={{ position: 'relative', marginBottom: '8px' }}>
                                                                <input className="fd-input" style={{ ...iStyle, paddingRight: '28px' }} type="number" placeholder="0" value={article.prixUnitaireHT} onChange={(e) => handleArticleChange(index, 'prixUnitaireHT', parseFloat(e.target.value) || 0)} min={0} />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: '0.8rem', pointerEvents: 'none' }}>€</span>
                                                            </div>
                                                            <div>
                                                                <span style={{ color: 'var(--text2)', fontSize: '0.7rem' }}>Prix total HT:</span>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500 }}>{(article.quantite * article.prixUnitaireHT).toFixed(2)} €</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Delete */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', borderLeft: '1px solid var(--border)', paddingLeft: '8px' }}>
                                                        <button className="fd-icon-btn" onClick={() => handleDeleteArticle(article.idArticle, index)} style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'transparent', color: '#ef4444' }}>
                                                            <Icons.Trash width={16} height={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={handleAddArticle} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '6px 14px', backgroundColor: '#0d9394', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                                                <Icons.Plus width={14} height={14} />
                                                Ajouter {itemsSectionLabel}
                                            </button>
                                        </FieldWrap>
                                    </div>

                                    {/* Save */}
                                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                        <button onClick={handleSave} disabled={isSaving} style={{ ...btnPrimary, opacity: isSaving ? 0.6 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                                            {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
                                        </button>
                                        {saveMessage && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: saveMessage.includes('succès') ? '#16a34a' : '#ef4444' }}>{saveMessage}</div>}
                                    </div>
                                </div>
                            ) : (
                                /* ── Supplementaire Tab ── */
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {attachmentInfo.type && !showAttachInterface ? (
                                        /* Has attachment */
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {/* Sub-tabs */}
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                                {(['projet', attachmentInfo.type, 'consultant'] as const).map((tab, ti) => {
                                                    const label = tab === 'projet' ? 'Projet' : tab === 'prestation' ? 'Prestation' : tab === 'depense' ? 'Dépense' : 'Consultant';
                                                    const isActive = infoTab === tab || (tab === attachmentInfo.type && (infoTab === 'prestation' || infoTab === 'depense'));
                                                    return (
                                                        <button key={ti} className="fd-info-btn" onClick={() => setInfoTab(tab as any)} style={{ fontWeight: isActive ? 600 : 400, backgroundColor: isActive ? '#0d9394' : 'transparent', color: isActive ? 'white' : 'var(--text2)' }}>
                                                            {label}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Tab Content */}
                                            <div style={{ flex: 1, overflow: 'auto' }}>
                                                {infoTab === 'projet' && (() => {
                                                    const project = getAttachedProject();
                                                    return (
                                                        <div style={{ background: 'linear-gradient(135deg, #0d9394 0%, #0b7a7b 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                                                            {!project ? <span>Aucun projet associé</span> : (
                                                                <>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px' }}><Icons.Briefcase width={20} height={20} style={{ color: 'white' }} /></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Projet</div><div style={{ fontSize: '1rem', fontWeight: 600 }}>{project.name}</div></div>
                                                                    </div>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Client</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{project.client}</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Status</div><span style={{ display: 'inline-block', backgroundColor: project.status === 'En cours' ? 'rgba(34,197,94,0.2)' : project.status === 'Terminé' ? 'rgba(59,130,246,0.2)' : 'rgba(251,191,36,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{project.status}</span></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Date début</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{project.startDate}</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Date fin</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{project.endDate}</div></div>
                                                                        <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Budget</div><div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{project.budget.toLocaleString('fr-FR')} €</div></div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {infoTab === 'prestation' && attachmentInfo.type === 'prestation' && (() => {
                                                    const prestation = getAttachedPrestation();
                                                    return (
                                                        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                                                            {!prestation ? <span>Aucune prestation associée</span> : (
                                                                <>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px' }}><Icons.FileText width={20} height={20} style={{ color: 'white' }} /></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Prestation</div><div style={{ fontSize: '1rem', fontWeight: 600 }}>{prestation.reference}</div></div>
                                                                    </div>
                                                                    <div style={{ marginBottom: '16px' }}><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Description</div><div style={{ fontSize: '0.85rem' }}>{prestation.description}</div></div>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Type</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{prestation.type}</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Status</div><span style={{ display: 'inline-block', backgroundColor: prestation.status === 'Validée' ? 'rgba(34,197,94,0.2)' : prestation.status === 'Facturée' ? 'rgba(59,130,246,0.2)' : 'rgba(251,191,36,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{prestation.status}</span></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Date début</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{prestation.dateDebut}</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Date fin</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{prestation.dateFin}</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Montant HT</div><div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{prestation.montantHT.toLocaleString('fr-FR')} €</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Montant TTC</div><div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{prestation.montantTTC.toLocaleString('fr-FR')} €</div></div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {infoTab === 'depense' && attachmentInfo.type === 'depense' && (() => {
                                                    const depense = getAttachedDepense();
                                                    return (
                                                        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                                                            {!depense ? <span>Aucune dépense associée</span> : (
                                                                <>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                                        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px' }}><Icons.CreditCard width={20} height={20} style={{ color: 'white' }} /></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Dépense</div><div style={{ fontSize: '1rem', fontWeight: 600 }}>{depense.reference}</div></div>
                                                                    </div>
                                                                    <div style={{ marginBottom: '16px' }}><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Description</div><div style={{ fontSize: '0.85rem' }}>{depense.description}</div></div>
                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Catégorie</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{depense.categorie}</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Type</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{depense.type}</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Status</div><span style={{ display: 'inline-block', backgroundColor: depense.status === 'Validée' ? 'rgba(34,197,94,0.2)' : depense.status === 'Annulée' ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{depense.status}</span></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Date</div><div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{depense.dateDepense}</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Montant HT</div><div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{depense.montantHT.toLocaleString('fr-FR')} €</div></div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Montant TTC</div><div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{depense.montantTTC.toLocaleString('fr-FR')} €</div></div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {infoTab === 'consultant' && (() => {
                                                    const consultant = getAttachedConsultant();
                                                    return (
                                                        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                                                            {!consultant ? <span>Aucun consultant associé</span> : (
                                                                <>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                                        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600 }}>{consultant.name.split(' ').map(n => n[0]).join('')}</div>
                                                                        <div><div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Consultant</div><div style={{ fontSize: '1rem', fontWeight: 600 }}>{consultant.name}</div></div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Mail width={14} height={14} style={{ opacity: 0.7 }} /><span style={{ fontSize: '0.85rem' }}>{consultant.email}</span></div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Phone width={14} height={14} style={{ opacity: 0.7 }} /><span style={{ fontSize: '0.85rem' }}>{consultant.phone}</span></div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Star width={14} height={14} style={{ opacity: 0.7 }} /><span style={{ fontSize: '0.85rem' }}>{consultant.speciality}</span></div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                                <button style={{ ...btnOutline }} onClick={() => setShowAttachInterface(true)}>Modifier l'attachement</button>
                                            </div>
                                        </div>
                                    ) : !showAttachInterface ? (
                                        /* No attachment - empty state */
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                                            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Icons.Link width={32} height={32} style={{ color: 'var(--text3)' }} />
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Aucune association</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>Cette facture n'est pas encore liée à une prestation ou une dépense</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <button onClick={() => { setAttachType('prestation'); setShowAttachInterface(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                                                    <Icons.FileText width={14} height={14} />
                                                    Attacher prestation
                                                </button>
                                                <button onClick={() => { setAttachType('depense'); setShowAttachInterface(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                                                    <Icons.CreditCard width={14} height={14} />
                                                    Attacher dépense
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Attach interface */
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {/* Back */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                                <button className="fd-icon-btn" onClick={() => { setShowAttachInterface(false); setSelectedClientFournisseur(null); setSelectedProject(null); setSelectedPrestation(null); setSelectedDepense(null); }} style={{ padding: '6px', backgroundColor: 'var(--bg2)', borderRadius: '6px' }}>
                                                    <Icons.ArrowLeft width={14} height={14} style={{ color: 'var(--text)' }} />
                                                </button>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{attachType === 'prestation' ? 'Attacher une prestation' : 'Attacher une dépense'}</span>
                                            </div>

                                            {/* Step 1: Select Client/Fournisseur */}
                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '8px' }}>1. Sélectionner {typeIsVente ? 'le client' : 'le fournisseur'}</div>
                                                <select className="fd-select" style={sStyle} value={selectedClientFournisseur?.id || ''} onChange={(e) => { const cf = clientsFournisseurs.find(c => c.id === e.target.value) || null; setSelectedClientFournisseur(cf); setSelectedProject(null); setSelectedPrestation(null); setSelectedDepense(null); }}>
                                                    <option value="">{typeIsVente ? 'Rechercher un client...' : 'Rechercher un fournisseur...'}</option>
                                                    {clientsFournisseurs.filter(cf => typeIsVente ? cf.type === 'client' : cf.type === 'fournisseur').map(cf => <option key={cf.id} value={cf.id}>{cf.name}</option>)}
                                                </select>
                                            </div>

                                            {/* Step 2: Select Project */}
                                            {selectedClientFournisseur && (
                                                <div style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '8px' }}>2. Sélectionner le projet</div>
                                                    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', maxHeight: '150px', overflowY: 'auto' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                            <thead>
                                                                <tr style={{ backgroundColor: 'var(--bg2)' }}>
                                                                    <th style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'left', color: 'var(--text2)', fontWeight: 600 }}></th>
                                                                    <th style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'left', color: 'var(--text2)', fontWeight: 600 }}>Projet</th>
                                                                    <th style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'left', color: 'var(--text2)', fontWeight: 600 }}>Status</th>
                                                                    <th style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'right', color: 'var(--text2)', fontWeight: 600 }}>Budget</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {projectsData.map(project => (
                                                                    <tr key={project.id} className="fd-tr-hover" onClick={() => { setSelectedProject(project); setSelectedPrestation(null); setSelectedDepense(null); }} style={{ cursor: 'pointer', backgroundColor: selectedProject?.id === project.id ? 'rgba(13,147,148,0.1)' : 'var(--bg)' }}>
                                                                        <td style={{ padding: '8px' }}><input type="radio" readOnly checked={selectedProject?.id === project.id} style={{ accentColor: '#0d9394' }} /></td>
                                                                        <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text)' }}>{project.name}</td>
                                                                        <td style={{ padding: '8px' }}><span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: project.status === 'En cours' ? '#dcfce7' : project.status === 'Terminé' ? '#dbeafe' : '#fef3c7', color: project.status === 'En cours' ? '#16a34a' : project.status === 'Terminé' ? '#2563eb' : '#d97706' }}>{project.status}</span></td>
                                                                        <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text)', textAlign: 'right' }}>{project.budget.toLocaleString('fr-FR')} €</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Select Prestation or Depense */}
                                            {selectedProject && (
                                                <div style={{ marginBottom: '16px', flex: 1 }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '8px' }}>3. Sélectionner {attachType === 'prestation' ? 'la prestation' : 'la dépense'}</div>
                                                    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', maxHeight: '150px', overflowY: 'auto' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                            <thead>
                                                                <tr style={{ backgroundColor: 'var(--bg2)' }}>
                                                                    <th style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'left', color: 'var(--text2)', fontWeight: 600 }}></th>
                                                                    <th style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'left', color: 'var(--text2)', fontWeight: 600 }}>Référence</th>
                                                                    <th style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'left', color: 'var(--text2)', fontWeight: 600 }}>Description</th>
                                                                    <th style={{ padding: '8px', fontSize: '0.7rem', textAlign: 'right', color: 'var(--text2)', fontWeight: 600 }}>Montant TTC</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {attachType === 'prestation' ? prestationsData.map(p => (
                                                                    <tr key={p.id} className="fd-tr-hover" onClick={() => setSelectedPrestation(p)} style={{ cursor: 'pointer', backgroundColor: selectedPrestation?.id === p.id ? 'rgba(139,92,246,0.1)' : 'var(--bg)' }}>
                                                                        <td style={{ padding: '8px' }}><input type="radio" readOnly checked={selectedPrestation?.id === p.id} style={{ accentColor: '#8b5cf6' }} /></td>
                                                                        <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>{p.reference}</td>
                                                                        <td style={{ padding: '8px', fontSize: '0.7rem', color: 'var(--text2)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</td>
                                                                        <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text)', textAlign: 'right', fontWeight: 500 }}>{p.montantTTC.toLocaleString('fr-FR')} €</td>
                                                                    </tr>
                                                                )) : depensesData.map(d => (
                                                                    <tr key={d.id} className="fd-tr-hover" onClick={() => setSelectedDepense(d)} style={{ cursor: 'pointer', backgroundColor: selectedDepense?.id === d.id ? 'rgba(245,158,11,0.1)' : 'var(--bg)' }}>
                                                                        <td style={{ padding: '8px' }}><input type="radio" readOnly checked={selectedDepense?.id === d.id} style={{ accentColor: '#f59e0b' }} /></td>
                                                                        <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>{d.reference}</td>
                                                                        <td style={{ padding: '8px', fontSize: '0.7rem', color: 'var(--text2)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</td>
                                                                        <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--text)', textAlign: 'right', fontWeight: 500 }}>{d.montantTTC.toLocaleString('fr-FR')} €</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Confirm */}
                                            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                                <button disabled={!(selectedPrestation || selectedDepense)} onClick={() => setShowAttachInterface(false)} style={{ ...btnPrimary, backgroundColor: attachType === 'prestation' ? '#8b5cf6' : '#f59e0b', opacity: !(selectedPrestation || selectedDepense) ? 0.5 : 1, cursor: !(selectedPrestation || selectedDepense) ? 'not-allowed' : 'pointer' }}>
                                                    Confirmer l'attachement
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Processing Overlay ── */}
            {isProcessing && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(12px)' }}>
                    <div className="fd-slide-up-modal" style={{ width: 380, padding: '32px', background: 'var(--header)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        {processingStep === 1 && (
                            <div style={{ animation: 'fd-fadeInScale 0.3s ease-out' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', margin: '0 auto 24px' }}>
                                    <Icons.RotateCw width={40} height={40} className="fd-spin" style={{ color: '#2563eb' }} />
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Initialisation de l'Agent Sofia</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>Lecture des données financières en cours...</div>
                            </div>
                        )}
                        {processingStep === 2 && (
                            <div style={{ animation: 'fd-fadeInScale 0.3s ease-out' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', margin: '0 auto 24px' }}>
                                    <Icons.Zap width={40} height={40} className="fd-processing-pulse" style={{ color: '#f59e0b' }} />
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Traitement Analytique</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>Liaison des éléments à la facture...</div>
                            </div>
                        )}
                        {processingStep === 3 && (
                            <div style={{ animation: 'fd-fadeInScale 0.3s ease-out' }}>
                                <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', margin: '0 auto 24px' }}>
                                    <Icons.CheckCircle width={40} height={40} className="fd-success-pop" style={{ color: '#10b981' }} />
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Succès !</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--text2)' }}>La liaison a été effectuée avec succès.</div>
                                <div style={{ marginTop: '16px', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Félicitations ! 🎉</div>
                            </div>
                        )}
                        <div style={{ width: '100%', height: 4, backgroundColor: 'var(--border)', borderRadius: '2px', marginTop: '32px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: processingStep === 1 ? '#2563eb' : processingStep === 2 ? '#f59e0b' : '#10b981', width: processingStep === 1 ? '33%' : processingStep === 2 ? '66%' : '100%', transition: 'all 0.5s ease-out', borderRadius: '2px' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Saving Dialog ── */}
            {savingDialogOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ background: 'var(--bg)', borderRadius: '12px', minWidth: '320px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid var(--border)' }}>
                        {savingStatus === 'saving' && <Icons.Loader2 width={24} height={24} className="fd-spin" style={{ color: '#0d9394', flexShrink: 0 }} />}
                        {savingStatus === 'success' && <Icons.Check width={24} height={24} style={{ color: '#16a34a', flexShrink: 0 }} />}
                        {savingStatus === 'error' && <Icons.X width={24} height={24} style={{ color: '#ef4444', flexShrink: 0 }} />}
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                                {savingStatus === 'saving' && 'Veuillez patienter svp !'}
                                {savingStatus === 'success' && 'Enregistré avec succès'}
                                {savingStatus === 'error' && 'Enregistrement échoué'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                                {savingStatus === 'saving' ? 'Sauvegarde en cours...' : savingStatus === 'success' ? 'Les modifications ont été appliquées.' : 'Une erreur est survenue lors de la sauvegarde.'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
