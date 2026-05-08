'use client';
import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from '../../../../../assets/icons';
import type { Customer } from '../../../../../lib/onboarding/types';
import { customerApi } from '../../../../../lib/onboarding/customer';
import { Pagination } from './Pagination';

const PAGE_SIZE = 10;
const C = { color: '#2563eb', bg: 'rgba(37,99,235,0.1)' };

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  active:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Actif' },
  inactive: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Inactif' },
  archived: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Archivé' },
  blocked:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Bloqué' },
};

const inputSt: React.CSSProperties = { width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.77rem', outline: 'none', boxSizing: 'border-box' };
const labelSt: React.CSSProperties = { fontSize: '0.62rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4, display: 'block' };
const sectionSt: React.CSSProperties = { fontSize: '0.65rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '8px 0 6px', borderBottom: '1px solid var(--border)', marginBottom: 12 };

const Field = ({ label, value, onChange, type = 'text', options }: { label: string; value: string; onChange: (v: string) => void; type?: string; options?: string[] }) => (
  <div>
    <label style={labelSt}>{label}</label>
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)} style={inputSt}>
        <option value="">— Choisir —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ ...inputSt, resize: 'vertical' }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputSt} />
    )}
  </div>
);

const empty: Partial<Customer> = { companyName: '', firstName: '', lastName: '', email: '', phone: '', address: '', city: '', country: 'Maroc', sector: '', website: '', ice: '', currency: 'MAD', status: 'active', notes: '' };

