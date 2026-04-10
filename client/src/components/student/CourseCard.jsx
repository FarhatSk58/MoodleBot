import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, Star } from 'lucide-react';
import { formatScore } from '../../lib/utils';

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const { _id, title, departments = [], topicCount = 0, overallAverageScore = 0 } = course;
  const progress = topicCount > 0 ? Math.round((course.publishedCount || 0) / topicCount * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 text-base leading-snug">{title}</h3>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <BookOpen size={16} className="text-indigo-500" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {departments.map(d => (
            <span key={d} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{d}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{topicCount} Topics</span>
        <div className="flex items-center gap-1 text-amber-500">
          <Star size={14} fill="currentColor" />
          <span className="font-semibold text-slate-700">{formatScore(overallAverageScore)}/10</span>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <button
        onClick={() => navigate(`/student/courses/${_id}`)}
        className="mt-auto w-full flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg transition-all duration-200"
      >
        View Course <ChevronRight size={15} />
      </button>
    </div>
  );
}
