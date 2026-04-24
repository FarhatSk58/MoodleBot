import { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

const UNITS = [1, 2, 3, 4, 5];

export default function UnitSidebar({ courseId, units, currentTopicId, isOpen, onToggle }) {
  const [expandedUnits, setExpandedUnits] = useState(new Set([1])); // Default expand Unit 1

  const toggleUnit = (unitNum) => {
    const next = new Set(expandedUnits);
    if (next.has(unitNum)) {
      next.delete(unitNum);
    } else {
      next.add(unitNum);
    }
    setExpandedUnits(next);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-20 h-[calc(100vh-80px)] bg-white border-r border-slate-200 transition-all duration-300 z-10 overflow-y-auto shadow-xl shadow-slate-200/20",
        isOpen ? "w-72" : "w-0 overflow-hidden border-none"
      )}
    >
      <div className="p-4 space-y-2">
        {UNITS.map((uNum) => {
          const unitData = units?.find(u => u.unit_number === uNum);
          const topics = unitData?.topics || [];
          const isExpanded = expandedUnits.has(uNum);

          return (
            <div key={uNum} className="border-b border-slate-50 last:border-none pb-2">
              <button
                onClick={() => toggleUnit(uNum)}
                className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                    isExpanded ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-slate-100 text-slate-500"
                  )}>
                    {uNum}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Unit</p>
                    <h4 className={cn(
                      "text-sm font-semibold truncate max-w-[160px]",
                      isExpanded ? "text-slate-900" : "text-slate-600"
                    )}>
                      {unitData?.unit_name || `Unit ${uNum}`}
                    </h4>
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />}
              </button>

              {isExpanded && (
                <div className="mt-1 ml-11 space-y-1">
                  {topics.length > 0 ? (
                    topics.map((topic) => {
                      const isActive = String(topic._id) === String(currentTopicId);
                      return (
                        <Link
                          key={topic._id}
                          to={`/student/courses/${courseId}/topics/${topic._id}`}
                          className={cn(
                            "group flex items-center justify-between p-2 rounded-md text-xs transition-all",
                            isActive 
                              ? "bg-indigo-50 text-indigo-700 font-semibold" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <BookOpen size={12} className={cn(isActive ? "text-indigo-600" : "text-slate-300")} />
                            <span className="truncate">{topic.title}</span>
                          </div>
                          {topic.completedAt && (
                            <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                          )}
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-slate-400 italic py-1 px-2">No topics available</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
