import { useMemo } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import { useFetch } from '../../hooks/useFetch';

const SECTION_GROUPS = [
  {
    title: 'Academic Structure',
    items: [
      { id: 'syllabus', label: 'Syllabus & Topic Setup' },
      { id: 'units', label: 'Units' },
    ],
  },
  {
    title: 'Learning Resources',
    items: [
      { id: 'textbooks', label: 'Textbooks' },
      { id: 'notes', label: 'Notes' },
    ],
  },
  {
    title: 'Assessment',
    items: [
      { id: 'mcqs', label: 'MCQs' },
      { id: 'question-banks', label: 'Question Banks' },
      { id: 'previous-papers', label: 'Previous Papers' },
    ],
  },
];

export default function TeacherCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data: course, loading, error } = useFetch(`/teacher/courses/${courseId}`);

  const details = useMemo(() => ({
    courseCode: course?.courseCode || '',
    yearSemester: [course?.year, course?.semester].filter(Boolean).join(' - '),
    departments: (course?.departments || []).join(', '),
    sections: (course?.sections || []).join(', '),
    status: course?.status || 'Draft',
  }), [course]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <button onClick={() => navigate('/teacher/courses')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>

          {loading && <LoadingSkeleton count={4} height="h-28" />}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

          {!loading && !error && course && (
            <>
              <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
                    <p className="text-sm text-slate-500 mt-2">{details.courseCode}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                    {details.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Course Code" value={details.courseCode} />
                  <InfoRow label="Year - Semester" value={details.yearSemester} />
                  <InfoRow label="Departments" value={details.departments} />
                  <InfoRow label="Sections" value={details.sections} />
                </div>
              </section>

              <div className="space-y-6">
                {SECTION_GROUPS.map((group) => (
                  <section key={group.title}>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">{group.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate(`/teacher/courses/${courseId}/sections/${item.id}`)}
                          className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-indigo-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-slate-900">{item.label}</span>
                            <ChevronRight size={16} className="text-slate-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className="text-slate-900 min-h-6">{value || ''}</p>
    </div>
  );
}

