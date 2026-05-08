"use client";

import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from '../../../../assets/icons';
import { InvoiceList } from './bankDetailsModeManuel/InvoiceList';
import { SocialChargesList } from './bankDetailsModeManuel/SocialChargesList';
import { CategorizationTab } from './bankDetailsModeManuel/CategorizationTab';

interface Transaction {
    id: string;
    idTransaction: string;
    date: string;
    amount: number;
    montant: number;
    bankDescription: string;
    description?: string;
    typeOperation?: 'CREDIT' | 'DEBIT';
    categorie?: string;
    statut?: string;
    categorieParent?: string;
    categorieTransaction?: string;
    client?: string;
    fournisseur?: string;
    salarie?: string;
    factureList?: string[];
    chargeAttacher?: number;
    label?: string;
}

interface BankDetailsModalProps {
    open: boolean;
    transaction: Transaction | null;
    onClose: () => void;
}

const getSofiaMessage = (transactionId: string): string => {
    const messages: Record<string, string> = {
        'tr-1': "Salut! Pour cette transaction, on l'a attachée avec des factures avec succès. Le client ABC a bien payé sa facture!",
        'tr-2': "Salut! Cette transaction a été attachée à une facture fournisseur et des charges sociales avec succès.",
    };
    return messages[transactionId] || "Salut! Je suis Sofia, votre assistant IA. Je peux vous aider à rapprocher cette transaction avec vos factures.";
};

const getSuggestionMessage = (transactionId: string): string | null => {
    const suggestions: Record<string, string | null> = {
        'tr-1': "Pour cette transaction, je te propose d'ajouter des charges sociales associées si nécessaire.",
    };
    return suggestions[transactionId] !== undefined ? suggestions[transactionId] : null;
};

interface CarouselItem { id: string; description: string; amount: number; date: string; reference?: string; }
interface CarouselSlide { type: 'facture' | 'charge'; title: string; items: CarouselItem[]; }

const getCarouselPropositions = (transactionId: string): CarouselSlide[] => {
    const propositions: Record<string, CarouselSlide[]> = {
        'tr-1': [{ type: 'charge', title: 'Charges proposées', items: [{ id: 'ch-prop-1', description: 'TVA collectée sur vente', amount: 250.00, date: '18/01/2025', reference: 'CHARGE-2025-046' }] }],
        'tr-3': [{ type: 'facture', title: 'Factures proposées', items: [{ id: 'fact-prop-1', description: 'Fiche de paie Janvier 2025', amount: 2850.00, date: '15/01/2025', reference: 'PAIE-2025-001' }] }],
        'tr-4': [
            { type: 'charge', title: 'Charges proposées', items: [{ id: 'ch-prop-2', description: 'TVA collectée Enterprise', amount: 1700.00, date: '14/01/2025', reference: 'CHARGE-2025-047' }] },
            { type: 'facture', title: 'Factures proposées', items: [{ id: 'fact-prop-2', description: 'Avoir Enterprise Corp', amount: -500.00, date: '10/01/2025', reference: 'AVO-2025-001' }] },
        ],
    };
    return propositions[transactionId] || [];
};

const getDefaultAttachedItems = (transactionId: string): any[] => {
    const items: Record<string, any[]> = {
        'tr-1': [
            { idRessource: 'sofia-fact-001', typeRessource: 'FACTURE', numeroFacture: 'FACT-2025-001', montantTtc: 1250.00, organisme: 'Client ABC', attachedBy: 'Agent Sofia', attachedByType: 'agent' },
            { idRessource: 'sofia-charge-001', typeRessource: 'CHARGE_SOCIAL', numeroFacture: '01/2025', montantTtc: 250.00, organisme: 'TVA collectée', attachedBy: 'Agent Sofia', attachedByType: 'agent' },
            { idRessource: 'human-fact-001', typeRessource: 'FACTURE', numeroFacture: 'FACT-2025-015', montantTtc: 890.50, organisme: 'Tech Solutions', attachedBy: 'mouhcine', attachedByType: 'human' },
        ],
        'tr-2': [
            { idRessource: 'sofia-fact-002', typeRessource: 'FACTURE', numeroFacture: 'FAC-F2025-089', montantTtc: 3600.00, organisme: 'Fournisseur XYZ', attachedBy: 'Agent Sofia', attachedByType: 'agent' },
            { idRessource: 'sofia-charge-002', typeRessource: 'CHARGE_SOCIAL', numeroFacture: '01/2025', montantTtc: 450.00, organisme: 'Cotisations sociales', attachedBy: 'Agent Sofia', attachedByType: 'agent' },
        ],
    };
    return items[transactionId] || [];
};

