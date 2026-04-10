import { Users, BookOpen, GraduationCap } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import StatCard from '../../components/admin/StatCard';
import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../lib/utils';

export default function AdminDashboard() {
  const { data: users, loading: uLoading } = useFetch('/admin/users');
  const { data: courses, loading: cLoading } = useFetch('/admin/courses');

  const students = users?.filter((user) => user.role === 'student') || [];
  const teachers = users?.filter((user) => user.role === 'teacher') || [];
  const recentCourses = [...(courses || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <PageHeader title="Platform Overview" subtitle="EduAI LMS - Admin Dashboard" />

          {(uLoading || cLoading) && <LoadingSkeleton count={4} height="h-28" />}

          {!uLoading && !cLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard icon={GraduationCap} label="Total Students" value={students.length} color="blue" />
                <StatCard icon={Users} label="Total Teachers" value={teachers.length} color="emerald" />
                <StatCard icon={BookOpen} label="Total Courses" value={courses?.length || 0} color="indigo" />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Recent Courses</h3>
                </div>
                <div>
                  {recentCourses.map((course) => (
                    <div key={course._id} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{course.title}</p>
                        <p className="text-xs text-slate-400">{course.assignedTeacher?.name || 'Unassigned'}</p>
                      </div>
                      <span className="text-xs text-slate-400">{formatDate(course.createdAt)}</span>
                    </div>
                  ))}
                  {recentCourses.length === 0 && <p className="px-5 py-4 text-sm text-slate-400">No courses yet</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

