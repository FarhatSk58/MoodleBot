import { CheckCircle } from 'lucide-react';

export default function IndustryUseCaseCard({ useCase }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {useCase.domain || 'General'}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 text-base leading-tight">
            {useCase.use_case_title}
          </h4>
        </div>
        {useCase.verified_company_example && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex-shrink-0">
            <CheckCircle size={12} className="text-emerald-500" />
            {useCase.verified_company_example}
          </div>
        )}
      </div>
      
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {useCase.description}
      </p>
      
      {useCase.tools_or_technologies_involved?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-slate-50">
          {useCase.tools_or_technologies_involved.map((tool, idx) => (
            <span 
              key={idx} 
              className="text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-md"
            >
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
