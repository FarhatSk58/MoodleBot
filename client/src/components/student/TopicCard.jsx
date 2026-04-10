import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn, statusColor, statusLabel } from '../../lib/utils';

const weightageColor = { core: 'bg-indigo-100 text-indigo-700', supporting: 'bg-blue-100 text-blue-700', optional: 'bg-slate-100 text-slate-600' };

export default function TopicCard({ topic, courseId }) {
  const navigate = useNavigate();
  const isPublished = topic.aiStatus === 'published';

  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 transition-all duration-200',
      isPublished ? 'hover:shadow-md hover:border-indigo-200' : 'opacity-60'
    )}>
      {/* Order number */}
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 flex-shrink-0">
        {topic.syllabusOrder}
      </div>

      {/* Title + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <h3 className="font-medium text-slate-900 text-sm truncate">{topic.title}</h3>
          {topic.hasAttempted && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <CheckCircle2 size={11} /> Attempted
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColor(topic.aiStatus))}>
            {statusLabel(topic.aiStatus)}
          </span>
          {isPublished && topic.aiContent && (
            <>
              <span className="text-xs text-slate-400">Importance: {topic.aiContent?.importance_score ?? '—'}/10</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', weightageColor[topic.aiContent?.weightage_tag] || 'bg-slate-100 text-slate-500')}>
                {topic.aiContent?.weightage_tag}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action */}
      {isPublished ? (
        <button
          onClick={() => navigate(`/student/courses/${courseId}/topics/${topic._id}`)}
          className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
        >
          Explore <ChevronRight size={13} />
        </button>
      ) : (
        <div className="flex items-center gap-1.5 text-slate-400 text-xs flex-shrink-0">
          <Lock size={14} /> Coming soon
        </div>
      )}
    </div>
  );
}