interface MockReleveLine {
    date: string;
    dateValeur: string;
    libelle: string;
    debit?: number;
    credit?: number;
    solde: number;
    highlight?: boolean;
}

interface MockReleve {
    banque: string;
    bic: string;
    agence: string;
    numCompte: string;
    iban: string;
    titulaire: string;
    adressTitulaire: string;
    periode: string;
    soldeInitial: number;
    lines: MockReleveLine[];
    soldeFinal: number;
}

const getMockReleve = (tx: Transaction): MockReleve => {
    const raw = tx.date || '15/01/2025';
    const parts = raw.includes('/') ? raw.split('/') : raw.split('-').reverse();
    const day = parts[0] || '15';
    const month = parts[1] || '01';
    const year = parts[2] || '2025';
    const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const mName = monthNames[parseInt(month, 10) - 1] || 'Janvier';
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();

    const absAmount = Math.abs(tx.montant || tx.amount || 0);
    const isCredit = (tx.typeOperation === 'CREDIT') || (tx.montant || tx.amount || 0) >= 0;
    const soldeFinal = 18_420.72;

    // Build running balance backwards from soldeFinal
    const others: Array<{ d: string; dv: string; lib: string; deb?: number; crd?: number }> = [
        { d: `02/${month}/${year}`, dv: `03/${month}/${year}`, lib: 'VIR SEPA REÇU PAIEMENT CLIENT', crd: 3_200.00 },
        { d: `05/${month}/${year}`, dv: `05/${month}/${year}`, lib: 'PRLV LOYER BUREAUX', deb: 1_800.00 },
        { d: `08/${month}/${year}`, dv: `09/${month}/${year}`, lib: 'CB FOURNITURES DE BUREAU', deb: 124.50 },
        { d: `12/${month}/${year}`, dv: `12/${month}/${year}`, lib: 'COTISATION URSSAF', deb: 892.00 },
        { d: `${String(daysInMonth - 2).padStart(2,'0')}/${month}/${year}`, dv: `${String(daysInMonth - 2).padStart(2,'0')}/${month}/${year}`, lib: 'PRELEVEMENT ASSURANCE PRO', deb: 148.00 },
        { d: `${String(daysInMonth).padStart(2,'0')}/${month}/${year}`, dv: `${String(daysInMonth).padStart(2,'0')}/${month}/${year}`, lib: 'INTERETS CREDITEURS', crd: 18.72 },
    ];

    // Highlight transaction
    const txLine = {
        d: raw.includes('/') ? raw : `${day}/${month}/${year}`,
        dv: raw.includes('/') ? raw : `${day}/${month}/${year}`,
        lib: (tx.bankDescription || tx.description || 'VIR SEPA TRANSACTION').toUpperCase().slice(0, 44),
        ...(isCredit ? { crd: absAmount } : { deb: absAmount }),
    };

    // Sort all lines by date then assign running balances
    const allRaw = [...others, txLine].sort((a, b) => {
        const toNum = (s: string) => { const p = s.split('/'); return parseInt(p[2])*10000 + parseInt(p[1])*100 + parseInt(p[0]); };
        return toNum(a.d) - toNum(b.d);
    });

    let running = soldeFinal;
    // Compute initial balance by unwinding all lines
    for (const l of [...allRaw].reverse()) {
        running += (l.deb || 0) - (l.crd || 0);
    }
    const soldeInitial = Math.round(running * 100) / 100;
    running = soldeInitial;

    const lines: MockReleveLine[] = allRaw.map(l => {
        running = Math.round((running - (l.deb || 0) + (l.crd || 0)) * 100) / 100;
        return {
            date: l.d, dateValeur: l.dv, libelle: l.lib,
            ...(l.deb ? { debit: l.deb } : {}),
            ...(l.crd ? { credit: l.crd } : {}),
            solde: running,
            highlight: l === txLine,
        };
    });

    return {
        banque: 'BNP Paribas',
        bic: 'BNPAFRPPXXX',
        agence: '16 Grands Boulevards — 75009 Paris',
        numCompte: '0002 0047 854',
        iban: 'FR76 3000 4008 0300 0200 4785 400',
        titulaire: tx.client || tx.fournisseur || tx.salarie || 'SARL EXEMPLE ENTREPRISE',
        adressTitulaire: '12 Rue de la Paix — 75001 Paris',
        periode: `1er ${mName} ${year} au ${daysInMonth} ${mName} ${year}`,
        soldeInitial,
        lines,
        soldeFinal,
    };
};

