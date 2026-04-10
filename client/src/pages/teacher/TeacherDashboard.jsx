import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import TeacherCourseCard from '../../components/teacher/TeacherCourseCard';
import { useFetch } from '../../hooks/useFetch';

const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['All', 'Semester 1', 'Semester 2'];

export default function TeacherDashboard() {
  const { data: courses, loading, error } = useFetch('/teacher/courses');
  const [yearFilter, setYearFilter] = useState('All');
  const [semFilter, setSemFilter] = useState('All');

  const filtered = (courses || []).filter(c =>
    (yearFilter === 'All' || c.year === yearFilter) &&
    (semFilter === 'All' || c.semester === semFilter)
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <PageHeader title="My Courses" subtitle="Manage syllabus progress and review AI content" />

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
            <select value={semFilter} onChange={e => setSemFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {SEMESTERS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {loading && <LoadingSkeleton count={4} height="h-52" />}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <EmptyState icon={BookOpen} title="No courses found" subtitle="No courses match your current filters." />
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filtered.map(c => <TeacherCourseCard key={c._id} course={c} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
