import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import EmptyState from '../shared/EmptyState';
import { cn, statusColor, statusLabel } from '../../lib/utils';

/**
 * @param {{ courseId: string, refetchKey: number }} props
 */
export default function UnitsSection({ courseId, refetchKey }) {
  const { data, loading, error } = useFetch(
    `/teacher/courses/${courseId}/topics/by-unit`,
    [refetchKey]
  );

  const units = data?.units || [];
  const [openUnits, setOpenUnits] = useState({});

  const toggleUnit = (num) =>
    setOpenUnits((prev) => ({ ...prev, [num]: !prev[num] }));

  if (loading) return <LoadingSkeleton count={3} height="h-14" />;
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
        {error}
      </div>
    );

  if (units.length === 0)
    return (
      <EmptyState
        icon={BookOpen}
        title="No topics yet"
        subtitle="Upload a micro syllabus above to extract and save topics. They will appear here grouped by unit."
      />
    );

  return (
    <div className="space-y-3">
      {units.map((unit) => {
        const isOpen = !!openUnits[unit.unit_number];
        return (
          <div
            key={unit.unit_number}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            {/* Accordion header */}
            <button
              onClick={() => toggleUnit(unit.unit_number)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div>
                <span className="font-semibold text-slate-900 text-sm">
                  Unit {unit.unit_number} — {unit.unit_name}
                </span>
                <span className="ml-2 text-xs text-slate-400">
                  ({unit.topics.length} topic{unit.topics.length !== 1 ? 's' : ''})
                </span>
              </div>
              {isOpen ? (
                <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
              )}
            </button>

            {/* Topic list — read-only */}
            {isOpen && (
              <div className="border-t border-slate-100 divide-y divide-slate-50">
                {unit.topics.map((topic) => (
                  <div
                    key={topic._id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-300 font-mono w-5">
                        {topic.syllabusOrder}
                      </span>
                      <span className="text-sm text-slate-700">{topic.title}</span>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0',
                        statusColor(topic.aiStatus)
                      )}
                    >
                      {statusLabel(topic.aiStatus)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