const CSS_ANIM = `
@keyframes bd-spin { to { transform: rotate(360deg); } }
@keyframes bd-blink { 0%,100%{opacity:1}50%{opacity:0} }
@keyframes bd-dot1 { 0%,80%,100%{transform:scale(0)}40%{transform:scale(1)} }
@keyframes bd-dot2 { 0%,20%,100%{transform:scale(0)}60%{transform:scale(1)} }
@keyframes bd-dot3 { 0%,40%,100%{transform:scale(0)}80%{transform:scale(1)} }
@keyframes bd-fadein { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none} }
`;

export const BankDetailsModal: React.FC<BankDetailsModalProps> = ({ open, transaction, onClose }) => {
    const [activeTab, setActiveTab] = useState<'agent' | 'manuel' | 'releve'>('agent');
    const [manuelTab, setManuelTab] = useState<'categorisation' | 'recherche'>('categorisation');
    const [rechercheSubTab, setRechercheSubTab] = useState<'facture' | 'charge'>('facture');
    const [attachedItems, setAttachedItems] = useState<any[]>([]);

    const [isSofiaThinking, setIsSofiaThinking] = useState(true);
    const [sofiaDisplayed, setSofiaDisplayed] = useState('');
    const [itemsDisplayed, setItemsDisplayed] = useState(0);
    const [suggestionDisplayed, setSuggestionDisplayed] = useState('');
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [showCarousel, setShowCarousel] = useState(false);
    const [carouselSlide, setCarouselSlide] = useState(0);
    const [acceptedItemIds, setAcceptedItemIds] = useState<string[]>([]);
    const [selectedFactures, setSelectedFactures] = useState<string[]>([]);
    const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const [pdfZoom, setPdfZoom] = useState(100);

    const sofiaMessage = transaction ? getSofiaMessage(transaction.idTransaction) : '';
    const rawSuggestionMessage = useMemo(() => transaction ? getSuggestionMessage(transaction.idTransaction) : null, [transaction?.idTransaction]);
    const rawCarouselPropositions = useMemo(() => transaction ? getCarouselPropositions(transaction.idTransaction) : [], [transaction?.idTransaction]);

    const carouselPropositions = useMemo(() =>
        rawCarouselPropositions
            .map(slide => ({ ...slide, items: slide.items.filter(item => !acceptedItemIds.includes(item.id)) }))
            .filter(slide => slide.items.length > 0),
        [rawCarouselPropositions, acceptedItemIds]
    );

    const suggestionMessage = useMemo(() => {
        if (!rawSuggestionMessage) return null;
        if (rawCarouselPropositions.length > 0 && carouselPropositions.length === 0) return "Pour cette transaction, il n'y a plus de proposition maintenant.";
        return rawSuggestionMessage;
    }, [rawSuggestionMessage, rawCarouselPropositions.length, carouselPropositions.length]);

    // Reset on open/transaction change
    useEffect(() => {
        if (open && transaction) {
            setAttachedItems(getDefaultAttachedItems(transaction.idTransaction));
            setIsSofiaThinking(true);
            setSofiaDisplayed('');
            setItemsDisplayed(0);
            setSuggestionDisplayed('');
            setShowSuggestion(false);
            setShowCarousel(false);
            setCarouselSlide(0);
            setAcceptedItemIds([]);
            const t = setTimeout(() => setIsSofiaThinking(false), 1000);
            return () => clearTimeout(t);
        }
    }, [open, transaction?.id]);

    // Typewriter for Sofia message
    useEffect(() => {
        if (!isSofiaThinking && sofiaDisplayed.length < sofiaMessage.length) {
            const t = setTimeout(() => setSofiaDisplayed(sofiaMessage.slice(0, sofiaDisplayed.length + 3)), 12);
            return () => clearTimeout(t);
        }
    }, [isSofiaThinking, sofiaDisplayed, sofiaMessage]);

    // Show suggestion card
    useEffect(() => {
        if (sofiaDisplayed === sofiaMessage && sofiaMessage.length > 0 && suggestionMessage && !showSuggestion) {
            const t = setTimeout(() => setShowSuggestion(true), 500);
            return () => clearTimeout(t);
        }
    }, [sofiaDisplayed, sofiaMessage, suggestionMessage, showSuggestion]);

    // Typewriter for suggestion
    useEffect(() => {
        if (showSuggestion && suggestionMessage && suggestionDisplayed.length < suggestionMessage.length) {
            const t = setTimeout(() => setSuggestionDisplayed(suggestionMessage.slice(0, suggestionDisplayed.length + 3)), 12);
            return () => clearTimeout(t);
        }
    }, [showSuggestion, suggestionMessage, suggestionDisplayed]);

    // Init carousel selections
    useEffect(() => {
        if (carouselPropositions.length > 0) {
            const factures: string[] = [];
            const charges: string[] = [];
            carouselPropositions.forEach(slide => {
                if (slide.type === 'facture') factures.push(...slide.items.map(i => i.id));
                else charges.push(...slide.items.map(i => i.id));
            });
            setSelectedFactures(factures);
            setSelectedCharges(charges);
        }
    }, [carouselPropositions]);

    // Show carousel after suggestion
    useEffect(() => {
        const done = suggestionDisplayed === suggestionMessage && suggestionMessage && suggestionMessage.length > 0;
        if (done && carouselPropositions.length > 0 && !showCarousel) {
            const t = setTimeout(() => setShowCarousel(true), 500);
            return () => clearTimeout(t);
        }
    }, [suggestionDisplayed, suggestionMessage, carouselPropositions.length, showCarousel]);

    const handleAccept = () => {
        const slide = carouselPropositions[carouselSlide];
        const toAccept = slide.type === 'facture'
            ? slide.items.map(i => i.id).filter(id => selectedFactures.includes(id))
            : slide.items.map(i => i.id).filter(id => selectedCharges.includes(id));
        if (toAccept.length === 0) return;
        processAcceptance(toAccept);
    };

    const processAcceptance = (itemsToAccept: string[]) => {
        setIsProcessing(true);
        setProcessingStep(1);
        setTimeout(() => {
            setProcessingStep(2);
            setTimeout(() => {
                setProcessingStep(3);
                setAcceptedItemIds(prev => [...prev, ...itemsToAccept]);
                setTimeout(() => { setIsProcessing(false); setProcessingStep(0); }, 2000);
            }, 3000);
        }, 2000);
    };

    const handleAttachInvoice = (invoice: any) => {
        setAttachedItems(prev => [...prev, { idRessource: invoice.id, typeRessource: 'FACTURE', numeroFacture: invoice.numeroFacture, montantTtc: invoice.montantTtc, organisme: invoice.clientName || invoice.fournisseurName || 'N/A', attachedBy: 'human', attachedByType: 'human' }]);
    };
    const handleDetachInvoice = (invoice: any) => {
        setAttachedItems(prev => prev.filter(item => !(item.idRessource === invoice.id && item.typeRessource === 'FACTURE')));
    };
    const handleAttachCharge = (charge: any) => {
        setAttachedItems(prev => [...prev, { idRessource: charge.idChargeSocial, typeRessource: 'CHARGE_SOCIAL', montantTtc: charge.montant, montant: charge.montant, organisme: charge.nameConsultant || 'N/A', numeroFacture: charge.periodePaie, attachedBy: 'human', attachedByType: 'human' }]);
    };
    const handleDetachCharge = (charge: any) => {
        setAttachedItems(prev => prev.filter(item => !(item.idRessource === charge.idChargeSocial && item.typeRessource === 'CHARGE_SOCIAL')));
    };

    if (!open || !transaction) return null;

    const amount = transaction.montant || transaction.amount || 0;
    const isCredit = (transaction.typeOperation === 'CREDIT') || amount >= 0;

    const SofiaAvatar = (
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>S</span>
        </div>
    );

    const tabBtn = (id: 'agent' | 'manuel' | 'releve', label: string) => (
        <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                background: activeTab === id ? 'var(--primary)' : 'transparent',
                color: activeTab === id ? 'white' : 'var(--text2)',
                transition: 'all 0.15s',
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
            <style>{CSS_ANIM}</style>

            {/* Header */}
            <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'var(--header)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.ArrowLeft style={{ width: 18, height: 18, color: 'var(--text)' }} />
                    </button>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>Détails de la transaction</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>{(transaction.bankDescription || transaction.description || '').slice(0, 50)}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        padding: '6px 14px', borderRadius: 8,
                        background: isCredit ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${isCredit ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isCredit ? '#10b981' : '#ef4444' }}>
                            {isCredit ? '+' : ''}{amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                        </span>
                    </div>
                    <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.X style={{ width: 18, height: 18, color: 'var(--text)' }} />
                    </button>
                </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 16 }}>
                {/* Mode tabs */}
                <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 10, padding: 4, gap: 4, marginBottom: 16, alignSelf: 'flex-start', border: '1px solid var(--border)' }}>
                    {tabBtn('agent', '🤖 Mode Agent Sofia')}
                    {tabBtn('manuel', '✏️ Mode Manuel')}
                    {tabBtn('releve', '📄 Relevé bancaire')}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 16 }}>

                    {/* ── AGENT MODE ── */}
                    {activeTab === 'agent' && (
                        <>
                            {/* Sofia chat column */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                                {/* Sofia message */}
                                <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', padding: 16, animation: 'bd-fadein 0.3s ease' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        {SofiaAvatar}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 6 }}>Sofia — Agent IA</div>
                                            {isSofiaThinking ? (
                                                <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                                                    {[1, 2, 3].map(n => (
                                                        <span key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: `bd-dot${n} 1.2s infinite ease-in-out` }} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
                                                    {sofiaDisplayed}
                                                    {sofiaDisplayed.length < sofiaMessage.length && (
                                                        <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--primary)', marginLeft: 1, animation: 'bd-blink 1s infinite' }} />
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Suggestion message */}
                                {showSuggestion && (
                                    <div style={{ background: 'var(--primaryL)', borderRadius: 12, border: '1px solid var(--primary)', padding: 14, animation: 'bd-fadein 0.3s ease' }}>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <Icons.Sparkles style={{ width: 16, height: 16, color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
                                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text)' }}>
                                                {suggestionDisplayed}
                                                {suggestionDisplayed.length < (suggestionMessage?.length || 0) && (
                                                    <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--primary)', marginLeft: 1, animation: 'bd-blink 1s infinite' }} />
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Carousel */}
                                {showCarousel && carouselPropositions.length > 0 && (
                                    <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', padding: 16, animation: 'bd-fadein 0.3s ease' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{carouselPropositions[carouselSlide]?.title}</span>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {carouselSlide > 0 && (
                                                    <button onClick={() => setCarouselSlide(p => p - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Icons.ChevronLeft style={{ width: 14, height: 14, color: 'var(--text)' }} />
                                                    </button>
                                                )}
                                                {carouselSlide < carouselPropositions.length - 1 && (
                                                    <button onClick={() => setCarouselSlide(p => p + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Icons.ChevronRight style={{ width: 14, height: 14, color: 'var(--text)' }} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {carouselPropositions[carouselSlide]?.items.map(item => {
                                            const isSelected = carouselPropositions[carouselSlide].type === 'facture'
                                                ? selectedFactures.includes(item.id)
                                                : selectedCharges.includes(item.id);
                                            return (
                                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, background: isSelected ? 'var(--primaryL)' : 'var(--bg2)', marginBottom: 8, cursor: 'pointer' }}
                                                    onClick={() => {
                                                        const type = carouselPropositions[carouselSlide].type;
                                                        if (type === 'facture') setSelectedFactures(prev => isSelected ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                                        else setSelectedCharges(prev => isSelected ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                                    }}
                                                >
                                                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, background: isSelected ? 'var(--primary)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {isSelected && <Icons.Check style={{ width: 10, height: 10, color: 'white' }} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{item.description}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{item.reference} — {item.date}</div>
                                                    </div>
                                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: item.amount >= 0 ? '#10b981' : '#ef4444' }}>
                                                        {item.amount >= 0 ? '+' : ''}{item.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                            {isProcessing ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                                    <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'bd-spin 0.8s linear infinite' }} />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                                                        {processingStep === 1 ? 'Vérification...' : processingStep === 2 ? 'Traitement...' : 'Confirmation...'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <button onClick={handleAccept} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                                                        Accepter la sélection
                                                    </button>
                                                    {carouselPropositions.length > 1 && (
                                                        <button onClick={() => processAcceptance(rawCarouselPropositions.flatMap(s => s.items.map(i => i.id)).filter(id => !acceptedItemIds.includes(id)))} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                                                            Tout accepter
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attached items panel */}
                            <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)', padding: 14, flex: 1, overflowY: 'auto' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
                                        Éléments attachés ({attachedItems.length})
                                    </div>
                                    {attachedItems.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: '0.8rem' }}>
                                            <Icons.Link style={{ width: 24, height: 24, margin: '0 auto 8px', display: 'block', color: 'var(--border)' }} />
                                            Aucun élément attaché
                                        </div>
                                    ) : attachedItems.map(item => (
                                        <div key={item.idRessource} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', marginBottom: 8 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: item.typeRessource === 'FACTURE' ? 'rgba(13,147,148,0.1)' : 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {item.typeRessource === 'FACTURE'
                                                    ? <Icons.FileText style={{ width: 14, height: 14, color: 'var(--primary)' }} />
                                                    : <Icons.Users style={{ width: 14, height: 14, color: '#8b5cf6' }} />
                                                }
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.organisme}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>{item.numeroFacture} — {item.attachedByType === 'agent' ? '🤖' : '👤'} {item.attachedBy}</div>
                                            </div>
                                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#ef4444', flexShrink: 0 }}>{(item.montantTtc || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                            <button onClick={() => setAttachedItems(prev => prev.filter(i => i.idRessource !== item.idRessource))} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Icons.X style={{ width: 12, height: 12 }} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Totals */}
                                    {attachedItems.length > 0 && (
                                        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                                                <span style={{ color: 'var(--text2)' }}>Total attaché</span>
                                                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{attachedItems.reduce((s, i) => s + (i.montantTtc || 0), 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span style={{ color: 'var(--text2)' }}>Transaction</span>
                                                <span style={{ fontWeight: 700, color: isCredit ? '#10b981' : '#ef4444' }}>{Math.abs(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Validate button */}
                                <button style={{ width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <Icons.CheckCircle style={{ width: 16, height: 16, display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                                    Valider le rapprochement
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── MANUEL MODE ── */}
                    {activeTab === 'manuel' && (
                        <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden', background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                            {/* Vertical tabs */}
                            <div style={{ width: 180, borderRight: '1px solid var(--border)', padding: 12, display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg2)' }}>
                                {([['categorisation', '⚙️', 'Catégorisation'], ['recherche', '🔍', 'Recherche']] as const).map(([id, icon, label]) => (
                                    <button
                                        key={id}
                                        onClick={() => setManuelTab(id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, textAlign: 'left',
                                            background: manuelTab === id ? 'var(--primaryL)' : 'transparent',
                                            color: manuelTab === id ? 'var(--primary)' : 'var(--text2)',
                                            borderLeft: manuelTab === id ? '3px solid var(--primary)' : '3px solid transparent',
                                        }}
                                    >
                                        <span>{icon}</span>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab content */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {manuelTab === 'categorisation' && (
                                    <CategorizationTab
                                        transaction={transaction}
                                        clients={['Client ABC', 'Enterprise Corp', 'Global Services']}
                                        suppliers={['Fournisseur XYZ', 'Tech Solutions', 'Digital Agency']}
                                        employees={['Jean Dupont', 'Marie Curie', 'Paul Martin']}
                                    />
                                )}
                                {manuelTab === 'recherche' && (
                                    <div style={{ padding: 12 }}>
                                        {/* Sub-tabs */}
                                        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                            {([['facture', '📄', 'Factures'], ['charge', '👥', 'Charges Sociales']] as const).map(([id, icon, label]) => (
                                                <button
                                                    key={id}
                                                    onClick={() => setRechercheSubTab(id)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${rechercheSubTab === id ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                                        background: rechercheSubTab === id ? 'var(--primaryL)' : 'var(--bg2)',
                                                        color: rechercheSubTab === id ? 'var(--primary)' : 'var(--text2)',
                                                    }}
                                                >
                                                    <span>{icon}</span> {label}
                                                </button>
                                            ))}
                                        </div>
                                        {rechercheSubTab === 'facture' && (
                                            <InvoiceList attachedItems={attachedItems} transactionId={transaction.idTransaction} onAttach={handleAttachInvoice} onDetach={handleDetachInvoice} />
                                        )}
                                        {rechercheSubTab === 'charge' && (
                                            <SocialChargesList attachedItems={attachedItems} transactionId={transaction.idTransaction} onAttach={handleAttachCharge} onDetach={handleDetachCharge} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── RELEVÉ PDF MODE ── */}
                    {activeTab === 'releve' && (() => {
                        const releve = getMockReleve(transaction);
                        const scale = pdfZoom / 100;
                        return (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                {/* PDF Toolbar */}
                                <div style={{ height: 46, background: '#3c4043', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0, borderRadius: '10px 10px 0 0' }}>
                                    {/* Page nav */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <button style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                                            <Icons.ChevronLeft style={{ width: 14, height: 14, color: 'white' }} />
                                        </button>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', minWidth: 50, textAlign: 'center' }}>1 / 1</span>
                                        <button style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                                            <Icons.ChevronRight style={{ width: 14, height: 14, color: 'white' }} />
                                        </button>
                                    </div>
                                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
                                    {/* Zoom */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <button onClick={() => setPdfZoom(z => Math.max(50, z - 10))} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, lineHeight: 1 }}>−</button>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', minWidth: 40, textAlign: 'center' }}>{pdfZoom}%</span>
                                        <button onClick={() => setPdfZoom(z => Math.min(200, z + 10))} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, lineHeight: 1 }}>+</button>
                                        <button onClick={() => setPdfZoom(100)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Réinitialiser</button>
                                    </div>
                                    <div style={{ flex: 1 }} />
                                    {/* Right controls */}
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button title="Télécharger" style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icons.Download style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.8)' }} />
                                        </button>
                                        <button title="Imprimer" style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icons.FileText style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.8)' }} />
                                        </button>
                                    </div>
                                </div>

                                {/* PDF canvas area */}
                                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#525659', padding: 28 }}>
                                    <div style={{ transformOrigin: 'top center', transform: `scale(${scale})`, marginBottom: scale < 1 ? `${1123 * (scale - 1)}px` : 0, minHeight: scale < 1 ? 1123 * scale : undefined }}>
                                        {/* A4 page */}
                                        <div style={{ width: 794, minHeight: 1123, margin: '0 auto', background: 'white', boxShadow: '0 6px 40px rgba(0,0,0,0.55)', borderRadius: 2, padding: '56px 64px', fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#1a1a2e', position: 'relative' }}>

                                            {/* Header band */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                                                {/* Bank logo */}
                                                <div>
                                                    <div style={{ width: 64, height: 64, borderRadius: 12, background: 'linear-gradient(135deg,#009e60,#00724a)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                                        <span style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>BNP</span>
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>
                                                        <div style={{ fontWeight: 700, fontSize: 12, color: '#111' }}>BNP Paribas</div>
                                                        <div>{releve.agence}</div>
                                                        <div>BIC : {releve.bic}</div>
                                                    </div>
                                                </div>
                                                {/* Document title */}
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', letterSpacing: 0.5, textTransform: 'uppercase' }}>Relevé de Compte</div>
                                                    <div style={{ fontSize: 11, color: '#777', marginTop: 4 }}>N° de compte : {releve.numCompte}</div>
                                                    <div style={{ fontSize: 11, color: '#777' }}>IBAN : {releve.iban}</div>
                                                    <div style={{ marginTop: 8, padding: '4px 10px', background: '#f0f7ff', borderRadius: 4, display: 'inline-block', fontSize: 11, color: '#2563eb', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                                                        Période : {releve.periode}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div style={{ height: 1, background: 'linear-gradient(to right,#009e60,#e5e7eb)', marginBottom: 20 }} />

                                            {/* Account holder */}
                                            <div style={{ display: 'flex', gap: 32, marginBottom: 28 }}>
                                                <div style={{ flex: 1, padding: '14px 16px', background: '#f8f9fb', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                                                    <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Titulaire du compte</div>
                                                    <div style={{ fontWeight: 700, fontSize: 13, color: '#111' }}>{releve.titulaire}</div>
                                                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{releve.adressTitulaire}</div>
                                                </div>
                                                <div style={{ flex: 1, padding: '14px 16px', background: '#f8f9fb', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                                                    <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Résumé de période</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                                                        <span style={{ color: '#555' }}>Solde au 1er</span>
                                                        <span style={{ fontWeight: 600, color: releve.soldeInitial >= 0 ? '#059669' : '#dc2626' }}>{releve.soldeInitial.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                                        <span style={{ color: '#555' }}>Solde final</span>
                                                        <span style={{ fontWeight: 700, color: releve.soldeFinal >= 0 ? '#059669' : '#dc2626', fontSize: 13 }}>{releve.soldeFinal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Transactions table */}
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                                                <thead>
                                                    <tr style={{ background: '#1a1a2e' }}>
                                                        {['Date', 'Date valeur', 'Libellé', 'Débit (€)', 'Crédit (€)', 'Solde (€)'].map((h, i) => (
                                                            <th key={i} style={{ padding: '9px 10px', textAlign: i >= 3 ? 'right' : 'left', color: 'white', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Opening balance row */}
                                                    <tr style={{ background: '#f0fdf4' }}>
                                                        <td colSpan={3} style={{ padding: '7px 10px', fontWeight: 600, fontSize: 10, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                                            ▶ Solde d'ouverture — 1er {releve.periode.split(' ')[1]} {releve.periode.split(' ')[2]}
                                                        </td>
                                                        <td style={{ padding: '7px 10px', textAlign: 'right' }} />
                                                        <td style={{ padding: '7px 10px', textAlign: 'right' }} />
                                                        <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{releve.soldeInitial.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                    {releve.lines.map((line, idx) => (
                                                        <tr key={idx} style={{ background: line.highlight ? '#fffbeb' : idx % 2 === 0 ? 'white' : '#fafafa', borderLeft: line.highlight ? '3px solid #f59e0b' : '3px solid transparent' }}>
                                                            <td style={{ padding: '8px 10px', color: '#374151', whiteSpace: 'nowrap' }}>{line.date}</td>
                                                            <td style={{ padding: '8px 10px', color: '#6b7280', whiteSpace: 'nowrap' }}>{line.dateValeur}</td>
                                                            <td style={{ padding: '8px 10px', color: line.highlight ? '#92400e' : '#111', fontWeight: line.highlight ? 700 : 400, maxWidth: 280 }}>
                                                                {line.libelle}
                                                                {line.highlight && <span style={{ marginLeft: 8, fontSize: 9, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 3, fontWeight: 600, border: '1px solid #fcd34d' }}>TRANSACTION</span>}
                                                            </td>
                                                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#dc2626', fontWeight: line.debit ? 500 : 400 }}>{line.debit ? line.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''}</td>
                                                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#059669', fontWeight: line.credit ? 500 : 400 }}>{line.credit ? line.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : ''}</td>
                                                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: line.solde >= 0 ? '#059669' : '#dc2626' }}>{line.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    ))}
                                                    {/* Closing balance row */}
                                                    <tr style={{ background: '#f0fdf4', borderTop: '2px solid #059669' }}>
                                                        <td colSpan={3} style={{ padding: '8px 10px', fontWeight: 700, fontSize: 10, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                                            ◀ Solde de clôture — Fin {releve.periode.split(' ')[1]} {releve.periode.split(' ')[2]}
                                                        </td>
                                                        <td style={{ padding: '8px 10px', textAlign: 'right' }} />
                                                        <td style={{ padding: '8px 10px', textAlign: 'right' }} />
                                                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, fontSize: 13, color: '#059669' }}>{releve.soldeFinal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            {/* Footer */}
                                            <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                    <div style={{ fontSize: 9, color: '#9ca3af', maxWidth: 400, lineHeight: 1.5 }}>
                                                        Ce relevé est établi selon les conditions générales en vigueur. En l'absence de contestation de votre part dans un délai de 30 jours, ce relevé sera réputé accepté. BNP Paribas SA — Capital : 2 499 597 122 € — RCS Paris B 662 042 449.
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,#009e60,#00724a)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginBottom: 4 }}>
                                                            <span style={{ color: 'white', fontWeight: 800, fontSize: 11 }}>BNP</span>
                                                        </div>
                                                        <div style={{ fontSize: 9, color: '#9ca3af' }}>Document généré automatiquement</div>
                                                        <div style={{ fontSize: 9, color: '#9ca3af' }}>{new Date().toLocaleDateString('fr-FR')}</div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                </div>
            </div>
        </div>
    );
};
