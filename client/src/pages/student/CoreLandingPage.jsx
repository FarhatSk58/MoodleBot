import React from 'react';
import { BookOpen, Mic, ExternalLink, ArrowRight } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';

export default function CoreLandingPage() {
  const handleOpen = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <PageHeader title="Core" subtitle="Master the fundamentals and test your knowledge." />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            
            {/* Learn Block */}
            <div 
              onClick={() => handleOpen('/student/learning')}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                  <BookOpen className="text-indigo-600" size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">Learn</h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Access comprehensive study materials, coding tutorials, and theoretical core concepts. Dive deep into modules curated specifically for technical interviews and coursework.
                </p>
              </div>
              
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <span className="flex items-center gap-2 text-indigo-600 font-bold group-hover:underline">
                  Open Learning Hub <ExternalLink size={18} />
                </span>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>

            {/* Mock Test Block */}
            <div 
              onClick={() => handleOpen('/student/interviews')}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                  <Mic className="text-emerald-600" size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">Take a Mock Test</h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Simulate real technical and behavioral interviews with our EduAI interviewer. Record your answers, manage your time, and receive instant feedback on your performance.
                </p>
              </div>
              
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <span className="flex items-center gap-2 text-emerald-600 font-bold group-hover:underline">
                  Start an Interview <ExternalLink size={18} />
                </span>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
