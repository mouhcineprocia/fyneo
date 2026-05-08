"use client"
import React, { useState, useEffect } from 'react';
import * as Icons from '../../../../../assets/icons';

interface Facture {
    id: string;
    dateFacture: string;
    numeroFacture: string;
    montantTtc: number;
    montantHt: number;
    montantTva: number;
    fournisseurName: string;
    clientName: string;
    status: string;
    attacher: 'oui' | 'non';
    mois: string;
    year: string;
    typeFacture: string;
    periode: string;
    statusPayement: string;
}

interface AttachmentItem {
    idRessource?: string;
    typeRessource?: string;
}

const mockFactures: Facture[] = [
    { id: '1', dateFacture: '2025-01-10', numeroFacture: 'FACT-2025-001', montantTtc: 1250.00, montantHt: 1041.67, montantTva: 208.33, fournisseurName: '', clientName: 'Client ABC', status: 'VALIDER', attacher: 'non', mois: 'janv', year: '2025', typeFacture: 'factureVente', periode: '01/2025', statusPayement: 'PAYE' },
    { id: '2', dateFacture: '2025-01-12', numeroFacture: 'FAC-F2025-089', montantTtc: 890.50, montantHt: 742.08, montantTva: 148.42, fournisseurName: 'Fournisseur XYZ', clientName: '', status: 'VALIDER', attacher: 'non', mois: 'janv', year: '2025', typeFacture: 'factureAchat', periode: '01/2025', statusPayement: 'PAYE' },
    { id: '3', dateFacture: '2025-01-14', numeroFacture: 'FACT-2025-002', montantTtc: 8500.00, montantHt: 7083.33, montantTva: 1416.67, fournisseurName: '', clientName: 'Enterprise Corp', status: 'EN_TRAITEMENT', attacher: 'non', mois: 'janv', year: '2025', typeFacture: 'factureVente', periode: '01/2025', statusPayement: 'EN_ATTENTE' },
    { id: '4', dateFacture: '2025-01-08', numeroFacture: 'FAC-F2025-045', montantTtc: 2340.00, montantHt: 1950.00, montantTva: 390.00, fournisseurName: 'Tech Solutions', clientName: '', status: 'VALIDER', attacher: 'non', mois: 'janv', year: '2025', typeFacture: 'factureAchat', periode: '01/2025', statusPayement: 'PAYE' },
    { id: '5', dateFacture: '2024-12-28', numeroFacture: 'FACT-2024-189', montantTtc: 4200.00, montantHt: 3500.00, montantTva: 700.00, fournisseurName: '', clientName: 'Global Services', status: 'VALIDER', attacher: 'non', mois: 'dec', year: '2024', typeFacture: 'factureVente', periode: '12/2024', statusPayement: 'PAYE' },
    { id: '6', dateFacture: '2024-12-20', numeroFacture: 'FAC-F2024-156', montantTtc: 1560.00, montantHt: 1300.00, montantTva: 260.00, fournisseurName: 'Digital Agency', clientName: '', status: 'VALIDER', attacher: 'non', mois: 'dec', year: '2024', typeFacture: 'factureAchat', periode: '12/2024', statusPayement: 'PAYE' },
];

