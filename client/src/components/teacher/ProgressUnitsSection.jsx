import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle2, Loader2, Check } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import EmptyState from '../shared/EmptyState';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { cn, statusColor, statusLabel } from '../../lib/utils';

/**
 * Course Progress accordion for teachers.
 * Each topic expands to show its subtopics, each individually checkable.
 * A topic is auto-completed when ALL its subtopics are checked.
 *
 * @param {{ courseId: string, refetchKey: number }} props
 */
export default function ProgressUnitsSection({ courseId, refetchKey }) {
  const { data, loading, error, refetch } = useFetch(
    `/teacher/courses/${courseId}/topics/by-unit`,
    [refetchKey, courseId]
  );

  const units = data?.units || [];
  const [openUnits, setOpenUnits] = useState({});

  const toggleUnit = (num) =>
    setOpenUnits((prev) => ({ ...prev, [num]: !prev[num] }));

  const isOpen = (num) =>
    openUnits[num] === undefined ? true : openUnits[num];

  if (loading) return <LoadingSkeleton count={3} height="h-16" />;
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
        subtitle="Go to the 'Syllabus & Topic Setup' section to upload and parse your syllabus files."
      />
    );

  // Compute overall completion across all subtopics / topics
  let totalItems = 0;
  let completedItems = 0;

  for (const unit of units) {
    for (const topic of unit.topics) {
      if (topic.subtopics && topic.subtopics.length > 0) {
        // Count at subtopic level
        totalItems += topic.subtopics.length;
        completedItems += topic.subtopics.filter((_, idx) =>
          topic.subtopicCompletions?.some((sc) => sc.index === idx && sc.completedAt)
        ).length;
      } else {
        // No subtopics — count the topic itself
        totalItems += 1;
        if (topic.completedAt) completedItems += 1;
      }
    }
  }

  const pct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar summary */}
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Completion</span>
            <span className="text-sm font-bold text-indigo-600">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {completedItems} of {totalItems} {totalItems === 1 ? 'item' : 'items'} completed
          </p>
        </div>
        <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-indigo-100 flex-shrink-0">
          <span className="text-base font-bold text-indigo-600">{pct}%</span>
        </div>
      </div>

      {/* Unit accordions */}
      {units.map((unit) => {
        const open = isOpen(unit.unit_number);

        // Compute unit-level completion
        let unitTotal = 0;
        let unitDone = 0;
        for (const topic of unit.topics) {
          if (topic.subtopics && topic.subtopics.length > 0) {
            unitTotal += topic.subtopics.length;
            unitDone += topic.subtopics.filter((_, idx) =>
              topic.subtopicCompletions?.some((sc) => sc.index === idx && sc.completedAt)
            ).length;
          } else {
            unitTotal += 1;
            if (topic.completedAt) unitDone += 1;
          }
        }
        const allDone = unitTotal > 0 && unitDone === unitTotal;

        return (
          <div
            key={unit.unit_number}
            className={cn(
              'bg-white border rounded-xl overflow-hidden transition-all',
              allDone ? 'border-emerald-200' : 'border-slate-200'
            )}
          >
            {/* Accordion header */}
            <button
              onClick={() => toggleUnit(unit.unit_number)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {allDone ? (
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 flex-shrink-0" />
                )}
                <div>
                  <span className="font-semibold text-slate-900 text-sm">
                    Unit {unit.unit_number} — {unit.unit_name}
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    ({unitDone}/{unitTotal} done)
                  </span>
                </div>
              </div>
              {open
                ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
            </button>

            {/* Topics list */}
            {open && (
              <div className="border-t border-slate-100">
                {unit.topics.map((topic) => (
                  <TopicRow
                    key={topic._id}
                    topic={topic}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Topic row with expandable subtopics ───────────────────────────────────────
function TopicRow({ topic, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
  const isTopicDone = !!topic.completedAt;

  const handleTopicToggle = async () => {
    if (loading || hasSubtopics) return;
    setLoading(true);
    try {
      await api.patch(`/teacher/topics/${topic._id}/complete`);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update topic');
    } finally {
      setLoading(false);
    }
  };

  // Derive subtopic completion map
  const completedIndices = new Set(
    (topic.subtopicCompletions || [])
      .filter((sc) => sc.completedAt)
      .map((sc) => sc.index)
  );

  const completedCount = hasSubtopics
    ? topic.subtopics.filter((_, idx) => completedIndices.has(idx)).length
    : 0;

  return (
    <div className={cn(
      'border-b border-slate-50 last:border-b-0 transition-colors',
      isTopicDone ? 'bg-emerald-50/30' : '',
      !hasSubtopics && !loading && 'hover:bg-slate-50 cursor-pointer'
    )}
    onClick={!hasSubtopics ? handleTopicToggle : undefined}
    >
      {/* Topic header row */}
      <div className="flex items-center gap-4 px-5 py-3">
        {/* Circle indicator — clickable for topics without subtopics */}
        <button 
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all outline-none',
            isTopicDone ? 'border-emerald-500 bg-emerald-500' : loading ? 'border-indigo-300' : 'border-slate-300',
            !hasSubtopics && !isTopicDone && !loading && 'hover:border-indigo-400'
          )}
          onClick={(e) => {
             // Stop propagation if we handle the div click, but since the div handles it, just prevent default to be safe
             // actually, just ignore if disabled. The button doesn't do much if div handles click. 
             // We can just make it disabled or ignore click and let div take it
             if (hasSubtopics) e.preventDefault();
          }}
          disabled={hasSubtopics || loading}
        >
          {loading ? <Loader2 size={10} className="animate-spin text-indigo-400" /> : isTopicDone && <Check size={12} className="text-white" />}
        </button>

        {/* Topic title + toggle */}
        <button
          onClick={(e) => {
            if (hasSubtopics) {
               e.stopPropagation();
               setOpen((o) => !o);
            }
          }}
          className={cn(
            'flex-1 text-left flex items-center justify-between gap-2 min-w-0 outline-none',
            hasSubtopics ? 'cursor-pointer' : 'cursor-pointer'
          )}
        >
          <p className={cn(
            'text-sm font-medium transition-colors',
            isTopicDone ? 'text-slate-400 line-through' : 'text-slate-800'
          )}>
            {topic.title}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasSubtopics && (
              <span className="text-xs text-slate-400">
                {completedCount}/{topic.subtopics.length}
              </span>
            )}
            {hasSubtopics && (
              open
                ? <ChevronUp size={14} className="text-slate-400" />
                : <ChevronDown size={14} className="text-slate-400" />
            )}
          </div>
        </button>

        {/* AI status badge */}
        <span className={cn(
          'text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0',
          statusColor(topic.aiStatus)
        )}>
          {statusLabel(topic.aiStatus)}
        </span>
      </div>

      {/* Subtopics */}
      {open && hasSubtopics && (
        <div className="pb-2 pl-14 pr-5 space-y-1.5">
          {topic.subtopics.map((sub, idx) => (
            <SubtopicRow
              key={idx}
              topicId={topic._id}
              index={idx}
              text={sub}
              completed={completedIndices.has(idx)}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single subtopic checkbox row ──────────────────────────────────────────────
function SubtopicRow({ topicId, index, text, completed, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.patch(`/teacher/topics/${topicId}/subtopics/${index}/complete`);
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'w-full flex items-start gap-3 rounded-lg px-3 py-2 text-left transition-all',
        completed
          ? 'bg-emerald-50/60 hover:bg-emerald-50'
          : 'hover:bg-slate-50'
      )}
    >
      {/* Checkbox */}
      <div className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
        completed
          ? 'bg-emerald-500 border-emerald-500'
          : loading
          ? 'border-indigo-300'
          : 'border-slate-300 hover:border-indigo-400'
      )}>
        {loading
          ? <Loader2 size={11} className="animate-spin text-indigo-400" />
          : completed
          ? <Check size={11} className="text-white" />
          : null}
      </div>

      <span className={cn(
        'text-xs leading-relaxed',
        completed ? 'text-slate-400 line-through' : 'text-slate-600'
      )}>
        {text}
      </span>
    </button>
  );
}
