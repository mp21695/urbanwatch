
import React, { useState } from 'react';
import { Complaint } from '../types';
import { WORKFLOW_STAGES, ISSUE_LABELS } from '../constants';

interface TrackingPortalProps {
  complaints: Complaint[];
}

const TrackingPortal: React.FC<TrackingPortalProps> = ({ complaints }) => {
  const [searchId, setSearchId] = useState('');
  const [tracked, setTracked] = useState<Complaint | null>(null);

  const handleSearch = () => {
    const found = complaints.find(c => c.id === searchId.trim() || c.id === `UW-${searchId.trim()}`);
    setTracked(found || null);
    if (!found) alert('Complaint ID not found.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Case Tracker</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter Case ID (e.g., UW-123456)"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="flex-1 h-14 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white outline-none font-bold text-lg"
          />
          <button
            onClick={handleSearch}
            className="h-14 px-10 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
          >
            Track Case
          </button>
        </div>
      </div>

      {tracked && (
        <div className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">CURRENT STATUS</p>
              <h2 className="text-2xl font-bold">{ISSUE_LABELS[tracked.issueType] || tracked.issueType}</h2>
              <p className="text-sm opacity-90 mt-1">📍 {tracked.location}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold opacity-70 mb-1 uppercase">CASE ID</p>
              <p className="text-2xl font-black">{tracked.id}</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="relative space-y-12">
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
              
              {WORKFLOW_STAGES.map((stage, idx) => {
                const stepData = tracked.progress.find(p => p.stage === stage.id);
                const isCompleted = !!stepData;
                const isCurrent = tracked.progress[tracked.progress.length - 1].stage === stage.id;

                return (
                  <div key={stage.id} className="relative flex items-start space-x-10">
                    <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400'}`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                          {stage.title}
                        </h3>
                        {stepData && (
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(stepData.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 p-8 flex flex-col md:flex-row justify-between items-center border-t border-slate-200">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">⏱️</div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Resolution</p>
                <p className="text-slate-900 font-bold">
                  {new Date(tracked.timestamp + (tracked.slaHours * 60 * 60 * 1000)).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button className="text-indigo-600 font-black flex items-center space-x-2 bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100 transition-all">
              <span>Contact Support</span>
              <span className="text-lg">💬</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPortal;
