'use client';
import React from 'react';
import { fmtCurrency, fmtDate, statusBadge, TableWrap, TdRow } from '../shared';
import type { WalletTransaction } from '../types';

export const WalletTab: React.FC<{ walletTxs: WalletTransaction[] }> = ({ walletTxs }) => {
  const balance = walletTxs.reduce((s, t) => s + t.amount, 0);
  const credit  = walletTxs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const debit   = walletTxs.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 180px', backgroundColor: 'var(--bg)', border: '1px solid rgba(13,147,148,0.3)', borderRadius: 8, padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text3)' }}>Solde actuel</p>
          <p style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 700, color: balance >= 0 ? '#22c55e' : '#ef4444' }}>{fmtCurrency(balance)}</p>
        </div>
        <div style={{ flex: '1 1 140px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text3)' }}>Entrées</p>
          <p style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#22c55e' }}>+{fmtCurrency(credit)}</p>
        </div>
        <div style={{ flex: '1 1 140px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text3)' }}>Sorties</p>
          <p style={{ margin: '4px 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>-{fmtCurrency(debit)}</p>
        </div>
      </div>

      <TableWrap headers={['Description', 'Montant', 'Date', 'Type', 'Statut']}>
        {walletTxs.map((t, i) => (
          <TdRow key={t.id} last={i === walletTxs.length - 1}>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text)' }}>{t.description}</span></td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: t.type === 'credit' ? '#22c55e' : '#ef4444' }}>
                {t.type === 'credit' ? '+' : ''}{fmtCurrency(t.amount)}
              </span>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(t.date)}</span></td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: t.type === 'credit' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: t.type === 'credit' ? '#22c55e' : '#ef4444' }}>
                {t.type === 'credit' ? 'Crédit' : 'Débit'}
              </span>
            </td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(t.status)}</td>
          </TdRow>
        ))}
      </TableWrap>
    </div>
  );
};
