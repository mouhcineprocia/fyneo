'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { fetchAgentDashboard } from '../../../../lib/onboarding/agentDashboard';
import type { AgentOnboardingEntry, AgentDashboardResponse } from '../../../../lib/onboarding/types';
import { ALERT_META, ALERT_GRAD, URGENCY_META, ACTION_ICONS } from './constants';

// ─── date helpers ────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];
const addDays = (s: string, n: number) => {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
const fmtNav = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// ─── DateNav ─────────────────────────────────────────────────────────────────
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

// ─── helpers ─────────────────────────────────────────────────────────────────
const empty: AgentDashboardResponse = { date: '', alerts: [], priorities: [], timeline: [], activities: [], kpis: [], plannedTasks: [], docsPending: [] };

const kpiVal = (kpis: AgentOnboardingEntry[], key: string) => kpis.find(k => k.kpiKey === key)?.kpiValue ?? 0;

// ─── AlertesView ─────────────────────────────────────────────────────────────
export const AlertesView: React.FC = () => {
  const [date, setDate]       = useState(todayStr());
  const [data, setData]       = useState<AgentDashboardResponse>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

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

  const { alerts, priorities, kpis } = data;

  const dossiersActifs    = kpiVal(kpis, 'dossiers_actifs');
  const traitesAujourdhui = kpiVal(kpis, 'traites_aujourd_hui');
  const enRetard          = priorities.filter(p => p.deadline && p.deadline < date).length;
  const pretsActivation   = kpiVal(kpis, 'prets_activation');
  const urgentCount       = priorities.filter(p => p.urgency === 'haute').length;
  const validationsCount  = priorities.filter(p => p.actionType === 'validation').length;

  const INDICATORS = [
    { label: 'Dossiers actifs',     value: dossiersActifs,    color: '#2563eb', bg: 'rgba(37,99,235,0.07)',  icon: '⟳' },
    { label: "Traités aujourd'hui", value: traitesAujourdhui, color: '#22c55e', bg: 'rgba(34,197,94,0.07)',  icon: '✓' },
    { label: 'En retard',           value: enRetard,          color: '#ef4444', bg: 'rgba(239,68,68,0.07)',  icon: '!' },
    { label: 'Prêts activation',    value: pretsActivation,   color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', icon: '◎' },
  ];

  const alertGroups = (['error', 'warning', 'success', 'info'] as const)
    .map(type => ({ type, items: alerts.filter(a => a.alertType === type) }))
    .filter(g => g.items.length > 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Top bar: indicators + date nav */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        {INDICATORS.map(ind => (
          <div key={ind.label} style={{ flex: 1, minWidth: 110, background: ind.bg, border: `1px solid ${ind.color}22`, borderRadius: 5, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 24, height: 24, borderRadius: 4, background: `${ind.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: ind.color, fontWeight: 800, flexShrink: 0 }}>{ind.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: ind.color, lineHeight: 1 }}>{loading ? '…' : ind.value}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2, whiteSpace: 'nowrap' }}>{ind.label}</div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 11px', border: '1px solid rgba(13,147,148,0.25)', borderRadius: 5, background: 'rgba(13,147,148,0.05)', flexShrink: 0 }}>
          <span style={{ fontSize: 13 }}>👤</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0d9394', whiteSpace: 'nowrap' }}>{loading ? '…' : `${validationsCount} validation${validationsCount !== 1 ? 's' : ''} requise${validationsCount !== 1 ? 's' : ''}`}</div>
            <div style={{ fontSize: 9, color: 'var(--text3)' }}>Traitement suspendu</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <DateNav date={date} onChange={setDate} />
        </div>
      </div>

      {error && (
        <div style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem', color: '#ef4444' }}>{error}</div>
      )}

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '0.85rem' }}>Chargement…</div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* LEFT — Priorités */}
          <div style={{ width: 336, borderRight: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'onb-pulse 2s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions requises</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                {urgentCount > 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>🔴 {urgentCount} urgentes</span>}
                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--bg2)', color: 'var(--text3)', border: '1px solid var(--border)' }}>{priorities.length} total</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {priorities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: '0.78rem' }}>Aucune action requise</div>
              ) : priorities.map(p => {
                const um = URGENCY_META[p.urgency ?? 'basse'] ?? URGENCY_META.basse;
                const ac = p.urgency === 'haute' ? '#ef4444' : p.urgency === 'moyenne' ? '#f59e0b' : '#22c55e';
                return (
                  <div key={p.id} style={{ background: 'var(--bg2)', border: `1px solid ${ac}22`, borderRadius: 5, overflow: 'hidden', cursor: 'pointer', animation: 'onb-fadein 0.3s ease-out' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `${ac}55`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = `${ac}22`)}>
                    <div style={{ height: 3, background: `linear-gradient(90deg,${ac},${ac}50)` }} />
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 4, background: um.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800, color: ac }}>{ACTION_ICONS[p.actionType ?? ''] ?? '?'}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', flex: 1, lineHeight: 1.3 }}>{p.title}</span>
                        <span style={{ padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 700, background: um.bg, color: ac, flexShrink: 0, whiteSpace: 'nowrap' }}>{um.label}</span>
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text2)', lineHeight: 1.4, marginBottom: 7, paddingLeft: 27 }}>{p.description}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 27, marginBottom: 7 }}>
                        {p.dossierName && <span style={{ fontSize: 9.5, padding: '1px 6px', borderRadius: 3, background: 'var(--bg)', color: 'var(--text3)', border: '1px solid var(--border)' }}>📁 {p.dossierName}</span>}
                        {p.deadline && <span style={{ fontSize: 9.5, color: p.urgency === 'haute' ? '#ef4444' : 'var(--text3)', marginLeft: 'auto' }}>⏰ {new Date(p.deadline + 'T00:00:00').toLocaleDateString('fr-FR')}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 5, paddingLeft: 27 }}>
                        <button style={{ flex: 1, height: 22, borderRadius: 4, border: 'none', background: ac, color: 'white', fontSize: 9.5, fontWeight: 700, cursor: 'pointer' }}>Traiter →</button>
                        <button style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋯</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Alert log */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Journal de l'agent</span>
              <span style={{ fontSize: 9, color: 'var(--text3)' }}>{fmtNav(date)}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                {(['error', 'warning', 'success', 'info'] as const).map(t => {
                  const m = ALERT_META[t];
                  const count = alerts.filter(a => a.alertType === t).length;
                  return <span key={t} style={{ padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>{m.icon} {count}</span>;
                })}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {alertGroups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: '0.78rem' }}>Aucune alerte pour cette journée</div>
              ) : alertGroups.map(group => {
                const ag = ALERT_GRAD[group.type];
                return (
                  <div key={group.type}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: ag.badge, color: ag.color }}>{ag.label}</span>
                      <span style={{ fontSize: 9, color: 'var(--text3)', background: 'var(--bg2)', padding: '1px 5px', borderRadius: 3, border: '1px solid var(--border)' }}>{group.items.length}</span>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${ag.color}35,transparent)` }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {group.items.map(alert => (
                        <div key={alert.id} style={{ background: 'var(--bg2)', border: `1px solid ${ag.color}20`, borderRadius: 5, overflow: 'hidden', animation: 'onb-fadein 0.3s ease-out' }}>
                          <div style={{ background: ag.grad, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 18, height: 18, borderRadius: 3, background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 800, flexShrink: 0 }}>{ag.icon}</div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'white', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.title}</span>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.78)', flexShrink: 0 }}>{alert.timeOfEvent}</span>
                          </div>
                          <div style={{ padding: '7px 10px' }}>
                            <p style={{ margin: 0, fontSize: 11, color: 'var(--text2)', lineHeight: 1.45 }}>{alert.message}</p>
                            {alert.dossierName && (
                              <div style={{ marginTop: 5 }}>
                                <span style={{ fontSize: 9, color: ag.color, background: ag.badge, padding: '1px 6px', borderRadius: 3 }}>📁 {alert.dossierName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
