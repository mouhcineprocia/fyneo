"use client"
import React, { useState, useEffect } from 'react';
import * as Icons from '../../../../../assets/icons';

interface CategorizationTabProps {
    transaction?: any;
    onUpdate?: (data: any) => void;
    clients?: string[];
    suppliers?: string[];
    employees?: string[];
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: '0.8rem',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--bg)',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text2)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
};

export const CategorizationTab: React.FC<CategorizationTabProps> = ({
    transaction,
    onUpdate,
    clients = ['Client ABC', 'Enterprise Corp', 'Global Services', 'Tech Partners'],
    suppliers = ['Fournisseur XYZ', 'Tech Solutions', 'Digital Agency', 'Office Pro'],
    employees = ['Jean Dupont', 'Marie Curie', 'Paul Martin', 'Sophie Bernard'],
}) => {
    const [formData, setFormData] = useState({
        amount: transaction?.amount || transaction?.montant || 0,
        bankDescription: transaction?.bankDescription || transaction?.description || '',
        parentCategory: transaction?.categorieParent || '',
        subCategory: transaction?.categorieTransaction || '',
        client: transaction?.client || transaction?.clientName || '',
        supplier: transaction?.fournisseur || transaction?.fournisseurName || '',
        employee: transaction?.salarie || '',
        period: transaction?.periode || transaction?.periodeOperation || '',
        typeOperation: transaction?.typeOperation || '',
        status: transaction?.statut || transaction?.status || '',
        dateOperation: transaction?.dateOperation || '',
        numeroCompte: transaction?.numeroCompte || '',
    });

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setFormData({
            amount: transaction?.amount || transaction?.montant || 0,
            bankDescription: transaction?.bankDescription || transaction?.description || '',
            parentCategory: transaction?.categorieParent || '',
            subCategory: transaction?.categorieTransaction || '',
            client: transaction?.client || transaction?.clientName || '',
            supplier: transaction?.fournisseur || transaction?.fournisseurName || '',
            employee: transaction?.salarie || '',
            period: transaction?.periode || transaction?.periodeOperation || '',
            typeOperation: transaction?.typeOperation || '',
            status: transaction?.statut || transaction?.status || '',
            dateOperation: transaction?.dateOperation || '',
            numeroCompte: transaction?.numeroCompte || '',
        });
    }, [transaction?.idTransaction]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (onUpdate) onUpdate(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const parentCategories = ['Recettes', 'Dépenses', 'Charges', 'Virements'];
    const subCategories = ['Vente services', 'Achats', 'Salaires', 'Prestations', 'Logiciels', 'Frais bancaires'];
    const periods = ['01/2025', '12/2024', '11/2024', '10/2024'];
    const typeOperations = ['CREDIT', 'DEBIT'];
    const statusOptions = ['VALIDER', 'EN_ATTENTE', 'RAPPROCHER', 'ERREUR'];

    return (
        <div style={{ padding: 16 }}>
            <div style={{
                background: 'var(--card)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                padding: 24,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
                <h3 style={{ margin: '0 0 20px', fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>
                    Catégorisation de la transaction
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Montant</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={e => handleChange('amount', e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Libellé bancaire</label>
                        <input
                            type="text"
                            value={formData.bankDescription}
                            onChange={e => handleChange('bankDescription', e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Type d'opération</label>
                        <select value={formData.typeOperation} onChange={e => handleChange('typeOperation', e.target.value)} style={inputStyle}>
                            <option value="">Inconnu</option>
                            {typeOperations.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Status</label>
                        <select value={formData.status} onChange={e => handleChange('status', e.target.value)} style={inputStyle}>
                            <option value="">Inconnu</option>
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Date opération</label>
                        <input
                            type="date"
                            value={formData.dateOperation ? formData.dateOperation.slice(0, 10) : ''}
                            onChange={e => handleChange('dateOperation', e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Compte</label>
                        <input
                            type="text"
                            value={formData.numeroCompte}
                            onChange={e => handleChange('numeroCompte', e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Catégorie Parente</label>
                        <select value={formData.parentCategory} onChange={e => handleChange('parentCategory', e.target.value)} style={inputStyle}>
                            <option value="">Sélectionner...</option>
                            {parentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Sous-catégorie</label>
                        <select value={formData.subCategory} onChange={e => handleChange('subCategory', e.target.value)} style={inputStyle}>
                            <option value="">Sélectionner...</option>
                            {subCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Client</label>
                        <select value={formData.client} onChange={e => handleChange('client', e.target.value)} style={inputStyle}>
                            <option value="">Aucun</option>
                            {clients.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Fournisseur</label>
                        <select value={formData.supplier} onChange={e => handleChange('supplier', e.target.value)} style={inputStyle}>
                            <option value="">Aucun</option>
                            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Salarié</label>
                        <select value={formData.employee} onChange={e => handleChange('employee', e.target.value)} style={inputStyle}>
                            <option value="">Aucun</option>
                            {employees.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Période</label>
                        <select value={formData.period} onChange={e => handleChange('period', e.target.value)} style={inputStyle}>
                            <option value="">Sélectionner...</option>
                            {periods.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 24px', borderRadius: 10, border: 'none',
                                background: 'var(--primary)', color: 'white',
                                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                            <Icons.Check style={{ width: 16, height: 16 }} />
                            Enregistrer les modifications
                        </button>
                    </div>
                </div>
            </div>

            {saved && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    background: '#22c55e', color: 'white', padding: '12px 20px',
                    borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                    Transaction catégorisée avec succès
                </div>
            )}
        </div>
    );
};
