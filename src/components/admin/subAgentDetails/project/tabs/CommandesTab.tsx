'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Icons from '../../../../../assets/icons';
import { fmtDate, TableWrap, Pagination, Skel } from '../shared';
import { bonCommandeApi } from '../../../../../lib/project/bon-commande';
import type { BonCommande, BCItem, CreateBCInput } from '../../../../../lib/project/bon-commande';
import { projectApi } from '../../../../../lib/project/api';
import { projectSupplierApi } from '../../../../../lib/project/supplier';
import { prestationApi } from '../../../../../lib/project/prestation';
import type { Prestation } from '../../../../../lib/project/prestation';

const LIMIT = 10;

const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string }> = {
  draft:     { label: 'Brouillon',  bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
  sent:      { label: 'Envoyé',     bg: 'rgba(37,99,235,0.1)',   color: '#2563eb',      border: 'rgba(37,99,235,0.3)'   },
  validated: { label: 'Validé',     bg: 'rgba(34,197,94,0.1)',   color: '#22c55e',      border: 'rgba(34,197,94,0.3)'   },
  rejected:  { label: 'Rejeté',     bg: 'rgba(239,68,68,0.1)',   color: '#ef4444',      border: 'rgba(239,68,68,0.3)'   },
  cancelled: { label: 'Annulé',     bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
  completed: { label: 'Complété',   bg: 'rgba(20,184,166,0.1)',  color: '#14b8a6',      border: 'rgba(20,184,166,0.3)'  },
};

function partnerName(p: any): string {
  if (!p) return '—';
  if (p.companyName) return p.companyName;
  return [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email || '—';
}

function fmtAmt(n: number, currency = 'MAD') {
  return `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

// ─── BC View (invoice-like) ───────────────────────────────────────────────────

const BCView: React.FC<{
  bc: BonCommande;
  onClose: () => void;
  onEdit: () => void;
}> = ({ bc, onClose, onEdit }) => {
  const sm = STATUS_META[bc.status] || STATUS_META.draft;
  const partner = bc.type === 'vente' ? bc.customer : bc.supplier;
  const items = bc.items || [];
  const remaining = bc.remainingAmount ?? (bc.amount - bc.paidAmount);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1700, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}>
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: 14, boxShadow: '0 32px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: 860, marginBottom: 24 }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onClose} style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)' }}>
            <Icons.ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', flex: 1 }}>BC {bc.bonCommandeNumber}</span>
          <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 7, fontSize: '0.7rem', fontWeight: 500, color: 'var(--text2)', background: 'none', cursor: 'pointer' }}>
            <Icons.Edit style={{ width: 12, height: 12 }} /> Modifier
          </button>
          <button onClick={onClose} style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)' }}>
            <Icons.X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div style={{ padding: '36px 44px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
            <div>
              <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1 }}>BON DE COMMANDE</p>
              <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'var(--text3)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{bc.bonCommandeNumber}</p>
              {bc.devisId && (
                <p style={{ margin: '4px 0 0', fontSize: '0.62rem', color: '#0d9394' }}>Devis lié: {bc.devisId.slice(0, 8).toUpperCase()}…</p>
              )}
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '4px 14px', borderRadius: 20, backgroundColor: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>{sm.label}</span>
              <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 4, backgroundColor: bc.type === 'vente' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: bc.type === 'vente' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                {bc.type === 'vente' ? '▲ Vente' : '▼ Achat'}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
            <div style={{ padding: '16px 18px', backgroundColor: 'var(--bg2)', borderRadius: 10 }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.58rem', fontWeight: 700, color: '#0d9394', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Émetteur</p>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Fyneo</p>
              <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: 'var(--text3)' }}>Votre organisation</p>
            </div>
            <div style={{ padding: '16px 18px', backgroundColor: 'var(--bg2)', borderRadius: 10 }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.58rem', fontWeight: 700, color: '#0d9394', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {bc.type === 'vente' ? 'Client' : 'Fournisseur'}
              </p>
              {partner ? (
                <>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{partnerName(partner)}</p>
                  {partner.email && <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: 'var(--text3)' }}>{partner.email}</p>}
                  {(partner.city || partner.country) && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: 'var(--text3)' }}>{[partner.city, partner.country].filter(Boolean).join(', ')}</p>
                  )}
                </>
              ) : <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text3)' }}>Non renseigné</p>}
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 30, flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 16px', backgroundColor: 'var(--bg2)', borderRadius: 8, minWidth: 140 }}>
              <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Date commande</p>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{fmtDate(bc.orderDate)}</p>
            </div>
            {bc.deliveryDate && (
              <div style={{ padding: '10px 16px', backgroundColor: 'rgba(37,99,235,0.06)', borderRadius: 8, border: '1px solid rgba(37,99,235,0.2)', minWidth: 140 }}>
                <p style={{ margin: 0, fontSize: '0.55rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Livraison</p>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{fmtDate(bc.deliveryDate)}</p>
              </div>
            )}
            {bc.validationDate && (
              <div style={{ padding: '10px 16px', backgroundColor: 'rgba(34,197,94,0.06)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', minWidth: 140 }}>
                <p style={{ margin: 0, fontSize: '0.55rem', color: '#22c55e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Validation</p>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>{fmtDate(bc.validationDate)}</p>
              </div>
            )}
          </div>

          {bc.title && <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{bc.title}</p>}
          {bc.description && <p style={{ margin: '0 0 24px', fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.65 }}>{bc.description}</p>}

          {/* Items */}
          {items.length > 0 && (
            <div style={{ marginBottom: 28, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text)' }}>Description</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', width: 72 }}>Qté</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', width: 130 }}>Prix unitaire</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', width: 140 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id || i} style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--bg2)' }}>
                      <td style={{ padding: '10px 14px', color: 'var(--text)' }}>{item.label || '—'}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text2)' }}>{item.quantity ?? '—'}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--text2)' }}>
                        {item.unitPrice != null ? fmtAmt(item.unitPrice, bc.currency) : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>
                        {item.totalPrice != null ? fmtAmt(item.totalPrice, bc.currency) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <div style={{ minWidth: 300 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '2px solid var(--border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>Montant total</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{fmtAmt(bc.amount, bc.currency)}</span>
              </div>
              {bc.paidAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#22c55e' }}>Montant payé</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22c55e' }}>− {fmtAmt(bc.paidAmount, bc.currency)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: remaining <= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(13,147,148,0.1)', borderRadius: 8, marginTop: 6 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: remaining <= 0 ? '#22c55e' : '#0d9394' }}>Restant dû</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: remaining <= 0 ? '#22c55e' : '#0d9394' }}>{fmtAmt(Math.max(0, remaining), bc.currency)}</span>
              </div>
            </div>
          </div>

          {bc.notes && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.65 }}>{bc.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Form item state ──────────────────────────────────────────────────────────

interface FormItem {
  _key: string;
  prestationId: string;
  label: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
}

// ─── BC Form (create / edit) ──────────────────────────────────────────────────

const BCForm: React.FC<{
  projectId: string;
  bc?: BonCommande;
  onClose: () => void;
  onSaved: (bc: BonCommande) => void;
}> = ({ projectId, bc, onClose, onSaved }) => {
  const isEdit = !!bc;
  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', fontSize: '0.72rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none' };
  const lbl: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text2)', fontWeight: 600, marginBottom: 5, display: 'block' };

  const [type, setType] = useState<'vente' | 'achat'>((bc?.type as 'vente' | 'achat') || 'vente');
  const [bcNumber, setBcNumber] = useState(bc?.bonCommandeNumber || '');
  const [devisId, setDevisId] = useState(bc?.devisId || '');
  const [title, setTitle] = useState(bc?.title || '');
  const [description, setDescription] = useState(bc?.description || '');
  const [orderDate, setOrderDate] = useState(bc?.orderDate || new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(bc?.deliveryDate || '');
  const [validationDate, setValidationDate] = useState(bc?.validationDate || '');
  const [status, setStatus] = useState(bc?.status || 'draft');
  const [currency, setCurrency] = useState(bc?.currency || 'MAD');
  const [paidAmount, setPaidAmount] = useState(bc?.paidAmount != null ? String(bc.paidAmount) : '0');
  const [notes, setNotes] = useState(bc?.notes || '');

  const [selectedPartner, setSelectedPartner] = useState<any>(
    bc ? (bc.type === 'vente' ? bc.customer : bc.supplier) : null,
  );
  const [partnerSearch, setPartnerSearch] = useState(
    bc ? partnerName(bc.type === 'vente' ? bc.customer : bc.supplier) : '',
  );
  const [partnerResults, setPartnerResults] = useState<any[]>([]);
  const [partnerSearching, setPartnerSearching] = useState(false);

  const [items, setItems] = useState<FormItem[]>(() =>
    bc?.items?.length
      ? bc.items.map(item => ({
          _key: Math.random().toString(36),
          prestationId: item.prestationId || '',
          label: item.label || '',
          quantity: item.quantity != null ? String(item.quantity) : '',
          unitPrice: item.unitPrice != null ? String(item.unitPrice) : '',
          totalPrice: item.totalPrice != null ? String(item.totalPrice) : '',
        }))
      : [{ _key: Math.random().toString(36), prestationId: '', label: '', quantity: '1', unitPrice: '', totalPrice: '' }],
  );

  const [projectPrestations, setProjectPrestations] = useState<Prestation[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    prestationApi.list(projectId, { limit: 100 }).then(r => setProjectPrestations(r.data)).catch(() => {});
  }, [projectId]);

  useEffect(() => {
    if (!partnerSearch || selectedPartner) { setPartnerResults([]); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    setPartnerSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        if (type === 'vente') {
          setPartnerResults(await projectApi.searchCustomers(partnerSearch));
        } else {
          setPartnerResults(await projectSupplierApi.searchSuppliers(partnerSearch));
        }
      } finally {
        setPartnerSearching(false);
      }
    }, 300);
  }, [partnerSearch, type, selectedPartner]);

  const updateItem = (idx: number, field: keyof Omit<FormItem, '_key'>, value: string) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = parseFloat(field === 'quantity' ? value : next[idx].quantity) || 0;
        const up = parseFloat(field === 'unitPrice' ? value : next[idx].unitPrice) || 0;
        if (qty && up) next[idx].totalPrice = (qty * up).toFixed(2);
      }
      return next;
    });
  };

  const totalAmount = items.reduce((s, item) => s + (parseFloat(item.totalPrice) || 0), 0);

  const save = async () => {
    if (!orderDate) { setError('La date de commande est obligatoire'); return; }
    setSaving(true); setError('');
    try {
      const apiItems = items
        .filter(item => item.label || item.totalPrice || item.prestationId)
        .map(item => ({
          prestationId: item.prestationId || undefined,
          label: item.label || undefined,
          quantity: item.quantity ? parseFloat(item.quantity) : undefined,
          unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : undefined,
          totalPrice: item.totalPrice ? parseFloat(item.totalPrice) : undefined,
        }));

      const payload: CreateBCInput = {
        bonCommandeNumber: bcNumber || undefined,
        devisId: devisId || undefined,
        type,
        customerId: type === 'vente' ? selectedPartner?.id : undefined,
        supplierId: type === 'achat' ? selectedPartner?.id : undefined,
        title: title || undefined,
        description: description || undefined,
        amount: totalAmount || undefined,
        paidAmount: parseFloat(paidAmount) || 0,
        currency,
        orderDate,
        deliveryDate: deliveryDate || undefined,
        validationDate: validationDate || undefined,
        status,
        notes: notes || undefined,
        items: apiItems.length ? apiItems : undefined,
      };

      const result = isEdit && bc
        ? await bonCommandeApi.update(projectId, bc.id, payload)
        : await bonCommandeApi.create(projectId, payload);
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
            {isEdit ? `Modifier — ${bc!.bonCommandeNumber}` : 'Créer un bon de commande'}
          </span>
          <button onClick={save} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', border: 'none', borderRadius: 7, fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#0d9394', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            <Icons.Check style={{ width: 13, height: 13 }} />
            {saving ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer le BC'}
          </button>
        </div>

        <div style={{ padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Row 1: Type + N° + Status + Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
            <div>
              <label style={lbl}>Type</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['vente', 'achat'] as const).map(t => (
                  <button key={t} onClick={() => { setType(t); setSelectedPartner(null); setPartnerSearch(''); setPartnerResults([]); }}
                    style={{ padding: '7px 16px', fontSize: '0.7rem', fontWeight: 700, borderRadius: 7, border: `1.5px solid ${type === t ? (t === 'vente' ? '#22c55e' : '#ef4444') : 'var(--border)'}`, backgroundColor: type === t ? (t === 'vente' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)') : 'var(--bg)', color: type === t ? (t === 'vente' ? '#16a34a' : '#dc2626') : 'var(--text2)', cursor: 'pointer' }}>
                    {t === 'vente' ? '▲ Vente' : '▼ Achat'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>N° Bon de commande</label>
              <input style={inp} value={bcNumber} onChange={e => setBcNumber(e.target.value)} placeholder="Auto-généré si vide" />
            </div>
            <div>
              <label style={lbl}>Statut</label>
              <select style={inp} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="validated">Validé</option>
                <option value="rejected">Rejeté</option>
                <option value="cancelled">Annulé</option>
                <option value="completed">Complété</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Devise</label>
              <select style={inp} value={currency} onChange={e => setCurrency(e.target.value)}>
                {['MAD', 'EUR', 'USD', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Title + Devis lié */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
            <div>
              <label style={lbl}>Titre du bon de commande</label>
              <input style={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Commande matériel informatique" />
            </div>
            <div>
              <label style={lbl}>ID Devis lié (optionnel)</label>
              <input style={inp} value={devisId} onChange={e => setDevisId(e.target.value)} placeholder="UUID du devis" />
            </div>
          </div>

          {/* Row 3: Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Date de commande *</label>
              <input type="date" style={inp} value={orderDate} onChange={e => setOrderDate(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Date de livraison</label>
              <input type="date" style={inp} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Date de validation</label>
              <input type="date" style={inp} value={validationDate} onChange={e => setValidationDate(e.target.value)} />
            </div>
          </div>

          {/* Row 4: Partner */}
          <div>
            <label style={lbl}>{type === 'vente' ? 'Client' : 'Fournisseur'}</label>
            <div style={{ position: 'relative' }}>
              <input style={inp} value={partnerSearch}
                onChange={e => { setPartnerSearch(e.target.value); if (selectedPartner) setSelectedPartner(null); }}
                placeholder={`Rechercher un ${type === 'vente' ? 'client' : 'fournisseur'}...`} />
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

          {/* Row 5: Description */}
          <div>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp, height: 60, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Description du bon de commande..." />
          </div>

          {/* Row 6: Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>Lignes de commande</span>
              <button onClick={() => setItems(prev => [...prev, { _key: Math.random().toString(36), prestationId: '', label: '', quantity: '1', unitPrice: '', totalPrice: '' }])}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid rgba(13,147,148,0.3)', borderRadius: 6, fontSize: '0.68rem', fontWeight: 600, color: '#0d9394', backgroundColor: 'rgba(13,147,148,0.05)', cursor: 'pointer' }}>
                <Icons.Plus style={{ width: 11, height: 11 }} /> Ajouter une ligne
              </button>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text)' }}>Prestation</th>
                    <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text)' }}>Description</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', width: 72 }}>Qté</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', width: 130 }}>Prix unitaire</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text)', width: 130 }}>Total HT</th>
                    <th style={{ width: 32 }} />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item._key} style={{ borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--bg2)' }}>
                      <td style={{ padding: '5px 8px', width: 160 }}>
                        <select
                          style={{ ...inp, border: 'none', padding: '5px 6px', backgroundColor: 'transparent', fontSize: '0.68rem', width: '100%' }}
                          value={item.prestationId}
                          onChange={e => {
                            const pid = e.target.value;
                            const prest = projectPrestations.find(p => p.id === pid);
                            setItems(prev => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], prestationId: pid, label: prest ? prest.name : next[idx].label };
                              return next;
                            });
                          }}>
                          <option value="">— Lier —</option>
                          {projectPrestations.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '5px 8px' }}>
                        <input style={{ ...inp, border: 'none', padding: '5px 6px', backgroundColor: 'transparent' }}
                          value={item.label} onChange={e => updateItem(idx, 'label', e.target.value)} placeholder="Description..." />
                      </td>
                      <td style={{ padding: '5px 6px' }}>
                        <input type="number" style={{ ...inp, border: 'none', padding: '5px 6px', textAlign: 'right', backgroundColor: 'transparent' }}
                          value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} min="0" />
                      </td>
                      <td style={{ padding: '5px 6px' }}>
                        <input type="number" style={{ ...inp, border: 'none', padding: '5px 6px', textAlign: 'right', backgroundColor: 'transparent' }}
                          value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} min="0" placeholder="0.00" />
                      </td>
                      <td style={{ padding: '5px 6px' }}>
                        <input type="number" style={{ ...inp, border: 'none', padding: '5px 6px', textAlign: 'right', fontWeight: 700, backgroundColor: 'transparent' }}
                          value={item.totalPrice} onChange={e => updateItem(idx, 'totalPrice', e.target.value)} min="0" placeholder="0.00" />
                      </td>
                      <td style={{ padding: '5px 4px', textAlign: 'center' }}>
                        <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} disabled={items.length === 1}
                          style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: items.length === 1 ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', borderRadius: 4, opacity: items.length === 1 ? 0.25 : 0.7 }}>
                          <Icons.X style={{ width: 12, height: 12 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '2px solid var(--border)', backgroundColor: 'var(--bg2)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text2)', lineHeight: '1.8rem' }}>Montant total</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{fmtAmt(totalAmount, currency)}</span>
              </div>
            </div>
          </div>

          {/* Row 7: Paid + Notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <label style={lbl}>Montant payé ({currency})</label>
              <input type="number" style={inp} value={paidAmount} onChange={e => setPaidAmount(e.target.value)} min="0" placeholder="0" />
            </div>
            <div>
              <label style={lbl}>Notes</label>
              <textarea style={{ ...inp, height: 68, resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes additionnelles..." />
            </div>
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

export const CommandesTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [items, setItems] = useState<BonCommande[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<BonCommande | null>(null);
  const [editing, setEditing] = useState<BonCommande | null>(null);
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
      const res = await bonCommandeApi.list(projectId, {
        page, limit: LIMIT,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setItems(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, debouncedSearch, typeFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openView = async (d: BonCommande) => {
    try { setViewing(await bonCommandeApi.getOne(projectId, d.id)); } catch { setViewing(d); }
  };

  const openEdit = async (d: BonCommande) => {
    try { setEditing(await bonCommandeApi.getOne(projectId, d.id)); } catch { setEditing(d); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce bon de commande définitivement ?')) return;
    setDeleting(id);
    try {
      await bonCommandeApi.remove(projectId, id);
      setItems(prev => prev.filter(d => d.id !== id));
      setTotal(prev => prev - 1);
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (saved: BonCommande) => {
    setCreating(false);
    setEditing(null);
    load();
    setViewing(saved);
  };

  const sm = (s: string) => STATUS_META[s] || STATUS_META.draft;

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', flex: 1, maxWidth: 280 }}>
          <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="N° BC, titre..."
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
          <option value="vente">Vente</option>
          <option value="achat">Achat</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: '0.7rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyé</option>
          <option value="validated">Validé</option>
          <option value="rejected">Rejeté</option>
          <option value="cancelled">Annulé</option>
          <option value="completed">Complété</option>
        </select>
        <button onClick={() => setCreating(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: 'none', borderRadius: 7, fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#0d9394', color: 'white', cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}>
          <Icons.Plus style={{ width: 13, height: 13 }} /> Créer un BC
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <Skel key={i} w="100%" h={44} r={6} />)}
        </div>
      ) : (
        <TableWrap
          headers={['N° BC', 'Type', 'Client / Fournisseur', 'Titre', 'Montant', 'Restant', 'Date', 'Livraison', 'Statut', 'Actions']}
          empty={items.length === 0}>
          {items.map((d, i) => {
            const s = sm(d.status);
            const remaining = d.remainingAmount ?? (d.amount - d.paidAmount);
            const partner = d.type === 'vente' ? d.customer : d.supplier;
            return (
              <tr key={d.id}
                style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--bg2)', transition: 'background 0.1s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>{d.bonCommandeNumber}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: d.type === 'vente' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: d.type === 'vente' ? '#16a34a' : '#dc2626' }}>
                    {d.type === 'vente' ? 'Vente' : 'Achat'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{partnerName(partner)}</span>
                </td>
                <td style={{ padding: '10px 12px', maxWidth: 150 }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{d.title || '—'}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{fmtAmt(d.amount, d.currency)}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: remaining <= 0 ? '#22c55e' : remaining < d.amount ? '#f59e0b' : 'var(--text)' }}>
                    {fmtAmt(Math.max(0, remaining), d.currency)}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text2)' }}>{fmtDate(d.orderDate)}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.68rem', color: d.deliveryDate ? 'var(--text2)' : 'var(--text3)' }}>
                    {d.deliveryDate ? fmtDate(d.deliveryDate) : '—'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => openView(d)}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: 4, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); openView(d); }} title="Voir"
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                      <Icons.Eye style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); openEdit(d); }} title="Modifier"
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                      <Icons.Edit style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(d.id); }} title="Supprimer" disabled={deleting === d.id}
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 5, cursor: deleting === d.id ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', opacity: deleting === d.id ? 0.5 : 1 }}>
                      <Icons.Trash style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </TableWrap>
      )}

      {!loading && <Pagination page={page} setPage={setPage} rowsPerPage={LIMIT} total={total} />}

      {viewing && (
        <BCView bc={viewing} onClose={() => setViewing(null)} onEdit={() => { openEdit(viewing); setViewing(null); }} />
      )}
      {(creating || editing) && (
        <BCForm
          projectId={projectId}
          bc={editing || undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
};
