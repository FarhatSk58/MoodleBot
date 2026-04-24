import React from 'react';
import { Clock, Tag } from 'lucide-react';

export default function DomainCard({ title, description, duration, tags, onStart, onViewPrevious }) {
  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag, idx) => (
            <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold">
              <Tag size={12} />
              {tag}
            </span>
          ))}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Clock size={12} />
            {duration} min
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          onClick={onStart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-bold shadow-sm transition-colors"
        >
          Start Interview
        </button>
        <button
          onClick={onViewPrevious}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg py-2.5 text-sm font-bold transition-colors"
        >
          Records
        </button>
      </div>
    </div>
  );
}
