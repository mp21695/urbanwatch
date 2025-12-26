
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Complaint, TransparencyArticle } from '../types';
import { ISSUE_LABELS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  complaints: Complaint[];
  articles: TransparencyArticle[];
}

const Dashboard: React.FC<DashboardProps> = ({ complaints, articles }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  // Vite Runtime Detection
  const isVite = !!(import.meta as any).env;
  const envMode = (import.meta as any).env?.MODE || 'Preview';
  const isHMR = !!(import.meta as any).hot;
  const apiKey = (process.env as any).API_KEY;

  useEffect(() => {
    let isMounted = true;

    const handleMapError = (e: any) => {
      if (e.message && e.message.includes('google')) {
        if (isMounted) setMapStatus('fallback');
      }
    };
    window.addEventListener('error', handleMapError, true);

    const initMap = () => {
      const g = (window as any).google;
      if (!g || !g.maps || !mapRef.current || !isMounted) return;

      try {
        mapInstanceRef.current = new g.maps.Map(mapRef.current, {
          center: { lat: 12.9716, lng: 80.2452 },
          zoom: 12,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] }
          ],
          disableDefaultUI: true
        });

        (window as any).gm_authFailure = () => {
          if (isMounted) setMapStatus('fallback');
        };

        setMapStatus('ready');
        renderMarkers(g);
      } catch (err) {
        if (isMounted) setMapStatus('fallback');
      }
    };

    const renderMarkers = (g: any) => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      complaints.forEach((c) => {
        const seed = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const lat = 12.9716 + (Math.sin(seed) * 0.05);
        const lng = 80.2452 + (Math.cos(seed) * 0.05);

        const marker = new g.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            fillColor: c.status === 'resolved' ? '#10b981' : (c.status === 'overdue' ? '#f43f5e' : '#6366f1'),
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 8
          }
        });
        markersRef.current.push(marker);
      });
    };

    if ((window as any).google?.maps) {
      initMap();
    } else if (apiKey) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = initMap;
      script.onerror = () => isMounted && setMapStatus('fallback');
      document.head.appendChild(script);
    } else {
      setMapStatus('fallback');
    }

    return () => {
      isMounted = false;
      window.removeEventListener('error', handleMapError);
    };
  }, [complaints, apiKey]);

  const total = complaints.length;
  const overdue = complaints.filter(c => ((Date.now() - c.timestamp) / 3600000) > c.slaHours && c.status === 'pending').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const pending = total - overdue - resolved;

  const areaData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => { counts[c.area] = (counts[c.area] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Infrastructure Dashboard</h1>
          <div className="flex items-center space-x-2 mt-1">
             <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-tighter">Vite {envMode} Host</span>
             <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-tighter">GCloud Proxy</span>
             <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase tracking-tighter">Gemini Engine</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100 font-bold text-xs uppercase tracking-widest">
          <div className="dot-pulse"></div>
          <span>Server Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Total Registry" value={total} color="bg-indigo-50" textColor="text-indigo-700" />
        <StatCard title="Pending" value={pending} color="bg-slate-100" textColor="text-slate-700" />
        <StatCard title="Resolved" value={resolved} color="bg-emerald-50" textColor="text-emerald-700" />
        <StatCard title="SLA Breaches" value={overdue} color="bg-rose-50" textColor="text-rose-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative" style={{ height: '450px' }}>
          <div className="p-6 flex justify-between items-center text-white bg-slate-900/90 backdrop-blur-md absolute top-0 left-0 right-0 z-20 border-b border-slate-800">
            <h3 className="text-sm font-bold flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
              <span className="tracking-widest uppercase text-xs font-black">Tactical Grid Overlay</span>
            </h3>
          </div>
          <div ref={mapRef} className="w-full h-full" style={{ visibility: mapStatus === 'ready' ? 'visible' : 'hidden', zIndex: 10 }} />
          {(mapStatus === 'fallback' || mapStatus === 'loading') && (
            <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center p-12 overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <p className="relative z-20 text-slate-500 font-black text-xs uppercase tracking-[0.4em] animate-pulse">
                {apiKey ? 'Initializing Metro Grid...' : 'Missing Maps API Key - Fallback Active'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Runtime Architecture</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-600">Bundler Engine</span>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase">Vite v5.1+</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-600">Environment Mode</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{envMode}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-600">HMR Protocol</span>
                <span className={`px-3 py-1 ${isHMR ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'} rounded-lg text-[10px] font-black uppercase`}>
                  {isHMR ? 'Active' : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600">Framework</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">React 19.0</span>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-tight">
              To resolve the blank screen locally, ensure you have run `npm install` and are using the command `npm run dev`.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm" style={{ height: '400px' }}>
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <span>📊</span>
            <span>Pattern Analysis by Area</span>
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-6">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Autonomous Scribe Engine</span>
            </div>
            <h2 className="text-4xl font-black mb-4 italic font-serif-heading leading-tight">Gemini Intelligence</h2>
            <p className="text-indigo-100 mb-8 leading-relaxed max-w-sm text-lg italic">
              Automated transparency reports are published to the public portal when localized registry breaches are detected.
            </p>
          </div>
          <button className="relative z-10 bg-white text-indigo-700 w-fit px-10 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-indigo-950/40 active:scale-95 transition-all hover:bg-slate-50 uppercase tracking-widest">
            Audit AI Logs
          </button>
          
          <div className="absolute top-[-40px] right-[-40px] w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, textColor }: any) => (
  <div className={`${color} p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:scale-[1.03] duration-500 cursor-default flex flex-col items-center text-center justify-center min-h-[160px]`}>
    <div className={`text-6xl font-black ${textColor} mb-2 tracking-tighter`}>{value}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{title}</div>
  </div>
);

export default Dashboard;
