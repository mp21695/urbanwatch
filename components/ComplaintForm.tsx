import React, { useState } from 'react';
import { Complaint, IssueType } from '../types';
import { ISSUE_LABELS, AREAS, SLA_TIMES_HOURS } from '../constants';

interface ComplaintFormProps {
  onSubmit: (complaint: Complaint) => Promise<void>;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    issueType: '' as IssueType,
    location: '',
    area: AREAS[0],
    description: '',
    contact: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [status, setStatus] = useState<'idle' | 'locating' | 'submitting' | 'success'>('idle');

  const getCurrentLocation = () => {
    setStatus('locating');
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setStatus('idle');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const coordsStr = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        
        if ((window as any).google && (window as any).google.maps) {
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === "OK" && results[0]) {
              const address = results[0].formatted_address;
              const foundArea = AREAS.find(a => 
                address.toLowerCase().includes(a.toLowerCase()) || 
                results[0].address_components.some((c: any) => c.long_name.toLowerCase().includes(a.toLowerCase()))
              );

              setFormData(prev => ({ 
                ...prev, 
                location: address,
                area: foundArea || prev.area 
              }));
            } else {
              setFormData(prev => ({ ...prev, location: coordsStr }));
            }
            setStatus('idle');
          });
        } else {
          setFormData(prev => ({ ...prev, location: coordsStr }));
          setStatus('idle');
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Permission denied or location unavailable. Enter manually.");
        setStatus('idle');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issueType) return;
    setStatus('submitting');
    
    const id = `UW-${Math.floor(Math.random() * 900000 + 100000)}`;
    const newComplaint: Complaint = {
      id,
      issueType: formData.issueType,
      location: formData.location,
      area: formData.area,
      description: formData.description,
      contact: formData.contact,
      timestamp: new Date(formData.date).getTime(),
      status: 'pending',
      slaHours: SLA_TIMES_HOURS[formData.issueType as IssueType] || 72,
      progress: [{ stage: 'submitted', timestamp: Date.now(), completed: true }]
    };
    
    await onSubmit(newComplaint);
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl shadow-emerald-200">✓</div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Registry Updated</h2>
        <p className="text-slate-500 text-lg">Your case has been broadcast to the UrbanWatch cloud network.</p>
        <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-6">Redirecting to Tracking Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Citizen Action Portal</h1>
        <p className="text-slate-500 text-lg italic">Persistent, traceable reports stored in the secure registry.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8 relative overflow-hidden">
        {status === 'submitting' && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-indigo-600 uppercase tracking-widest text-xs">Broadcasting to Cloud Registry...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Issue Category</label>
            <select
              required
              value={formData.issueType}
              onChange={e => setFormData({ ...formData, issueType: e.target.value as IssueType })}
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold"
            >
              <option value="">Select Category</option>
              {Object.entries(ISSUE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Area</label>
            <select
              required
              value={formData.area}
              onChange={e => setFormData({ ...formData, area: e.target.value })}
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold"
            >
              {/* Fix: Corrected key(a) value(a} to key={a} value={a} */}
              {AREAS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
            <span>Specific Location</span>
            <button 
              type="button" 
              onClick={getCurrentLocation}
              className={`text-indigo-600 font-bold hover:underline flex items-center space-x-1 ${status === 'locating' ? 'animate-pulse' : ''}`}
              disabled={status !== 'idle'}
            >
              <span>{status === 'locating' ? 'Identifying Ward...' : '🎯 Auto-locate Ward'}</span>
            </button>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Near Main Market Junction"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full h-14 px-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white outline-none font-bold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Observation Details</label>
          <textarea
            required
            placeholder="Provide clear details to speed up verification..."
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white outline-none font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={status !== 'idle'}
          className={`w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-lg tracking-wide shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-3 ${status !== 'idle' ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <span>Submit to UrbanWatch Registry</span>
          <span className="text-xl">📡</span>
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;