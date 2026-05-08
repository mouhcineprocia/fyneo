'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as Icons from '../../../../assets/icons';
import type { ChatMsg } from './types';
import type { AgentOnboardingEntry, AgentDashboardResponse } from '../../../../lib/onboarding/types';
import { fetchAgentDashboard } from '../../../../lib/onboarding/agentDashboard';
import { TYPE_META, TL_META, ACTIVITY_META, glass } from './constants';
import { SOFIA_MSGS } from './data';

// ─── date helpers ─────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];
const addDays = (s: string, n: number) => {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
const fmtNav = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// ─── DateNav ──────────────────────────────────────────────────────────────────
const DateNav: React.FC<{ date: string; onChange: (d: string) => void }> = ({ date, onChange }) => {
  const isToday = date === todayStr();
  const btn: React.CSSProperties = { width: 24, height: 24, borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text2)', flexShrink: 0 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <button style={btn} onClick={() => onChange(addDays(date, -1))}>‹</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 5, background: 'var(--bg)', border: '1px solid var(--border)' }}>
        {isToday && <span style={{ fontSize: 9, fontWeight: 700, color: '#0d9394', background: 'rgba(13,147,148,0.1)', padding: '1px 5px', borderRadius: 3 }}>Aujourd'hui</span>}
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{fmtNav(date)}</span>
        <input type="date" value={date} onChange={e => onChange(e.target.value)} style={{ width: 16, height: 16, border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', colorScheme: 'dark' }} title="Choisir une date" />
      </div>
      <button style={{ ...btn, opacity: isToday ? 0.35 : 1 }} onClick={() => !isToday && onChange(addDays(date, 1))} disabled={isToday}>›</button>
    </div>
  );
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const empty: AgentDashboardResponse = { date: '', alerts: [], priorities: [], timeline: [], activities: [], kpis: [], plannedTasks: [], docsPending: [] };
const kpiByKey = (kpis: AgentOnboardingEntry[], key: string) => kpis.find(k => k.kpiKey === key);
const kpiVal  = (kpis: AgentOnboardingEntry[], key: string) => kpiByKey(kpis, key)?.kpiValue ?? 0;
const kpiText = (kpis: AgentOnboardingEntry[], key: string) => kpiByKey(kpis, key)?.kpiSub ?? '—';

// ─── VueAgent ─────────────────────────────────────────────────────────────────
export const VueAgent: React.FC = () => {
  const [date, setDate]         = useState(todayStr());
  const [data, setData]         = useState<AgentDashboardResponse>(empty);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { id: 's0', from: 'sofia', text: SOFIA_MSGS.default[0], time: '09:00' },
    { id: 's1', from: 'sofia', text: SOFIA_MSGS.default[1], time: '09:00' },
  ]);
  const [sofiaTyping, setSofiaTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAgentDashboard(date));
    } catch {
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs, sofiaTyping]);

  const { kpis, timeline, activities, docsPending, plannedTasks } = data;

  // KPI bar — 6 cards
  const KPI_DEFS = [
    { key: 'total_dossiers',  icon: '📁', label: 'Total dossiers',   color: '#0d9394' },
    { key: 'completed',       icon: '✓',  label: 'Complétés',        color: '#22c55e' },
    { key: 'en_cours',        icon: '↻',  label: 'En cours',         color: '#2563eb' },
    { key: 'docs_en_attente', icon: '!',  label: 'Docs en attente',  color: '#f59e0b' },
    { key: 'contrats_actifs', icon: '📄', label: 'Contrats actifs',  color: '#8b5cf6' },
    { key: 'taux_completion', icon: '◎',  label: 'Taux complétion',  color: '#0d9394' },
  ];

  // Agent health rows
  const HEALTH_DEFS = [
    { label: 'Statut',        key: 'agent_status',         color: '#22c55e', dot: true  },
    { label: 'Précision IA',  key: 'agent_precision',      color: '#0d9394', dot: false },
    { label: 'Docs analysés', key: 'agent_docs_analyses',  color: 'var(--text)', dot: false },
    { label: 'Temps réponse', key: 'agent_response_time',  color: 'var(--text)', dot: false },
  ];

  // Répartition
  const REPARTITION = (['CLIENT', 'FOURNISSEUR', 'CONTACT', 'SALARIE'] as const);

  const sendMsg = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setChatMsgs(prev => [...prev, { id: `u${Date.now()}`, from: 'user', text: chatInput.trim(), time: now }]);
    setChatInput('');
    setSofiaTyping(true);
    setTimeout(() => {
      setSofiaTyping(false);
      setChatMsgs(prev => [...prev, { id: `s${Date.now()}`, from: 'sofia', text: "J'analyse votre demande et je vérifie les données de tous les dossiers en cours.", time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1400);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 20, gap: 14 }}>

      {/* Date navigation bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Vue Agent — {fmtNav(date)}
        </div>
        <DateNav date={date} onChange={setDate} />
      </div>

      {error && <div style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem', color: '#ef4444', flexShrink: 0 }}>{error}</div>}

      {/* KPI bar */}
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        {KPI_DEFS.map(k => {
          const entry = kpiByKey(kpis, k.key);
          const val = entry?.kpiValue != null ? entry.kpiValue : (entry?.kpiSub ?? '—');
          const sub = entry?.kpiSub ?? '';
          return (
            <div key={k.key} style={{ flex: 1, ...glass(`${k.color}20`), padding: '12px 14px', background: `${k.color}05` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{k.icon}</div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{k.label}</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: k.color, lineHeight: 1 }}>{loading ? '…' : val}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text3)', marginTop: 3 }}>{loading ? '' : (entry?.kpiValue != null ? sub : '')}</div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div style={{ flex: 1, display: 'flex', gap: 14, overflow: 'hidden', minHeight: 0 }}>

        {/* Col 1 — Timeline + Agent health */}
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <div style={{ ...glass(), flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              Timeline — {fmtNav(date)}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: '0.75rem' }}>Chargement…</div>
              ) : timeline.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: '0.75rem' }}>Aucun événement</div>
              ) : timeline.map((ev, i) => {
                const m = TL_META[ev.alertType ?? 'action'] ?? TL_META.action;
                return (
                  <div key={ev.id} style={{ display: 'flex', gap: 10, paddingBottom: i < timeline.length - 1 ? 14 : 0, position: 'relative' }}>
                    {i < timeline.length - 1 && <div style={{ position: 'absolute', left: 11, top: 22, bottom: 0, width: 1, background: 'var(--border)' }} />}
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: m.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)' }}>{ev.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'var(--text3)', flexShrink: 0 }}>{ev.timeOfEvent}</span>
                      </div>
                      <div style={{ fontSize: '0.67rem', color: 'var(--text3)', lineHeight: 1.4 }}>{ev.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent health */}
          <div style={{ ...glass('rgba(13,147,148,0.2)'), padding: '12px 14px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Santé de l'agent</div>
            {HEALTH_DEFS.map(s => {
              const val = kpiText(kpis, s.key);
              const isOnline = s.key === 'agent_status' && val !== '—';
              return (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.67rem', color: 'var(--text3)' }}>{s.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {s.dot && <div style={{ width: 6, height: 6, borderRadius: '50%', background: isOnline ? '#22c55e' : '#6b7280', animation: isOnline ? 'onb-pulse 2s infinite' : 'none' }} />}
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: s.key === 'agent_status' ? (isOnline ? '#22c55e' : '#6b7280') : s.color }}>{loading ? '…' : val}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2 — Activity + Docs pending + Planned tasks */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden', minWidth: 0 }}>

          {/* Today's activity */}
          <div style={{ ...glass(), flexShrink: 0 }}>
            <div style={{ padding: '12px 14px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Activité dossiers — {fmtNav(date)}
              <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 6, background: 'rgba(13,147,148,0.1)', color: '#0d9394', fontWeight: 700 }}>{activities.length}</span>
            </div>
            <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {loading ? (
                <div style={{ padding: '10px 0', textAlign: 'center', color: 'var(--text3)', fontSize: '0.75rem' }}>Chargement…</div>
              ) : activities.length === 0 ? (
                <div style={{ padding: '10px 0', textAlign: 'center', color: 'var(--text3)', fontSize: '0.75rem' }}>Aucune activité</div>
              ) : activities.map(act => {
                const tm = TYPE_META[act.entityType ?? ''] ?? TYPE_META.CLIENT;
                const am = ACTIVITY_META[act.action ?? ''] ?? ACTIVITY_META.modified;
                return (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: am.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: am.color, flexShrink: 0 }}>{am.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text)' }}>{act.dossierName}</span>
                    </div>
                    <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 700, background: tm.bg, color: tm.color }}>{tm.label}</span>
                    <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 700, background: am.color + '10', color: am.color }}>{am.label}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text3)', flexShrink: 0 }}>{act.timeOfEvent}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Docs pending */}
          <div style={{ ...glass(), flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px 8px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              Documents en attente de validation
              <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 6, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 700 }}>{docsPending.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {loading ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text3)', fontSize: '0.75rem' }}>Chargement…</div>
              ) : docsPending.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text3)', fontSize: '0.75rem' }}>Aucun document en attente</div>
              ) : docsPending.map(doc => {
                const isManquant = doc.alertType === 'manquant';
                const ds = isManquant ? { color: '#ef4444', label: 'Manquant' } : { color: '#f59e0b', label: 'En attente' };
                return (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ds.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.73rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text3)' }}>{doc.dossierName}{doc.description ? ` · ${doc.description}` : ''}</div>
                    </div>
                    <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 700, background: ds.color + '15', color: ds.color, flexShrink: 0 }}>{ds.label}</span>
                    <button style={{ width: 24, height: 24, borderRadius: 5, border: `1px solid ${ds.color}30`, background: ds.color + '10', cursor: 'pointer', fontSize: 11, color: ds.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Planned tasks */}
          <div style={{ ...glass(), flexShrink: 0, padding: '12px 14px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Tâches planifiées — prochains jours</div>
            {loading ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Chargement…</div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                {plannedTasks.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Aucune tâche planifiée</div>
                ) : plannedTasks.map(t => (
                  <div key={t.id} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: (t.taskColor ?? '#0d9394') + '08', border: `1px solid ${(t.taskColor ?? '#0d9394')}20` }}>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, color: t.taskColor ?? '#0d9394', marginBottom: 3 }}>{t.dayLabel}</div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--text2)', lineHeight: 1.3 }}>{t.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col 3 — Sofia chatbot (static) + Répartition */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...glass('rgba(13,147,148,0.2)'), flex: chatOpen ? 1 : 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'flex 0.3s' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, cursor: 'pointer', background: 'rgba(13,147,148,0.04)' }} onClick={() => setChatOpen(v => !v)}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 11 }}>S</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>Sofia · IA</div>
                <div style={{ fontSize: '0.6rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} /> En ligne
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text3)', transition: 'transform 0.2s', transform: chatOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
            </div>

            {chatOpen && <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chatMsgs.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', gap: 6, flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                    {msg.from === 'sofia' && <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 8, color: 'white', fontWeight: 700 }}>S</div>}
                    <div style={{ maxWidth: '80%', padding: '7px 9px', borderRadius: msg.from === 'user' ? '10px 2px 10px 10px' : '2px 10px 10px 10px', background: msg.from === 'user' ? 'var(--primary)' : 'var(--bg)', border: msg.from === 'sofia' ? '1px solid var(--border)' : 'none', fontSize: '0.72rem', color: msg.from === 'user' ? 'white' : 'var(--text)', lineHeight: 1.45 }}>
                      {msg.text}
                      <div style={{ fontSize: '0.56rem', color: msg.from === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--text3)', marginTop: 3, textAlign: 'right' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
                {sofiaTyping && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9394,#0b7a7b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 8, color: 'white', fontWeight: 700 }}>S</div>
                    <div style={{ padding: '8px 10px', borderRadius: '2px 10px 10px 10px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', gap: 3 }}>
                      {[1, 2, 3].map(n => <span key={n} style={{ width: 5, height: 5, borderRadius: '50%', background: '#0d9394', display: 'inline-block', animation: `onb-dot${n} 1.2s infinite` }} />)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Demander à Sofia…" style={{ flex: 1, height: 30, padding: '0 9px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.72rem' }} />
                <button onClick={sendMsg} style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Send style={{ width: 11, height: 11, color: 'white' }} />
                </button>
              </div>
            </>}
          </div>

          {/* Répartition — from kpi entries */}
          {chatOpen && (
            <div style={{ ...glass(), marginTop: 14, padding: '12px 14px', flexShrink: 0 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Répartition</div>
              {REPARTITION.map(type => {
                const tm = TYPE_META[type];
                const count = kpiVal(kpis, `repartition_${type}`);
                const total = REPARTITION.reduce((s, t) => s + kpiVal(kpis, `repartition_${t}`), 0);
                const pct = total > 0 ? Math.round(count / total * 100) : 0;
                return (
                  <div key={type} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: '0.67rem', color: 'var(--text2)', fontWeight: 500 }}>{tm.label}</span>
                      <span style={{ fontSize: '0.67rem', fontWeight: 700, color: tm.color }}>{loading ? '…' : count}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: tm.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
