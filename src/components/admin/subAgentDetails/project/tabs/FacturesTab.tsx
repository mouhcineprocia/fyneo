'use client';
import React, { useState } from 'react';
import * as Icons from '../../../../../assets/icons';
import { fmtCurrency, fmtDate, statusBadge, TableWrap, TdRow, ActionBtn, Pagination, SearchBar } from '../shared';
import type { Facture } from '../types';

export const FacturesTab: React.FC<{ factures: Facture[] }> = ({ factures }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const ROW = 10;

  const filtered = factures.filter(f =>
    !search || f.numeroFacture.toLowerCase().includes(search.toLowerCase()) || f.partnerName.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice(page * ROW, (page + 1) * ROW);

  return (
    <>
      <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} />
      <TableWrap headers={['N° Facture', 'Type', 'Partenaire', 'Montant TTC', 'Date', 'Statut', 'Paiement', 'Actions']} empty={filtered.length === 0}>
        {paged.map((f, i) => (
          <TdRow key={f.id} last={i === paged.length - 1}>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{f.numeroFacture}</span></td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: f.typeFacture.includes('ACHAT') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: f.typeFacture.includes('ACHAT') ? '#ef4444' : '#22c55e' }}>
                {f.typeFacture.replace('FACTURE_', '')}
              </span>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{f.partnerName}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: f.montantTtc < 0 ? '#ef4444' : '#22c55e' }}>{fmtCurrency(f.montantTtc)}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{fmtDate(f.dateFacture)}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(f.status)}</td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(f.statusPayement)}</td>
            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
              <ActionBtn title="Voir" icon={<Icons.Eye style={{ width: 12, height: 12 }} />} />
            </td>
          </TdRow>
        ))}
      </TableWrap>
      <Pagination page={page} setPage={setPage} rowsPerPage={ROW} total={filtered.length} />
    </>
  );
};
