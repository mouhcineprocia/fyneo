'use client';
import React from 'react';
import { useLang } from '../../contexts/LangContext';
import {
  FileText, Users, Clock, DollarSign, TrendingUp, TrendingDown,
  Plus, Search, Filter, Download, Eye, CheckCircle, AlertCircle,
} from '../../assets/icons';

const invoices = [
  { id: 'INV-2024-089', client: 'TechCorp SAS', amount: '2 400,00 €', status: 'paid', date: '15 jan. 2024', type: 'Client' },
  { id: 'INV-2024-088', client: 'Acme Distribution', amount: '5 820,00 €', status: 'pending', date: '14 jan. 2024', type: 'Client' },
  { id: 'INV-2024-087', client: 'TechParts Inc.', amount: '1 200,00 €', status: 'overdue', date: '10 jan. 2024', type: 'Fournisseur' },
  { id: 'INV-2024-086', client: 'Cabinet Moreau', amount: '3 600,00 €', status: 'paid', date: '08 jan. 2024', type: 'Consultant' },
  { id: 'INV-2024-085', client: 'BNP Paribas', amount: '780,00 €', status: 'draft', date: '06 jan. 2024', type: 'Banque' },
  { id: 'INV-2024-084', client: 'Nexity Group', amount: '9 100,00 €', status: 'paid', date: '03 jan. 2024', type: 'Client' },
  { id: 'INV-2024-083', client: 'Schneider Electric', amount: '4 450,00 €', status: 'pending', date: '02 jan. 2024', type: 'Fournisseur' },
];

const statusConfig: Record<string, { color: string; bg: string; label: Record<string, string> }> = {
  paid:    { color: 'var(--success)', bg: 'var(--successL)', label: { fr: 'Payée', en: 'Paid' } },
  pending: { color: 'var(--warn)',    bg: 'var(--warnL)',    label: { fr: 'En attente', en: 'Pending' } },
  overdue: { color: 'var(--danger)', bg: 'var(--dangerL)', label: { fr: 'En retard', en: 'Overdue' } },
  draft:   { color: 'var(--text3)',  bg: 'var(--border)',   label: { fr: 'Brouillon', en: 'Draft' } },
};

export const Dashboard: React.FC = () => {
  const { t, lang } = useLang();

  const stats = [
    {
      title: t('totalInvoices'),
      value: '1 247',
      trend: '+12%',
      trendUp: true,
      sub: t('vsLastMonth'),
      icon: <FileText width={16} height={16} />,
      color: 'var(--primary)',
      bg: 'var(--primaryL)',
    },
    {
      title: t('totalRevenue'),
      value: '128 450 €',
      trend: '+8.3%',
      trendUp: true,
      sub: t('vsLastMonth'),
      icon: <DollarSign width={16} height={16} />,
      color: 'var(--success)',
      bg: 'var(--successL)',
    },
    {
      title: t('activeClients'),
      value: '89',
      trend: '+3',
      trendUp: true,
      sub: t('newThisMonth'),
      icon: <Users width={16} height={16} />,
      color: 'var(--info)',
      bg: 'var(--infoL)',
    },
    {
      title: t('pendingPayments'),
      value: '24 300 €',
      trend: '8',
      trendUp: false,
      sub: t('invoicesPending'),
      icon: <Clock width={16} height={16} />,
      color: 'var(--warn)',
      bg: 'var(--warnL)',
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-bold text-base" style={{ color: 'var(--text)' }}>{t('dashboard')}</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{t('aiPlatform')}</p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
          style={{ background: 'var(--primary)', color: 'white' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primaryH)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
        >
          <Plus width={13} height={13} />
          {t('generateInvoice')}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text3)' }}>{s.title}</p>
              <div
                className="flex items-center justify-center rounded"
                style={{ width: 30, height: 30, background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{s.value}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {s.trendUp
                ? <TrendingUp width={12} height={12} style={{ color: 'var(--success)' }} />
                : <TrendingDown width={12} height={12} style={{ color: 'var(--warn)' }} />
              }
              <span className="text-xs font-semibold" style={{ color: s.trendUp ? 'var(--success)' : 'var(--warn)' }}>
                {s.trend}
              </span>
              <span className="text-xs" style={{ color: 'var(--text3)' }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent invoices table */}
      <div className="glass-card">
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t('recentInvoices')}</h2>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded"
              style={{ background: 'var(--border)', color: 'var(--text3)' }}
            >
              <Search width={12} height={12} />
              <span className="text-xs">{lang === 'fr' ? 'Rechercher…' : 'Search…'}</span>
            </div>
            <button
              className="flex items-center justify-center rounded transition-colors"
              style={{ width: 28, height: 28, background: 'var(--border)', color: 'var(--text3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
            >
              <Filter width={12} height={12} />
            </button>
            <button
              className="flex items-center justify-center rounded transition-colors"
              style={{ width: 28, height: 28, background: 'var(--border)', color: 'var(--text3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
            >
              <Download width={12} height={12} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[t('invoiceNumber'), t('client'), 'Type', t('amount'), t('status'), t('date'), ''].map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-2.5 text-xs font-semibold whitespace-nowrap"
                    style={{ color: 'var(--text3)', background: 'transparent' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => {
                const st = statusConfig[inv.status];
                return (
                  <tr
                    key={inv.id}
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: i < invoices.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(89,140,96,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--primary)' }}>{inv.id}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--text)' }}>{inv.client}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--border)', color: 'var(--text3)' }}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text)' }}>{inv.amount}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {inv.status === 'paid' && <CheckCircle width={10} height={10} />}
                        {inv.status === 'overdue' && <AlertCircle width={10} height={10} />}
                        {st.label[lang]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--text3)' }}>{inv.date}</td>
                    <td className="px-4 py-2.5">
                      <button
                        className="flex items-center justify-center rounded transition-colors"
                        style={{ width: 24, height: 24, color: 'var(--text3)', background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)'; }}
                      >
                        <Eye width={12} height={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text3)' }}>
            {invoices.length} {lang === 'fr' ? 'résultats affichés' : 'results shown'}
          </span>
          <button
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--primary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primaryH)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--primary)')}
          >
            {t('viewAll')} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
