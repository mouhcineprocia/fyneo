'use client';
import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from '../../../../assets/icons';
import { AiInsight, Skel } from './shared';
import {
  mkDepenses, mkFactures,
  mkChargesSociales, mkCras, mkFichiers,
  mkWalletTransactions, mkCommentaires,
} from './mockData';
import { AnalyticsTab }     from './tabs/AnalyticsTab';
import { PrestationsTab }   from './tabs/PrestationsTab';
import { DevisTab }         from './tabs/DevisTab';
import { CommandesTab }     from './tabs/CommandesTab';
import { FacturesTab }      from './tabs/FacturesTab';
import { FournisseursTab }  from './tabs/FournisseursTab';
import { ChargeSocialeTab } from './tabs/ChargeSocialeTab';
import { CraTab }           from './tabs/CraTab';
import { WalletTab }        from './tabs/WalletTab';
import { FichiersTab }      from './tabs/FichiersTab';
import { CommentairesTab }  from './tabs/CommentairesTab';
import type { Project }     from './types';

interface ProjectDetailsProps { open: boolean; project: Project | null; onClose: () => void; }

export const ProjectDetailsModal: React.FC<ProjectDetailsProps> = ({ open, project, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading]     = useState(true);

  const isRegie         = project?.type === 'regie';
  const depenses        = useMemo(() => mkDepenses(),         []);
  const factures        = useMemo(() => mkFactures(),         []);
  const chargesSociales = useMemo(() => mkChargesSociales(),  []);
  const cras            = useMemo(() => mkCras(),             []);
  const fichiers        = useMemo(() => mkFichiers(),         []);
  const walletTxs       = useMemo(() => mkWalletTransactions(), []);
  const initialComments = useMemo(() => mkCommentaires(),     []);

  const TABS = useMemo(() => {
    const base = [
      { key: 'analytics',    label: 'Analytics' },
      ...(isRegie ? [{ key: 'prestations', label: 'Prestations' }] : []),
      { key: 'devis',        label: 'Devis' },
      { key: 'commandes',    label: 'Commandes' },
      { key: 'factures',     label: `Factures (${factures.length})` },
      { key: 'fournisseurs', label: 'Fournisseurs' },
      { key: 'chargesociale',label: `Charge Sociale (${chargesSociales.length})` },
      { key: 'cra',          label: `CRA (${cras.length})` },
      { key: 'wallet',       label: 'Wallet' },
      { key: 'fichiers',     label: `Fichiers (${fichiers.length})` },
      { key: 'commentaires', label: `Commentaires (${initialComments.length})` },
    ];
    return base;
  }, [isRegie, factures.length, chargesSociales.length, cras.length, fichiers.length, initialComments.length]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setActiveTab(0);
      const t = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open || !project) return null;

  const currentTabKey = TABS[activeTab]?.key || 'analytics';
  const typeMeta = project.type === 'regie'
    ? { label: 'Régie', color: '#0d9394', bg: 'rgba(13,147,148,0.1)' }
    : { label: 'Négoce', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
  const statusLabel: Record<string, string> = { active: 'Actif', pending: 'En attente', completed: 'Terminé', cancelled: 'Annulé' };
  const fmtCurrency = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  const renderTab = () => {
    if (loading) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(5)].map((_, i) => <Skel key={i} w="100%" h={44} r={6} />)}
      </div>
    );
    switch (currentTabKey) {
      case 'analytics':    return <AnalyticsTab project={project} prestations={[]} depenses={depenses} factures={factures} chargesSociales={chargesSociales} walletTxs={walletTxs} isRegie={isRegie} />;
      case 'prestations':  return <PrestationsTab projectId={project.id} />;
      case 'devis':        return <DevisTab projectId={project.id} />;
      case 'commandes':    return <CommandesTab projectId={project.id} />;
      case 'factures':     return <FacturesTab factures={factures} />;
      case 'fournisseurs': return <FournisseursTab projectId={project.id} />;
      case 'chargesociale':return <ChargeSocialeTab chargesSociales={chargesSociales} />;
      case 'cra':          return <CraTab cras={cras} />;
      case 'wallet':       return <WalletTab walletTxs={walletTxs} />;
      case 'fichiers':     return <FichiersTab fichiers={fichiers} />;
      case 'commentaires': return <CommentairesTab initialComments={initialComments} />;
      default:             return null;
    }
  };

  return (
    <>
      <style>{`
        @keyframes od-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes od-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        .od-dot1 { animation: od-dot1 1.2s infinite ease-in-out; animation-delay: 0s; }
        .od-dot2 { animation: od-dot1 1.2s infinite ease-in-out; animation-delay: 0.16s; }
        .od-dot3 { animation: od-dot1 1.2s infinite ease-in-out; animation-delay: 0.32s; }
        @keyframes od-dot1 { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 1400, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: '0 16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 12, height: 52 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: typeMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.Briefcase style={{ width: 15, height: 15, color: typeMeta.color }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 3, backgroundColor: typeMeta.bg, color: typeMeta.color, fontWeight: 600 }}>{typeMeta.label}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>·</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{statusLabel[project.status] || project.status}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>·</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{fmtCurrency(project.budget ?? 0)}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.6rem', padding: '3px 8px', borderRadius: 4, backgroundColor: 'rgba(13,147,148,0.1)', color: '#0d9394', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icons.Sparkles style={{ width: 10, height: 10 }} /> Sofia IA
            </span>
            <button onClick={onClose} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, color: 'var(--text2)' }}>
              <Icons.X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ flexShrink: 0, display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg2)', overflowX: 'auto' }} className="no-scrollbar">
          {TABS.map((tab, idx) => (
            <button key={tab.key} onClick={() => setActiveTab(idx)}
              style={{ flexShrink: 0, padding: '10px 14px', fontSize: '0.7rem', fontWeight: activeTab === idx ? 600 : 500, color: activeTab === idx ? '#0d9394' : 'var(--text2)', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === idx ? '2px solid #0d9394' : '2px solid transparent', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {!loading && <AiInsight tabKey={currentTabKey} active={true} />}
          {renderTab()}
        </div>
      </div>
    </>
  );
};
