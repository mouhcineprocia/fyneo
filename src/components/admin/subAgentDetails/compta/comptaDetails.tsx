"use client";

import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from '../../../../assets/icons';

const CSS_ANIM = `
@keyframes cd-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@keyframes cd-blink { 0%,50%{opacity:1;} 51%,100%{opacity:0;} }
@keyframes cd-fadein { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
@keyframes cd-ping { 75%,100%{transform:scale(2);opacity:0;} }
@keyframes cd-pop { 0%{transform:scale(0);} 100%{transform:scale(1);} }
.cd-fadein { animation: cd-fadein 0.3s ease-out forwards; }
`;

interface DeclarationTva {
    uuidDemandeTva: string;
    periode: string;
    status: string;
    dateCreation: string;
}

interface AttachmentItem {
    type: 'facture';
    label: string;
    status: 'success' | 'pending' | 'error';
    amount: number;
}

interface CarouselItem {
    id: string;
    description: string;
    amount: number;
    date: string;
    reference?: string;
}

interface CarouselSlide {
    type: 'facture';
    title: string;
    items: CarouselItem[];
}

interface Facture {
    id: string;
    numeroFacture: string;
    typeFacture: string;
    montantHt: number;
    montantTva: number;
    montantTtc: number;
    status: string;
    dateCreation: string;
    nameFournisseur?: string;
    nameClient?: string;
}

interface ComptaDetailsModalProps {
    open: boolean;
    declaration: DeclarationTva | null;
    onClose: () => void;
}

const mockFactures: Facture[] = [
    { id: 'f1', numeroFacture: 'FACT-2025-001', typeFacture: 'Facture Vente', montantHt: 1000.00, montantTva: 200.00, montantTtc: 1200.00, status: 'VALIDATED', dateCreation: '2025-01-15', nameClient: 'Client ABC' },
    { id: 'f2', numeroFacture: 'FACT-2025-002', typeFacture: 'Facture Achat', montantHt: 500.00, montantTva: 100.00, montantTtc: 600.00, status: 'VALIDATED', dateCreation: '2025-01-14', nameFournisseur: 'Fournisseur XYZ' },
    { id: 'f3', numeroFacture: 'FACT-2025-003', typeFacture: 'Facture Vente', montantHt: 2500.00, montantTva: 500.00, montantTtc: 3000.00, status: 'PENDING', dateCreation: '2025-01-13', nameClient: 'Client DEF' },
    { id: 'f4', numeroFacture: 'FACT-2025-004', typeFacture: 'Facture Achat', montantHt: 800.00, montantTva: 160.00, montantTtc: 960.00, status: 'VALIDATED', dateCreation: '2025-01-12', nameFournisseur: 'Fournisseur ABC' },
    { id: 'f5', numeroFacture: 'FACT-2025-005', typeFacture: 'Facture Vente', montantHt: 3200.00, montantTva: 640.00, montantTtc: 3840.00, status: 'VALIDATED', dateCreation: '2025-01-11', nameClient: 'Client GHI' },
    { id: 'f6', numeroFacture: 'FACT-2025-006', typeFacture: 'Avoir Vente', montantHt: -200.00, montantTva: -40.00, montantTtc: -240.00, status: 'VALIDATED', dateCreation: '2025-01-10', nameClient: 'Client ABC' },
    { id: 'f7', numeroFacture: 'FACT-2025-007', typeFacture: 'Facture Achat', montantHt: 1500.00, montantTva: 300.00, montantTtc: 1800.00, status: 'ISSUED', dateCreation: '2025-01-09', nameFournisseur: 'Fournisseur LMN' },
    { id: 'f8', numeroFacture: 'FACT-2025-008', typeFacture: 'Facture Vente', montantHt: 4500.00, montantTva: 900.00, montantTtc: 5400.00, status: 'VALIDATED', dateCreation: '2025-01-08', nameClient: 'Client JKL' },
];

