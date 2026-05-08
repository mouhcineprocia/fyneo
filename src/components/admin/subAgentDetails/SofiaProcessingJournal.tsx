"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { MathUtils } from 'three';
import { Sofia } from '../Sofia';
import './SofiaProcessingJournal.css';

const { degToRad } = MathUtils;

interface TimelineEvent {
  step: string;
  status: 'success' | 'error' | 'pending';
  detail: string;
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
}

interface SofiaProcessingJournalProps {
  sessionId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

const MOCK_FILES = ['facture-acme-jan2024.pdf', 'facture-tech-supplies.pdf', 'avoir-client-003.pdf'];

const TIMELINE_SEQUENCE: Omit<TimelineEvent, 'startedAt' | 'finishedAt'>[] = [
  { step: 'files_uploaded', status: 'success', detail: '3 fichiers reçus et indexés', error: null },
  { step: 'workflow_triggered', status: 'success', detail: 'Pipeline de traitement initialisé', error: null },
  { step: 'ocr_processing', status: 'success', detail: 'OCR appliqué sur 3 documents', error: null },
  { step: 'data_extraction', status: 'success', detail: 'Données extraites avec succès', error: null },
  { step: 'validation', status: 'success', detail: 'Validation et conformité OK — 3/3', error: null },
];

const formatStepName = (step: string) => {
  switch (step) {
    case 'files_uploaded': return 'Réception des fichiers';
    case 'workflow_triggered': return 'Initialisation du workflow';
    case 'ocr_processing': return 'Lecture et OCR';
    case 'data_extraction': return 'Extraction des données';
    case 'validation': return 'Validation et Conformité';
    default: return step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const SpinnerSvg = ({ size = 18, color = '#22d3ee' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"
    style={{ animation: 'spj-spin 1s linear infinite', display: 'inline-block' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const CheckCircleSvg = ({ size = 24, color = '#4ade80' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
  </svg>
);

const BrainSvg = ({ size = 18, color = '#34d399' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
  </svg>
);

const FileSvg = ({ size = 18, color = '#475569' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
);

const ThinkingProcess = ({
  isThinking,
  timeline,
}: {
  isThinking: boolean;
  timeline: TimelineEvent[];
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ marginTop: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isThinking ? <SpinnerSvg size={18} color="#22d3ee" /> : <BrainSvg size={18} color="#34d399" />}
          <span style={{ fontWeight: 600, color: isThinking ? '#22d3ee' : '#34d399', fontSize: '0.95rem' }}>
            {isThinking ? 'Sofia réfléchit...' : 'Analyse terminée'}
          </span>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{expanded ? 'Masquer' : 'Voir les détails'}</span>
      </div>

      {expanded && (
        <div style={{ padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: 'rgba(255,255,255,0.02)' }}>
          {timeline.length === 0 && (
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Démarrage du processus...</span>
          )}
          {timeline.map((event, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingLeft: 10, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div style={{
                marginTop: 4, width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                backgroundColor: event.status === 'success' ? '#34d399' : '#e2e8f0',
                boxShadow: event.status === 'success' ? '0 0 8px rgba(52,211,153,0.4)' : 'none',
              }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 500 }}>
                  {formatStepName(event.step)}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {event.detail}
                </p>
              </div>
            </div>
          ))}
          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 10 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22d3ee',
                animation: 'spj-ping 1s cubic-bezier(0,0,0.2,1) infinite',
              }} />
              <span style={{ fontSize: '0.85rem', color: '#22d3ee' }}>Traitement en cours...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const SofiaProcessingJournal: React.FC<SofiaProcessingJournalProps> = ({
  sessionId,
  onComplete,
  onClose,
}) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isThinking, setIsThinking] = useState(true);
  const [progress, setProgress] = useState(0);
  const [completedDocs, setCompletedDocs] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const total = MOCK_FILES.length;

    TIMELINE_SEQUENCE.forEach((step, idx) => {
      timers.push(setTimeout(() => {
        if (hasCompleted.current) return;
        const now = new Date().toISOString();
        setTimeline(prev => [...prev, { ...step, startedAt: now, finishedAt: now }]);
        setProgress(Math.round(((idx + 1) / TIMELINE_SEQUENCE.length) * 100));
        setCompletedDocs(Math.round(((idx + 1) / TIMELINE_SEQUENCE.length) * total));

        if (idx === TIMELINE_SEQUENCE.length - 1) {
          hasCompleted.current = true;
          setIsThinking(false);
          setIsDone(true);
          timers.push(setTimeout(() => onComplete?.(), 3000));
        }
      }, (idx + 1) * 1200));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{`
        @keyframes spj-spin { to { transform: rotate(360deg); } }
        @keyframes spj-ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          position: 'relative', borderRadius: 24,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white', padding: 32, marginBottom: 24,
          boxShadow: '0 20px 40px -10px rgba(13,147,148,0.3)',
          border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: 32 }}>

            {/* Left: 3D Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120, flexShrink: 0 }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                border: '2px solid #0d9394', overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)',
                boxShadow: isThinking ? '0 0 25px rgba(13,147,148,0.6)' : '0 0 10px rgba(13,147,148,0.3)',
                transition: 'box-shadow 0.5s ease',
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
              <p style={{ margin: '10px 0 0 0', fontWeight: 700, color: '#22d3ee', fontSize: 14 }}>Sofia AI</p>
              <span style={{
                marginTop: 4, padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                backgroundColor: isThinking ? 'rgba(34,211,238,0.1)' : 'rgba(16,185,129,0.1)',
                color: isThinking ? '#22d3ee' : '#34d399',
                border: isThinking ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(16,185,129,0.3)',
              }}>
                {isThinking ? 'PROCESSING' : 'ONLINE'}
              </span>
            </div>

            {/* Center: Thinking process */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                margin: '0 0 0 0', fontWeight: 800, fontSize: '1.5rem',
                background: 'linear-gradient(90deg, #fff, #94a3b8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {isThinking ? "J'analyse vos documents..." : 'Mission accomplie.'}
              </h2>

              <ThinkingProcess isThinking={isThinking} timeline={timeline} />

              {isDone && (
                <div style={{
                  marginTop: 20, padding: 16, borderRadius: 12,
                  backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <CheckCircleSvg size={24} color="#4ade80" />
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 14 }}>Traitement Terminé</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: '#86efac' }}>
                      {completedDocs} documents traités avec succès.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Stats */}
            <div style={{ minWidth: 200, flexShrink: 0 }}>
              <div style={{
                padding: 20, borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>SESSION ID</p>
                <p style={{ margin: '0 0 20px 0', fontFamily: 'monospace', color: '#e2e8f0', fontSize: '0.9rem' }}>
                  {sessionId.slice(0, 8)}...
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Progression</span>
                  <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${progress}%`, height: '100%', borderRadius: 3,
                    backgroundColor: isThinking ? '#22d3ee' : '#34d399',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Fichiers</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{MOCK_FILES.length}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Succès</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>{completedDocs}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Files section */}
        <div>
          <h3 style={{ margin: '0 0 14px 0', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileSvg size={20} />
            Fichiers détectés
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {MOCK_FILES.map((file, idx) => (
              <div key={idx} style={{
                padding: 14, borderRadius: 12, border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', backgroundColor: 'white',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 8, flexShrink: 0 }}>
                    <FileSvg size={18} color="#475569" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1e293b' }}>
                      {file}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: isThinking ? '#0284c7' : '#16a34a' }}>
                      {isThinking ? 'En attente...' : 'Traité ✓'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {isDone && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#1e293b', color: 'white', borderRadius: 10,
                padding: '10px 24px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export const SofiaThinkingBubble = ({ message }: { message: string }) => (
  <div style={{
    display: 'flex', gap: 8, padding: 16, alignItems: 'center',
    backgroundColor: 'rgba(13,147,148,0.05)', borderRadius: 12,
    border: '1px solid rgba(13,147,148,0.1)',
  }}>
    <SpinnerSvg size={20} color="#0e7490" />
    <span style={{ color: '#0e7490', fontSize: '0.9rem' }}>{message || 'Analyse en cours...'}</span>
  </div>
);
