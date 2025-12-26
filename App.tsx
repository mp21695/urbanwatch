
import React, { useState, useEffect, useCallback } from 'react';
import { Complaint, TransparencyArticle, UserRole, User } from './types';
import { AREAS } from './constants';
import Dashboard from './components/Dashboard';
import ComplaintForm from './components/ComplaintForm';
import ComplaintList from './components/ComplaintList';
import TransparencyPortal from './components/TransparencyPortal';
import TrackingPortal from './components/TrackingPortal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { generateTransparencyReport } from './services/geminiService';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [articles, setArticles] = useState<TransparencyArticle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{ active: boolean; label: string; progress: number } | null>(null);

  useEffect(() => {
    const handleSyncEvent = (e: any) => {
      const { action, duration } = e.detail;
      if (duration > 0) {
        setSyncStatus({ active: true, label: action, progress: 0 });
        let start = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - start;
          const p = Math.min((elapsed / duration) * 100, 100);
          setSyncStatus(prev => prev ? { ...prev, progress: p } : null);
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setSyncStatus(null), 300);
          }
        }, 30);
      }
    };

    window.addEventListener('storage-sync-start', handleSyncEvent);
    
    const loadData = async () => {
      setIsLoading(true);
      await storageService.initCollection();
      
      const [storedComplaints, storedArticles] = await Promise.all([
        storageService.getComplaints(),
        storageService.getArticles()
      ]);

      if (storedComplaints.length === 0) {
        const seed: Complaint = {
          id: 'UW-882731',
          issueType: 'streetlight',
          location: 'GST Road Junction',
          area: AREAS[0],
          description: 'Entire block is dark for 3 days.',
          timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000),
          status: 'pending',
          slaHours: 72,
          progress: [{ stage: 'submitted', timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000), completed: true }]
        };
        await storageService.saveComplaint(seed);
        setComplaints([seed]);
      } else {
        setComplaints(storedComplaints);
      }
      
      setArticles(storedArticles);
      setIsLoading(false);
    };

    loadData();
    return () => window.removeEventListener('storage-sync-start', handleSyncEvent);
  }, []);

  const monitorBreaches = useCallback(async () => {
    if (isGenerating || isLoading) return;
    
    const overdue = complaints.filter(c => {
      const hoursPassed = (Date.now() - c.timestamp) / (1000 * 60 * 60);
      return hoursPassed > c.slaHours && c.status === 'pending';
    });

    if (overdue.length === 0) return;

    const grouping: Record<string, Complaint[]> = {};
    overdue.forEach(c => {
      const key = `${c.area}|${c.issueType}`;
      if (!grouping[key]) grouping[key] = [];
      grouping[key].push(c);
    });

    for (const [key, group] of Object.entries(grouping)) {
      const [area, issueType] = key.split('|');
      const articleExists = articles.find(a => a.area === area && a.issueType === issueType);
      
      if (!articleExists) {
        setIsGenerating(true);
        try {
          const content = await generateTransparencyReport(area, issueType, group);
          const newArticle: TransparencyArticle = {
            id: `ART-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: `Report: Service Delay in ${area}`,
            content: content || "No report generated.",
            date: Date.now(),
            area: area,
            issueType: issueType,
            breachCount: group.length,
            isAiGenerated: true
          };
          await storageService.saveArticle(newArticle);
          setArticles(prev => [newArticle, ...prev]);
        } catch (err) {
          console.error(err);
        } finally {
          setIsGenerating(false);
        }
      }
    }
  }, [complaints, articles, isGenerating, isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      monitorBreaches();
    }, 5000);
    return () => clearTimeout(timer);
  }, [monitorBreaches]);

  const addComplaint = async (newComplaint: Complaint) => {
    await storageService.saveComplaint(newComplaint);
    setComplaints(prev => [newComplaint, ...prev]);
    setActiveTab('tracking');
  };

  const updateComplaintStatus = async (id: string, stageId: string) => {
    const isResolved = stageId === 'resolved';
    const updates = {
      status: isResolved ? 'resolved' : 'pending' as any,
    };
    
    const currentComplaint = complaints.find(c => c.id === id);
    if (!currentComplaint) return;

    const newProgress = [...currentComplaint.progress, { stage: stageId, timestamp: Date.now(), completed: true }];
    
    await storageService.updateComplaint(id, { ...updates, progress: newProgress });
    
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, ...updates, progress: newProgress };
      }
      return c;
    }));
  };

  const loginAs = (role: UserRole) => {
    setUser({
      id: role === UserRole.ADMIN ? 'admin-1' : 'citizen-1',
      username: role === UserRole.ADMIN ? 'UrbanAdmin' : 'CitizenUser',
      role: role
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing GCloud Registry...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-indigo-500 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/50">🏙️</div>
            <h1 className="text-4xl font-black text-white tracking-tight">UrbanWatch</h1>
            <p className="text-slate-400 text-lg">Integrated Civic Accountability Portal</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => loginAs(UserRole.CITIZEN)} className="group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10 text-left transition-all hover:-translate-y-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl">🙋‍♂️</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Citizen</span>
              </div>
              <h3 className="text-xl font-bold text-white">Citizen Access</h3>
            </button>
            <button onClick={() => loginAs(UserRole.ADMIN)} className="group bg-white/5 hover:bg-white/10 p-6 rounded-3xl border border-white/10 text-left transition-all hover:-translate-y-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl">🏢</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Authority</span>
              </div>
              <h3 className="text-xl font-bold text-white">Registry Management</h3>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 relative">
      {/* Strategic Delay UI Overlay */}
      {syncStatus?.active && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] flex items-end justify-center pb-12 pointer-events-none">
          <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">GCloud Propagation</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">RTT: {Math.round(syncStatus.progress * 12)}ms</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${syncStatus.progress}%` }}></div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Syncing: {syncStatus.label}...</p>
          </div>
        </div>
      )}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={user.role} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={() => setUser(null)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard complaints={complaints} articles={articles} />}
            {activeTab === 'submit' && <ComplaintForm onSubmit={addComplaint} />}
            {activeTab === 'complaints' && <ComplaintList complaints={complaints} isAdmin={user.role === UserRole.ADMIN} onUpdate={updateComplaintStatus} />}
            {activeTab === 'transparency' && <TransparencyPortal articles={articles} isGenerating={isGenerating} />}
            {activeTab === 'tracking' && <TrackingPortal complaints={complaints} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
