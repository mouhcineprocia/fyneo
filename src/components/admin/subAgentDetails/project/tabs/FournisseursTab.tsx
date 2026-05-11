'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Icons from '../../../../../assets/icons';
import { fmtDate, TableWrap, Pagination, Skel } from '../shared';
import { projectSupplierApi } from '../../../../../lib/project/supplier';
import type { ProjectSupplier, Supplier } from '../../../../../lib/project/supplier';

const LIMIT = 10;

const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string }> = {
  active:   { label: 'Actif',    bg: 'rgba(34,197,94,0.1)',   color: '#22c55e',      border: 'rgba(34,197,94,0.3)'   },
  inactive: { label: 'Inactif',  bg: 'rgba(107,114,128,0.1)', color: 'var(--text2)', border: 'rgba(107,114,128,0.3)' },
  archived: { label: 'Archivé',  bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b',      border: 'rgba(245,158,11,0.3)'  },
  blocked:  { label: 'Bloqué',   bg: 'rgba(239,68,68,0.1)',   color: '#ef4444',      border: 'rgba(239,68,68,0.3)'   },
};

function supplierName(s: Supplier): string {
  if (s.companyName) return s.companyName;
  return [s.firstName, s.lastName].filter(Boolean).join(' ') || '—';
}

// ─── Details Popup ────────────────────────────────────────────────────────────

const DetailsPopup: React.FC<{ ps: ProjectSupplier; onClose: () => void }> = ({ ps, onClose }) => {
  const s = ps.supplier;
  const sm = STATUS_META[ps.status] || STATUS_META.inactive;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d9394', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
        <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>{children}</div>
    </div>
  );

  const Field = ({ label, value }: { label: string; value?: string | number }) => (
    <div style={{ backgroundColor: 'var(--bg2)', borderRadius: 6, padding: '10px 12px' }}>
      <p style={{ margin: 0, fontSize: '0.58rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '0.72rem', color: value ? 'var(--text)' : 'var(--text3)', fontWeight: value ? 500 : 400 }}>
        {value ?? '—'}
      </p>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 }} onClick={onClose}>
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', width: '100%', maxWidth: 780, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.Building2 style={{ width: 20, height: 20, color: '#0d9394' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{supplierName(s)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              {s.category && <span style={{ fontSize: '0.62rem', padding: '1px 7px', borderRadius: 4, backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb', fontWeight: 600 }}>{s.category}</span>}
              <span style={{ fontSize: '0.62rem', padding: '1px 7px', borderRadius: 4, backgroundColor: sm.bg, color: sm.color, border: `1px solid ${sm.border}`, fontWeight: 600 }}>{sm.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)', flexShrink: 0 }}>
            <Icons.X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <Section title="Fournisseur">
            <Field label="Raison sociale" value={s.companyName} />
            <Field label="Prénom / Nom" value={[s.firstName, s.lastName].filter(Boolean).join(' ') || undefined} />
            <Field label="Email" value={s.email} />
            <Field label="Téléphone" value={s.phone || s.mobile} />
            <Field label="ICE" value={s.ice} />
            <Field label="Pays / Ville" value={[s.city, s.country].filter(Boolean).join(', ') || undefined} />
          </Section>
          <Section title="Contrat projet">
            <Field label="Rôle" value={ps.role} />
            <Field label="Réf. contrat" value={ps.contractReference} />
            <Field label="Date début" value={ps.startDate ? fmtDate(ps.startDate) : undefined} />
            <Field label="Date fin" value={ps.endDate ? fmtDate(ps.endDate) : undefined} />
            <Field label="Coût estimé" value={ps.estimatedCost != null ? `${Number(ps.estimatedCost).toLocaleString('fr-FR')} ${ps.currency}` : undefined} />
            <Field label="Notes" value={ps.notes} />
          </Section>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Popup ───────────────────────────────────────────────────────────────

const EditPopup: React.FC<{
  ps: ProjectSupplier;
  projectId: string;
  onClose: () => void;
  onSaved: (ps: ProjectSupplier) => void;
}> = ({ ps, projectId, onClose, onSaved }) => {
  const [form, setForm] = useState({
    role: ps.role || '',
    contractReference: ps.contractReference || '',
    startDate: ps.startDate || '',
    endDate: ps.endDate || '',
    estimatedCost: ps.estimatedCost != null ? String(ps.estimatedCost) : '',
    currency: ps.currency || 'MAD',
    notes: ps.notes || '',
    status: ps.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await projectSupplierApi.update(projectId, ps.id, {
        role: form.role || undefined,
        contractReference: form.contractReference || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
        currency: form.currency || undefined,
        notes: form.notes || undefined,
        status: form.status,
      });
      onSaved(updated);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: '0.72rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none' };
  const lbl: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text2)', fontWeight: 500, marginBottom: 4, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 }} onClick={onClose}>
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Modifier le lien fournisseur</span>
          <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)' }}>
            <Icons.X style={{ width: 15, height: 15 }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text2)', fontWeight: 500 }}>{supplierName(ps.supplier)}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={lbl}>Rôle</label><input style={inp} value={form.role} onChange={set('role')} placeholder="Ex: Sous-traitant" /></div>
            <div><label style={lbl}>Réf. contrat</label><input style={inp} value={form.contractReference} onChange={set('contractReference')} placeholder="CTR-001" /></div>
            <div><label style={lbl}>Date début</label><input type="date" style={inp} value={form.startDate} onChange={set('startDate')} /></div>
            <div><label style={lbl}>Date fin</label><input type="date" style={inp} value={form.endDate} onChange={set('endDate')} /></div>
            <div><label style={lbl}>Coût estimé</label><input type="number" style={inp} value={form.estimatedCost} onChange={set('estimatedCost')} placeholder="0" min="0" /></div>
            <div>
              <label style={lbl}>Devise</label>
              <select style={inp} value={form.currency} onChange={set('currency')}>
                {['MAD', 'EUR', 'USD', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Statut</label>
              <select style={inp} value={form.status} onChange={set('status')}>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="archived">Archivé</option>
                <option value="blocked">Bloqué</option>
              </select>
            </div>
          </div>
          <div><label style={lbl}>Notes</label><textarea style={{ ...inp, height: 70, resize: 'vertical' }} value={form.notes} onChange={set('notes')} placeholder="Notes..." /></div>
          {error && <p style={{ margin: 0, fontSize: '0.68rem', color: '#ef4444' }}>{error}</p>}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.7rem', background: 'none', cursor: 'pointer', color: 'var(--text2)' }}>Annuler</button>
          <button onClick={save} disabled={saving} style={{ padding: '6px 14px', border: 'none', borderRadius: 6, fontSize: '0.7rem', backgroundColor: '#0d9394', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add Modal ────────────────────────────────────────────────────────────────

const AddModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onAdded: (ps: ProjectSupplier) => void;
}> = ({ projectId, onClose, onAdded }) => {
  const [tab, setTab] = useState<'existing' | 'new'>('existing');

  const [searchQ, setSearchQ] = useState('');
  const [results, setResults] = useState<Supplier[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [linkRole, setLinkRole] = useState('');
  const [linkRef, setLinkRef] = useState('');
  const [linkStart, setLinkStart] = useState('');
  const [linkEnd, setLinkEnd] = useState('');
  const [linkCost, setLinkCost] = useState('');
  const [linkCurrency, setLinkCurrency] = useState('MAD');
  const [linkNotes, setLinkNotes] = useState('');

  const [newType, setNewType] = useState<'company' | 'individual'>('company');
  const [newCompany, setNewCompany] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newIce, setNewIce] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newCurrency, setNewCurrency] = useState('MAD');
  const [newNotes, setNewNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQ) { setResults([]); return; }
    setSearching(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await projectSupplierApi.searchSuppliers(searchQ);
        setResults(data);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [searchQ]);

  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: '0.72rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none' };
  const lbl: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text2)', fontWeight: 500, marginBottom: 4, display: 'block' };

  const submitExisting = async () => {
    if (!selectedSupplier) return;
    setSaving(true); setError('');
    try {
      const ps = await projectSupplierApi.link(projectId, {
        supplierId: selectedSupplier.id,
        role: linkRole || undefined,
        contractReference: linkRef || undefined,
        startDate: linkStart || undefined,
        endDate: linkEnd || undefined,
        estimatedCost: linkCost ? Number(linkCost) : undefined,
        currency: linkCurrency,
        notes: linkNotes || undefined,
      });
      onAdded(ps);
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const submitNew = async () => {
    if (!newCompany && !newFirstName) { setError('Veuillez renseigner un nom ou une raison sociale.'); return; }
    setSaving(true); setError('');
    try {
      const ps = await projectSupplierApi.createAndLink(projectId, {
        type: newType,
        companyName: newCompany || undefined,
        firstName: newFirstName || undefined,
        lastName: newLastName || undefined,
        email: newEmail || undefined,
        phone: newPhone || undefined,
        category: newCategory || undefined,
        ice: newIce || undefined,
        city: newCity || undefined,
        country: newCountry || undefined,
        role: newRole || undefined,
        estimatedCost: newCost ? Number(newCost) : undefined,
        linkCurrency: newCurrency,
        linkNotes: newNotes || undefined,
      });
      onAdded(ps);
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = tab === 'existing' ? !!selectedSupplier && !saving : !saving;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 }} onClick={onClose}>
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', width: '100%', maxWidth: 600, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>Ajouter un fournisseur</span>
          <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: 'var(--text2)' }}>
            <Icons.X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0, backgroundColor: 'var(--bg2)' }}>
          {(['existing', 'new'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{ flex: 1, padding: '10px 0', fontSize: '0.7rem', fontWeight: tab === t ? 600 : 500, color: tab === t ? '#0d9394' : 'var(--text2)', border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid #0d9394' : '2px solid transparent' }}>
              {t === 'existing' ? 'Fournisseurs existants' : 'Créer un fournisseur'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {tab === 'existing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Rechercher un fournisseur</label>
                <div style={{ position: 'relative' }}>
                  <input style={inp} value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Nom, email, catégorie..." />
                  {searching && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--text3)' }}>…</span>}
                </div>
                {results.length > 0 && (
                  <div style={{ marginTop: 6, border: '1px solid var(--border)', borderRadius: 6, maxHeight: 180, overflowY: 'auto', backgroundColor: 'var(--bg)' }}>
                    {results.map(s => (
                      <div key={s.id} onClick={() => { setSelectedSupplier(s); setSearchQ(supplierName(s)); setResults([]); }}
                        style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{supplierName(s)}</span>
                          {s.email && <span style={{ fontSize: '0.6rem', color: 'var(--text3)', display: 'block' }}>{s.email}</span>}
                        </div>
                        {s.category && <span style={{ fontSize: '0.58rem', padding: '1px 6px', borderRadius: 3, backgroundColor: 'rgba(37,99,235,0.08)', color: '#2563eb' }}>{s.category}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {selectedSupplier && (
                  <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, backgroundColor: 'rgba(13,147,148,0.08)', border: '1px solid rgba(13,147,148,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0d9394' }}>{supplierName(selectedSupplier)}</span>
                    <button onClick={() => { setSelectedSupplier(null); setSearchQ(''); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#0d9394', display: 'flex', padding: 0 }}>
                      <Icons.X style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lbl}>Rôle</label><input style={inp} value={linkRole} onChange={e => setLinkRole(e.target.value)} placeholder="Ex: Sous-traitant" /></div>
                <div><label style={lbl}>Réf. contrat</label><input style={inp} value={linkRef} onChange={e => setLinkRef(e.target.value)} placeholder="CTR-001" /></div>
                <div><label style={lbl}>Date début</label><input type="date" style={inp} value={linkStart} onChange={e => setLinkStart(e.target.value)} /></div>
                <div><label style={lbl}>Date fin</label><input type="date" style={inp} value={linkEnd} onChange={e => setLinkEnd(e.target.value)} /></div>
                <div><label style={lbl}>Coût estimé</label><input type="number" style={inp} value={linkCost} onChange={e => setLinkCost(e.target.value)} placeholder="0" min="0" /></div>
                <div>
                  <label style={lbl}>Devise</label>
                  <select style={inp} value={linkCurrency} onChange={e => setLinkCurrency(e.target.value)}>
                    {['MAD', 'EUR', 'USD', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={lbl}>Notes</label><textarea style={{ ...inp, height: 64, resize: 'vertical' }} value={linkNotes} onChange={e => setLinkNotes(e.target.value)} placeholder="Notes..." /></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['company', 'individual'] as const).map(t => (
                  <button key={t} onClick={() => setNewType(t)}
                    style={{ flex: 1, padding: '7px 0', fontSize: '0.7rem', fontWeight: 600, borderRadius: 6, border: `1px solid ${newType === t ? '#0d9394' : 'var(--border)'}`, backgroundColor: newType === t ? 'rgba(13,147,148,0.1)' : 'var(--bg)', color: newType === t ? '#0d9394' : 'var(--text2)', cursor: 'pointer' }}>
                    {t === 'company' ? 'Société' : 'Individuel'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {newType === 'company' ? (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Raison sociale *</label>
                    <input style={inp} value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="Nom de la société" />
                  </div>
                ) : (
                  <>
                    <div><label style={lbl}>Prénom *</label><input style={inp} value={newFirstName} onChange={e => setNewFirstName(e.target.value)} /></div>
                    <div><label style={lbl}>Nom *</label><input style={inp} value={newLastName} onChange={e => setNewLastName(e.target.value)} /></div>
                  </>
                )}
                <div><label style={lbl}>Email</label><input type="email" style={inp} value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
                <div><label style={lbl}>Téléphone</label><input style={inp} value={newPhone} onChange={e => setNewPhone(e.target.value)} /></div>
                <div><label style={lbl}>Catégorie</label><input style={inp} value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Ex: Informatique" /></div>
                <div><label style={lbl}>ICE</label><input style={inp} value={newIce} onChange={e => setNewIce(e.target.value)} /></div>
                <div><label style={lbl}>Ville</label><input style={inp} value={newCity} onChange={e => setNewCity(e.target.value)} /></div>
                <div><label style={lbl}>Pays</label><input style={inp} value={newCountry} onChange={e => setNewCountry(e.target.value)} /></div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.65rem', fontWeight: 700, color: '#0d9394', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lien au projet</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={lbl}>Rôle</label><input style={inp} value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Ex: Sous-traitant" /></div>
                  <div><label style={lbl}>Coût estimé</label><input type="number" style={inp} value={newCost} onChange={e => setNewCost(e.target.value)} placeholder="0" min="0" /></div>
                  <div>
                    <label style={lbl}>Devise</label>
                    <select style={inp} value={newCurrency} onChange={e => setNewCurrency(e.target.value)}>
                      {['MAD', 'EUR', 'USD', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}><label style={lbl}>Notes</label><textarea style={{ ...inp, height: 56, resize: 'vertical' }} value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes..." /></div>
              </div>
            </div>
          )}
          {error && <p style={{ margin: '10px 0 0', fontSize: '0.68rem', color: '#ef4444' }}>{error}</p>}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.7rem', background: 'none', cursor: 'pointer', color: 'var(--text2)' }}>Annuler</button>
          <button onClick={tab === 'existing' ? submitExisting : submitNew} disabled={!canSubmit}
            style={{ padding: '6px 14px', border: 'none', borderRadius: 6, fontSize: '0.7rem', backgroundColor: '#0d9394', color: 'white', cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.5 }}>
            {saving ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export const FournisseursTab: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [items, setItems] = useState<ProjectSupplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProjectSupplier | null>(null);
  const [editTarget, setEditTarget] = useState<ProjectSupplier | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 300);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectSupplierApi.list(projectId, {
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
      setItems(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (psId: string) => {
    if (!window.confirm('Supprimer ce fournisseur du projet ?')) return;
    setDeleting(psId);
    try {
      await projectSupplierApi.remove(projectId, psId);
      setItems(prev => prev.filter(i => i.id !== psId));
      setTotal(prev => prev - 1);
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (updated: ProjectSupplier) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    setEditTarget(null);
  };

  const handleAdded = (_ps: ProjectSupplier) => {
    setShowAdd(false);
    load();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', flex: 1, maxWidth: 300 }}>
          <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.7rem', color: 'var(--text)', width: '100%' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', padding: 0 }}>
              <Icons.X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.7rem', color: 'var(--text)', backgroundColor: 'var(--bg)', outline: 'none', cursor: 'pointer' }}>
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="archived">Archivé</option>
          <option value="blocked">Bloqué</option>
        </select>
        <button onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: 'none', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#0d9394', color: 'white', cursor: 'pointer', flexShrink: 0, marginLeft: 'auto' }}>
          <Icons.Plus style={{ width: 13, height: 13 }} /> Ajouter un fournisseur
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <Skel key={i} w="100%" h={44} r={6} />)}
        </div>
      ) : (
        <TableWrap headers={['Fournisseur', 'Rôle', 'Réf. contrat', 'Coût estimé', 'Période', 'Statut', 'Actions']} empty={items.length === 0}>
          {items.map((ps, i) => {
            const sm = STATUS_META[ps.status] || STATUS_META.inactive;
            const s = ps.supplier;
            return (
              <tr key={ps.id}
                style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--bg2)', transition: 'background 0.1s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg2)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <td style={{ padding: '10px 12px' }} onClick={() => setSelected(ps)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icons.Building2 style={{ width: 13, height: 13, color: '#0d9394' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)', display: 'block' }}>{supplierName(s)}</span>
                      {s.category && <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: 3, backgroundColor: 'rgba(37,99,235,0.08)', color: '#2563eb' }}>{s.category}</span>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setSelected(ps)}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text2)' }}>{ps.role || '—'}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setSelected(ps)}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text3)', fontFamily: 'monospace' }}>{ps.contractReference || '—'}</span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setSelected(ps)}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>
                    {ps.estimatedCost != null ? `${Number(ps.estimatedCost).toLocaleString('fr-FR')} ${ps.currency}` : '—'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setSelected(ps)}>
                  {ps.startDate || ps.endDate ? (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>
                      {ps.startDate ? fmtDate(ps.startDate) : '?'} → {ps.endDate ? fmtDate(ps.endDate) : '?'}
                    </span>
                  ) : <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>—</span>}
                </td>
                <td style={{ padding: '10px 12px' }} onClick={() => setSelected(ps)}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>{sm.label}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); setSelected(ps); }} title="Détails"
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                      <Icons.Eye style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setEditTarget(ps); }} title="Modifier"
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'var(--bg2)', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                      <Icons.Edit style={{ width: 12, height: 12 }} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(ps.id); }} title="Supprimer" disabled={deleting === ps.id}
                      style={{ width: 26, height: 26, border: 'none', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 5, cursor: deleting === ps.id ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', opacity: deleting === ps.id ? 0.5 : 1 }}>
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

      {selected && <DetailsPopup ps={selected} onClose={() => setSelected(null)} />}
      {editTarget && <EditPopup ps={editTarget} projectId={projectId} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
      {showAdd && <AddModal projectId={projectId} onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
    </>
  );
};
