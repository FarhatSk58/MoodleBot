import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function TeacherCourseCard({ course }) {
  const navigate = useNavigate();
  const { _id, title, courseCode = '' } = course;

  return (
    <button
      type="button"
      onClick={() => navigate(`/teacher/courses/${_id}`)}
      className="w-full text-left bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-indigo-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900 text-base leading-snug">{title}</h3>
          <p className="text-sm text-slate-500 min-h-5">{courseCode || ''}</p>
        </div>
        <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
      </div>
    </button>
  );
}

