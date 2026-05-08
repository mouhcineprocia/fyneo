/// <reference types="@react-three/fiber" />
'use client';
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sofia } from './Sofia';
import { MathUtils } from 'three';
import { FactureChatModal } from './subAgentDetails/facture/facture';
import { ProjectChatModal } from './subAgentDetails/project/project';
import { BankChatModal } from './subAgentDetails/bank/bank';
import { ComptaChatModal } from './subAgentDetails/compta/compta';
import { OnboardingChatModal } from './subAgentDetails/onboarding/onboarding';
import { DriveChatModal } from './subAgentDetails/drive/drive';
import { listAgents } from '../../lib/api';

const { degToRad } = MathUtils;

// ─── Icons ───────────────────────────────────────────────────────────────────

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const AgentIcon = ({ size = 24, color = '#0d9394' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
    <path d="M9 20v-4" />
    <path d="M15 20v-4" />
  </svg>
);

// ─── Static mock data ─────────────────────────────────────────────────────────

const subAgents = [
  { id: 1, name: 'Agent Onboarding', connected: true, description: 'Intégration clients & consultants', tasks: 7, lastActive: 'Il y a 3 min' },
  { id: 2, name: 'Agent Project', connected: true, description: 'Gestion de projets régie & négoce', tasks: 10, lastActive: 'Il y a 1 min' },
  { id: 3, name: 'Agent Facture', connected: true, description: 'Gestion des factures et devis', tasks: 12, lastActive: 'Il y a 2 min' },
  { id: 4, name: 'Agent Bank', connected: true, description: 'Synchronisation bancaire', tasks: 8, lastActive: 'Il y a 5 min' },
  { id: 5, name: 'Agent Compta', connected: true, description: 'Comptabilité automatisée', tasks: 15, lastActive: 'Actif maintenant' },
  { id: 6, name: 'Agent Drive', connected: false, description: 'Gestion documentaire intelligente', tasks: 4, lastActive: 'Il y a 1 h' },
];

// ─── Main component ───────────────────────────────────────────────────────────

const Agent: React.FC = () => {
  const [isThinking, setIsThinking] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [factureModalOpen, setFactureModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [comptaModalOpen, setComptaModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<typeof subAgents[0] | null>(null);
  const [sofiaAgentId, setSofiaAgentId] = useState<string | null>(null);

  const fullMessage = "Bonjour 👋🏻, Je suis Procia. Pour une meilleure expérience, j'aimerais te présenter mes agents...";

  const handleSubAgentClick = (agent: typeof subAgents[0]) => {
    if (agent.name === 'Agent Facture') {
      setSelectedAgent(agent);
      setFactureModalOpen(true);
    } else if (agent.name === 'Agent Project') {
      setSelectedAgent(agent);
      setProjectModalOpen(true);
    } else if (agent.name === 'Agent Bank') {
      setSelectedAgent(agent);
      setBankModalOpen(true);
    } else if (agent.name === 'Agent Compta') {
      setSelectedAgent(agent);
      setComptaModalOpen(true);
    } else if (agent.name === 'Agent Onboarding') {
      setSelectedAgent(agent);
      setOnboardingModalOpen(true);
    } else if (agent.name === 'Agent Drive') {
      setSelectedAgent(agent);
      setDriveModalOpen(true);
    }
  };

  // Thinking animation 2 s
  useEffect(() => {
    const t = setTimeout(() => setIsThinking(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Discover Sofia agent id from mock data
  useEffect(() => {
    const fetch = async () => {
      try {
        const cached = typeof window !== 'undefined' ? window.localStorage?.getItem('sofiaAgentId') : null;
        if (cached) { setSofiaAgentId(cached); return; }
        const agents = await listAgents();
        const sofia = agents.find(a => (a.nom || '').toLowerCase().includes('sofia'));
        if (sofia) {
          setSofiaAgentId(sofia.id);
          window.localStorage?.setItem('sofiaAgentId', sofia.id);
          if (sofia.organizationId) window.localStorage?.setItem('organizationId', sofia.organizationId);
        }
      } catch (e) { console.warn('Failed to load Sofia agent id', e); }
    };
    fetch();
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!isThinking && displayedText.length < fullMessage.length) {
      const t = setTimeout(() => setDisplayedText(fullMessage.slice(0, displayedText.length + 1)), 30);
      return () => clearTimeout(t);
    }
  }, [isThinking, displayedText, fullMessage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, gap: 30 }}>

      {/* Animations */}
      <style>{`
        @keyframes ping { 75%,100%{transform:scale(2);opacity:0;} }
        .animate-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        @keyframes scrollPulse { 0%,100%{opacity:.4;transform:translateX(0)} 50%{opacity:1;transform:translateX(4px)} }
        .agent-hscroll { overflow-x:auto; overflow-y:visible; scroll-behavior:smooth; }
        .agent-hscroll::-webkit-scrollbar { height:4px; }
        .agent-hscroll::-webkit-scrollbar-track { background:transparent; border-radius:10px; }
        .agent-hscroll::-webkit-scrollbar-thumb { background:linear-gradient(90deg,#0d9394,#22c55e); border-radius:10px; }
        .agent-hscroll::-webkit-scrollbar-thumb:hover { background:linear-gradient(90deg,#0b7f80,#1aad5e); }
        .scroll-arrow { opacity:.7; transition:opacity .2s,transform .2s,background .2s; }
        .scroll-arrow:hover { opacity:1; transform:scale(1.08); }
      `}</style>

      {/* Sofia card */}
      <div style={{
        width: 500, height: 300,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        background: 'linear-gradient(to top right,rgba(148,163,184,0.3),rgba(156,163,175,0.3),rgba(71,85,105,0.3))',
        padding: 16, backdropFilter: 'blur(12px)', borderRadius: 12,
        border: '1px solid var(--card-b)', position: 'relative',
      }}>
        {/* connector dot bottom */}
        <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--text)' }} />

        {/* 3D avatar */}
        <div style={{
          width: 200, height: 200, borderRadius: '50%',
          border: '3px solid #0d9394',
          boxShadow: '0 0 20px rgba(13,147,148,0.6),0 0 40px rgba(13,147,148,0.3)',
          backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
        }}>
          <Canvas camera={{ position: [0, -0.2, 1.5], fov: 50 }} style={{ background: 'transparent' }}>
            {/* @ts-ignore */}
            <ambientLight intensity={0.6} />
            {/* @ts-ignore */}
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <Suspense fallback={null}>
              <Sofia teacher="Sofia" scale={2.2} position={[0, -2.8, 0.1]} rotation-y={degToRad(5)} />
            </Suspense>
          </Canvas>
        </div>

        {/* Thinking or typewriter text */}
        <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
          {isThinking ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ position: 'relative', display: 'flex', height: 16, width: 16 }}>
                <span className="animate-ping" style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: 'var(--text)', opacity: 0.75 }} />
                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: 26, width: 26, backgroundColor: 'transparent' }} />
              </span>
            </div>
          ) : (
            <h4 style={{ color: 'var(--text)', fontWeight: 'bold', fontSize: 14, textAlign: 'center', margin: 0 }}>
              {displayedText}
            </h4>
          )}
        </div>
      </div>

      {/* Horizontal scroll zone */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '100vw' }}>

        {/* Left fade mask */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 16, width: 80, background: 'linear-gradient(to right, var(--bg) 20%, transparent)', zIndex: 2, pointerEvents: 'none', borderRadius: '12px 0 0 12px' }} />
        {/* Right fade mask */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 16, width: 80, background: 'linear-gradient(to left, var(--bg) 20%, transparent)', zIndex: 2, pointerEvents: 'none', borderRadius: '0 12px 12px 0' }} />

        {/* Left arrow */}
        <button
          className="scroll-arrow"
          onClick={() => scrollRef.current?.scrollBy({ left: -290, behavior: 'smooth' })}
          style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-60%)', zIndex: 3, width: 36, height: 36, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        {/* Right arrow */}
        <button
          className="scroll-arrow"
          onClick={() => scrollRef.current?.scrollBy({ left: 290, behavior: 'smooth' })}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-60%)', zIndex: 3, width: 36, height: 36, borderRadius: '50%', background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="agent-hscroll"
          onScroll={e => {
            const el = e.currentTarget;
            setScrollProgress(el.scrollLeft / (el.scrollWidth - el.clientWidth) || 0);
          }}
          style={{ paddingBottom: 8 }}
        >
          {/* Inner content: SVG + cards, no wrap */}
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 80px' }}>

            {/* Connecting lines SVG */}
            {/* 7 cards × 240 + 6 × 24 gap = 1824; padding 80 each side → total 1984 */}
            {/* Card centers: 80+120=200, 200+264=464, 728, 992, 1256, 1520, 1784 */}
            {/* Sofia center = index 3 → 992 */}
            <svg width="1984" height="100" style={{ marginTop: -30, marginBottom: -30, display: 'block' }}>
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d939440" />
                  <stop offset="50%" stopColor="#0d9394" />
                  <stop offset="100%" stopColor="#0d939440" />
                </linearGradient>
              </defs>
              {/* Sofia vertical drop */}
              <line x1="992" y1="0" x2="992" y2="40" strokeWidth="2" stroke="url(#lineGrad)" />
              {/* Horizontal bar */}
              <line x1="200" y1="40" x2="1784" y2="40" strokeWidth="2" stroke="url(#lineGrad)" />
              {/* Vertical drops to cards */}
              {[200, 464, 728, 992, 1256, 1520, 1784].map(x => (
                <line key={x} x1={x} y1="40" x2={x} y2="100" strokeWidth="2" stroke="url(#lineGrad)" />
              ))}
            </svg>

            {/* Cards row — no wrap */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'nowrap' }}>
              {subAgents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="fade-in-up"
                  onClick={() => handleSubAgentClick(agent)}
                  style={{
                    width: 240, backgroundColor: 'var(--bg2)', borderRadius: 8, padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0,
                    boxShadow: 'var(--shadow)', position: 'relative',
                    border: '1px solid var(--card-b)', animationDelay: `${index * 0.1}s`,
                    opacity: 0, cursor: 'pointer', transition: 'transform 0.2s ease,box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.18)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                >
                  {/* icon + status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AgentIcon size={22} color="#0d9394" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: agent.connected ? '#22c55e' : '#ef4444' }} />
                      <span style={{ fontSize: 10, color: agent.connected ? '#22c55e' : '#ef4444' }}>{agent.connected ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </div>

                  {/* title */}
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 'bold', fontSize: 13, color: 'var(--text)' }}>{agent.name}</h5>
                    <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text3)' }}>{agent.description}</p>
                  </div>

                  {/* stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 'bold', color: '#0d9394' }}>{agent.tasks}</span>
                      <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 4 }}>tâches</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{agent.lastActive}</span>
                  </div>

                  {/* actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--border)', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'var(--text2)' }}>
                      <SettingsIcon />
                    </button>
                    <button style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#ef4444' }}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add new sub-agent */}
              <div
                className="fade-in-up"
                style={{
                  width: 240, backgroundColor: 'var(--bg2)', borderRadius: 8, padding: 16, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                  boxShadow: 'var(--shadow)', cursor: 'pointer',
                  border: '2px dashed var(--border)', position: 'relative', minHeight: 180,
                  transition: 'all 0.2s ease', animationDelay: `${subAgents.length * 0.1}s`, opacity: 0,
                }}
              >
                <div style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,147,148,0.1)', borderRadius: '50%', color: '#0d9394' }}>
                  <PlusIcon />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', fontWeight: 500 }}>Ajouter un sous-agent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll progress bar */}
        <div style={{ margin: '6px auto 0', width: 120, height: 3, borderRadius: 10, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, #0d9394, #22c55e)', width: `${Math.max(14, scrollProgress * 100)}%`, transition: 'width 0.15s ease' }} />
        </div>
      </div>

      {/* Facture modal */}
      <FactureChatModal
        open={factureModalOpen}
        agent={selectedAgent}
        agentId={sofiaAgentId || undefined}
        onClose={() => { setFactureModalOpen(false); setSelectedAgent(null); }}
      />

      {/* Project modal */}
      <ProjectChatModal
        open={projectModalOpen}
        agent={selectedAgent}
        agentId={sofiaAgentId || undefined}
        onClose={() => { setProjectModalOpen(false); setSelectedAgent(null); }}
      />

      {/* Bank modal */}
      <BankChatModal
        open={bankModalOpen}
        agent={selectedAgent}
        agentId={sofiaAgentId || undefined}
        onClose={() => { setBankModalOpen(false); setSelectedAgent(null); }}
      />

      {/* Compta modal */}
      <ComptaChatModal
        open={comptaModalOpen}
        agent={selectedAgent}
        agentId={sofiaAgentId || undefined}
        onClose={() => { setComptaModalOpen(false); setSelectedAgent(null); }}
      />

      {/* Onboarding modal */}
      <OnboardingChatModal
        open={onboardingModalOpen}
        agent={selectedAgent}
        agentId={sofiaAgentId || undefined}
        onClose={() => { setOnboardingModalOpen(false); setSelectedAgent(null); }}
      />

      {/* Drive modal */}
      <DriveChatModal
        open={driveModalOpen}
        agent={selectedAgent}
        agentId={sofiaAgentId || undefined}
        onClose={() => { setDriveModalOpen(false); setSelectedAgent(null); }}
      />
    </div>
  );
};

export default Agent;