const years = ['2025', '2024', '2023'];
const trimestres = [
    { value: '1', label: 'Trimestre 1 (Janvier - Mars)' },
    { value: '2', label: 'Trimestre 2 (Avril - Juin)' },
    { value: '3', label: 'Trimestre 3 (Juillet - Septembre)' },
    { value: '4', label: 'Trimestre 4 (Octobre - Decembre)' },
];

const getDeclarationItems = (_periode: string): AttachmentItem[] => [
    { type: 'facture', label: 'FACT-2025-001 - Client ABC - 1 200,00 €', status: 'success', amount: 1200.00 },
    { type: 'facture', label: 'FACT-2025-002 - Fournisseur XYZ - 600,00 €', status: 'success', amount: 600.00 },
    { type: 'facture', label: 'FACT-2025-003 - Client DEF - 3 000,00 €', status: 'success', amount: 3000.00 },
];

const getCarouselPropositions = (_periode: string): CarouselSlide[] => [
    {
        type: 'facture',
        title: 'Factures proposées',
        items: [
            { id: 'prop-1', description: 'Facture Vente - Client GHI', amount: 3840.00, date: '11/01/2025', reference: 'FACT-2025-005' },
            { id: 'prop-2', description: 'Avoir Vente - Client ABC', amount: -240.00, date: '10/01/2025', reference: 'FACT-2025-006' },
            { id: 'prop-3', description: 'Facture Vente - Client JKL', amount: 5400.00, date: '08/01/2025', reference: 'FACT-2025-008' },
        ],
    },
];

const fmtCurrency = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';

