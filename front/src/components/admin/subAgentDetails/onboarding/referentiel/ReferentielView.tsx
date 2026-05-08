'use client';
import React, { useState } from 'react';
import { TYPE_META } from '../constants';
import { ClientTable } from './ClientTable';
import { FournisseurTable } from './FournisseurTable';
import { ContactTable } from './ContactTable';
import { SalarieTable } from './SalarieTable';

type Tab = 'CLIENT' | 'FOURNISSEUR' | 'CONTACT' | 'SALARIE';

const TABS: { key: Tab; label: string }[] = [
  { key: 'CLIENT',      label: 'Clients' },
  { key: 'FOURNISSEUR', label: 'Fournisseurs' },
  { key: 'CONTACT',     label: 'Contacts' },
  { key: 'SALARIE',     label: 'Salariés' },
];

export const ReferentielView: React.FC = () => {
  const [tab, setTab] = useState<Tab>('CLIENT');
  const C = TYPE_META[tab];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0, padding: '0 14px' }}>
        {TABS.map(t => {
          const m = TYPE_META[t.key];
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: active ? 700 : 500, color: active ? m.color : 'var(--text2)', borderBottom: active ? `2px solid ${m.color}` : '2px solid transparent', transition: 'color 0.15s', whiteSpace: 'nowrap' }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tab === 'CLIENT'      && <ClientTable />}
      {tab === 'FOURNISSEUR' && <FournisseurTable />}
      {tab === 'CONTACT'     && <ContactTable />}
      {tab === 'SALARIE'     && <SalarieTable />}
    </div>
  );
};
