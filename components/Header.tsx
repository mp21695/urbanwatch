
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  
  useEffect(() => {
    // Detect if running on Firebase Hosting
    if (window.location.hostname.includes('web.app') || window.location.hostname.includes('firebaseapp.com')) {
      setIsLive(true);
    }

    const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    };
    window.addEventListener('storage-sync-start', handleSync);
    return () => window.removeEventListener('storage-sync-start', handleSync);
  }, []);

  const envMode = (import.meta as any).env?.MODE ?? 'preview';

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center space-x-6">
        <div>
          <h2 className="text-sm font-medium text-slate-500">
            {user?.role === UserRole.ADMIN ? 'Authority Access' : 'Good day,'}
          </h2>
          <p className="text-lg font-bold text-slate-900">{user ? user.username : 'Guest User'}</p>
        </div>
        
        {isSyncing ? (
          <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 animate-in fade-in slide-in-from-left-4">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">Syncing Registry...</span>
          </div>
        ) : isLive && (
          <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-in fade-in">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Live Deployment</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="hidden sm:flex items-center space-x-4 pr-4 border-r border-slate-100">
          <div className="text-right mr-2 hidden lg:block">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol</p>
            <p className="text-[10px] font-bold text-slate-600">Vite {envMode.toUpperCase()} v5.0</p>
          </div>

          <div className="relative">
            <button 
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
            >
              <span className="text-xl">🔔</span>
            </button>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-black transition-all group"
        >
          <span>Logout</span>
          <span className="group-hover:translate-x-1 transition-transform">🚪</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
