import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import { useFetch } from '../../hooks/useFetch';
import ProgressUnitsSection from '../../components/teacher/ProgressUnitsSection';

export default function CourseProgressPage() {
  const { data: courses, loading, error } = useFetch('/teacher/courses');
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCourseId = searchParams.get('courseId');
  const defaultCourseId = courses?.[0]?._id;
  const activeCourseId = queryCourseId || defaultCourseId;

  useEffect(() => {
    if (!queryCourseId && defaultCourseId) {
      setSearchParams({ courseId: defaultCourseId });
    }
  }, [queryCourseId, defaultCourseId, setSearchParams]);

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    if (courseId) setSearchParams({ courseId });
    else setSearchParams({});
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <PageHeader
            title="Course Progress"
            subtitle="Check off topics as you complete them — AI processing is queued at 11 PM daily"
          />

          {/* Course selector */}
          <div className="flex flex-wrap items-center gap-4">
            <label htmlFor="course-select" className="text-sm font-medium text-slate-600">
              Select course
            </label>
            <select
              id="course-select"
              value={activeCourseId || ''}
              onChange={handleCourseChange}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
              disabled={loading || !courses?.length}
            >
              <option value="" disabled>Choose a course</option>
              {(courses || []).map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {loading && <LoadingSkeleton count={3} height="h-16" />}
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && !courses?.length && (
            <EmptyState
              icon={() => null}
              title="No courses assigned"
              subtitle="Create or assign a course first to see progress data."
            />
          )}

          {!loading && !error && activeCourseId && (
            <ProgressUnitsSection
              courseId={activeCourseId}
              refetchKey={activeCourseId}
            />
          )}
        </div>
      </main>
    </div>
  );
}
