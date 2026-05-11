'use client';
import React, { useState } from 'react';
import * as Icons from '../../../../../assets/icons';
import type { Commentaire } from '../types';

export const CommentairesTab: React.FC<{ initialComments: Commentaire[] }> = ({ initialComments }) => {
  const [comments, setComments] = useState<Commentaire[]>(initialComments);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setComments(prev => [{ id: `cm${Date.now()}`, username: 'Mouhcine', commentaire: input.trim(), time: "À l'instant" }, ...prev]);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#0d9394', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 11 }}>M</span>
        </div>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
          placeholder="Ajouter un commentaire..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text)', fontSize: '0.72rem', outline: 'none' }}
        />
        <button onClick={add} disabled={!input.trim()}
          style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: input.trim() ? 'pointer' : 'default', backgroundColor: input.trim() ? '#0d9394' : 'var(--bg2)', color: input.trim() ? 'white' : 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icons.Send style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {comments.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: 'rgba(13,147,148,0.1)', border: '1px solid rgba(13,147,148,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9394' }}>{c.username.charAt(0).toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0 8px 8px 8px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{c.username}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text3)' }}>{c.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text2)', lineHeight: 1.5 }}>{c.commentaire}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
