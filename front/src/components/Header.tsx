'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LangContext';
import { Bell, Sun, Moon, Globe, User, Mail, Settings, LogOut, X, CheckCircle, AlertCircle, Zap } from '../assets/icons';

const AppLogo = ({ theme }: { theme: string }) => (
  <img
    src={theme === 'dark' ? '/mister-logo-dark.png' : '/mister-logo-light.png'}
    alt="mister logo"
    width={110}
    height={110}
    style={{ objectFit: 'contain' }}
  />
);

const iconBtn = 'flex items-center justify-center w-8 h-8 rounded cursor-pointer transition-colors duration-150';

export default function Header() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { id: 1, icon: <Zap width={14} height={14} />, iconColor: 'var(--primary)', bg: 'var(--primaryL)', title: t('notif1Title'), desc: t('notif1Desc'), time: t('notif1Time'), unread: true },
    { id: 2, icon: <CheckCircle width={14} height={14} />, iconColor: 'var(--success)', bg: 'var(--successL)', title: t('notif2Title'), desc: t('notif2Desc'), time: t('notif2Time'), unread: true },
    { id: 3, icon: <AlertCircle width={14} height={14} />, iconColor: 'var(--warn)', bg: 'var(--warnL)', title: t('notif3Title'), desc: t('notif3Desc'), time: t('notif3Time'), unread: false },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
      style={{
        height: 52,
        background: 'var(--header)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* Border overlay — renders on top of logo overflow */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: 70, pointerEvents: 'none' }} />

      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
        <AppLogo theme={theme} />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className={`${iconBtn} gap-1 px-2 text-xs font-semibold`}
          style={{ color: 'var(--text2)', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Change language"
        >
          <Globe width={14} height={14} />
          <span>{lang.toUpperCase()}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={iconBtn}
          style={{ color: 'var(--text2)', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon width={16} height={16} /> : <Sun width={16} height={16} />}
        </button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            className={iconBtn}
            style={{ color: 'var(--text2)', background: 'transparent', position: 'relative' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            title={t('notifications')}
          >
            <Bell width={16} height={16} />
            <span
              className="absolute flex items-center justify-center font-bold"
              style={{
                top: 2, right: 2, width: 14, height: 14, borderRadius: '50%',
                background: 'var(--danger)', color: 'white', fontSize: 9, lineHeight: 1,
              }}
            >
              2
            </span>
          </button>

          {showNotif && (
            <div
              className="my-glass-card"
              style={{ position: 'fixed', top: 85, right: 16, width: 300, zIndex: 9999 }}
            >
              <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="font-semibold text-xs" style={{ color: 'var(--text)' }}>{t('notifications')}</span>
                <div className="flex items-center gap-2">
                  <button className="text-xs" style={{ color: 'var(--primary)' }}>{t('markAllRead')}</button>
                  <button onClick={() => setShowNotif(false)} style={{ color: 'var(--text3)' }}>
                    <X width={14} height={14} />
                  </button>
                </div>
              </div>
              <div>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border)', background: n.unread ? 'rgba(89,140,96,0.03)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                    onMouseLeave={e => (e.currentTarget.style.background = n.unread ? 'rgba(89,140,96,0.03)' : 'transparent')}
                  >
                    <div
                      className="flex items-center justify-center rounded mt-0.5 shrink-0"
                      style={{ width: 26, height: 26, background: n.bg, color: n.iconColor }}
                    >
                      {n.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-xs truncate" style={{ color: 'var(--text)' }}>{n.title}</span>
                        {n.unread && (
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
                        )}
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text2)' }}>{n.desc}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative ml-1" ref={userRef}>
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            className="flex items-center justify-center rounded font-bold text-xs cursor-pointer"
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--primary)', color: 'white',
              border: '2px solid var(--primaryB)',
            }}
            title="Account"
          >
            M
          </button>

          {showUser && (
            <div
              className="my-glass-card"
              style={{ position: 'fixed', top: 80, right: 16, width: 220, zIndex: 9999 }}
            >
              {/* User info */}
              <div className="flex items-center gap-2.5 px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div
                  className="flex items-center justify-center rounded font-bold text-sm shrink-0"
                  style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: 'white' }}
                >
                  M
                </div>
                <div className="min-w-0 cursor-pointer">
                  <p className="font-semibold text-xs truncate" style={{ color: 'var(--text)' }}>Mouhcine</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text3)' }}>mouhcine@mister.ai</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {[
                  { icon: <User width={14} height={14} />, label: t('profile') },
                  { icon: <Mail width={14} height={14} />, label: t('emailSettings') },
                  { icon: <Settings width={14} height={14} />, label: t('settings') },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors cursor-pointer"
                    style={{ color: 'var(--text2)', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: 'var(--text3)' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)' }} className="py-1">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 cursor-pointer text-xs transition-colors"
                  style={{ color: 'var(--danger)', background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--dangerL)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut width={14} height={14} />
                  {t('logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
