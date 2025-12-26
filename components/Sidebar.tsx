
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { storageService } from '../services/storageService';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userRole }) => {
  const [logs, setLogs] = useState<{id: number, msg: string}[]>([]);
  const [stats, setStats] = useState({ size: '0 KB', records: 0 });

  useEffect(() => {
    const handleSync = (e: any) => {
      const { action, detail } = e.detail;
      const newLog = { 
        id: Date.now(), 
        msg: `${action}: ${typeof detail === 'string' ? detail : 'Object Data'}` 
      };
      setLogs(prev => [newLog, ...prev].slice(0, 5));
      
    };

    window.addEventListener('storage-sync-start', handleSync);
    
    return () => window.removeEventListener('storage-sync-start', handleSync);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'submit', label: 'Submit Case', icon: '📝', hideFor: [UserRole.ADMIN] },
    { id: 'tracking', label: 'Track Issue', icon: '🔍' },
    { id: 'complaints', label: 'All Complaints', icon: '📋' },
    { id: 'transparency', label: 'Transparency', icon: '📰' },
  ];

  const filteredItems = menuItems.filter(item => !item.hideFor || !item.hideFor.includes(userRole));

  return (
    <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-indigo-500 w-10 h-10 rounded-lg flex items-center justify-center text-xl">🏙️</div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">UrbanWatch</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
            {userRole === UserRole.ADMIN ? 'Authority Engine' : 'Civic Accountability'}
          </p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center md:justify-start space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Registry Monitoring HUD */}
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Cloud Registry Logs</p>
        <div className="space-y-2 h-24 overflow-hidden mask-fade-bottom">
          {logs.length === 0 && <p className="text-[10px] text-slate-600 italic">Listening for registry events...</p>}
          {logs.map(log => (
            <div key={log.id} className="text-[9px] font-mono text-emerald-400/80 animate-in fade-in slide-in-from-left-2 truncate">
              <span className="text-slate-600 mr-2">[{new Date(log.id).toLocaleTimeString([], {hour12: false})}]</span>
              {log.msg}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Storage Health</p>
            <span className="text-[10px] font-mono text-indigo-400">{stats.size}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-emerald-500">Sync Active</span>
          </div>
          {userRole === UserRole.ADMIN && (
            <button 
              onClick={() => { if(confirm('Wipe local registry?')) storageService.clearRegistry() }}
              className="w-full mt-2 py-1.5 border border-rose-500/30 text-rose-500 text-[9px] font-black uppercase rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              Hard Reset Database
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
