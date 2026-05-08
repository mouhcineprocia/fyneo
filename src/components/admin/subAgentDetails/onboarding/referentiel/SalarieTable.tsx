'use client';
import React, { useState, useCallback, useEffect } from 'react';
import * as Icons from '../../../../../assets/icons';
import type { Employee } from '../../../../../lib/onboarding/types';
import { employeeApi } from '../../../../../lib/onboarding/employee';
import { Pagination } from './Pagination';

const PAGE_SIZE = 10;
const C = { color: '#0d9394', bg: 'rgba(13,147,148,0.1)' };

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Actif',       color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  inactive:  { label: 'Inactif',     color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  on_leave:  { label: 'En congé',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  suspended: { label: 'Suspendu',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

const CONTRACT_META: Record<string, { color: string; bg: string }> = {
  CDI:       { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  CDD:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  STAGE:     { color: '#0d9394', bg: 'rgba(13,147,148,0.1)' },
  FREELANCE: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

const CONTRACT_TYPES = ['CDI', 'CDD', 'STAGE', 'FREELANCE'];
const DEPARTMENTS = ['Finance', 'Commercial', 'RH', 'IT', 'Marketing', 'Juridique', 'Direction', 'Autre'];

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

const Row = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: '0.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '0.77rem', color: 'var(--text)', fontWeight: 500, fontFamily: mono ? 'monospace' : undefined }}>{value || '—'}</span>
  </div>
);

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function initials(e: Employee) {
  return `${(e.firstName || '?').charAt(0)}${(e.lastName || '?').charAt(0)}`.toUpperCase();
}

const DetailPopup: React.FC<{ emp: Employee; onClose: () => void }> = ({ emp: e, onClose }) => {
  const sm = STATUS_META[e.status] ?? { label: e.status, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
  const cm = CONTRACT_META[e.contractType ?? ''] ?? { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={ev => ev.target === ev.currentTarget && onClose()}>
      <div style={{ width: '60vw', maxWidth: 700, maxHeight: '86vh', background: 'var(--bg)', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'onb-popup 0.2s ease-out' }}>
        <div style={{ padding: '18px 22px', background: `linear-gradient(135deg,${C.bg},transparent)`, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: C.bg, border: `2px solid ${C.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.color }}>{initials(e)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{e.firstName} {e.lastName}</span>
                {e.contractType && <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.63rem', fontWeight: 700, background: cm.bg, color: cm.color }}>{e.contractType}</span>}
                <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.63rem', fontWeight: 700, background: sm.bg, color: sm.color }}>{sm.label}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{e.jobTitle}{e.department ? ` · ${e.department}` : ''}</div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.X style={{ width: 14, height: 14, color: 'var(--text)' }} />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {[
            { title: 'Contact', fields: [{ l: 'Email', v: e.email }, { l: 'Téléphone', v: e.phone }, { l: 'Mobile', v: e.mobile }, { l: 'Ville', v: e.city }] },
            { title: 'Contrat & RH', fields: [{ l: 'Type de contrat', v: e.contractType }, { l: "Date d'embauche", v: fmtDate(e.hireDate) }, { l: 'Date de fin', v: fmtDate(e.endDate) }, { l: 'Salaire', v: e.salary ? `${e.salary.toLocaleString('fr-FR')} ${e.currency ?? 'MAD'}` : undefined }, { l: 'Statut', v: sm.label }] },
            { title: 'Affiliation sociale', fields: [{ l: 'N° CNSS', v: e.cnssNumber, mono: true }, { l: 'N° National', v: e.nationalId }, { l: 'Date de naissance', v: fmtDate(e.birthDate) }, { l: 'Code salarié', v: e.employeeCode }] },
          ].map(sec => (
            <div key={sec.title} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid var(--border)' }}>{sec.title}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                {sec.fields.map(f => <Row key={f.l} label={f.l} value={f.v ?? ''} mono={(f as any).mono} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const emptyForm: Partial<Employee> = { firstName: '', lastName: '', email: '', phone: '', jobTitle: '', department: '', contractType: 'CDI', hireDate: '', salary: 0, cnssNumber: '', status: 'active' };

const FormPopup: React.FC<{ title: string; initial: Partial<Employee>; saving: boolean; onSave: (d: Partial<Employee>) => void; onClose: () => void }> = ({ title, initial, saving, onSave, onClose }) => {
  const [form, setForm] = useState<Partial<Employee>>(initial);
  const set = (k: keyof Employee) => (v: string) => setForm(p => ({ ...p, [k]: k === 'salary' ? Number(v) : v }));

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
          <p style={sectionSt}>Identité</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
            <Field label="Prénom *" value={form.firstName || ''} onChange={set('firstName')} />
            <Field label="Nom *" value={form.lastName || ''} onChange={set('lastName')} />
            <Field label="Email *" value={form.email || ''} onChange={set('email')} type="email" />
            <Field label="Téléphone" value={form.phone || ''} onChange={set('phone')} />
          </div>
          <p style={sectionSt}>Poste & Organisation</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
            <Field label="Poste *" value={form.jobTitle || ''} onChange={set('jobTitle')} />
            <Field label="Département" value={form.department || ''} onChange={set('department')} options={DEPARTMENTS} />
          </div>
          <p style={sectionSt}>Contrat</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
            <Field label="Type de contrat" value={form.contractType || ''} onChange={set('contractType')} options={CONTRACT_TYPES} />
            <Field label="Date d'embauche" value={form.hireDate || ''} onChange={set('hireDate')} type="date" />
            <Field label="Date de fin" value={form.endDate || ''} onChange={set('endDate')} type="date" />
            <Field label="Salaire (MAD)" value={String(form.salary || '')} onChange={set('salary')} type="number" />
            <Field label="Statut" value={form.status || ''} onChange={set('status')} options={Object.keys(STATUS_META)} />
          </div>
          <p style={sectionSt}>Affiliation sociale</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
            <Field label="N° CNSS" value={form.cnssNumber || ''} onChange={set('cnssNumber')} />
            <Field label="N° National" value={form.nationalId || ''} onChange={set('nationalId')} />
            <Field label="Date de naissance" value={form.birthDate || ''} onChange={set('birthDate')} type="date" />
          </div>
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '7px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 500 }}>Annuler</button>
          <button onClick={() => { if (form.firstName?.trim() && form.lastName?.trim()) onSave(form); }} disabled={saving}
            style={{ padding: '7px 20px', borderRadius: 8, border: 'none', background: saving ? 'var(--border)' : C.color, cursor: saving ? 'default' : 'pointer', fontSize: '0.8rem', color: 'white', fontWeight: 700 }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SalarieTable: React.FC = () => {
  const [data, setData]         = useState<Employee[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState('');
  const [statusF, setStatusF]   = useState('');
  const [contractF, setContractF] = useState('');
  const [deptF, setDeptF]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [detail, setDetail]     = useState<Employee | null>(null);
  const [editing, setEditing]   = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.getAll({ page, limit: PAGE_SIZE, search: search || undefined, status: statusF || undefined, department: deptF || undefined, contractType: contractF || undefined });
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      setError('Impossible de charger les salariés.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusF, deptF, contractF]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [search, statusF, deptF, contractF]);

  const handleCreate = async (d: Partial<Employee>) => {
    setSaving(true);
    try { await employeeApi.create(d); setCreating(false); await load(); } catch { setError('Échec de la création.'); } finally { setSaving(false); }
  };
  const handleEdit = async (d: Partial<Employee>) => {
    if (!editing) return;
    setSaving(true);
    try { await employeeApi.update(editing.id, d); setEditing(null); await load(); } catch { setError('Échec de la mise à jour.'); } finally { setSaving(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce salarié ?')) return;
    try { await employeeApi.remove(id); await load(); } catch { setError('Échec de la suppression.'); }
  };

  const selSt: React.CSSProperties = { padding: '5px 9px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text2)', fontSize: '0.73rem', cursor: 'pointer' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', flex: '1 1 200px', minWidth: 160 }}>
          <Icons.Search style={{ width: 13, height: 13, color: 'var(--text3)', flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, poste, département…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.75rem', color: 'var(--text)', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, padding: 0, flexShrink: 0 }}>✕</button>}
        </div>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} style={selSt}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={contractF} onChange={e => setContractF(e.target.value)} style={selSt}>
          <option value="">Tous les contrats</option>
          {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={deptF} onChange={e => setDeptF(e.target.value)} style={selSt}>
          <option value="">Tous les dép.</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {error && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{error}</span>}
        <button onClick={() => setCreating(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${C.color}`, background: C.bg, color: C.color, cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
          <Icons.Plus style={{ width: 13, height: 13 }} /> Nouveau salarié
        </button>
      </div>

      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)', fontSize: '0.85rem' }}>Chargement…</div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
            <Icons.Users style={{ width: 32, height: 32, margin: '0 auto 10px', display: 'block', color: 'var(--border)' }} />
            <div style={{ fontSize: '0.85rem' }}>Aucun salarié trouvé</div>
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: 920, borderCollapse: 'collapse', fontSize: '0.74rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                {['Salarié', 'Poste', 'Département', 'Contrat', 'Embauche', 'CNSS', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '9px 11px', textAlign: h === '' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.71rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((e, i) => {
                const sm = STATUS_META[e.status] ?? { label: e.status, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
                const cm = CONTRACT_META[e.contractType ?? ''] ?? { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
                return (
                  <tr key={e.id} onClick={() => setDetail(e)}
                    style={{ borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--bg2)')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.bg, border: `1px solid ${C.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: 11, color: C.color }}>{initials(e)}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{e.firstName} {e.lastName}</div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{e.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 11px', color: 'var(--text2)', whiteSpace: 'nowrap', fontSize: '0.71rem' }}>{e.jobTitle || '—'}</td>
                    <td style={{ padding: '10px 11px' }}><span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.63rem', fontWeight: 600, background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{e.department || '—'}</span></td>
                    <td style={{ padding: '10px 11px' }}>{e.contractType ? <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.63rem', fontWeight: 700, background: cm.bg, color: cm.color }}>{e.contractType}</span> : '—'}</td>
                    <td style={{ padding: '10px 11px', color: 'var(--text2)', whiteSpace: 'nowrap', fontSize: '0.71rem' }}>{fmtDate(e.hireDate)}</td>
                    <td style={{ padding: '10px 11px' }}><span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{e.cnssNumber || '—'}</span></td>
                    <td style={{ padding: '10px 11px' }}><span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.63rem', fontWeight: 600, background: sm.bg, color: sm.color, whiteSpace: 'nowrap' }}>{sm.label}</span></td>
                    <td style={{ padding: '10px 11px' }} onClick={ev => ev.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button title="Voir" onClick={() => setDetail(e)} style={{ width: 27, height: 27, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Eye style={{ width: 12, height: 12, color: 'var(--text2)' }} /></button>
                        <button title="Modifier" onClick={() => setEditing(e)} style={{ width: 27, height: 27, borderRadius: 6, border: `1px solid ${C.color}40`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Edit style={{ width: 12, height: 12, color: C.color }} /></button>
                        <button title="Supprimer" onClick={() => handleDelete(e.id)} style={{ width: 27, height: 27, borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Trash style={{ width: 12, height: 12, color: '#ef4444' }} /></button>
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
      {detail   && <DetailPopup emp={detail} onClose={() => setDetail(null)} />}
      {editing  && <FormPopup title={`Modifier — ${editing.firstName} ${editing.lastName}`} initial={editing} saving={saving} onSave={handleEdit} onClose={() => setEditing(null)} />}
      {creating && <FormPopup title="Nouveau salarié" initial={emptyForm} saving={saving} onSave={handleCreate} onClose={() => setCreating(false)} />}
    </div>
  );
};
