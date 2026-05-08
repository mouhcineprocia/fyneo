"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as Icons from '../../../../assets/icons';

// ── Types ──────────────────────────────────────────────────────────────────────
interface DriveFolder { id: string; name: string; parentId: string | null; fileCount: number; size: string; }
interface DriveFile { id: string; folderId: string; name: string; type: 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png' | 'zip' | 'txt'; size: string; updatedAt: string; updatedBy: string; shared: boolean; starred: boolean; }
interface ChatMsg { id: string; from: 'sofia' | 'user'; text: string; time: string; }
interface PriorityItem { id: string; title: string; description: string; urgency: 'haute' | 'moyenne' | 'basse'; actionType: 'validation' | 'signature' | 'revision' | 'suppression'; fileName: string; deadline: string; size: string; }
interface AgentAlert { id: string; type: 'error' | 'warning' | 'success' | 'info'; title: string; message: string; time: string; fileName: string; }
interface TimelineEvent { id: string; type: string; label: string; desc: string; time: string; }
interface TodayActivity { id: string; action: 'uploaded' | 'downloaded' | 'shared' | 'indexed' | 'deleted'; fileName: string; folder: string; user: string; time: string; }
interface KpiCard { id: string; label: string; value: string; sub: string; color: string; }

// ── Mock data ──────────────────────────────────────────────────────────────────
const mockFolders: DriveFolder[] = [
    { id: 'root', name: 'Tous les fichiers', parentId: null, fileCount: 48, size: '234 MB' },
    { id: 'f1', name: 'Contrats', parentId: 'root', fileCount: 12, size: '45 MB' },
    { id: 'f2', name: 'Factures', parentId: 'root', fileCount: 18, size: '67 MB' },
    { id: 'f3', name: 'RH', parentId: 'root', fileCount: 8, size: '22 MB' },
    { id: 'f4', name: 'Clients', parentId: 'root', fileCount: 6, size: '31 MB' },
    { id: 'f5', name: 'Rapports', parentId: 'root', fileCount: 4, size: '69 MB' },
    { id: 'f1-1', name: 'Contrats clients', parentId: 'f1', fileCount: 7, size: '28 MB' },
    { id: 'f1-2', name: 'Contrats fournisseurs', parentId: 'f1', fileCount: 5, size: '17 MB' },
    { id: 'f2-1', name: 'Factures 2024', parentId: 'f2', fileCount: 10, size: '34 MB' },
    { id: 'f2-2', name: 'Factures 2025', parentId: 'f2', fileCount: 8, size: '33 MB' },
];
const mockFiles: DriveFile[] = [
    { id: 'file1', folderId: 'f1', name: 'CTR-2025-001 Acme Corp.pdf', type: 'pdf', size: '1.2 MB', updatedAt: '2025-01-15', updatedBy: 'Alice Martin', shared: true, starred: true },
    { id: 'file2', folderId: 'f1', name: 'CTR-2025-002 Jean Dupont.pdf', type: 'pdf', size: '0.8 MB', updatedAt: '2025-01-12', updatedBy: 'Bob Dupont', shared: false, starred: false },
    { id: 'file3', folderId: 'f1', name: 'Avenant CTR-2024-011.docx', type: 'docx', size: '0.3 MB', updatedAt: '2025-01-10', updatedBy: 'Alice Martin', shared: false, starred: false },
    { id: 'file4', folderId: 'f2', name: 'FAC-2025-0042.pdf', type: 'pdf', size: '0.5 MB', updatedAt: '2025-01-20', updatedBy: 'Carol Lemaire', shared: true, starred: false },
    { id: 'file5', folderId: 'f2', name: 'FAC-2025-0043.pdf', type: 'pdf', size: '0.6 MB', updatedAt: '2025-01-21', updatedBy: 'Carol Lemaire', shared: true, starred: false },
    { id: 'file6', folderId: 'f2', name: 'Tableau récap jan 2025.xlsx', type: 'xlsx', size: '0.9 MB', updatedAt: '2025-01-22', updatedBy: 'David Renaud', shared: false, starred: true },
    { id: 'file7', folderId: 'f3', name: 'Fiches de paie Jan 2025.zip', type: 'zip', size: '4.1 MB', updatedAt: '2025-01-31', updatedBy: 'Emma Petit', shared: false, starred: false },
    { id: 'file8', folderId: 'f3', name: 'Organigramme.png', type: 'png', size: '1.8 MB', updatedAt: '2025-01-05', updatedBy: 'Alice Martin', shared: true, starred: false },
    { id: 'file9', folderId: 'f4', name: 'Présentation Acme Corp.pdf', type: 'pdf', size: '3.2 MB', updatedAt: '2025-01-14', updatedBy: 'David Renaud', shared: true, starred: true },
    { id: 'file10', folderId: 'f4', name: 'Fiche client Global Services.docx', type: 'docx', size: '0.4 MB', updatedAt: '2024-12-22', updatedBy: 'Bob Dupont', shared: false, starred: false },
    { id: 'file11', folderId: 'f5', name: 'Rapport Q4 2024.pdf', type: 'pdf', size: '8.7 MB', updatedAt: '2025-01-07', updatedBy: 'Alice Martin', shared: true, starred: true },
    { id: 'file12', folderId: 'f5', name: 'Analyse financière 2024.xlsx', type: 'xlsx', size: '2.3 MB', updatedAt: '2025-01-07', updatedBy: 'Carol Lemaire', shared: false, starred: false },
    { id: 'file13', folderId: 'f1-1', name: 'CTR-2025-003 Global Services.pdf', type: 'pdf', size: '1.1 MB', updatedAt: '2025-01-02', updatedBy: 'Alice Martin', shared: true, starred: false },
    { id: 'file14', folderId: 'f1-2', name: 'CTR-2024-012 Tech Supplies.pdf', type: 'pdf', size: '0.9 MB', updatedAt: '2024-12-02', updatedBy: 'Bob Dupont', shared: false, starred: false },
    { id: 'file15', folderId: 'f2-1', name: 'Factures archivées 2024.zip', type: 'zip', size: '12.4 MB', updatedAt: '2025-01-01', updatedBy: 'Carol Lemaire', shared: false, starred: false },
    { id: 'file16', folderId: 'f2-2', name: 'FAC-2025-0044.pdf', type: 'pdf', size: '0.4 MB', updatedAt: '2025-01-25', updatedBy: 'Carol Lemaire', shared: false, starred: false },
];

const mockPriorities: PriorityItem[] = [
    { id: 'p1', title: 'CTR-2025-001 Acme Corp', description: 'Signature du contrat requise avant échéance client', urgency: 'haute', actionType: 'signature', fileName: 'CTR-2025-001 Acme Corp.pdf', deadline: '2025-02-01', size: '1.2 MB' },
    { id: 'p2', title: 'Rapport Q4 2024', description: 'Validation comptable du rapport annuel en attente', urgency: 'haute', actionType: 'validation', fileName: 'Rapport Q4 2024.pdf', deadline: '2025-02-03', size: '8.7 MB' },
    { id: 'p3', title: 'Contrats fournisseurs', description: 'Révision annuelle des contrats fournisseurs à planifier', urgency: 'moyenne', actionType: 'revision', fileName: 'CTR-2024-012 Tech Supplies.pdf', deadline: '2025-02-15', size: '0.9 MB' },
    { id: 'p4', title: 'Fiches de paie Jan 2025', description: 'Archivage RH à valider avant distribution équipe', urgency: 'moyenne', actionType: 'validation', fileName: 'Fiches de paie Jan 2025.zip', deadline: '2025-02-10', size: '4.1 MB' },
    { id: 'p5', title: 'Factures archivées 2024', description: 'Purge des doublons détectés dans l\'archive 2024', urgency: 'basse', actionType: 'suppression', fileName: 'Factures archivées 2024.zip', deadline: '2025-02-28', size: '12.4 MB' },
];
const mockAlerts: AgentAlert[] = [
    { id: 'a1', type: 'error', title: 'Fichier corrompu détecté', message: 'Le fichier Avenant CTR-2024-011.docx semble corrompu — impossible d\'extraire le contenu texte.', time: '08:14', fileName: 'Avenant CTR-2024-011.docx' },
    { id: 'a2', type: 'error', title: 'Doublon critique', message: '3 copies de FAC-2025-0042.pdf détectées dans deux dossiers différents. Risque de version divergente.', time: '09:30', fileName: 'FAC-2025-0042.pdf' },
    { id: 'a3', type: 'warning', title: 'Quota de stockage', message: 'Stockage à 47% (234 MB / 500 MB). Prévoir nettoyage des archives avant fin de mois.', time: '07:50', fileName: '' },
    { id: 'a4', type: 'warning', title: 'Partage externe détecté', message: 'CTR-2025-001 Acme Corp.pdf a été partagé avec une adresse externe (acme@example.com).', time: '10:05', fileName: 'CTR-2025-001 Acme Corp.pdf' },
    { id: 'a5', type: 'success', title: 'Import réussi', message: 'Lot de 8 factures Factures 2025 importé avec succès. Index mis à jour automatiquement.', time: '06:45', fileName: 'FAC-2025-0044.pdf' },
    { id: 'a6', type: 'success', title: 'Indexation terminée', message: 'Réindexation complète du dossier Rapports terminée — 4 fichiers, 69 MB analysés.', time: '05:30', fileName: '' },
    { id: 'a7', type: 'info', title: 'Nouveau fichier partagé', message: 'Présentation Acme Corp.pdf a été partagé par David Renaud avec 2 collaborateurs.', time: '11:20', fileName: 'Présentation Acme Corp.pdf' },
    { id: 'a8', type: 'info', title: 'Mise à jour de l\'index', message: 'L\'index de recherche a été mis à jour — 48 fichiers référencés, temps de recherche < 200ms.', time: '12:00', fileName: '' },
];
const mockTimeline: TimelineEvent[] = [
    { id: 't1', type: 'upload', label: 'Import fichiers', desc: 'FAC-2025-0044.pdf importé dans Factures 2025', time: '06:45' },
    { id: 't2', type: 'index', label: 'Réindexation', desc: 'Dossier Rapports réindexé — 4 fichiers', time: '05:30' },
    { id: 't3', type: 'share', label: 'Partage', desc: 'Présentation Acme Corp.pdf partagé × 2', time: '11:20' },
    { id: 't4', type: 'error', label: 'Erreur détectée', desc: 'Fichier corrompu : Avenant CTR-2024-011.docx', time: '08:14' },
    { id: 't5', type: 'download', label: 'Téléchargement', desc: 'Rapport Q4 2024.pdf téléchargé par Alice', time: '09:10' },
    { id: 't6', type: 'delete', label: 'Suppression doublon', desc: 'FAC-2024-0028 (doublon) supprimé auto', time: '07:00' },
    { id: 't7', type: 'share', label: 'Partage externe', desc: 'CTR-2025-001 partagé avec acme@example.com', time: '10:05' },
    { id: 't8', type: 'upload', label: 'Archivage RH', desc: 'Fiches de paie Jan 2025.zip archivé', time: '08:00' },
];
const mockActivity: TodayActivity[] = [
    { id: 'act1', action: 'uploaded', fileName: 'FAC-2025-0044.pdf', folder: 'Factures 2025', user: 'Carol Lemaire', time: '06:45' },
    { id: 'act2', action: 'shared', fileName: 'Présentation Acme Corp.pdf', folder: 'Clients', user: 'David Renaud', time: '11:20' },
    { id: 'act3', action: 'downloaded', fileName: 'Rapport Q4 2024.pdf', folder: 'Rapports', user: 'Alice Martin', time: '09:10' },
    { id: 'act4', action: 'deleted', fileName: 'FAC-2024-0028 (doublon)', folder: 'Factures 2024', user: 'Sofia IA', time: '07:00' },
    { id: 'act5', action: 'indexed', fileName: 'Dossier Rapports complet', folder: 'Rapports', user: 'Sofia IA', time: '05:30' },
];
const mockKpis: KpiCard[] = [
    { id: 'k1', label: 'Total fichiers', value: '48', sub: '+2 aujourd\'hui', color: '#0d9394' },
    { id: 'k2', label: 'Stockage utilisé', value: '234 MB', sub: '47% du quota', color: '#f59e0b' },
    { id: 'k3', label: 'Fichiers partagés', value: '7', sub: '3 externes', color: '#3b82f6' },
    { id: 'k4', label: 'Favoris', value: '4', sub: 'étoilés', color: '#a855f7' },
    { id: 'k5', label: 'Importés aujourd\'hui', value: '8', sub: 'ce matin', color: '#22c55e' },
    { id: 'k6', label: 'Erreurs', value: '2', sub: '1 critique', color: '#ef4444' },
];

const ROOT_SOFIA_MSGS = [
    "Bonjour ! J'ai indexé 48 fichiers répartis dans 10 dossiers. Je détecte 4 fichiers en doublon potentiel et 2 documents arrivant à expiration ce mois-ci.",
    "Je recommande de vérifier les contrats CTR-2024-011 et CTR-2024-012 dont les échéances approchent. Souhaitez-vous que je génère un rapport de synthèse ?",
];
const FOLDER_MSGS: Record<string, string[]> = {
    f1: ["Dossier Contrats — 12 fichiers, 45 MB. 2 contrats expirent dans moins de 60 jours. Je peux préparer les avenants si nécessaire."],
    f2: ["Dossier Factures — 18 fichiers. Le tableau récap janvier 2025 est à jour. Aucune facture impayée détectée ce mois-ci."],
    f3: ["Dossier RH — 8 fichiers. Fiches de paie janvier générées et archivées. L'organigramme a été mis à jour le 05/01."],
    f4: ["Dossier Clients — 6 fichiers. La présentation Acme Corp est la plus consultée cette semaine (7 vues). Fiche Global Services à mettre à jour."],
    f5: ["Dossier Rapports — Le rapport Q4 2024 est le document le plus lourd (8.7 MB). Je peux en faire un résumé exécutif si vous le souhaitez."],
};

// ── Constants ──────────────────────────────────────────────────────────────────
const URGENCY_META = {
    haute:   { label: 'Haute',   bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
    moyenne: { label: 'Moyenne', bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    basse:   { label: 'Basse',   bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
};
const ACTION_META = {
    validation:  { label: 'Validation',  bg: 'rgba(13,147,148,0.12)',  color: '#0d9394' },
    signature:   { label: 'Signature',   bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6' },
    revision:    { label: 'Révision',    bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    suppression: { label: 'Suppression', bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
};
const ALERT_META = {
    error:   { label: 'Erreurs',          icon: '✕', grad: 'linear-gradient(135deg,#ef4444,#dc2626)', badge: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
    warning: { label: 'Avertissements',   icon: '⚠', grad: 'linear-gradient(135deg,#f59e0b,#d97706)', badge: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    success: { label: 'Succès',           icon: '✓', grad: 'linear-gradient(135deg,#22c55e,#16a34a)', badge: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
    info:    { label: 'Informations',     icon: 'ℹ', grad: 'linear-gradient(135deg,#3b82f6,#2563eb)', badge: 'rgba(59,130,246,0.15)',  color: '#3b82f6' },
};
const TL_META: Record<string, { icon: string; color: string }> = {
    upload:   { icon: '↑', color: '#22c55e' },
    index:    { icon: '⟳', color: '#0d9394' },
    share:    { icon: '⤴', color: '#3b82f6' },
    error:    { icon: '✕', color: '#ef4444' },
    download: { icon: '↓', color: '#a855f7' },
    delete:   { icon: '⌫', color: '#6b7280' },
};
const ACTIVITY_META: Record<string, { label: string; color: string }> = {
    uploaded:   { label: 'Importé',      color: '#22c55e' },
    downloaded: { label: 'Téléchargé',   color: '#a855f7' },
    shared:     { label: 'Partagé',      color: '#3b82f6' },
    indexed:    { label: 'Indexé',       color: '#0d9394' },
    deleted:    { label: 'Supprimé',     color: '#ef4444' },
};

const CSS = `
@keyframes drv-dot1{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
@keyframes drv-dot2{0%,20%,100%{transform:scale(0)}60%{transform:scale(1)}}
@keyframes drv-dot3{0%,40%,100%{transform:scale(0)}80%{transform:scale(1)}}
@keyframes drv-blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes drv-fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes drv-ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}}
`;

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const FILE_COLORS: Record<string, string> = { pdf: '#ef4444', docx: '#3b82f6', xlsx: '#22c55e', jpg: '#f59e0b', png: '#a855f7', zip: '#6b7280', txt: '#64748b' };

const glass = (accent: string): React.CSSProperties => ({
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: `0 2px 12px ${accent}18`,
});

const FileTypeIcon = ({ type }: { type: DriveFile['type'] }) => (
    <div style={{ width: 36, height: 44, borderRadius: 4, position: 'relative', background: `${FILE_COLORS[type]}20`, border: `1px solid ${FILE_COLORS[type]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: FILE_COLORS[type], letterSpacing: 0.5 }}>{type.toUpperCase()}</span>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 8px 8px 0', borderColor: `transparent ${FILE_COLORS[type]}60 transparent transparent` }} />
    </div>
);

// ── AlertesView ────────────────────────────────────────────────────────────────
const AlertesView: React.FC<{ priorities: PriorityItem[]; alerts: AgentAlert[] }> = ({ priorities, alerts }) => {
    const urgentCount = priorities.filter(p => p.urgency === 'haute').length;
    const alertGroups = (['error', 'warning', 'success', 'info'] as const)
        .map(type => ({ type, items: alerts.filter(a => a.type === type) }))
        .filter(g => g.items.length > 0);

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Priorités */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Priorités actives</div>
                    {urgentCount > 0 && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#ef4444', opacity: 0.4, animation: 'drv-ping 1.5s ease-out infinite' }} />
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', position: 'relative' }}>{urgentCount}</div>
                        </div>
                    )}
                    <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>{priorities.length} fichiers en attente</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {priorities.map(p => {
                        const um = URGENCY_META[p.urgency];
                        const am = ACTION_META[p.actionType];
                        const accentGrad = p.urgency === 'haute' ? 'linear-gradient(180deg,#ef4444,#dc2626)' : p.urgency === 'moyenne' ? 'linear-gradient(180deg,#f59e0b,#d97706)' : 'linear-gradient(180deg,#22c55e,#16a34a)';
                        return (
                            <div key={p.id} style={{ ...glass(um.color), position: 'relative', overflow: 'hidden', display: 'flex' }}>
                                <div style={{ width: 4, flexShrink: 0, background: accentGrad, borderRadius: '14px 0 0 14px' }} />
                                <div style={{ flex: 1, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{p.title}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.description}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: um.bg, color: um.color }}>{um.label}</span>
                                            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: am.bg, color: am.color }}>{am.label}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 5, border: '1px solid var(--border)' }}>📄 {p.fileName}</span>
                                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>💾 {p.size}</span>
                                        <span style={{ fontSize: 10, color: '#ef4444', marginLeft: 'auto', fontWeight: 500 }}>⏰ {fmtDate(p.deadline)}</span>
                                        <button style={{ height: 28, padding: '0 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${um.color},${am.color})`, color: 'white', fontSize: 11, fontWeight: 600 }}>
                                            {am.label} →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Alertes */}
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Journal des alertes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {alertGroups.map(group => {
                        const meta = ALERT_META[group.type];
                        return (
                            <div key={group.type}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 10, background: meta.badge, color: meta.color }}>{meta.label}</span>
                                    <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--bg2)', padding: '1px 7px', borderRadius: 8, border: '1px solid var(--border)' }}>{group.items.length}</span>
                                    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${meta.color}40,transparent)` }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {group.items.map(alert => (
                                        <div key={alert.id} style={{ ...glass(meta.color), overflow: 'hidden' }}>
                                            <div style={{ background: meta.grad, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', flexShrink: 0 }}>{meta.icon}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.title}</div>
                                                </div>
                                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', flexShrink: 0 }}>{alert.time}</span>
                                            </div>
                                            <div style={{ padding: '10px 14px' }}>
                                                <p style={{ margin: 0, fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{alert.message}</p>
                                                {alert.fileName && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <span style={{ fontSize: 10, color: meta.color, background: meta.badge, padding: '2px 8px', borderRadius: 5 }}>📄 {alert.fileName}</span>
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
    );
};

// ── VueAgentView ───────────────────────────────────────────────────────────────
const VueAgentView: React.FC<{ kpis: KpiCard[]; timeline: TimelineEvent[]; activities: TodayActivity[] }> = ({ kpis, timeline, activities }) => {
    const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isSofiaTyping, setIsSofiaTyping] = useState(true);
    const [sofiaTyped, setSofiaTyped] = useState('');
    const [sofiaQueue] = useState(ROOT_SOFIA_MSGS);
    const [sofiaIdx, setSofiaIdx] = useState(0);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isSofiaTyping || sofiaIdx >= sofiaQueue.length) return;
        const target = sofiaQueue[sofiaIdx];
        if (sofiaTyped.length < target.length) {
            const t = setTimeout(() => setSofiaTyped(target.slice(0, sofiaTyped.length + 1)), 14);
            return () => clearTimeout(t);
        } else {
            const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            setChatMsgs(prev => [...prev, { id: `s${Date.now()}`, from: 'sofia', text: target, time: now }]);
            const nextIdx = sofiaIdx + 1;
            setSofiaIdx(nextIdx);
            setSofiaTyped('');
            if (nextIdx >= sofiaQueue.length) setIsSofiaTyping(false);
        }
    }, [isSofiaTyping, sofiaTyped, sofiaIdx, sofiaQueue]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs, sofiaTyped]);

    const sendMsg = () => {
        if (!userInput.trim()) return;
        const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setChatMsgs(prev => [...prev, { id: `u${Date.now()}`, from: 'user', text: userInput.trim(), time: now }]);
        setUserInput('');
        setIsSofiaTyping(true);
        setSofiaTyped('');
        setSofiaIdx(0);
    };

    return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                {kpis.map(k => (
                    <div key={k.id} style={{ ...glass(k.color), padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{k.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{k.value}</div>
                        <div style={{ fontSize: 10, color: k.color }}>{k.sub}</div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${k.color},${k.color}40)`, borderRadius: '0 0 14px 14px' }} />
                    </div>
                ))}
            </div>
            {/* 3 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {/* Timeline */}
                <div style={{ ...glass('#0d9394'), padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Timeline</div>
                    <div style={{ position: 'relative', paddingLeft: 20 }}>
                        <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
                        {timeline.map((ev, i) => {
                            const m = TL_META[ev.type] || { icon: '●', color: '#6b7280' };
                            return (
                                <div key={ev.id} style={{ position: 'relative', marginBottom: i < timeline.length - 1 ? 14 : 0 }}>
                                    <div style={{ position: 'absolute', left: -16, top: 2, width: 16, height: 16, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', fontWeight: 700 }}>{m.icon}</div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{ev.label}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{ev.desc}</div>
                                    <div style={{ fontSize: 9, color: m.color, marginTop: 2 }}>{ev.time}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Activity */}
                <div style={{ ...glass('#22c55e'), padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Activité du jour</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {activities.map(act => {
                            const meta = ACTIVITY_META[act.action];
                            return (
                                <div key={act.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{meta.label.slice(0, 2)}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.fileName}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{act.folder} · {act.user}</div>
                                        <div style={{ fontSize: 9, color: meta.color, marginTop: 1 }}>{act.time} · {meta.label}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Sofia mini-chat */}
                <div style={{ ...glass('#0d9394'), display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(13,147,148,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>Sofia</div>
                            <div style={{ fontSize: 9, color: '#22c55e' }}>● En ligne</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280 }}>
                        {chatMsgs.map(msg => (
                            <div key={msg.id} style={{ animation: 'drv-fadein 0.3s ease-out', display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 5 }}>
                                {msg.from === 'sofia' && <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(13,147,148,0.15)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🤖</div>}
                                <div style={{ maxWidth: '80%', padding: '7px 9px', borderRadius: msg.from === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: msg.from === 'user' ? 'var(--primary)' : 'var(--bg2)', border: msg.from === 'sofia' ? '1px solid var(--border)' : 'none' }}>
                                    <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: msg.from === 'user' ? 'white' : 'var(--text)' }}>{msg.text}</p>
                                    <span style={{ fontSize: 9, color: msg.from === 'user' ? 'rgba(255,255,255,0.65)' : 'var(--text3)', marginTop: 2, display: 'block' }}>{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        {isSofiaTyping && (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(13,147,148,0.15)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                                <div style={{ padding: '7px 9px', borderRadius: '10px 10px 10px 2px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                                    {sofiaTyped
                                        ? <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: 'var(--text)' }}>{sofiaTyped}<span style={{ animation: 'drv-blink 1s step-start infinite' }}>|</span></p>
                                        : <div style={{ display: 'flex', gap: 3, padding: '2px 0' }}>{[1,2,3].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text3)', animation: `drv-dot${i} 1.2s ease-in-out infinite` }} />)}</div>
                                    }
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 5, flexShrink: 0 }}>
                        <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Demander à Sofia…" style={{ flex: 1, height: 30, padding: '0 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 11 }} />
                        <button onClick={sendMsg} style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--primary)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── DetailsView (preserves existing drive browser) ─────────────────────────────
const DetailsView: React.FC = () => {
    const [selectedFolder, setSelectedFolder] = useState<DriveFolder>(mockFolders[0]);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [search, setSearch] = useState('');
    const [rightTab, setRightTab] = useState<'fichiers' | 'partages' | 'favoris'>('fichiers');
    const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isSofiaTyping, setIsSofiaTyping] = useState(false);
    const [sofiaTyped, setSofiaTyped] = useState('');
    const [sofiaQueue, setSofiaQueue] = useState<string[]>([]);
    const [sofiaIdx, setSofiaIdx] = useState(0);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const visibleFiles = useMemo(() => {
        let files: DriveFile[] = [];
        if (selectedFolder.id === 'root') { files = mockFiles; }
        else {
            const childIds = mockFolders.filter(f => f.parentId === selectedFolder.id).map(f => f.id);
            files = mockFiles.filter(f => f.folderId === selectedFolder.id || childIds.includes(f.folderId));
        }
        if (rightTab === 'partages') files = files.filter(f => f.shared);
        if (rightTab === 'favoris') files = files.filter(f => f.starred);
        if (search.trim()) files = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
        return files;
    }, [selectedFolder, search, rightTab]);

    const rootFolders = mockFolders.filter(f => f.parentId === 'root');

    useEffect(() => {
        const msgs = FOLDER_MSGS[selectedFolder.id] || ROOT_SOFIA_MSGS;
        setSofiaQueue(msgs); setSofiaIdx(0); setChatMsgs([]); setIsSofiaTyping(true); setSofiaTyped('');
    }, [selectedFolder.id]);

    useEffect(() => {
        if (!isSofiaTyping || sofiaIdx >= sofiaQueue.length) return;
        const target = sofiaQueue[sofiaIdx];
        if (sofiaTyped.length < target.length) {
            const t = setTimeout(() => setSofiaTyped(target.slice(0, sofiaTyped.length + 1)), 14);
            return () => clearTimeout(t);
        } else {
            const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            setChatMsgs(prev => [...prev, { id: `s${Date.now()}`, from: 'sofia', text: target, time: now }]);
            const nextIdx = sofiaIdx + 1; setSofiaIdx(nextIdx); setSofiaTyped('');
            if (nextIdx >= sofiaQueue.length) setIsSofiaTyping(false);
        }
    }, [isSofiaTyping, sofiaTyped, sofiaIdx, sofiaQueue]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs, sofiaTyped]);

    const sendMsg = () => {
        if (!userInput.trim()) return;
        const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        setChatMsgs(prev => [...prev, { id: `u${Date.now()}`, from: 'user', text: userInput.trim(), time: now }]);
        setUserInput(''); setIsSofiaTyping(true); setSofiaTyped('');
        setSofiaQueue(["Je recherche dans vos documents… Un instant.", "Voici ce que j'ai trouvé dans votre espace Drive. Souhaitez-vous affiner la recherche ?"]);
        setSofiaIdx(0);
    };

    const toggleFolder = (id: string) => {
        setExpandedFolders(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '8px 14px', fontSize: 12, fontWeight: active ? 600 : 400,
        color: active ? 'var(--primary)' : 'var(--text3)', background: 'none', border: 'none',
        cursor: 'pointer', borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
    });

    return (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Folder tree */}
            <div style={{ width: 200, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
                <div style={{ padding: '12px 12px 4px', fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>Mon Drive</div>
                <button onClick={() => setSelectedFolder(mockFolders[0])} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: selectedFolder.id === 'root' ? 'rgba(13,147,148,0.08)' : 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderLeft: selectedFolder.id === 'root' ? '2px solid var(--primary)' : '2px solid transparent' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={selectedFolder.id === 'root' ? '#0d9394' : 'var(--text3)'} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span style={{ fontSize: 12, color: selectedFolder.id === 'root' ? 'var(--primary)' : 'var(--text)', fontWeight: selectedFolder.id === 'root' ? 600 : 400 }}>Tous les fichiers</span>
                </button>
                {rootFolders.map(folder => {
                    const children = mockFolders.filter(f => f.parentId === folder.id);
                    const expanded = expandedFolders.has(folder.id);
                    const isSelected = selectedFolder.id === folder.id;
                    return (
                        <div key={folder.id}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {children.length > 0 && (
                                    <button onClick={() => toggleFolder(folder.id)} style={{ width: 18, height: 28, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 9, paddingLeft: 8, flexShrink: 0 }}>
                                        {expanded ? '▼' : '▶'}
                                    </button>
                                )}
                                <button onClick={() => setSelectedFolder(folder)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: `7px ${children.length ? 4 : 12}px 7px ${children.length ? 2 : 12}px`, background: isSelected ? 'rgba(13,147,148,0.08)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: isSelected ? '2px solid var(--primary)' : '2px solid transparent' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill={isSelected ? '#0d939430' : 'var(--border)'} stroke={isSelected ? '#0d9394' : 'var(--text3)'} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                    <span style={{ fontSize: 12, color: isSelected ? 'var(--primary)' : 'var(--text)', fontWeight: isSelected ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>{folder.fileCount}</span>
                                </button>
                            </div>
                            {expanded && children.map(child => {
                                const isSel = selectedFolder.id === child.id;
                                return (
                                    <button key={child.id} onClick={() => setSelectedFolder(child)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px 6px 28px', background: isSel ? 'rgba(13,147,148,0.08)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: isSel ? '2px solid var(--primary)' : '2px solid transparent' }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill={isSel ? '#0d939430' : 'none'} stroke={isSel ? '#0d9394' : 'var(--text3)'} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                        <span style={{ fontSize: 11, color: isSel ? 'var(--primary)' : 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{child.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
                <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>Stockage utilisé</div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ width: '47%', height: '100%', background: '#0d9394', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>234 MB / 500 MB</div>
                </div>
            </div>

            {/* File browser */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text3)', minWidth: 0 }}>
                        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setSelectedFolder(mockFolders[0])}>Drive</span>
                        {selectedFolder.id !== 'root' && (<><span>/</span><span style={{ color: 'var(--text)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedFolder.name}</span></>)}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" style={{ height: 32, paddingLeft: 28, paddingRight: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 12, width: 160 }} />
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </div>
                    <div style={{ display: 'flex', gap: 2, background: 'var(--bg2)', borderRadius: 6, padding: 2 }}>
                        {(['list', 'grid'] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)} style={{ width: 28, height: 28, borderRadius: 4, border: 'none', cursor: 'pointer', background: viewMode === v ? 'var(--primary)' : 'none', color: viewMode === v ? 'white' : 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {v === 'list'
                                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                                    : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                                }
                            </button>
                        ))}
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', background: 'var(--primary)', border: 'none', borderRadius: 6, cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 500 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Importer
                    </button>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px', flexShrink: 0 }}>
                    {(['fichiers', 'partages', 'favoris'] as const).map(t => (
                        <button key={t} onClick={() => setRightTab(t)} style={tabStyle(rightTab === t)}>
                            {t === 'fichiers' ? `Fichiers (${visibleFiles.length})` : t === 'partages' ? 'Partagés' : '★ Favoris'}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                    {viewMode === 'list' ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
                                    {['Nom', 'Taille', 'Modifié le', 'Modifié par', ''].map(h => (
                                        <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 500, fontSize: 11 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {visibleFiles.map(file => (
                                    <tr key={file.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                        <td style={{ padding: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <FileTypeIcon type={file.type} />
                                                <div>
                                                    <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                                                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                                                        {file.shared && <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '1px 5px', borderRadius: 3, marginRight: 4 }}>Partagé</span>}
                                                        {file.starred && <span style={{ color: '#f59e0b' }}>★</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '8px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{file.size}</td>
                                        <td style={{ padding: '8px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtDate(file.updatedAt)}</td>
                                        <td style={{ padding: '8px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{file.updatedBy}</td>
                                        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button style={{ width: 26, height: 26, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Télécharger">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                </button>
                                                <button style={{ width: 26, height: 26, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Partager">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                                </button>
                                                <button style={{ width: 26, height: 26, borderRadius: 4, border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Supprimer">
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6"/><path d="M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {visibleFiles.length === 0 && (
                                    <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>Aucun fichier trouvé</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                            {visibleFiles.map(file => (
                                <div key={file.id} style={{ background: 'var(--bg2)', borderRadius: 10, padding: 12, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}
                                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
                                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}><FileTypeIcon type={file.type} /></div>
                                    <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 500, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.name}>{file.name}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>{file.size}</div>
                                </div>
                            ))}
                            {visibleFiles.length === 0 && (
                                <div style={{ gridColumn: '1/-1', padding: '32px', textAlign: 'center', color: 'var(--text3)' }}>Aucun fichier trouvé</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Sofia chat */}
            <div style={{ width: 280, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(13,147,148,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Sofia</div>
                        <div style={{ fontSize: 10, color: '#22c55e' }}>● En ligne</div>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {chatMsgs.map(msg => (
                        <div key={msg.id} style={{ animation: 'drv-fadein 0.3s ease-out', display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6 }}>
                            {msg.from === 'sofia' && <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(13,147,148,0.15)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🤖</div>}
                            <div style={{ maxWidth: '78%', padding: '8px 10px', borderRadius: msg.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: msg.from === 'user' ? 'var(--primary)' : 'var(--bg2)', border: msg.from === 'sofia' ? '1px solid var(--border)' : 'none' }}>
                                <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.5, color: msg.from === 'user' ? 'white' : 'var(--text)' }}>{msg.text}</p>
                                <span style={{ fontSize: 9, color: msg.from === 'user' ? 'rgba(255,255,255,0.65)' : 'var(--text3)', marginTop: 3, display: 'block' }}>{msg.time}</span>
                            </div>
                        </div>
                    ))}
                    {isSofiaTyping && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(13,147,148,0.15)', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                            <div style={{ maxWidth: '78%', padding: '8px 10px', borderRadius: '12px 12px 12px 2px', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                                {sofiaTyped
                                    ? <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.5, color: 'var(--text)' }}>{sofiaTyped}<span style={{ animation: 'drv-blink 1s step-start infinite' }}>|</span></p>
                                    : <div style={{ display: 'flex', gap: 3, padding: '2px 0' }}>{[1,2,3].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', animation: `drv-dot${i} 1.2s ease-in-out infinite` }} />)}</div>
                                }
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
                    <input value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Demander à Sofia…" style={{ flex: 1, height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 12 }} />
                    <button onClick={sendMsg} style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--primary)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────
export const DriveChatModal: React.FC<{ open: boolean; agent: any; agentId?: string; onClose: () => void }> = ({ open, onClose }) => {
    const [tab, setTab] = useState<'alertes' | 'vue' | 'details'>('alertes');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [hoverToggle, setHoverToggle] = useState(false);

    if (!open) return null;

    const urgentCount = mockPriorities.filter(p => p.urgency === 'haute').length;

    const NAV = [
        { id: 'alertes' as const, icon: '🔔', label: 'Alertes & Priorités', badge: urgentCount > 0 ? String(urgentCount) : null, badgeColor: '#ef4444' },
        { id: 'vue'     as const, icon: '⬡',  label: 'Vue Agent',           badge: null,                                         badgeColor: '' },
        { id: 'details' as const, icon: '☰',  label: 'Référentiel',             badge: String(mockFolders[0].fileCount),              badgeColor: '#0d9394' },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1300, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
            <style>{CSS}</style>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 12, flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(13,147,148,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9394" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Agent Drive</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Gestion documentaire intelligente</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>Santé</div>
                        <div style={{ width: 80, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                            <div style={{ width: '88%', height: '100%', background: 'linear-gradient(90deg,#22c55e,#0d9394)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>88%</span>
                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>2 erreurs · 48 fichiers</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 11, color: '#22c55e' }}>Sofia connectée</span>
                    </div>
                    <button onClick={onClose} style={{ marginLeft: 8, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Collapsible sidebar */}
                    <div style={{ width: sidebarOpen ? 200 : 58, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.25s ease', overflow: 'hidden' }}>
                        {/* Toggle */}
                        <div style={{ padding: sidebarOpen ? '10px 12px' : '10px 8px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: sidebarOpen ? 'flex-end' : 'center' }}>
                            <button
                                onClick={() => setSidebarOpen(v => !v)}
                                onMouseEnter={() => setHoverToggle(true)}
                                onMouseLeave={() => setHoverToggle(false)}
                                style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: hoverToggle ? 'var(--bg2)' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}
                                title={sidebarOpen ? 'Réduire' : 'Agrandir'}
                            >
                                {sidebarOpen
                                    ? <Icons.ChevronLeft width={14} height={14} color="var(--text3)" />
                                    : <Icons.ChevronRight width={14} height={14} color="var(--text3)" />
                                }
                            </button>
                        </div>

                        {/* Nav items */}
                        <div style={{ flex: 1, padding: '8px 0' }}>
                            {NAV.map(item => {
                                const isActive = tab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setTab(item.id)}
                                        title={!sidebarOpen ? item.label : undefined}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                            padding: sidebarOpen ? '9px 14px' : '9px 0', justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                            background: isActive ? 'rgba(13,147,148,0.08)' : 'none',
                                            border: 'none', cursor: 'pointer', textAlign: 'left',
                                            borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                                        }}
                                    >
                                        <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                                        {sidebarOpen && (
                                            <>
                                                <span style={{ fontSize: 12, color: isActive ? 'var(--primary)' : 'var(--text)', fontWeight: isActive ? 600 : 400, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                                                {item.badge && (
                                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: item.badgeColor, color: 'white', flexShrink: 0 }}>{item.badge}</span>
                                                )}
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sofia status */}
                        <div style={{ padding: sidebarOpen ? '12px' : '8px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(13,147,148,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>
                                {sidebarOpen && (
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>Sofia</div>
                                        <div style={{ fontSize: 10, color: '#22c55e' }}>● En ligne</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                        {tab === 'alertes' && <AlertesView priorities={mockPriorities} alerts={mockAlerts} />}
                        {tab === 'vue'     && <VueAgentView kpis={mockKpis} timeline={mockTimeline} activities={mockActivity} />}
                        {tab === 'details' && <DetailsView />}
                    </div>
                </div>
            </div>
        </div>
    );
};
