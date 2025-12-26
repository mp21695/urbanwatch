
import React, { useState, useEffect } from 'react';
import { TransparencyArticle } from '../types';

interface TransparencyPortalProps {
  articles: TransparencyArticle[];
  isGenerating: boolean;
}

const TransparencyPortal: React.FC<TransparencyPortalProps> = ({ articles, isGenerating }) => {
  const [generationStep, setGenerationStep] = useState(0);
  const steps = [
    "Scanning registry for SLA breaches...",
    "Correlating geographic delay patterns...",
    "Initializing Gemini Engine...",
    "Drafting public accountability statement...",
    "Finalizing transparency report..."
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setGenerationStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 2500);
      return () => {
        clearInterval(interval);
        setGenerationStep(0);
      };
    }
  }, [isGenerating]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-serif-heading italic">The Transparency Journal</h1>
          <p className="text-slate-500 mt-2 text-lg">Autonomous disclosure of persistent infrastructure failures.</p>
        </div>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] h-fit">
          Live Feed: Active
        </div>
      </div>

      {isGenerating && (
        <div className="bg-slate-900 p-10 rounded-[40px] border border-slate-800 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
              style={{ width: `${((generationStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center relative">
               <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
               <span className="text-2xl animate-pulse">✨</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-white font-bold text-xl">Scribe Engine Active</h3>
              <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest h-4">
                {steps[generationStep]}
              </p>
            </div>

            <div className="flex space-x-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-colors duration-500 ${i <= generationStep ? 'bg-indigo-500' : 'bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-black text-white">GEMINI</span>
          </div>
        </div>
      )}

      {articles.length === 0 && !isGenerating ? (
        <div className="bg-white p-20 rounded-[50px] border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center text-4xl mx-auto">🛡️</div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">System Integrity Confirmed</h3>
            <p className="text-slate-500 max-w-sm mx-auto">No persistent service level breaches have been detected. The transparency protocol remains on standby.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {articles.map(article => (
            <article key={article.id} className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-2xl hover:border-indigo-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">Automated Disclosure</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Ref: {article.id} • {new Date(article.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 font-serif-heading leading-tight">{article.title}</h2>
                </div>
                <div className="bg-indigo-50 px-6 py-4 rounded-3xl flex flex-col items-center justify-center border border-indigo-100">
                  <span className="text-3xl font-black text-indigo-600 leading-none">{article.breachCount}</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mt-1">Impact Level</span>
                </div>
              </div>

              <div className="prose prose-slate max-w-none mb-10 text-slate-600 leading-relaxed text-xl whitespace-pre-wrap italic font-medium">
                {article.content}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50 bg-slate-50/50 -mx-12 -mb-12 px-12 py-8 mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">✨</div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Verified AI Audit</p>
                    <p className="text-[10px] font-bold text-slate-400">Published by UrbanWatch Scribe Engine</p>
                  </div>
                </div>
                <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center space-x-2">
                  <span>📄</span>
                  <span>Export Report</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransparencyPortal;
