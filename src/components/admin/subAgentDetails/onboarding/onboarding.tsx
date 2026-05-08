'use client';
import React, { useState } from 'react';
import * as Icons from '../../../../assets/icons';
import { mockDossiers, mockPriorities } from './data';
import { CSS } from './constants';
import { AlertesView } from './AlertesView';
import { VueAgent } from './VueAgent';
import { ReferentielView } from './referentiel/ReferentielView';

type MainTab = 'alertes' | 'vue' | 'details';

const NAV: { key: MainTab; label: string; icon: string; badge: number | null; badgeColor: string }[] = [
  { key: 'alertes', label: 'Alertes & Priorités', icon: '🔔', badge: mockPriorities.filter(p => p.urgency === 'haute').length, badgeColor: '#ef4444' },
  { key: 'vue',     label: 'Vue Agent',           icon: '⬡',  badge: null,                                                     badgeColor: ''        },
  { key: 'details', label: 'Référentiel',          icon: '☰',  badge: mockDossiers.length,                                      badgeColor: '#0d9394' },
];

export const OnboardingChatModal: React.FC<{ open: boolean; agent: any; agentId?: string; onClose: () => void }> = ({ open, agent, onClose }) => {
  const [mainTab, setMainTab]     = useState<MainTab>('alertes');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!open) return null;

  const SIDEBAR_W = sidebarOpen ? 200 : 58;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', background: 'var(--header)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setSidebarOpen(v => !v)} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>☰</button>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Users style={{ width: 15, height: 15, color: '#8b5cf6' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{agent?.name || 'Agent Onboarding'}</div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text2)' }}>Intégration clients, fournisseurs & contacts · IA</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'onb-pulse 2s infinite' }} />
            <span style={{ fontSize: '0.68rem', color: '#22c55e', fontWeight: 600 }}>Agent actif</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.X style={{ width: 14, height: 14, color: 'var(--text)' }} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: SIDEBAR_W, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', transition: 'width 0.22s ease', overflow: 'hidden' }}>
          <div style={{ padding: sidebarOpen ? '14px 10px 8px' : '14px 6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map(n => {
              const active = mainTab === n.key;
              return (
                <button key={n.key} onClick={() => setMainTab(n.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '9px 10px' : '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', background: active ? 'rgba(139,92,246,0.1)' : 'transparent', color: active ? '#8b5cf6' : 'var(--text3)', transition: 'all 0.15s', width: '100%', position: 'relative' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
                  {sidebarOpen && <span style={{ fontSize: '0.76rem', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.label}</span>}
                  {n.badge !== null && (
                    <span style={{ marginLeft: sidebarOpen ? 'auto' : 0, position: sidebarOpen ? 'static' : 'absolute', top: 4, right: 4, fontSize: '0.56rem', padding: '1px 5px', borderRadius: 6, fontWeight: 700, background: n.badgeColor + '18', color: n.badgeColor, flexShrink: 0 }}>{n.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {sidebarOpen && (
            <div style={{ marginTop: 'auto', padding: '10px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text3)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Résumé</div>
              {[['EN_COURS', '#2563eb', 'En cours'], ['COMPLETE', '#22c55e', 'Complétés'], ['EN_ATTENTE', '#f59e0b', 'En attente'], ['REJETE', '#ef4444', 'Rejetés']].map(([s, c, l]) => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>{l}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: c }}>{mockDossiers.filter(d => d.status === s).length}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {mainTab === 'alertes' && <AlertesView />}
          {mainTab === 'vue'     && <VueAgent />}
          {mainTab === 'details' && <ReferentielView />}
        </div>
      </div>
    </div>
  );
};
