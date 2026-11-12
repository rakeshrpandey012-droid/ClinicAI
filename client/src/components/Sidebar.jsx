import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const [activeLang, setActiveLang] = useState('HI');
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items matching exact HTML wireframes
  const navItems = [
    { label: 'Queue', path: '/queue', icon: 'queue' },
    { label: 'Consult', path: '/consult/674000000000000000000001', icon: 'mic', activePrefix: '/consult' },
    { label: 'History', path: '/history/674000000000000000000001', icon: 'folder_shared', activePrefix: '/history' },
    { label: 'Rx', path: '/rx/674000000000000000000201', icon: 'prescriptions', activePrefix: '/rx' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      {/* 1. Global Top App Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none" 
            onClick={() => navigate('/queue')}
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">local_hospital</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg text-primary leading-tight">ClinicAI</span>
              <span className="text-[11px] text-on-surface-variant font-medium">Intelligent Clinical Copilot</span>
            </div>
          </div>

          {/* OPD Clinic Tag */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-low text-on-surface text-sm font-medium">
            <span className="material-symbols-outlined text-secondary text-[18px]">domain</span>
            <span>Shree Ram Clinic • OPD 3</span>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* EMR Sync Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-low">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
            <span className="text-xs font-semibold text-secondary">EMR Connected • Real-time Sync</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg gap-1">
            {['HI', 'GARH', 'EN'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
                  activeLang === lang
                    ? 'bg-surface-container-lowest text-primary shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Doctor Profile Header */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-on-surface">Dr. Ananya Sen, MD</span>
            <span className="text-[11px] text-on-surface-variant">MCI-28491</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </header>

      {/* 2. Persistent Sidebar Navigation */}
      <aside className="fixed left-0 top-16 bottom-0 w-20 sm:w-24 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex flex-col justify-between py-4 items-center">
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {navItems.map((item) => {
            const isActive = item.activePrefix 
              ? location.pathname.startsWith(item.activePrefix)
              : location.pathname === item.path;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                <span className="text-[11px] font-semibold mt-1">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Utility Link */}
        <div className="flex flex-col items-center w-full px-2">
          <button 
            onClick={() => alert('Analytics Module: 28 patients triaged today, average consult time 7.2 mins.')}
            className="flex flex-col items-center justify-center w-full py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">analytics</span>
            <span className="text-[11px] font-semibold mt-1">Analytics</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Content Wrapper */}
      <div className="pl-20 sm:pl-24 pt-16 min-h-screen w-full flex-1">
        <main className="w-full bg-surface min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
