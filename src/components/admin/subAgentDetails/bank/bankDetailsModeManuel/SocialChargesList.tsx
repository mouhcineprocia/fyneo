"use client"
import React, { useState, useEffect } from 'react';
import * as Icons from '../../../../../assets/icons';

interface ChargesSocial {
    idChargeSocial: string;
    periodePaie: string;
    typeChargeSocial: string;
    montant: number;
    status: string;
    attacher: 'oui' | 'non';
    nameConsultant: string;
    dateCharge: string;
    year: string;
}

interface AttachmentItem {
    idRessource?: string;
    typeRessource?: string;
}

const mockCharges: ChargesSocial[] = [
    { idChargeSocial: '1', periodePaie: '01/2025', typeChargeSocial: 'URSSAF', montant: 1250.00, status: 'VALIDER', attacher: 'non', nameConsultant: 'Jean Dupont', dateCharge: '2025-01-15', year: '2025' },
    { idChargeSocial: '2', periodePaie: '01/2025', typeChargeSocial: 'RETRAITE', montant: 890.50, status: 'VALIDER', attacher: 'non', nameConsultant: 'Marie Curie', dateCharge: '2025-01-12', year: '2025' },
    { idChargeSocial: '3', periodePaie: '01/2025', typeChargeSocial: 'MUTUELLE', montant: 120.00, status: 'EN_TRAITEMENT', attacher: 'non', nameConsultant: 'Paul Martin', dateCharge: '2025-01-10', year: '2025' },
    { idChargeSocial: '4', periodePaie: '12/2024', typeChargeSocial: 'URSSAF', montant: 1180.00, status: 'VALIDER', attacher: 'non', nameConsultant: 'Sophie Bernard', dateCharge: '2024-12-20', year: '2024' },
    { idChargeSocial: '5', periodePaie: '12/2024', typeChargeSocial: 'PREVOYANCE', montant: 210.50, status: 'VALIDER', attacher: 'non', nameConsultant: 'Luc Moreau', dateCharge: '2024-12-18', year: '2024' },
    { idChargeSocial: '6', periodePaie: '12/2024', typeChargeSocial: 'RETRAITE', montant: 750.00, status: 'VALIDER', attacher: 'non', nameConsultant: 'Emma Leroy', dateCharge: '2024-12-15', year: '2024' },
];

