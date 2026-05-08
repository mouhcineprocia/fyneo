'use client';
import React from 'react';

interface Props {
  total: number;
  page: number;
  pageSize: number;
  onChange: (p: number) => void;
  accent?: string;
}

export const Pagination: React.FC<Props> = ({ total, page, pageSize, onChange, accent = '#0d9394' }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg2)' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
        {from}–{to} <span style={{ color: 'var(--text2)', fontWeight: 600 }}>sur {total}</span>
      </span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >‹</button>

        {visible.map((p, i) => {
          const prev = visible[i - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          return (
            <React.Fragment key={p}>
              {showEllipsis && <span style={{ fontSize: '0.72rem', color: 'var(--text3)', padding: '0 2px' }}>…</span>}
              <button
                onClick={() => onChange(p)}
                style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${page === p ? accent : 'var(--border)'}`, background: page === p ? accent : 'var(--bg)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: page === p ? 700 : 400, color: page === p ? 'white' : 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >{p + 1}</button>
            </React.Fragment>
          );
        })}

        <button
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
          style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.4 : 1, fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >›</button>
      </div>
    </div>
  );
};
