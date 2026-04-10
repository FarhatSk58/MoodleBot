import { BookOpen } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import CourseCard from '../../components/student/CourseCard';
import { useFetch } from '../../hooks/useFetch';

export default function StudentDashboard() {
  const { data: courses, loading, error } = useFetch('/student/courses');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <PageHeader
            title="My Courses"
            subtitle={courses ? `${courses.length} course${courses.length !== 1 ? 's' : ''} enrolled` : 'Loading...'}
          />

          {loading && <LoadingSkeleton count={6} height="h-52" />}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
          )}

          {!loading && !error && courses?.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No courses enrolled yet"
              subtitle="Contact your administrator to get enrolled in your courses."
            />
          )}

          {!loading && !error && courses?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