const FormPopup: React.FC<{ title: string; initial: Partial<Customer>; onSave: (d: Partial<Customer>) => void; onClose: () => void; loading?: boolean }> = ({ title, initial, onSave, onClose, loading }) => {
  const [form, setForm] = useState<Partial<Customer>>(initial);
  const set = (k: keyof Customer) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '68vw', maxWidth: 820, maxHeight: '90vh', background: 'var(--bg)', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'onb-popup 0.2s ease-out' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: `linear-gradient(135deg,${C.bg},transparent)` }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--text)' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text3)', marginTop: 2 }}>Les champs marqués * sont obligatoires</p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.X style={{ width: 14, height: 14, color: 'var(--text)' }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          <p style={sectionSt}>Identification</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
            <Field label="Raison sociale *" value={form.companyName || ''} onChange={set('companyName')} />
            <Field label="Type" value={form.type || ''} onChange={set('type')} options={['company', 'individual']} />
            <Field label="Prénom" value={form.firstName || ''} onChange={set('firstName')} />
            <Field label="Nom" value={form.lastName || ''} onChange={set('lastName')} />
          </div>
          <p style={sectionSt}>Contact</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
            <Field label="Email *" value={form.email || ''} onChange={set('email')} type="email" />
            <Field label="Téléphone" value={form.phone || ''} onChange={set('phone')} />
            <Field label="Mobile" value={form.mobile || ''} onChange={set('mobile')} />
            <Field label="Site web" value={form.website || ''} onChange={set('website')} />
          </div>
          <p style={sectionSt}>Adresse</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
            <div style={{ gridColumn: '1 / -1' }}><Field label="Adresse" value={form.address || ''} onChange={set('address')} /></div>
            <Field label="Ville" value={form.city || ''} onChange={set('city')} />
            <Field label="Pays" value={form.country || ''} onChange={set('country')} />
          </div>
          <p style={sectionSt}>Informations légales</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
            <Field label="ICE" value={form.ice || ''} onChange={set('ice')} />
            <Field label="Secteur" value={form.sector || ''} onChange={set('sector')} />
            <Field label="Statut" value={form.status || ''} onChange={set('status')} options={Object.keys(STATUS_COLORS)} />
          </div>
          <p style={sectionSt}>Notes</p>
          <Field label="Notes internes" value={form.notes || ''} onChange={set('notes')} type="textarea" />
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '7px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 500 }}>Annuler</button>
          <button onClick={() => { if (!loading) onSave(form); }} disabled={loading} style={{ padding: '7px 20px', borderRadius: 8, border: 'none', background: C.color, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', color: 'white', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClientTable: React.FC = () => {
  const [data, setData]           = useState<Customer[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(0);
  const [search, setSearch]       = useState('');
  const [statusF, setStatusF]     = useState('');
  const [countryF, setCountryF]   = useState('');
  const [sectorF, setSectorF]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [detail, setDetail]       = useState<Customer | null>(null);
  const [editing, setEditing]     = useState<Customer | null>(null);
  const [creating, setCreating]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerApi.getAll({ page, limit: PAGE_SIZE, search: search || undefined, status: statusF || undefined, country: countryF || undefined, sector: sectorF || undefined });
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e: any) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusF, countryF, sectorF]);

  useEffect(() => { load(); }, [load]);

  // reset page when filters change
  useEffect(() => { setPage(0); }, [search, statusF, countryF, sectorF]);

  const handleCreate = async (dto: Partial<Customer>) => {
    setSaving(true);
    try { await customerApi.create(dto); setCreating(false); load(); } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };
  const handleEdit = async (dto: Partial<Customer>) => {
    if (!editing) return;
    setSaving(true);
    try { await customerApi.update(editing.id, dto); setEditing(null); load(); } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return;
    try { await customerApi.remove(id); load(); } catch (e: any) { alert(e.message); }
  };

  const selSt: React.CSSProperties = { padding: '5px 9px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', fontSize: '0.73rem', cursor: 'pointer' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', flex: '1 1 200px', minWidth: 160 }}>
          <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, email, ville…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.75rem', color: 'var(--text)', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, padding: 0 }}>✕</button>}
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} style={selSt}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={countryF} onChange={e => setCountryF(e.target.value)} style={selSt}>
          <option value="">Tous les pays</option>
          {[...new Set(data.map(d => d.country).filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sectorF} onChange={e => setSectorF(e.target.value)} style={selSt}>
          <option value="">Tous les secteurs</option>
          {[...new Set(data.map(d => d.sector).filter(Boolean))].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {total > 0 && <span style={{ fontSize: '0.7rem', color: C.color, fontWeight: 600 }}>{total} client{total > 1 ? 's' : ''}</span>}
        <button onClick={() => setCreating(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${C.color}`, background: C.bg, color: C.color, cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
          <Icons.Plus style={{ width: 13, height: 13 }} /> Nouveau client
        </button>
      </div>

      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)', fontSize: '0.85rem' }}>Chargement…</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
            <Icons.Users style={{ width: 32, height: 32, margin: '0 auto 10px', display: 'block', color: 'var(--border)' }} />
            <div style={{ fontSize: '0.85rem' }}>Aucun client trouvé</div>
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: '0.74rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {['Nom', 'Email', 'Téléphone', 'Pays / Ville', 'Secteur', 'ICE', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '9px 11px', textAlign: h === '' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.71rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => {
                const sm = STATUS_COLORS[d.status] || STATUS_COLORS.active;
                const displayName = d.companyName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || '—';
                return (
                  <tr key={d.id} onClick={() => setDetail(d)}
                    style={{ borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.bg, border: `1px solid ${C.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 13, color: C.color }}>{displayName.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{displayName}</div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>{d.type === 'company' ? 'Entreprise' : 'Particulier'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 11px' }}><span style={{ color: 'var(--primary)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{d.email || '—'}</span></td>
                    <td style={{ padding: '10px 11px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{d.phone || d.mobile || '—'}</td>
                    <td style={{ padding: '10px 11px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text)' }}>{d.city || '—'}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>{d.country || '—'}</div>
                    </td>
                    <td style={{ padding: '10px 11px', color: 'var(--text2)', whiteSpace: 'nowrap', fontSize: '0.71rem' }}>{d.sector || '—'}</td>
                    <td style={{ padding: '10px 11px' }}><span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{d.ice || '—'}</span></td>
                    <td style={{ padding: '10px 11px' }}><span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.63rem', fontWeight: 600, background: sm.bg, color: sm.color, whiteSpace: 'nowrap' }}>{sm.label}</span></td>
                    <td style={{ padding: '10px 11px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button title="Voir" onClick={() => setDetail(d)} style={{ width: 27, height: 27, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Eye style={{ width: 12, height: 12, color: 'var(--text2)' }} /></button>
                        <button title="Modifier" onClick={() => setEditing(d)} style={{ width: 27, height: 27, borderRadius: 6, border: `1px solid ${C.color}40`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Edit style={{ width: 12, height: 12, color: C.color }} /></button>
                        <button title="Supprimer" onClick={() => handleDelete(d.id)} style={{ width: 27, height: 27, borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Trash style={{ width: 12, height: 12, color: '#ef4444' }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination total={total} page={page} pageSize={PAGE_SIZE} onChange={setPage} accent={C.color} />

      {/* Detail drawer */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div style={{ width: '60vw', maxWidth: 720, maxHeight: '86vh', background: 'var(--bg)', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'onb-popup 0.2s ease-out' }}>
            <div style={{ padding: '18px 22px', background: `linear-gradient(135deg,${C.bg},transparent)`, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{detail.companyName || `${detail.firstName || ''} ${detail.lastName || ''}`.trim()}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: 3 }}>{detail.sector} {detail.city && `· ${detail.city}`} {detail.country && `, ${detail.country}`}</div>
              </div>
              <button onClick={() => setDetail(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.X style={{ width: 14, height: 14, color: 'var(--text)' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
              {[
                { title: 'Contact', rows: [['Email', detail.email], ['Téléphone', detail.phone], ['Mobile', detail.mobile], ['Site web', detail.website]] },
                { title: 'Légal', rows: [['ICE', detail.ice], ['RC', detail.rc], ['Tax ID', detail.taxId], ['Secteur', detail.sector]] },
                { title: 'Adresse', rows: [['Adresse', detail.address], ['Ville', detail.city], ['Pays', detail.country]] },
                { title: 'Commercial', rows: [['Conditions paiement', detail.paymentTerms], ['Limite crédit', detail.creditLimit?.toString()], ['Devise', detail.currency]] },
              ].map(sec => (
                <div key={sec.title} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid var(--border)' }}>{sec.title}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                    {sec.rows.map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{l}</span>
                        <span style={{ fontSize: '0.77rem', color: 'var(--text)', fontWeight: 500 }}>{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {detail.notes && <div style={{ background: 'var(--bg2)', border: `1px solid ${C.color}20`, borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${C.color}`, fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.6 }}>{detail.notes}</div>}
            </div>
          </div>
        </div>
      )}

      {editing  && <FormPopup title={`Modifier — ${editing.companyName || editing.firstName}`} initial={editing} onSave={handleEdit} onClose={() => setEditing(null)} loading={saving} />}
      {creating && <FormPopup title="Nouveau client" initial={empty} onSave={handleCreate} onClose={() => setCreating(false)} loading={saving} />}
    </div>
  );
};
