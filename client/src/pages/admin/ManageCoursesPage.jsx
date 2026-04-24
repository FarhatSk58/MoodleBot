import { useState, useContext, useRef, useEffect } from 'react';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import CourseFormModal from '../../components/admin/CourseFormModal';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/axios';
import { AuthContext } from '../../context/AuthContext';

export default function ManageCoursesPage() {
  const { data: courses, loading, error, refetch } = useFetch('/admin/courses');
  const { data: users } = useFetch('/admin/users');
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [menuCourseId, setMenuCourseId] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const menuWrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuWrapperRef.current && !menuWrapperRef.current.contains(event.target)) {
        setMenuCourseId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const teachers = (users || []).filter((user) => user.role === 'teacher');

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? This action cannot be undone.')) return;

    setDeletingCourseId(courseId);
    try {
      await api.delete(`/admin/courses/${courseId}`);
      toast.success('Course deleted.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course.');
    } finally {
      setDeletingCourseId(null);
      setMenuCourseId(null);
    }
  };

  const toggleMenu = (courseId) => {
    setMenuCourseId((prev) => (prev === courseId ? null : courseId));
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <PageHeader
            title="Manage Courses"
            subtitle={`${courses?.length || 0} courses`}
            action={
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all">
                <Plus size={16} /> Create Course
              </button>
            }
          />

          {loading && <LoadingSkeleton count={4} height="h-36" />}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

          {!loading && !error && (
            <div className="space-y-4">
              {(courses || []).map((course) => {
                const creatorId = course.createdBy?._id || course.createdBy;
                const canDelete = Boolean(user && creatorId && creatorId === user._id);
                const statusClasses =
                  course.status === 'Published'
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                    : 'border-slate-100 bg-slate-50 text-slate-600';
                const topicCount = course.topicCount ?? (course.topics?.length ?? 0);

                return (
                  <article
                    key={course._id}
                    onClick={() => setEditingCourse(course)}
                    className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm p-5 hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                  >
                    <div
                      className="flex items-start justify-between gap-4"
                      ref={course._id === menuCourseId ? menuWrapperRef : null}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Course code</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-slate-900 truncate">{course.title}</h3>
                          <span className={`text-xs font-semibold border px-3 py-1 rounded-full ${statusClasses}`}>
                            {course.status || 'Draft'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 truncate">
                          {course.courseCode || '—'} · {course.year || 'Year missing'} · {course.semester || 'Semester missing'}
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleMenu(course._id); }}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"
                          aria-label="Course actions"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {menuCourseId === course._id && (
                          <div className="absolute right-0 top-full mt-2 min-w-[180px] rounded-xl border border-slate-200 bg-white shadow-lg z-20">
                            {canDelete ? (
                              <button
                                type="button"
                                onClick={() => handleDeleteCourse(course._id)}
                                disabled={deletingCourseId === course._id}
                                className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                <Trash2 size={14} /> Delete course
                              </button>
                            ) : (
                              <div className="px-4 py-2 text-xs text-slate-500">
                                Only creators can delete courses
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {(course.departments || []).map((department) => (
                        <span
                          key={department}
                          className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full"
                        >
                          {department}
                        </span>
                      ))}
                      {!course.departments?.length && (
                        <span className="text-xs text-slate-400">No departments assigned</span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mt-4">
                      {course.description || 'No description added yet.'}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold text-slate-700">{topicCount}</span> topics
                      </span>
                      <span>
                        Assigned teacher: <span className="font-semibold text-slate-700">{course.assignedTeacher?.name || 'Unassigned'}</span>
                      </span>
                      <span>Matching students auto-enrolled</span>
                    </div>
                  </article>
                );
              })}

              {(courses || []).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                  No courses created yet.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showModal && <CourseFormModal onClose={() => setShowModal(false)} onSuccess={refetch} teachers={teachers} />}
      {editingCourse && (
        <CourseFormModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSuccess={() => {
            setEditingCourse(null);
            refetch();
          }}
          teachers={teachers}
        />
      )}
    </div>
  );
}

