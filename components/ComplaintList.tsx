
import React, { useState, useMemo } from 'react';
import { Complaint } from '../types';
import { ISSUE_LABELS, WORKFLOW_STAGES } from '../constants';

interface ComplaintListProps {
  complaints: Complaint[];
  isAdmin: boolean;
  onUpdate: (id: string, stageId: string) => void;
}

const ComplaintList: React.FC<ComplaintListProps> = ({ complaints, isAdmin, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'overdue'>('all');

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = 
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase());

      const hoursPassed = (Date.now() - c.timestamp) / (1000 * 60 * 60);
      const isOverdue = hoursPassed > c.slaHours && c.status === 'pending';

      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'overdue') return matchesSearch && isOverdue;
      return matchesSearch && c.status === statusFilter;
    });
  }, [complaints, searchTerm, statusFilter]);

  const exportToCSV = () => {
    const headers = ['Case ID', 'Issue Type', 'Area', 'Location', 'Status', 'SLA (Hours)', 'Timestamp', 'Description'];
    const rows = filteredComplaints.map(c => [
      c.id,
      ISSUE_LABELS[c.issueType] || c.issueType,
      c.area,
      `"${c.location.replace(/"/g, '""')}"`,
      c.status,
      c.slaHours,
      new Date(c.timestamp).toLocaleString(),
      `"${c.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `UrbanWatch_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Registry</h1>
          <p className="text-slate-500 font-medium">Managing {filteredComplaints.length} active records</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Search ID, Area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
            />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-50 transition-all appearance-none pr-10 relative"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org.w3.org/2000/svg\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="overdue">SLA Breached</option>
          </select>

          <button 
            onClick={exportToCSV}
            className="flex items-center space-x-2 h-11 px-6 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="text-4xl mb-4">🔎</div>
          <h3 className="text-xl font-bold text-slate-900">No matching records</h3>
          <p className="text-slate-500">Try adjusting your search filters or check back later.</p>
          <button 
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
            className="mt-6 text-indigo-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map(c => {
            const hoursPassed = (Date.now() - c.timestamp) / (1000 * 60 * 60);
            const isOverdue = hoursPassed > c.slaHours && c.status === 'pending';
            const progress = Math.round((c.progress.length / WORKFLOW_STAGES.length) * 100);

            return (
              <div key={c.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isOverdue ? 'Overdue 🚨' : 'In SLA ✅'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{c.id}</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{ISSUE_LABELS[c.issueType] || c.issueType}</h3>
                <p className="text-sm text-slate-500 font-medium flex items-center space-x-2 mb-4">
                  <span>📍</span>
                  <span>{c.location}</span>
                </p>

                <div className="flex-1 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-sm text-slate-600 italic line-clamp-2">"{c.description}"</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workflow Progression</span>
                      <span className="text-[10px] font-bold text-indigo-600">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase">Age: {Math.floor(hoursPassed)} hours</span>
                    <span className="text-xs font-bold text-slate-900 uppercase">Area: {c.area}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex space-x-2">
                      <select
                        className="flex-1 h-10 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold outline-none cursor-pointer"
                        value={c.progress[c.progress.length - 1].stage}
                        onChange={(e) => onUpdate(c.id, e.target.value)}
                      >
                        {WORKFLOW_STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                      <button className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">✉️</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
