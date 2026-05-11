'use client';
import React, { useState } from 'react';
import * as Icons from '../../../../../assets/icons';
import { statusBadge, TableWrap, TdRow, ActionBtn, Pagination, ProgressBar, SearchBar } from '../shared';
import type { Cra } from '../types';

export const CraTab: React.FC<{ cras: Cra[] }> = ({ cras }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const ROW = 10;

  const filtered = cras.filter(c =>
    !search || c.consultantName.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice(page * ROW, (page + 1) * ROW);

  return (
    <>
      <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} />
      <TableWrap headers={['Consultant', 'Jours travail', 'Présence', 'Absence', 'Taux', 'Période', 'Statut', 'Actions']} empty={filtered.length === 0}>
        {paged.map((c, i) => (
          <TdRow key={c.id} last={i === paged.length - 1}>
            <td style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(13,147,148,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.User style={{ width: 13, height: 13, color: '#0d9394' }} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text)' }}>{c.consultantName}</span>
              </div>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{c.nbrJourTravail} j</span></td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#22c55e' }}>{c.nbrJourPresence} j</span></td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: c.nbrJourAbsence > 2 ? '#ef4444' : 'var(--text2)' }}>
                {c.nbrJourAbsence} j
              </span>
            </td>
            <td style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ProgressBar value={Math.round(c.nbrJourPresence / c.nbrJourTravail * 100)} />
                <span style={{ fontSize: '0.6rem', color: 'var(--text2)', minWidth: 30 }}>{Math.round(c.nbrJourPresence / c.nbrJourTravail * 100)}%</span>
              </div>
            </td>
            <td style={{ padding: '10px 12px' }}><span style={{ fontSize: '0.7rem', color: 'var(--text2)' }}>{c.periode}</span></td>
            <td style={{ padding: '10px 12px' }}>{statusBadge(c.status)}</td>
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
