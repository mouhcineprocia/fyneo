'use client';
import React, { useState } from 'react';
import * as Icons from '../../../../../assets/icons';
import type { Dossier } from '../types';
import { mockDocuments, mockContrats } from '../data';
import { TYPE_META, STATUS_META, DOC_STATUS_META, CONTRAT_STATUS_META, fmtDate, fmtCurrency } from '../constants';

const Row = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: '0.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '0.77rem', color: 'var(--text)', fontWeight: 500, fontFamily: mono ? 'monospace' : undefined }}>{value || '—'}</span>
  </div>
);

interface Props { dossier: Dossier; onClose: () => void; }

export const DossierDetailPopup: React.FC<Props> = ({ dossier: d, onClose }) => {
  const [tab, setTab] = useState<'info' | 'documents' | 'contrats'>('info');
  const docs = mockDocuments.filter(doc => doc.dossierId === d.id);
  const contrats = mockContrats.filter(ct => ct.dossierId === d.id);
  const tm = TYPE_META[d.type];
  const sm = STATUS_META[d.status];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: '70vw', maxWidth: 880, maxHeight: '86vh', background: 'var(--bg)', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'onb-popup 0.2s ease-out' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px 0', background: `linear-gradient(135deg,${tm.bg},transparent)`, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: tm.bg, border: `2px solid ${tm.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: tm.color }}>{d.nom.charAt(0)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>{d.nom}</span>
                <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.63rem', fontWeight: 700, background: tm.bg, color: tm.color }}>{tm.label}</span>
                <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.63rem', fontWeight: 700, background: sm.bg, color: sm.color }}>{sm.label}</span>
                {d.tags.map(t => <span key={t} style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.6rem', fontWeight: 600, background: 'var(--bg2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{t}</span>)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text2)' }}>{d.secteur} · {d.ville}, {d.pays} · {d.formeJuridique}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <div style={{ width: 200, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.progression}%`, background: d.status === 'COMPLETE' ? '#22c55e' : d.status === 'REJETE' ? '#ef4444' : tm.color, borderRadius: 2, transition: 'width 0.4s' }} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: d.status === 'COMPLETE' ? '#22c55e' : d.status === 'REJETE' ? '#ef4444' : tm.color }}>{d.progression}%</span>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.X style={{ width: 14, height: 14, color: 'var(--text)' }} />
            </button>
          </div>
          <div style={{ display: 'flex' }}>
            {([['info', 'Informations'], ['documents', `Documents (${docs.length})`], ['contrats', `Contrats (${contrats.length})`]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: '7px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600, color: tab === k ? tm.color : 'var(--text2)', borderBottom: tab === k ? `2px solid ${tm.color}` : '2px solid transparent' }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {tab === 'info' && (
            <div>
              {[
                { title: 'Coordonnées', fields: [{ l: 'Contact principal', v: d.contact }, { l: 'Email', v: d.email }, { l: 'Téléphone', v: d.telephone }, { l: 'Site web', v: d.siteWeb }, { l: 'Adresse', v: d.adresse }, { l: 'Ville', v: d.ville }, { l: 'Pays', v: d.pays }] },
                { title: 'Informations légales', fields: [{ l: 'ICE / SIRET', v: d.iceSiret, mono: true }, { l: 'Forme juridique', v: d.formeJuridique }, { l: 'Catégorie', v: d.categorie }, { l: "Secteur d'activité", v: d.secteur }, { l: "Chiffre d'affaires", v: d.chiffreAffaires }, { l: 'Effectif', v: d.effectif ? `${d.effectif} pers.` : '—' }] },
                { title: 'Suivi dossier', fields: [{ l: 'Responsable', v: d.responsable }, { l: 'Créé le', v: fmtDate(d.dateCreation) }, { l: 'Relation depuis', v: fmtDate(d.dateRelation) }, { l: 'Statut', v: STATUS_META[d.status].label }] },
              ].map(sec => (
                <div key={sec.title} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid var(--border)' }}>{sec.title}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                    {sec.fields.map(f => <Row key={f.l} label={f.l} value={f.v} mono={(f as any).mono} />)}
                  </div>
                </div>
              ))}
              {d.notes && <div style={{ background: 'var(--bg2)', border: `1px solid ${tm.color}20`, borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${tm.color}`, fontSize: '0.78rem', color: 'var(--text)', lineHeight: 1.6 }}>{d.notes}</div>}
            </div>
          )}

          {tab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: '0.85rem' }}>Aucun document</div>
                : docs.map(doc => {
                  const ds = DOC_STATUS_META[doc.status];
                  return (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${ds.color}20`, background: `${ds.color}04` }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: ds.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: ds.color, flexShrink: 0 }}>{doc.status === 'VALIDER' ? '✓' : '✕'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.77rem', fontWeight: 600, color: 'var(--text)' }}>{doc.nom}{doc.obligatoire && <span style={{ marginLeft: 5, fontSize: '0.58rem', color: '#ef4444', fontWeight: 700 }}>*</span>}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: '0.62rem', padding: '1px 5px', borderRadius: 3, background: 'var(--bg2)', color: 'var(--text3)' }}>{doc.categorie}</span>
                          {doc.dateUpload && <span style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>Importé le {fmtDate(doc.dateUpload)}</span>}
                        </div>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 600, background: ds.bg, color: ds.color, flexShrink: 0 }}>{ds.label}</span>
                      {doc.status === 'VALIDER'
                        ? <button style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Download style={{ width: 11, height: 11, color: 'var(--text2)' }} /></button>
                        : <button style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${tm.color}`, background: tm.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Plus style={{ width: 11, height: 11, color: tm.color }} /></button>
                      }
                    </div>
                  );
                })}
            </div>
          )}

          {tab === 'contrats' && (
            contrats.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: '0.85rem' }}>Aucun contrat</div>
              : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                <thead><tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                  {['N° Contrat', 'Type', 'Date début', 'Date fin', 'Montant', 'Statut', ''].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: h === '' ? 'center' : 'left', fontWeight: 600, color: 'var(--text)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr></thead>
                <tbody>{contrats.map((ct, i) => {
                  const cs = CONTRAT_STATUS_META[ct.status];
                  return (
                    <tr key={ct.id} style={{ borderBottom: i < contrats.length - 1 ? '1px solid var(--border)' : 'none' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '9px 10px' }}><span style={{ fontWeight: 600, color: tm.color, fontFamily: 'monospace', fontSize: '0.7rem' }}>{ct.numero}</span></td>
                      <td style={{ padding: '9px 10px', color: 'var(--text2)' }}>{ct.type}</td>
                      <td style={{ padding: '9px 10px', color: 'var(--text2)' }}>{fmtDate(ct.dateDebut)}</td>
                      <td style={{ padding: '9px 10px', color: 'var(--text2)' }}>{fmtDate(ct.dateFin)}</td>
                      <td style={{ padding: '9px 10px' }}><span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmtCurrency(ct.montant)}</span></td>
                      <td style={{ padding: '9px 10px' }}><span style={{ padding: '2px 7px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 600, background: cs.bg, color: cs.color }}>{cs.label}</span></td>
                      <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button style={{ width: 25, height: 25, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Eye style={{ width: 10, height: 10, color: 'var(--text2)' }} /></button>
                          <button style={{ width: 25, height: 25, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Download style={{ width: 10, height: 10, color: 'var(--text2)' }} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
          )}
        </div>
      </div>
    </div>
  );
};
