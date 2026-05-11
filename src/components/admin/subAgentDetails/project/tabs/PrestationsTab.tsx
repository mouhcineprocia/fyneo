'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Icons from '../../../../../assets/icons';
import { fmtDate, TableWrap, Pagination, Skel } from '../shared';
import { prestationApi } from '../../../../../lib/project/prestation';
import type { Prestation, PrestationConsultant, CreatePrestationInput } from '../../../../../lib/project/prestation';
import { projectApi } from '../../../../../lib/project/api';
import { projectSupplierApi } from '../../../../../lib/project/supplier';

const LIMIT = 10;

const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string }> = {
  created:    { label: 'Créée',       bg: 'rgba(37,99,235,0.1)',   color: '#2563eb',      border: 'rgba(37,99,235,0.3)'   },
  pending:    { label: 'En attente',  bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b',      border: 'rgba(245,158,11,0.3)'  },
  validated:  { label: 'Validée',     bg: 'rgba(34,197,94,0.1)',   color: '#22c55e',      border: 'rgba(34,197,94,0.3)'   },
  in_progress:{ label: 'En cours',    bg: 'rgba(13,147,148,0.1)',  color: '#0d9394',      border: 'rgba(13,147,148,0.3)'  },
  completed:  { label: 'Terminée',    bg: 'rgba(20,184,166,0.1)',  color: '#14b8a6',      border: 'rgba(20,184,166,0.3)'  },
  cancelled:  { label: 'Annulée',     bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
};

function partnerName(p: any): string {
  if (!p) return '—';
  if (p.companyName) return p.companyName;
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email || '—';
}

function contactName(c: any): string {
  if (!c) return '—';
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.companyName || c.email || '—';
}

function fmtAmt(n: number, currency = 'MAD') {
  return `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

// ─── Prestation View ──────────────────────────────────────────────────────────

const PrestationView: React.FC<{
  prestation: Prestation;
  onClose: () => void;
  onEdit: () => void;
}> = ({ prestation: p, onClose, onEdit }) => {
  const sm = STATUS_META[p.status] || STATUS_META.created;
  const partner = p.type === 'client' ? p.customer : p.supplier;
  const consultants = p.consultants || [];
  const progress = p.estimatedDays ? Math.min(100, Math.round((p.consumedDays / p.estimatedDays) * 100)) : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1700, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}>
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: 14, boxShadow: '0 32px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: 860, marginBottom: 24 }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onClose} style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)' }}>
            <Icons.ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', flex: 1 }}>{p.name}</span>
          <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 7, fontSize: '0.7rem', fontWeight: 500, color: 'var(--text2)', background: 'none', cursor: 'pointer' }}>
            <Icons.Edit style={{ width: 12, height: 12 }} /> Modifier
          </button>
          <button onClick={onClose} style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)' }}>
            <Icons.X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div style={{ padding: '36px 44px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', lineHeight: 1 }}>PRESTATION</p>
              {p.prestationCode && <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{p.prestationCode}</p>}
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '4px 14px', borderRadius: 20, backgroundColor: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>{sm.label}</span>
              <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 4, backgroundColor: p.type === 'client' ? 'rgba(37,99,235,0.1)' : 'rgba(139,92,246,0.1)', color: p.type === 'client' ? '#2563eb' : '#8b5cf6', fontWeight: 700 }}>
                {p.type === 'client' ? '◆ Client' : '◆ Fournisseur'}
              </span>
              <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 4, backgroundColor: 'rgba(13,147,148,0.1)', color: '#0d9394', fontWeight: 600 }}>
                {p.category === 'service' ? 'Service' : 'Autre'}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            <div style={{ padding: '16px 18px', backgroundColor: 'var(--bg2)', borderRadius: 10 }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.58rem', fontWeight: 700, color: '#0d9394', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Émetteur</p>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Fyneo</p>
              <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: 'var(--text3)' }}>Votre organisation</p>
            </div>
            <div style={{ padding: '16px 18px', backgroundColor: 'var(--bg2)', borderRadius: 10 }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.58rem', fontWeight: 700, color: '#0d9394', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {p.type === 'client' ? 'Client' : 'Fournisseur'}
              </p>
              {partner ? (
                <>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{partnerName(partner)}</p>
                  {partner.email && <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: 'var(--text3)' }}>{partner.email}</p>}
                </>
              ) : <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text3)' }}>Non renseigné</p>}
            </div>
          </div>

          {/* Dates + Amount */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            {p.startDate && (
              <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg2)', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Début</p>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{fmtDate(p.startDate)}</p>
              </div>
            )}
            {p.endDate && (
              <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg2)', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Fin</p>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{fmtDate(p.endDate)}</p>
              </div>
            )}
            <div style={{ padding: '10px 16px', backgroundColor: 'rgba(13,147,148,0.08)', borderRadius: 8, border: '1px solid rgba(13,147,148,0.2)' }}>
              <p style={{ margin: 0, fontSize: '0.55rem', color: '#0d9394', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Montant</p>
              <p style={{ margin: '3px 0 0', fontSize: '0.88rem', fontWeight: 800, color: '#0d9394' }}>{fmtAmt(p.amount, p.currency)}</p>
            </div>
          </div>

          {/* Progress */}
          {p.estimatedDays != null && (
            <div style={{ marginBottom: 28, padding: '16px 18px', backgroundColor: 'var(--bg2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text2)' }}>Avancement (jours)</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)' }}>{p.consumedDays} / {p.estimatedDays} j ({progress}%)</span>
              </div>
              <div style={{ height: 8, backgroundColor: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, backgroundColor: progress >= 100 ? '#ef4444' : '#0d9394', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {/* Description */}
          {p.description && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.65 }}>{p.description}</p>
            </div>
          )}

          {/* Consultants */}
          {consultants.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 12px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Consultants ({consultants.length})</p>
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text)' }}>Consultant</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text)' }}>Rôle</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>TJM</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>Jours Est.</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>Jours Conso.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultants.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: i === consultants.length - 1 ? 'none' : '1px solid var(--bg2)' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{contactName(c.contact)}</span>
                          {c.contact?.type && <span style={{ marginLeft: 6, fontSize: '0.58rem', padding: '1px 5px', borderRadius: 3, backgroundColor: 'rgba(13,147,148,0.1)', color: '#0d9394' }}>{c.contact.type === 'consultant_interne' ? 'Interne' : 'Externe'}</span>}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{c.role || '—'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text)' }}>{c.dailyRate != null ? fmtAmt(c.dailyRate, 'MAD') : '—'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text2)' }}>{c.estimatedDays ?? '—'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text2)' }}>{c.consumedDays ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {p.notes && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.65 }}>{p.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Consultant row state ─────────────────────────────────────────────────────

interface FormConsultant {
  _key: string;
  contactId: string;
  contactLabel: string;
  role: string;
  dailyRate: string;
  estimatedDays: string;
  startDate: string;
  endDate: string;
  notes: string;
}

// ─── Prestation Form ──────────────────────────────────────────────────────────

const PrestationForm: React.FC<{
  projectId: string;
  prestation?: Prestation;
  onClose: () => void;
  onSaved: (p: Prestation) => void;
}> = ({ projectId, prestation, onClose, onSaved }) => {
  const isEdit = !!prestation;
  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', fontSize: '0.72rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none' };
  const lbl: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text2)', fontWeight: 600, marginBottom: 5, display: 'block' };

  const [type, setType] = useState<'client' | 'supplier'>((prestation?.type as 'client' | 'supplier') || 'client');
  const [category, setCategory] = useState(prestation?.category || 'service');
  const [code, setCode] = useState(prestation?.prestationCode || '');
  const [name, setName] = useState(prestation?.name || '');
  const [description, setDescription] = useState(prestation?.description || '');
  const [amount, setAmount] = useState(prestation?.amount != null ? String(prestation.amount) : '0');
  const [currency, setCurrency] = useState(prestation?.currency || 'MAD');
  const [startDate, setStartDate] = useState(prestation?.startDate || '');
  const [endDate, setEndDate] = useState(prestation?.endDate || '');
  const [estimatedDays, setEstimatedDays] = useState(prestation?.estimatedDays != null ? String(prestation.estimatedDays) : '');
  const [status, setStatus] = useState(prestation?.status || 'created');
  const [notes, setNotes] = useState(prestation?.notes || '');

  const [selectedPartner, setSelectedPartner] = useState<any>(
    prestation ? (prestation.type === 'client' ? prestation.customer : prestation.supplier) : null,
  );
  const [partnerSearch, setPartnerSearch] = useState(
    prestation ? partnerName(prestation.type === 'client' ? prestation.customer : prestation.supplier) : '',
  );
  const [partnerResults, setPartnerResults] = useState<any[]>([]);
  const [partnerSearching, setPartnerSearching] = useState(false);

  const [consultants, setConsultants] = useState<FormConsultant[]>(() =>
    prestation?.consultants?.map(c => ({
      _key: Math.random().toString(36),
      contactId: c.contactId,
      contactLabel: contactName(c.contact),
      role: c.role || '',
      dailyRate: c.dailyRate != null ? String(c.dailyRate) : '',
      estimatedDays: c.estimatedDays != null ? String(c.estimatedDays) : '',
      startDate: c.startDate || '',
      endDate: c.endDate || '',
      notes: c.notes || '',
    })) || [],
  );

  const [contactSearch, setContactSearch] = useState('');
  const [contactResults, setContactResults] = useState<any[]>([]);
  const [contactSearching, setContactSearching] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const partnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contactTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!partnerSearch || selectedPartner) { setPartnerResults([]); return; }
    if (partnerTimerRef.current) clearTimeout(partnerTimerRef.current);
    setPartnerSearching(true);
    partnerTimerRef.current = setTimeout(async () => {
      try {
        if (type === 'client') {
          setPartnerResults(await projectApi.searchCustomers(partnerSearch));
        } else {
          setPartnerResults(await projectSupplierApi.searchSuppliers(partnerSearch));
        }
      } finally { setPartnerSearching(false); }
    }, 300);
  }, [partnerSearch, type, selectedPartner]);

  useEffect(() => {
    if (!contactSearch) { setContactResults([]); return; }
    if (contactTimerRef.current) clearTimeout(contactTimerRef.current);
    setContactSearching(true);
    contactTimerRef.current = setTimeout(async () => {
      try {
        setContactResults(await prestationApi.searchContacts(contactSearch));
      } finally { setContactSearching(false); }
    }, 300);
  }, [contactSearch]);

  const addConsultant = (contact: any) => {
    setConsultants(prev => [...prev, {
      _key: Math.random().toString(36),
      contactId: contact.id,
      contactLabel: contactName(contact),
      role: '', dailyRate: '', estimatedDays: '',
      startDate: '', endDate: '', notes: '',
    }]);
    setContactSearch('');
    setContactResults([]);
  };

  const updateConsultant = (idx: number, field: keyof Omit<FormConsultant, '_key' | 'contactId' | 'contactLabel'>, value: string) => {
    setConsultants(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const save = async () => {
    if (!name.trim()) { setError('Le nom est obligatoire'); return; }
    setSaving(true); setError('');
    try {
      const payload: CreatePrestationInput = {
        prestationCode: code || undefined,
        name: name.trim(),
        description: description || undefined,
        category,
        type,
        customerId: type === 'client' ? selectedPartner?.id : undefined,
        supplierId: type === 'supplier' ? selectedPartner?.id : undefined,
        amount: parseFloat(amount) || 0,
        currency,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        estimatedDays: estimatedDays ? parseFloat(estimatedDays) : undefined,
        status,
        notes: notes || undefined,
        consultants: consultants.map(c => ({
          contactId: c.contactId,
          role: c.role || undefined,
          dailyRate: c.dailyRate ? parseFloat(c.dailyRate) : undefined,
          estimatedDays: c.estimatedDays ? parseFloat(c.estimatedDays) : undefined,
          startDate: c.startDate || undefined,
          endDate: c.endDate || undefined,
          notes: c.notes || undefined,
        })),
      };

      const result = isEdit && prestation
        ? await prestationApi.update(projectId, prestation.id, payload)
        : await prestationApi.create(projectId, payload);
      onSaved(result);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1700, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: 14, boxShadow: '0 32px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: 940, marginBottom: 24 }}>
        {/* Header */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)' }}>
            <Icons.ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', flex: 1 }}>
            {isEdit ? `Modifier — ${prestation!.name}` : 'Créer une prestation'}
          </span>
          <button onClick={save} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', border: 'none', borderRadius: 7, fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#0d9394', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            <Icons.Check style={{ width: 13, height: 13 }} />
            {saving ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>

        <div style={{ padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Row 1: Type + Category + Status + Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr 1fr', gap: 16, alignItems: 'end' }}>
            <div>
              <label style={lbl}>Type</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['client', 'supplier'] as const).map(t => (
                  <button key={t} onClick={() => { setType(t); setSelectedPartner(null); setPartnerSearch(''); setPartnerResults([]); }}
                    style={{ padding: '7px 14px', fontSize: '0.7rem', fontWeight: 700, borderRadius: 7, border: `1.5px solid ${type === t ? (t === 'client' ? '#2563eb' : '#8b5cf6') : 'var(--border)'}`, backgroundColor: type === t ? (t === 'client' ? 'rgba(37,99,235,0.1)' : 'rgba(139,92,246,0.1)') : 'var(--bg)', color: type === t ? (t === 'client' ? '#2563eb' : '#8b5cf6') : 'var(--text2)', cursor: 'pointer' }}>
                    {t === 'client' ? 'Client' : 'Fournisseur'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Catégorie</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['service', 'autre'] as const).map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{ padding: '7px 14px', fontSize: '0.7rem', fontWeight: 600, borderRadius: 7, border: `1.5px solid ${category === c ? '#0d9394' : 'var(--border)'}`, backgroundColor: category === c ? 'rgba(13,147,148,0.1)' : 'var(--bg)', color: category === c ? '#0d9394' : 'var(--text2)', cursor: 'pointer' }}>
                    {c === 'service' ? 'Service' : 'Autre'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Statut</label>
              <select style={inp} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="created">Créée</option>
                <option value="pending">En attente</option>
                <option value="validated">Validée</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Devise</label>
              <select style={inp} value={currency} onChange={e => setCurrency(e.target.value)}>
                {['MAD', 'EUR', 'USD', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Code + Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Code prestation</label>
              <input style={inp} value={code} onChange={e => setCode(e.target.value)} placeholder="Auto-généré si vide" />
            </div>
            <div>
              <label style={lbl}>Nom *</label>
              <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la prestation" />
            </div>
          </div>

          {/* Row 3: Partner */}
          <div>
            <label style={lbl}>{type === 'client' ? 'Client' : 'Fournisseur'}</label>
            <div style={{ position: 'relative' }}>
              <input style={inp} value={partnerSearch}
                onChange={e => { setPartnerSearch(e.target.value); if (selectedPartner) setSelectedPartner(null); }}
                placeholder={`Rechercher un ${type === 'client' ? 'client' : 'fournisseur'}...`} />
              {partnerSearching && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--text3)' }}>…</span>}
            </div>
            {partnerResults.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 7, maxHeight: 160, overflowY: 'auto', backgroundColor: 'var(--bg)', marginTop: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                {partnerResults.map(p => (
                  <div key={p.id} onClick={() => { setSelectedPartner(p); setPartnerSearch(partnerName(p)); setPartnerResults([]); }}
                    style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid var(--bg2)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{partnerName(p)}</span>
                    {p.email && <span style={{ fontSize: '0.6rem', color: 'var(--text3)', marginLeft: 8 }}>{p.email}</span>}
                  </div>
                ))}
              </div>
            )}
            {selectedPartner && (
              <div style={{ marginTop: 6, padding: '7px 14px', borderRadius: 7, backgroundColor: 'rgba(13,147,148,0.08)', border: '1px solid rgba(13,147,148,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0d9394' }}>{partnerName(selectedPartner)}</span>
                <button onClick={() => { setSelectedPartner(null); setPartnerSearch(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0d9394', display: 'flex', padding: 0 }}>
                  <Icons.X style={{ width: 12, height: 12 }} />
                </button>
              </div>
            )}
          </div>

          {/* Row 4: Dates + Days + Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Date début</label>
              <input type="date" style={inp} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Date fin</label>
              <input type="date" style={inp} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Jours estimés</label>
              <input type="number" style={inp} value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} min="0" placeholder="0" />
            </div>
            <div>
              <label style={lbl}>Montant ({currency})</label>
              <input type="number" style={inp} value={amount} onChange={e => setAmount(e.target.value)} min="0" placeholder="0.00" />
            </div>
          </div>

          {/* Row 5: Description */}
          <div>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, height: 68, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Description de la prestation..." />
          </div>

          {/* Row 6: Consultants */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>Consultants assignés</span>
            </div>

            {/* Contact search */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input style={{ ...inp, paddingLeft: 32 }} value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Rechercher un consultant (interne / externe)..." />
              <Icons.Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: 'var(--text3)' }} />
              {contactSearching && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--text3)' }}>…</span>}
            </div>
            {contactResults.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 7, maxHeight: 160, overflowY: 'auto', backgroundColor: 'var(--bg)', marginBottom: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                {contactResults.map(c => (
                  <div key={c.id} onClick={() => addConsultant(c)}
                    style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid var(--bg2)', display: 'flex', alignItems: 'center', gap: 8 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(13,147,148,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icons.User style={{ width: 13, height: 13, color: '#0d9394' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{contactName(c)}</span>
                      <span style={{ marginLeft: 6, fontSize: '0.58rem', padding: '1px 5px', borderRadius: 3, backgroundColor: 'rgba(13,147,148,0.1)', color: '#0d9394' }}>{c.type === 'consultant_interne' ? 'Interne' : 'Externe'}</span>
                      {c.email && <p style={{ margin: '1px 0 0', fontSize: '0.6rem', color: 'var(--text3)' }}>{c.email}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {consultants.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text)' }}>Consultant</th>
                      <th style={{ padding: '8px 8px', textAlign: 'left', fontWeight: 700, color: 'var(--text)', width: 100 }}>Rôle</th>
                      <th style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', width: 100 }}>TJM</th>
                      <th style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', width: 90 }}>Jours</th>
                      <th style={{ width: 32 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {consultants.map((c, idx) => (
                      <tr key={c._key} style={{ borderBottom: idx === consultants.length - 1 ? 'none' : '1px solid var(--bg2)' }}>
                        <td style={{ padding: '5px 8px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{c.contactLabel}</span>
                        </td>
                        <td style={{ padding: '5px 4px' }}>
                          <input style={{ ...inp, border: 'none', padding: '4px 6px', backgroundColor: 'transparent', fontSize: '0.68rem' }}
                            value={c.role} onChange={e => updateConsultant(idx, 'role', e.target.value)} placeholder="Rôle" />
                        </td>
                        <td style={{ padding: '5px 4px' }}>
                          <input type="number" style={{ ...inp, border: 'none', padding: '4px 6px', textAlign: 'right', backgroundColor: 'transparent', fontSize: '0.68rem' }}
                            value={c.dailyRate} onChange={e => updateConsultant(idx, 'dailyRate', e.target.value)} min="0" placeholder="0.00" />
                        </td>
                        <td style={{ padding: '5px 4px' }}>
                          <input type="number" style={{ ...inp, border: 'none', padding: '4px 6px', textAlign: 'right', backgroundColor: 'transparent', fontSize: '0.68rem' }}
                            value={c.estimatedDays} onChange={e => updateConsultant(idx, 'estimatedDays', e.target.value)} min="0" placeholder="0" />
                        </td>
                        <td style={{ padding: '5px 4px', textAlign: 'center' }}>
                          <button onClick={() => setConsultants(prev => prev.filter((_, i) => i !== idx))}
                            style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', borderRadius: 4, opacity: 0.7 }}>
                            <Icons.X style={{ width: 12, height: 12 }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Row 7: Notes */}
          <div>
            <label style={lbl}>Notes</label>
            <textarea style={{ ...inp, height: 60, resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes additionnelles..." />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#ef4444', padding: '9px 14px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export const PrestationsTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [items, setItems] = useState<Prestation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Prestation | null>(null);
  const [editing, setEditing] = useState<Prestation | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 300);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await prestationApi.list(projectId, {
        page, limit: LIMIT,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setItems(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, debouncedSearch, typeFilter, statusFilter, categoryFilter]);

  useEffect(() => { load(); }, [load]);

  const openView = async (p: Prestation) => {
    try { setViewing(await prestationApi.getOne(projectId, p.id)); } catch { setViewing(p); }
  };

  const openEdit = async (p: Prestation) => {
    try { setEditing(await prestationApi.getOne(projectId, p.id)); } catch { setEditing(p); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette prestation définitivement ?')) return;
    setDeleting(id);
    try {
      await prestationApi.remove(projectId, id);
      setItems(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (saved: Prestation) => {
    setCreating(false);
    setEditing(null);
    load();
    setViewing(saved);
  };

  const sm = (s: string) => STATUS_META[s] || STATUS_META.created;

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', flex: 1, maxWidth: 280 }}>
          <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, code..."
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.7rem', color: 'var(--text)', width: '100%' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 0 }}>
              <Icons.X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: '0.7rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les types</option>
          <option value="client">Client</option>
          <option value="supplier">Fournisseur</option>
        </select>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(0); }}
          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: '0.7rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Toutes catégories</option>
          <option value="service">Service</option>
          <option value="autre">Autre</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: '0.7rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les statuts</option>
          <option value="created">Créée</option>
          <option value="pending">En attente</option>
          <option value="validated">Validée</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
        <button onClick={() => setCreating(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: 'none', borderRadius: 7, fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#0d9394', color: 'white', cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}>
          <Icons.Plus style={{ width: 13, height: 13 }} /> Créer une prestation
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <Skel key={i} w="100%" h={44} r={6} />)}
        </div>
      ) : (
        <TableWrap
          headers={['Code / Nom', 'Catégorie', 'Type', 'Partenaire', 'Montant', 'Jours Est.', 'Jours Conso.', 'Début', 'Fin', 'Statut', 'Actions']}
          empty={items.length === 0}>
          {items.map((p, i) => {
            const s = sm(p.status);
            const partner = p.type === 'client' ? p.customer : p.supplier;
            return (
              <tr key={p.id}
                style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--bg2)', transition: 'background 0.1s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(p)}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                    {p.prestationCode && <p style={{ margin: '1px 0 0', fontSize: '0.58rem', color: 'var(--text3)', fontFamily: 'monospace' }}>{p.prestationCode}</p>}
                  </div>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(13,147,148,0.1)', color: '#0d9394' }}>
                    {p.category === 'service' ? 'Service' : 'Autre'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, backgroundColor: p.type === 'client' ? 'rgba(37,99,235,0.1)' : 'rgba(139,92,246,0.1)', color: p.type === 'client' ? '#2563eb' : '#8b5cf6' }}>
                    {p.type === 'client' ? 'Client' : 'Fournisseur'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{partnerName(partner)}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{fmtAmt(p.amount, p.currency)}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{p.estimatedDays ?? '—'}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.7rem', color: p.estimatedDays && p.consumedDays > p.estimatedDays ? '#ef4444' : 'var(--text2)' }}>{p.consumedDays ?? 0}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text2)' }}>{p.startDate ? fmtDate(p.startDate) : '—'}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text2)' }}>{p.endDate ? fmtDate(p.endDate) : '—'}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(p)}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); openView(p); }} title="Voir"
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                      <Icons.Eye style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); openEdit(p); }} title="Modifier"
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                      <Icons.Edit style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(p.id); }} title="Supprimer"
                      disabled={deleting === p.id}
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 5, cursor: deleting === p.id ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', opacity: deleting === p.id ? 0.5 : 1 }}>
                      <Icons.Trash style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </TableWrap>
      )}

      <Pagination page={page} setPage={setPage} rowsPerPage={LIMIT} total={total} />

      {viewing && !editing && (
        <PrestationView
          prestation={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { openEdit(viewing); setViewing(null); }}
        />
      )}

      {(creating || editing) && (
        <PrestationForm
          projectId={projectId}
          prestation={editing || undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
};