const statusFilters = [
    { id: 'VALIDER', label: 'Valide', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { id: 'EN_TRAITEMENT', label: 'En cours', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { id: 'ERROR', label: 'Erreur', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
];

const typeFilters = [
    { id: 'factureVente', label: 'Vente', icon: '📤' },
    { id: 'factureAchat', label: 'Achat', icon: '📥' },
];

function getStatusMeta(status: string) {
    switch (status) {
        case 'VALIDER': return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' };
        case 'EN_TRAITEMENT': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' };
        case 'ERROR': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
        default: return { color: 'var(--text2)', bg: 'var(--bg2)', border: 'var(--border)' };
    }
}

function getPaymentMeta(status: string) {
    switch (status) {
        case 'PAYE': return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' };
        case 'EN_ATTENTE': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' };
        case 'IMPAYE': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
        default: return { color: 'var(--text2)', bg: 'var(--bg2)', border: 'var(--border)' };
    }
}

export const InvoiceList: React.FC<{
    factures?: Facture[];
    isFetching?: boolean;
    attachedItems?: AttachmentItem[];
    transactionId?: string;
    onAttach?: (invoice: Facture) => void;
    onDetach?: (invoice: Facture) => void;
}> = ({ factures: propFactures = [], isFetching = false, attachedItems = [], transactionId = '', onAttach, onDetach }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedYear, setSelectedYear] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [page, setPage] = useState(0);
    const rowsPerPage = 5;

    // Compute inline to avoid infinite re-renders when propFactures default [] creates new reference
    const factures: Facture[] = (propFactures.length > 0 ? propFactures : mockFactures).map(f => ({
        ...f,
        attacher: attachedItems.some(item => item.idRessource === f.id && item.typeRessource === 'FACTURE') ? 'oui' : 'non',
    })) as Facture[];

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleAttach = (f: Facture) => {
        if (onAttach) onAttach(f);
        showToast('Facture attachée avec succès');
    };

    const handleDetach = (f: Facture) => {
        if (onDetach) onDetach(f);
        showToast('Facture détachée avec succès');
    };

    const filtered = factures
        .filter(f =>
            f.numeroFacture.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.fournisseurName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.clientName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter(f => selectedStatus ? f.status === selectedStatus : true)
        .filter(f => selectedType ? f.typeFacture === selectedType : true)
        .filter(f => selectedYear ? f.year === selectedYear : true);

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
                            placeholder="Rechercher une facture..."
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.75rem', color: 'var(--text)', width: '100%' }}
                        />
                    </div>

                    <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

                    {/* Status filters */}
                    <div style={{ display: 'flex', gap: 4 }}>
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
                    <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 500, display: 'block', marginBottom: 3 }}>Année</label>
                            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ padding: '5px 8px', fontSize: '0.7rem', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }}>
                                <option value="">Toutes</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 500, display: 'block', marginBottom: 3 }}>Date début</label>
                            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={{ padding: '5px 8px', fontSize: '0.7rem', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 500, display: 'block', marginBottom: 3 }}>Date fin</label>
                            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} style={{ padding: '5px 8px', fontSize: '0.7rem', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--text)', outline: 'none', cursor: 'pointer' }} />
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
                                {['Période', 'Client/Fournisseur', 'Montant TTC', 'N° Facture', 'Status', 'Paiement', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Actions' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.75rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isFetching ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 60, textAlign: 'center' }}>
                                        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 8px', animation: 'spin 0.8s linear infinite' }} />
                                        <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Chargement des factures...</span>
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                                        <Icons.FileText style={{ width: 32, height: 32, color: 'var(--text3)', margin: '0 auto 8px', display: 'block' }} />
                                        <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Aucune facture trouvée</span>
                                    </td>
                                </tr>
                            ) : paginated.map(row => {
                                const sm = getStatusMeta(row.status);
                                const pm = getPaymentMeta(row.statusPayement);
                                const isAchat = row.typeFacture === 'factureAchat';
                                return (
                                    <tr
                                        key={row.id}
                                        style={{ borderBottom: '1px solid var(--border)' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: 12 }}>
                                            <span style={{ fontWeight: 500, color: 'var(--text)' }}>{row.periode}</span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 6, background: isAchat ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Icons.FileText style={{ width: 14, height: 14, color: isAchat ? '#ef4444' : '#22c55e' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.75rem' }}>{row.clientName || row.fournisseurName}</div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{isAchat ? 'Facture Achat' : 'Facture Vente'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: isAchat ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: isAchat ? '#ef4444' : '#22c55e', border: `1px solid ${isAchat ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                                                {row.montantTtc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} EUR
                                            </span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)' }}>{row.numeroFacture}</span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: sm.bg, color: sm.color, border: `1px solid ${sm.border}`, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: pm.bg, color: pm.color, border: `1px solid ${pm.border}` }}>
                                                {row.statusPayement}
                                            </span>
                                        </td>
                                        <td style={{ padding: 12, textAlign: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                                {row.attacher === 'oui' ? (
                                                    <button onClick={() => handleDetach(row)} disabled={!transactionId} title="Détacher cette facture" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: transactionId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: transactionId ? 1 : 0.5 }}>
                                                        <Icons.X style={{ width: 14, height: 14 }} />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleAttach(row)} disabled={!transactionId} title="Attacher cette facture" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', cursor: transactionId ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: transactionId ? 1 : 0.5 }}>
                                                        <Icons.Check style={{ width: 14, height: 14 }} />
                                                    </button>
                                                )}
                                                <button title="Voir les détails" style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                        width: 28, height: 28, borderRadius: 6,
                                        border: (btn as any).active ? 'none' : '1px solid var(--border)',
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
