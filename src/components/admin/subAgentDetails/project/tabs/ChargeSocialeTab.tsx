'use client';
import React, { useState } from 'react';
import * as Icons from '../../../../../assets/icons';
import { fmtCurrency, statusBadge, TableWrap, TdRow, ActionBtn, Pagination, SearchBar } from '../shared';
import type { ChargeSociale } from '../types';

export const ChargeSocialeTab: React.FC<{ chargesSociales: ChargeSociale[] }> = ({ chargesSociales }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const ROW = 10;

  const filtered = chargesSociales.filter(c =>
    !search || c.nameConsultant.toLowerCase().includes(search.toLowerCase()) || c.typeChargeSocial.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice(page * ROW, (page + 1) * ROW);

  return (
    <>
      <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} />
      <TableWrap headers={['Consultant', 'Type', 'Montant', 'Période', 'Statut', 'Paiement', 'Actions']} empty={filtered.length === 0}>
        {paged.map((c, i) => (
          <TdRow key={c.id} last={i === paged.length - 1}>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{c.nameConsultant}</span></td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                {c.typeChargeSocial.replace('_', ' ')}
              </span>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text)' }}>{fmtCurrency(c.montant)}</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{c.periode}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(c.status)}</td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(c.statusPayement)}</td>
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
