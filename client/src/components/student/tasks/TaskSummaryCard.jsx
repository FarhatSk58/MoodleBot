import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  resolveTaskDifficulty,
  resolveTaskStatus,
} from './taskUiUtils';

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  hard: 'bg-rose-50 text-rose-700 border-rose-100',
};

const STATUS_META = {
  not_started: { label: 'Not Started', icon: Circle, cls: 'bg-slate-100 text-slate-500' },
  in_progress: { label: 'In Progress', icon: Clock, cls: 'bg-sky-50 text-sky-600' },
  completed: { label: 'Mastered', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600' },
};

export default function TaskSummaryCard({
  taskId,
  task,
  taskIndex,
  topicId,
  courseId,
  topicComplexity,
  progress, // { bestScore, totalAttempts }
  workspaceBackTo,
}) {
  const navigate = useNavigate();
  const difficulty = resolveTaskDifficulty(task, topicComplexity);
  const status = resolveTaskStatus(progress || {});
  const statusMeta = STATUS_META[status];
  const StatusIcon = statusMeta.icon;

  const goWorkspace = () => {
    if (!taskId || !topicId || taskIndex == null) return;
    navigate(`/student/tasks/${taskId}`, {
      state: {
        topicId,
        taskIndex,
        courseId,
        ...(workspaceBackTo ? { workspaceBackTo } : {}),
      },
    });
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-3xl p-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border",
              DIFFICULTY_STYLES[difficulty]
            )}>
              {difficulty}
            </span>
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md",
              statusMeta.cls
            )}>
              <StatusIcon size={12} />
              {statusMeta.label}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
            {task.task_title || 'Untitled Task'}
          </h3>
        </div>
        
        <button
          onClick={goWorkspace}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
        {task.description}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
        <div className="flex flex-wrap gap-1.5">
          {task.skills_practiced?.slice(0, 3).map((skill, i) => (
            <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100 font-medium">
              {skill}
            </span>
          ))}
          {task.skills_practiced?.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium">+{task.skills_practiced.length - 3} more</span>
          )}
        </div>

        {task.estimated_time && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Clock size={12} />
            {task.estimated_time}
          </div>
        )}
      </div>

      {/* Hidden Solve Text on Hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
    </div>
  );
}
