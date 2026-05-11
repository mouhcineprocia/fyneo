'use client';
import React from 'react';
import * as Icons from '../../../../../assets/icons';
import { fmtDate, getFileIcon } from '../shared';
import type { Fichier } from '../types';

export const FichiersTab: React.FC<{ fichiers: Fichier[] }> = ({ fichiers }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
    {fichiers.map(f => (
      <div key={f.id} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 28, textAlign: 'center' }}>{getFileIcon(f.fileType)}</div>
        <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, color: 'var(--text)', textAlign: 'center', wordBreak: 'break-all' }}>{f.fileName}{f.fileType}</p>
        <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text3)', textAlign: 'center' }}>{f.size} · {fmtDate(f.uploadDate)}</p>
        <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text3)', textAlign: 'center' }}>Par {f.uploadedBy}</p>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          <button style={{ flex: 1, fontSize: '0.65rem', padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)', backgroundColor: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Icons.Eye style={{ width: 11, height: 11 }} /> Voir
          </button>
          <button style={{ flex: 1, fontSize: '0.65rem', padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)', backgroundColor: 'var(--bg2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Icons.Download style={{ width: 11, height: 11 }} /> DL
          </button>
        </div>
      </div>
    ))}
    <div style={{ backgroundColor: 'transparent', border: '2px dashed var(--border)', borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 160 }}>
      <Icons.Plus style={{ width: 24, height: 24, color: 'var(--text3)' }} />
      <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text3)', textAlign: 'center' }}>Ajouter un fichier</p>
    </div>
  </div>
);