const getStatusMeta = (status: string) => {
    const map: Record<string, { bg: string; color: string; border: string }> = {
        VALIDATED: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' },
        PENDING:   { bg: 'rgba(251,191,36,0.1)', color: '#f59e0b', border: '1px solid rgba(251,191,36,0.2)' },
        CANCELLED: { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
        ISSUED:    { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' },
    };
    return map[status] ?? { bg: 'rgba(156,163,175,0.1)', color: 'var(--text2)', border: '1px solid var(--border)' };
};

const SofiaAvatar: React.FC = () => (
    <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>S</span>
    </div>
);

export const ComptaDetailsModal: React.FC<ComptaDetailsModalProps> = ({ open, declaration, onClose }) => {
    const [activeTab, setActiveTab] = useState<'agent' | 'manuel'>('agent');

    /* ── Agent Sofia states ── */
    const [isSofiaThinking, setIsSofiaThinking] = useState(true);
    const [sofiaDisplayedText, setSofiaDisplayedText] = useState('');
    const [itemsDisplayed, setItemsDisplayed] = useState(0);
    const [showSuggestionCard, setShowSuggestionCard] = useState(false);
    const [suggestionDisplayedText, setSuggestionDisplayedText] = useState('');
    const [showCarousel, setShowCarousel] = useState(false);
    const [carouselSlide, setCarouselSlide] = useState(0);
    const [acceptedItemIds, setAcceptedItemIds] = useState<string[]>([]);
    const [selectedFactures, setSelectedFactures] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);

    const sofiaMessage = "Salut! Pour cette demande de declaration TVA, on l'a traitée et attachée avec des factures avec succès. Le montant total de TVA collectée est de 1 300,00 €.";
    const suggestionMessage = "Je te propose aussi ces factures-là, tu peux les valider manuellement si tu veux les inclure dans cette déclaration.";
    const declarationItems = declaration ? getDeclarationItems(declaration.periode) : [];

    const rawCarouselPropositions = useMemo(
        () => (declaration ? getCarouselPropositions(declaration.periode) : []),
        [declaration?.periode]
    );

    const carouselPropositions = useMemo(
        () => rawCarouselPropositions
            .map(slide => ({ ...slide, items: slide.items.filter(item => !acceptedItemIds.includes(item.id)) }))
            .filter(slide => slide.items.length > 0),
        [rawCarouselPropositions, acceptedItemIds]
    );

    /* ── Wizard states ── */
    const [activeStep, setActiveStep] = useState(0);
    const [factureSelected, setFactureSelected] = useState<Facture[]>([]);
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);

    /* ── Filter states ── */
    const [selectedYear, setSelectedYear] = useState('2025');
    const [selectedPeriode, setSelectedPeriode] = useState('');
    const [selectedTrimestre, setSelectedTrimestre] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 5;

    const periodes = selectedYear
        ? ['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => `${m}/${selectedYear}`)
        : [];

    const totalPages = Math.ceil(mockFactures.length / rowsPerPage);
    const paginatedFactures = mockFactures.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const totals = factureSelected.reduce(
        (acc, f) => ({ ht: acc.ht + f.montantHt, tva: acc.tva + f.montantTva, ttc: acc.ttc + f.montantTtc }),
        { ht: 0, tva: 0, ttc: 0 }
    );

    /* ── Reset on open ── */
    useEffect(() => {
        if (open) {
            setActiveStep(0); setFactureSelected([]); setProcessing(false); setCompleted(false);
        }
    }, [open]);

    useEffect(() => {
        if (open && declaration) {
            setIsSofiaThinking(true); setSofiaDisplayedText(''); setItemsDisplayed(0);
            setSuggestionDisplayedText(''); setShowSuggestionCard(false); setShowCarousel(false);
            setCarouselSlide(0); setAcceptedItemIds([]); setSelectedFactures([]);
            const t = setTimeout(() => setIsSofiaThinking(false), 1000);
            return () => clearTimeout(t);
        }
    }, [open, declaration?.uuidDemandeTva]);

    /* ── Typewriter: sofia message ── */
    useEffect(() => {
        if (!isSofiaThinking && sofiaDisplayedText.length < sofiaMessage.length) {
            const t = setTimeout(() => setSofiaDisplayedText(sofiaMessage.slice(0, sofiaDisplayedText.length + 3)), 1);
            return () => clearTimeout(t);
        }
    }, [isSofiaThinking, sofiaDisplayedText]);

    /* ── Items cascade ── */
    useEffect(() => {
        if (sofiaDisplayedText === sofiaMessage && sofiaMessage.length > 0 && itemsDisplayed < declarationItems.length) {
            const t = setTimeout(() => setItemsDisplayed(p => p + 1), 300);
            return () => clearTimeout(t);
        }
    }, [sofiaDisplayedText, itemsDisplayed, declarationItems.length]);

    /* ── Show suggestion ── */
    useEffect(() => {
        if (sofiaDisplayedText === sofiaMessage && sofiaMessage.length > 0 && itemsDisplayed >= declarationItems.length && !showSuggestionCard) {
            const t = setTimeout(() => setShowSuggestionCard(true), 500);
            return () => clearTimeout(t);
        }
    }, [itemsDisplayed, declarationItems.length, sofiaDisplayedText, showSuggestionCard]);

    /* ── Typewriter: suggestion ── */
    useEffect(() => {
        if (showSuggestionCard && suggestionDisplayedText.length < suggestionMessage.length) {
            const t = setTimeout(() => setSuggestionDisplayedText(suggestionMessage.slice(0, suggestionDisplayedText.length + 3)), 1);
            return () => clearTimeout(t);
        }
    }, [showSuggestionCard, suggestionDisplayedText]);

    /* ── Init carousel selected items ── */
    useEffect(() => {
        if (carouselPropositions.length > 0) {
            const ids: string[] = [];
            carouselPropositions.forEach(s => s.items.forEach(i => ids.push(i.id)));
            setSelectedFactures(ids);
        }
    }, [carouselPropositions]);

    /* ── Show carousel ── */
    useEffect(() => {
        if (suggestionDisplayedText === suggestionMessage && suggestionMessage.length > 0 && carouselPropositions.length > 0 && !showCarousel) {
            const t = setTimeout(() => setShowCarousel(true), 500);
            return () => clearTimeout(t);
        }
    }, [suggestionDisplayedText, carouselPropositions.length, showCarousel]);

    /* ── Carousel handlers ── */
    const handleCheckboxToggle = (id: string) =>
        setSelectedFactures(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const processAcceptance = (ids: string[]) => {
        setIsProcessing(true); setProcessingStep(1);
        setTimeout(() => {
            setProcessingStep(2);
            setTimeout(() => {
                setProcessingStep(3);
                setAcceptedItemIds(prev => [...prev, ...ids]);
                setTimeout(() => { setIsProcessing(false); setProcessingStep(0); if (carouselSlide >= carouselPropositions.length - 1) setCarouselSlide(Math.max(0, carouselPropositions.length - 1)); }, 2000);
            }, 3000);
        }, 2000);
    };

    const handleAccept = () => {
        const slide = carouselPropositions[carouselSlide];
        const ids = slide.items.map(i => i.id).filter(id => selectedFactures.includes(id));
        if (ids.length === 0) return;
        processAcceptance(ids);
    };

    const handleAcceptAll = () => {
        const ids: string[] = [];
        rawCarouselPropositions.forEach(s => s.items.forEach(i => { if (!acceptedItemIds.includes(i.id)) ids.push(i.id); }));
        if (ids.length === 0) return;
        processAcceptance(ids);
    };

    /* ── Wizard handlers ── */
    const handleSelectFacture = (f: Facture) =>
        setFactureSelected(prev => prev.some(x => x.id === f.id) ? prev.filter(x => x.id !== f.id) : [...prev, f]);

    const handleSubmit = () => {
        setProcessing(true);
        setTimeout(() => { setProcessing(false); setCompleted(true); setActiveStep(2); }, 2000);
    };

    if (!open || !declaration) return null;

    /* ── Shared style helpers ── */
    const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 } as React.CSSProperties;
    const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', color: 'var(--text)', outline: 'none' };
    const btnPrimary: React.CSSProperties = { padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
    const btnOutline: React.CSSProperties = { padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontWeight: 500, fontSize: 13, cursor: 'pointer' };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <style>{CSS_ANIM}</style>

            {/* Header */}
            <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'var(--header)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.ArrowLeft style={{ width: 16, height: 16, color: 'var(--text)' }} />
                    </button>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Declaration TVA — {declaration.periode}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{declaration.uuidDemandeTva.slice(0, 22)}…</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '4px 14px', borderRadius: 8, background: 'rgba(13,147,148,0.12)', border: '1px solid rgba(13,147,148,0.25)', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{declaration.status}</span>
                    <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.X style={{ width: 16, height: 16, color: 'var(--text)' }} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 20 }}>
                {/* Tab switcher */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: 'var(--bg2)', borderRadius: 12, padding: 6, flexShrink: 0 }}>
                    {(['agent', 'manuel'] as const).map(tab => {
                        const active = activeTab === tab;
                        return (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 16px', borderRadius: 9, border: active ? '1px solid rgba(13,147,148,0.2)' : '1px solid transparent', background: active ? 'var(--card)' : 'transparent', cursor: 'pointer', boxShadow: active ? '0 2px 8px rgba(13,147,148,0.15)' : 'none', transition: 'all .2s' }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'linear-gradient(135deg,#0d9394,#0b7a7b)' : 'var(--bg)', transition: 'all .2s' }}>
                                    {tab === 'agent'
                                        ? <Icons.Sparkles style={{ width: 14, height: 14, color: active ? 'white' : 'var(--text3)' }} />
                                        : <Icons.User style={{ width: 14, height: 14, color: active ? 'white' : 'var(--text3)' }} />}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? 'var(--primary)' : 'var(--text2)' }}>{tab === 'agent' ? 'Agent Sofia' : 'Mode Manuel'}</div>
                                    <div style={{ fontSize: 10, color: active ? 'var(--primary)' : 'var(--text3)' }}>{tab === 'agent' ? 'Traitement automatique IA' : 'Configuration humaine'}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflow: 'auto' }}>

                    {/* ═══════════ AGENT TAB ═══════════ */}
                    {activeTab === 'agent' && (
                        <div style={{ maxWidth: 720, margin: '0 auto' }}>

                            {/* Sofia message */}
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
                                <SofiaAvatar />
                                <div style={{ flex: 1, background: 'rgba(13,147,148,0.07)', border: '1px solid rgba(13,147,148,0.18)', borderRadius: '0 12px 12px 12px', padding: '16px 18px', minHeight: 72 }}>
                                    {isSofiaThinking ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            {[1, 2, 3].map(n => (
                                                <span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: `cd-blink 1.2s ${(n - 1) * 0.2}s infinite` }} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>
                                            {sofiaDisplayedText}
                                            {sofiaDisplayedText.length < sofiaMessage.length && (
                                                <span style={{ display: 'inline-block', width: 2, height: 13, background: 'var(--primary)', marginLeft: 2, animation: 'cd-blink 1s infinite' }} />
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Attached items */}
                            {sofiaDisplayedText === sofiaMessage && declarationItems.length > 0 && (
                                <div className="cd-fadein" style={{ ...card, padding: 18, marginBottom: 16, background: 'rgba(13,147,148,0.07)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Éléments attachés</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {declarationItems.map((item, idx) => {
                                            const ic = item.status === 'success' ? '#22c55e' : item.status === 'pending' ? '#f59e0b' : '#ef4444';
                                            return (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', borderRadius: 9, padding: '10px 12px', opacity: idx < itemsDisplayed ? 1 : 0, transition: 'opacity .3s', animation: idx < itemsDisplayed ? 'cd-fadein .3s ease-out' : 'none' }}>
                                                    <input type="checkbox" checked readOnly style={{ accentColor: ic, width: 14, height: 14, cursor: 'default' }} />
                                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${ic}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        {item.status === 'success' ? <Icons.Check style={{ width: 10, height: 10, color: ic }} /> : item.status === 'pending' ? <Icons.Clock style={{ width: 10, height: 10, color: ic }} /> : <Icons.X style={{ width: 10, height: 10, color: ic }} />}
                                                    </div>
                                                    <span style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(59,130,246,0.1)', fontSize: 10, fontWeight: 600, color: '#3b82f6', flexShrink: 0 }}>{item.type}</span>
                                                    <span style={{ fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Suggestion message */}
                            {showSuggestionCard && (
                                <div className="cd-fadein" style={{ ...card, background: 'rgba(13,147,148,0.07)', borderRadius: '0 12px 12px 12px', padding: '14px 16px', marginBottom: 16 }}>
                                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>
                                        {suggestionDisplayedText}
                                        {suggestionDisplayedText.length < suggestionMessage.length && (
                                            <span style={{ display: 'inline-block', width: 2, height: 13, background: 'var(--primary)', marginLeft: 2, animation: 'cd-blink 1s infinite' }} />
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Carousel */}
                            {showCarousel && carouselPropositions.length > 0 && (
                                <div className="cd-fadein" style={{ ...card, background: 'rgba(13,147,148,0.07)', padding: 18, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
                                    {/* Processing overlay */}
                                    {isProcessing && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(var(--bg-rgb,255,255,255),0.92)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 10 }}>
                                            {processingStep < 3 ? (
                                                <>
                                                    <div style={{ width: 42, height: 42, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'cd-spin 1s linear infinite' }} />
                                                    <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{processingStep === 1 ? 'Validation en cours…' : 'Attachement des factures…'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'cd-pop .3s ease-out' }}>
                                                        <Icons.Check style={{ width: 22, height: 22, color: '#22c55e' }} />
                                                    </div>
                                                    <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>Factures attachées avec succès!</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{carouselPropositions[carouselSlide]?.title || 'Factures proposées'}</span>
                                        {carouselPropositions.length > 1 && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => setCarouselSlide(p => Math.max(0, p - 1))} disabled={carouselSlide === 0} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: carouselSlide === 0 ? 0.35 : 1 }}>
                                                    <Icons.ArrowLeft style={{ width: 13, height: 13, color: 'var(--text)' }} />
                                                </button>
                                                <button onClick={() => setCarouselSlide(p => Math.min(carouselPropositions.length - 1, p + 1))} disabled={carouselSlide === carouselPropositions.length - 1} style={{ width: 28, height: 28, border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: carouselSlide === carouselPropositions.length - 1 ? 0.35 : 1 }}>
                                                    <Icons.ChevronRight style={{ width: 13, height: 13, color: 'var(--text)' }} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Items */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                                        {carouselPropositions[carouselSlide]?.items.map(item => {
                                            const checked = selectedFactures.includes(item.id);
                                            return (
                                                <div key={item.id} onClick={() => handleCheckboxToggle(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', borderRadius: 9, padding: '10px 12px', cursor: 'pointer', transition: 'background .15s' }}>
                                                    <input type="checkbox" checked={checked} onChange={() => handleCheckboxToggle(item.id)} style={{ accentColor: '#0d9394', width: 14, height: 14, cursor: 'pointer' }} onClick={e => e.stopPropagation()} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                                                            <span style={{ fontSize: 11, color: 'var(--text3)' }}>{item.date}{item.reference ? ` • ${item.reference}` : ''}</span>
                                                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>{fmtCurrency(item.amount)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            {carouselPropositions.length > 1 && carouselPropositions.map((_, idx) => (
                                                <div key={idx} onClick={() => setCarouselSlide(idx)} style={{ width: 7, height: 7, borderRadius: '50%', background: idx === carouselSlide ? 'var(--primary)' : 'rgba(13,147,148,0.2)', cursor: 'pointer', transition: 'all .25s' }} />
                                            ))}
                                        </div>
                                        <button onClick={handleAccept} disabled={isProcessing} style={{ ...btnPrimary, fontSize: 12, padding: '6px 18px', opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}>Accepter</button>
                                    </div>
                                </div>
                            )}

                            {/* Accept all */}
                            {showCarousel && carouselPropositions.length > 0 && (
                                <button className="cd-fadein" onClick={handleAcceptAll} disabled={isProcessing} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px dashed rgba(13,147,148,0.4)', background: 'rgba(13,147,148,0.05)', color: 'var(--primary)', fontWeight: 600, fontSize: 13, cursor: isProcessing ? 'not-allowed' : 'pointer', marginBottom: 12, opacity: isProcessing ? 0.5 : 1 }}>
                                    Accepter toutes les propositions
                                </button>
                            )}

                            {/* Empty state */}
                            {showCarousel && carouselPropositions.length === 0 && rawCarouselPropositions.length > 0 && (
                                <div className="cd-fadein" style={{ ...card, background: 'rgba(13,147,148,0.07)', padding: 32, textAlign: 'center' }}>
                                    <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                        <Icons.Check style={{ width: 24, height: 24, color: '#22c55e' }} />
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Toutes les factures ont été traitées!</div>
                                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Il n'y a plus de propositions pour cette déclaration.</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════ MANUEL TAB ═══════════ */}
                    {activeTab === 'manuel' && (
                        <div style={{ maxWidth: 900, margin: '0 auto' }}>

                            {/* Filters */}
                            <div style={{ ...card, padding: 16, marginBottom: 18, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                                {[
                                    { label: 'Année', value: selectedYear, opts: [{ value: '', label: 'Toutes' }, ...years.map(y => ({ value: y, label: y }))], onChange: (v: string) => { setSelectedYear(v); setSelectedPeriode(''); setSelectedTrimestre(''); } },
                                    { label: 'Période', value: selectedPeriode, opts: [{ value: '', label: 'Toutes' }, ...periodes.map(p => ({ value: p, label: p }))], onChange: (v: string) => { setSelectedPeriode(v); setSelectedTrimestre(''); }, disabled: !selectedYear },
                                    { label: 'Trimestre', value: selectedTrimestre, opts: [{ value: '', label: 'Tous' }, ...trimestres.map(t => ({ value: t.value, label: t.label }))], onChange: (v: string) => { setSelectedTrimestre(v); setSelectedPeriode(''); }, disabled: !selectedYear },
                                ].map(({ label, value, opts, onChange, disabled }) => (
                                    <div key={label} style={{ minWidth: 160 }}>
                                        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
                                        <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} style={{ ...inputStyle, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
                                            {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            {/* Stepper */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                {[{ n: 1, label: 'Sélection des Factures' }, { n: 2, label: 'Confirmation' }].map(({ n, label }, idx) => (
                                    <React.Fragment key={n}>
                                        {idx > 0 && <div style={{ flex: 1, height: 2, background: activeStep >= n - 1 ? 'var(--primary)' : 'var(--border)', borderRadius: 1 }} />}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeStep >= n - 1 ? 'var(--primary)' : 'var(--bg2)', color: activeStep >= n - 1 ? 'white' : 'var(--text3)', fontSize: 12, fontWeight: 600 }}>
                                                {activeStep > n - 1 ? <Icons.Check style={{ width: 12, height: 12 }} /> : n}
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: activeStep === n - 1 ? 600 : 400, color: activeStep === n - 1 ? 'var(--primary)' : 'var(--text3)' }}>{label}</span>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* ── Step 0: select factures ── */}
                            {activeStep === 0 && (
                                <div>
                                    <div style={{ ...card, overflow: 'hidden', marginBottom: 14 }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg2)' }}>
                                                    <th style={{ padding: '10px 12px', textAlign: 'left', width: 40 }}>
                                                        <input type="checkbox"
                                                            ref={el => { if (el) el.indeterminate = factureSelected.length > 0 && factureSelected.length < mockFactures.length; }}
                                                            checked={factureSelected.length === mockFactures.length && mockFactures.length > 0}
                                                            onChange={() => setFactureSelected(factureSelected.length === mockFactures.length ? [] : [...mockFactures])}
                                                            style={{ accentColor: '#0d9394', width: 14, height: 14, cursor: 'pointer' }} />
                                                    </th>
                                                    {['Date', 'N° Facture', 'Fournisseur / Client', 'Type', 'HT', 'TVA', 'TTC', 'Status'].map(h => (
                                                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedFactures.map((f, ri) => {
                                                    const sel = factureSelected.some(x => x.id === f.id);
                                                    const sm = getStatusMeta(f.status);
                                                    return (
                                                        <tr key={f.id} onClick={() => handleSelectFacture(f)} style={{ borderTop: '1px solid var(--border)', background: sel ? 'rgba(13,147,148,0.05)' : ri % 2 === 0 ? 'var(--card)' : 'var(--bg)', cursor: 'pointer' }}>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <input type="checkbox" checked={sel} onChange={() => handleSelectFacture(f)} onClick={e => e.stopPropagation()} style={{ accentColor: '#0d9394', width: 14, height: 14, cursor: 'pointer' }} />
                                                            </td>
                                                            <td style={{ padding: '10px 12px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{new Date(f.dateCreation).toLocaleDateString('fr-FR')}</td>
                                                            <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{f.numeroFacture}</td>
                                                            <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>{f.nameFournisseur || f.nameClient || '—'}</td>
                                                            <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>{f.typeFacture}</td>
                                                            <td style={{ padding: '10px 12px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtCurrency(f.montantHt)}</td>
                                                            <td style={{ padding: '10px 12px', color: 'var(--primary)', fontWeight: 500, whiteSpace: 'nowrap' }}>{fmtCurrency(f.montantTva)}</td>
                                                            <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap' }}>{fmtCurrency(f.montantTtc)}</td>
                                                            <td style={{ padding: '10px 12px' }}>
                                                                <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 10, fontWeight: 600, ...sm }}>{f.status.toLowerCase()}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                                        <span style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(13,147,148,0.07)', border: '1px solid rgba(13,147,148,0.15)', fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>{factureSelected.length} facture{factureSelected.length !== 1 ? 's' : ''} sélectionnée{factureSelected.length !== 1 ? 's' : ''}</span>
                                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                            {['Premier', '←', ...Array.from({ length: Math.min(5, totalPages) }, (_, i) => String(Math.max(1, Math.min(page - 2, totalPages - 4)) + i)).filter(p => Number(p) <= totalPages), '→', 'Dernier'].map((lbl, i) => {
                                                const isNum = !isNaN(Number(lbl));
                                                const num = Number(lbl);
                                                const disabled = lbl === 'Premier' || lbl === '←' ? page === 1 : lbl === '→' || lbl === 'Dernier' ? page === totalPages : false;
                                                const active = isNum && num === page;
                                                const click = () => {
                                                    if (lbl === 'Premier') setPage(1);
                                                    else if (lbl === '←') setPage(p => Math.max(1, p - 1));
                                                    else if (lbl === '→') setPage(p => Math.min(totalPages, p + 1));
                                                    else if (lbl === 'Dernier') setPage(totalPages);
                                                    else setPage(num);
                                                };
                                                return (
                                                    <button key={i} onClick={click} disabled={disabled} style={{ minWidth: isNum ? 28 : 'auto', height: 28, padding: isNum ? 0 : '0 8px', borderRadius: 6, border: 'none', background: active ? 'var(--primary)' : 'transparent', color: active ? 'white' : disabled ? 'var(--text3)' : 'var(--text2)', fontSize: 12, fontWeight: active ? 600 : 400, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>{lbl}</button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                        <button onClick={onClose} style={btnOutline}>Annuler</button>
                                        <button onClick={() => setActiveStep(1)} disabled={factureSelected.length === 0} style={{ ...btnPrimary, opacity: factureSelected.length === 0 ? 0.45 : 1, cursor: factureSelected.length === 0 ? 'not-allowed' : 'pointer' }}>Suivant</button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 1: confirm ── */}
                            {activeStep === 1 && (
                                <div>
                                    {/* Summary */}
                                    <div style={{ ...card, padding: 20, marginBottom: 18 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Récapitulatif</div>
                                        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 9, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {[
                                                { label: 'Période', value: declaration.periode },
                                                { label: 'Nombre de factures', value: String(factureSelected.length) },
                                            ].map(({ label, value }) => (
                                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>{label}</span>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
                                                </div>
                                            ))}
                                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>Total HT</span>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{fmtCurrency(totals.ht)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>Total TVA</span>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{fmtCurrency(totals.tva)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(13,147,148,0.07)', border: '1px solid rgba(13,147,148,0.15)', borderRadius: 7, padding: '8px 12px' }}>
                                                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Total TTC</span>
                                                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{fmtCurrency(totals.ttc)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected table */}
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Factures sélectionnées</div>
                                    <div style={{ ...card, overflow: 'hidden', marginBottom: 18 }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg2)' }}>
                                                    {['N° Facture', 'Type', 'Montant HT', 'Montant TVA', 'Montant TTC'].map(h => (
                                                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text2)' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {factureSelected.map((f, ri) => (
                                                    <tr key={f.id} style={{ borderTop: '1px solid var(--border)', background: ri % 2 === 0 ? 'var(--card)' : 'var(--bg)' }}>
                                                        <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 500 }}>{f.numeroFacture}</td>
                                                        <td style={{ padding: '9px 12px', color: 'var(--text2)' }}>{f.typeFacture}</td>
                                                        <td style={{ padding: '9px 12px', color: 'var(--text2)' }}>{fmtCurrency(f.montantHt)}</td>
                                                        <td style={{ padding: '9px 12px', color: 'var(--primary)', fontWeight: 500 }}>{fmtCurrency(f.montantTva)}</td>
                                                        <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 500 }}>{fmtCurrency(f.montantTtc)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <button onClick={() => setActiveStep(0)} style={btnOutline}>Retour</button>
                                        <button onClick={handleSubmit} disabled={processing} style={{ ...btnPrimary, opacity: processing ? 0.65 : 1, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {processing && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'cd-spin 1s linear infinite' }} />}
                                            {processing ? 'Traitement…' : 'Finaliser'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: completed ── */}
                            {activeStep === 2 && completed && (
                                <div style={{ ...card, padding: 36, textAlign: 'center' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', animation: 'cd-pop .3s ease-out' }}>
                                        <Icons.Check style={{ width: 28, height: 28, color: '#22c55e' }} />
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Déclaration TVA traitée avec succès!</div>
                                    <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>Toutes les étapes sont terminées.</div>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                                        <button onClick={() => { setActiveStep(0); setFactureSelected([]); setCompleted(false); }} style={btnPrimary}>Traiter une autre</button>
                                        <button onClick={onClose} style={btnOutline}>Fermer</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