const statusFilters = [
    { id: 'VALIDER', label: 'Valide', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { id: 'EN_TRAITEMENT', label: 'En cours', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { id: 'ERROR', label: 'Erreur', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
];

const typeFilters = [
    { id: 'URSSAF', label: 'URSSAF', icon: '🏛️' },
    { id: 'RETRAITE', label: 'Retraite', icon: '👴' },
    { id: 'MUTUELLE', label: 'Mutuelle', icon: '🏥' },
    { id: 'PREVOYANCE', label: 'Prévoyance', icon: '🛡️' },
];

function getStatusMeta(status: string) {
    switch (status) {
        case 'VALIDER': return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' };
        case 'EN_TRAITEMENT': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' };
        case 'ERROR': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
        default: return { color: 'var(--text2)', bg: 'var(--bg2)', border: 'var(--border)' };
    }
}

function getTypeMeta(type: string) {
    switch (type) {
        case 'URSSAF': return { color: 'var(--primary)', bg: 'var(--primaryL)' };
        case 'RETRAITE': return { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
        case 'MUTUELLE': return { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' };
        case 'PREVOYANCE': return { color: '#f97316', bg: 'rgba(249,115,22,0.1)' };
        default: return { color: 'var(--text2)', bg: 'var(--bg2)' };
    }
}

export const SocialChargesList: React.FC<{
    attachedItems?: AttachmentItem[];
    transactionId?: string;
    onAttach?: (charge: any) => void;
    onDetach?: (charge: any) => void;
}> = ({ attachedItems = [], transactionId = '', onAttach, onDetach }) => {
    const [charges, setCharges] = useState<ChargesSocial[]>(mockCharges);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedYear, setSelectedYear] = useState('');
    const [page, setPage] = useState(0);
    const rowsPerPage = 5;

    useEffect(() => {
        setCharges(mockCharges.map(c => ({
            ...c,
            attacher: attachedItems.some(item => item.idRessource === c.idChargeSocial && item.typeRessource === 'CHARGE_SOCIAL') ? 'oui' : 'non',
        })) as ChargesSocial[]);
    }, [attachedItems]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleAttach = (charge: ChargesSocial) => {
        if (onAttach) onAttach(charge);
        showToast('Charge sociale attachée avec succès');
    };

    const handleDetach = (charge: ChargesSocial) => {
        if (onDetach) onDetach(charge);
        showToast('Charge sociale détachée avec succès');
    };

    const filtered = charges
        .filter(c =>
            c.nameConsultant.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.typeChargeSocial.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.periodePaie.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(c => selectedStatus ? c.status === selectedStatus : true)
        .filter(c => selectedType ? c.typeChargeSocial === selectedType : true)
        .filter(c => selectedYear ? c.year === selectedYear : true);

    const paginated = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const totalPages = Math.ceil(filtered.length / rowsPerPage);

    return (
        <div style={{ width: '100%', padding: 12 }}>
            {/* Filter card */}
            <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', padding: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', minWidth: 180 }}>
                        <Icons.Search style={{ width: 14, height: 14, color: 'var(--text3)', flexShrink: 0 }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Rechercher une charge..."
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.75rem', color: 'var(--text)', width: '100%' }}
                        />
                    </div>

                    <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

                    {/* Status filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {statusFilters.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedStatus(selectedStatus === s.id ? null : s.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 500,
                                    border: selectedStatus === s.id ? `1.5px solid ${s.color}` : '1.5px solid transparent',
                                    background: selectedStatus === s.id ? s.bg : 'var(--bg2)',
                                    color: selectedStatus === s.id ? s.color : 'var(--text2)',
                                }}
                            >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

                    {/* Advanced filters toggle */}
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 500,
                            background: showAdvancedFilters ? 'var(--primaryL)' : 'var(--bg2)',
                            color: showAdvancedFilters ? 'var(--primary)' : 'var(--text2)',
                            border: showAdvancedFilters ? '1.5px solid var(--primary)' : '1.5px solid transparent',
                        }}
                    >
                        <Icons.SlidersHorizontal style={{ width: 12, height: 12 }} />
                        Filtres
                        <Icons.ChevronDown style={{ width: 10, height: 10, transform: showAdvancedFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                </div>

                {/* Type filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 500 }}>Type:</span>
                    {typeFilters.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedType(selectedType === t.id ? null : t.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 500,
                                border: selectedType === t.id ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                                background: selectedType === t.id ? 'var(--primaryL)' : 'var(--card)',
                                color: selectedType === t.id ? 'var(--primary)' : 'var(--text2)',
                            }}
                        >
                            <span style={{ fontSize: '0.75rem' }}>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Advanced filters */}
                {showAdvancedFilters && (
                    <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--border)' }}>
                        <div>
                            <label style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 500, display: 'block', marginBottom: 3 }}>Année</label>
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(e.target.value)}
                                style={{ padding: '5px 8px', fontSize: '0.7rem', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }}
                            >
                                <option value="">Toutes</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                                {['Période', 'Type', 'Consultant', 'Montant', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Actions' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.75rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                                        <Icons.Users style={{ width: 32, height: 32, color: 'var(--text3)', margin: '0 auto 8px', display: 'block' }} />
                                        <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Aucune charge sociale trouvée</span>
                                    </td>
                                </tr>
                            ) : paginated.map(row => {
                                const sm = getStatusMeta(row.status);
                                const tm = getTypeMeta(row.typeChargeSocial);
                                return (
                                    <tr
                                        key={row.idChargeSocial}
                                        style={{ borderBottom: '1px solid var(--border)' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: 12 }}>
                                            <span style={{ fontWeight: 500, color: 'var(--text)' }}>{row.periodePaie}</span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: tm.bg, color: tm.color }}>
                                                {row.typeChargeSocial}
                                            </span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Icons.User style={{ width: 14, height: 14, color: '#8b5cf6' }} />
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.75rem' }}>{row.nameConsultant}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                                {row.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR
                                            </span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: 12, textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                                {row.attacher === 'oui' ? (
                                                    <button
                                                        onClick={() => handleDetach(row)}
                                                        disabled={!transactionId}
                                                        title="Détacher cette charge"
                                                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: transactionId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: transactionId ? 1 : 0.5 }}
                                                    >
                                                        <Icons.X style={{ width: 14, height: 14 }} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAttach(row)}
                                                        disabled={!transactionId}
                                                        title="Attacher cette charge"
                                                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', cursor: transactionId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: transactionId ? 1 : 0.5 }}
                                                    >
                                                        <Icons.Check style={{ width: 14, height: 14 }} />
                                                    </button>
                                                )}
                                                <button
                                                    title="Voir les détails"
                                                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Icons.Eye style={{ width: 14, height: 14 }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filtered.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>
                            {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} sur {filtered.length}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[
                                { label: <Icons.ChevronLeft style={{ width: 14, height: 14 }} />, action: () => setPage(0), disabled: page === 0 },
                                { label: <Icons.ChevronLeft style={{ width: 14, height: 14 }} />, action: () => setPage(p => p - 1), disabled: page === 0 },
                                ...Array.from({ length: totalPages }, (_, i) => ({ label: <span>{i + 1}</span>, action: () => setPage(i), disabled: false, active: page === i })),
                                { label: <Icons.ChevronRight style={{ width: 14, height: 14 }} />, action: () => setPage(p => p + 1), disabled: page >= totalPages - 1 },
                                { label: <Icons.ChevronRight style={{ width: 14, height: 14 }} />, action: () => setPage(totalPages - 1), disabled: page >= totalPages - 1 },
                            ].map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={btn.disabled ? undefined : btn.action}
                                    disabled={btn.disabled}
                                    style={{
                                        width: 28, height: 28, borderRadius: 6, border: (btn as any).active ? 'none' : '1px solid var(--border)',
                                        background: (btn as any).active ? 'var(--primary)' : 'var(--card)',
                                        color: (btn as any).active ? 'white' : 'var(--text)',
                                        cursor: btn.disabled ? 'not-allowed' : 'pointer', opacity: btn.disabled ? 0.5 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600,
                                    }}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {toast && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: '#22c55e', color: 'white', padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    {toast}
                </div>
            )}
        </div>
    );
};
