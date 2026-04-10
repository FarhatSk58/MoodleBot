import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import UserTable from '../../components/admin/UserTable';
import { useFetch } from '../../hooks/useFetch';

const YEAR_OPTIONS = [
  { label: 'All Years', value: 'All' },
  { label: '1', value: '1st Year' },
  { label: '2', value: '2nd Year' },
  { label: '3', value: '3rd Year' },
  { label: '4', value: '4th Year' },
];
const SEMESTER_OPTIONS = [
  { label: 'All Semesters', value: 'All' },
  { label: '1', value: 'Semester 1' },
  { label: '2', value: 'Semester 2' },
];
const DEPARTMENT_OPTIONS = ['All', 'CSE-AIML', 'CSE-DS'];

export default function ManageUsersPage() {
  const { data: users, loading, error, refetch } = useFetch('/admin/users');
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [studentFilters, setStudentFilters] = useState({
    year: 'All',
    semester: 'All',
    department: 'All',
  });
  const [teacherDepartment, setTeacherDepartment] = useState('All');

  const students = useMemo(() => {
    let list = (users || []).filter((user) => user.role === 'student');
    if (studentFilters.year !== 'All') list = list.filter((user) => user.year === studentFilters.year);
    if (studentFilters.semester !== 'All') list = list.filter((user) => user.semester === studentFilters.semester);
    if (studentFilters.department !== 'All') list = list.filter((user) => user.department === studentFilters.department);
    if (studentSearch.trim()) {
      const query = studentSearch.toLowerCase();
      list = list.filter((user) =>
        user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
      );
    }
    return list;
  }, [studentFilters, studentSearch, users]);

  const teachers = useMemo(() => {
    let list = (users || []).filter((user) => user.role === 'teacher');
    if (teacherDepartment !== 'All') list = list.filter((user) => user.department === teacherDepartment);
    if (teacherSearch.trim()) {
      const query = teacherSearch.toLowerCase();
      list = list.filter((user) =>
        user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
      );
    }
    return list;
  }, [teacherDepartment, teacherSearch, users]);

  const handleDelete = () => refetch();
  const inputCls = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <PageHeader title="Manage Users" subtitle={`${users?.length || 0} total users`} />

          {loading && <LoadingSkeleton count={5} height="h-14" />}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-6">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Students</h2>
                    <p className="text-sm text-slate-500">{students.length} matching students</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">Students</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_repeat(3,180px)] gap-3 mb-5">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search by name or email"
                      className={`w-full pl-9 pr-4 ${inputCls}`}
                    />
                  </div>
                  <select
                    value={studentFilters.year}
                    onChange={(e) => setStudentFilters((prev) => ({ ...prev, year: e.target.value }))}
                    className={inputCls}
                  >
                    {YEAR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={studentFilters.semester}
                    onChange={(e) => setStudentFilters((prev) => ({ ...prev, semester: e.target.value }))}
                    className={inputCls}
                  >
                    {SEMESTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={studentFilters.department}
                    onChange={(e) => setStudentFilters((prev) => ({ ...prev, department: e.target.value }))}
                    className={inputCls}
                  >
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {students.length === 0 ? (
                  <EmptyState icon={Users} title="No students found" subtitle="Try adjusting the student filters or search." />
                ) : (
                  <UserTable users={students} onDelete={handleDelete} />
                )}
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Teachers</h2>
                    <p className="text-sm text-slate-500">{teachers.length} matching teachers</p>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">Teachers</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_220px] gap-3 mb-5">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      placeholder="Search by name or email"
                      className={`w-full pl-9 pr-4 ${inputCls}`}
                    />
                  </div>
                  <select
                    value={teacherDepartment}
                    onChange={(e) => setTeacherDepartment(e.target.value)}
                    className={inputCls}
                  >
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {teachers.length === 0 ? (
                  <EmptyState icon={Users} title="No teachers found" subtitle="Try adjusting the teacher filters or search." />
                ) : (
                  <UserTable users={teachers} onDelete={handleDelete} />
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

