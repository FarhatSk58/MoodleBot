import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const DEPTS = ['CSE-AIML', 'CSE-DS'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMS = ['Semester 1', 'Semester 2'];
const STATUS_OPTIONS = ['Draft', 'Published'];

export default function CourseFormModal({
  onClose,
  onSuccess,
  teachers = [],
  course = null,
  endpoint = null,
  method: methodProp = null,
  showTeacherSelect = true,
}) {
  const isEdit = Boolean(course);
  const [form, setForm] = useState({
    title: course?.title || '',
    description: course?.description || '',
    courseCode: course?.courseCode || '',
    departments: course?.departments || [],
    year: course?.year || '2nd Year',
    semester: course?.semester || 'Semester 1',
    sectionsText: course?.sections?.join(', ') || '',
    credits: course?.credits ?? '',
    category: course?.category || '',
    lectureTutorial: course?.lectureTutorial || '',
    courseType: course?.courseType || '',
    prerequisites: course?.prerequisites || '',
    continuousEvaluation: course?.continuousEvaluation ?? '',
    semesterEndExamination: course?.semesterEndExamination ?? '',
    totalMarks: course?.totalMarks ?? '',
    status: course?.status || 'Draft',
    teacherId: course?.assignedTeacher?._id || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!course) return;
    setForm({
      title: course.title || '',
      description: course.description || '',
      courseCode: course.courseCode || '',
      departments: course.departments || [],
      year: course.year || '2nd Year',
      semester: course.semester || 'Semester 1',
      sectionsText: course.sections?.join(', ') || '',
      credits: course.credits ?? '',
      category: course.category || '',
      lectureTutorial: course.lectureTutorial || '',
      courseType: course.courseType || '',
      prerequisites: course.prerequisites || '',
      continuousEvaluation: course.continuousEvaluation ?? '',
      semesterEndExamination: course.semesterEndExamination ?? '',
      totalMarks: course.totalMarks ?? '',
      status: course.status || 'Draft',
      teacherId: course.assignedTeacher?._id || '',
    });
  }, [course]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const toggleDept = (d) =>
    set(
      'departments',
      form.departments.includes(d)
        ? form.departments.filter((x) => x !== d)
        : [...form.departments, d]
    );

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.departments.length) e.departments = 'Select at least one department';
    if (showTeacherSelect && !form.teacherId) e.teacherId = 'Assign a teacher';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        courseCode: form.courseCode,
        departments: form.departments,
        year: form.year,
        semester: form.semester,
        sections: form.sectionsText
          .split(',')
          .map((section) => section.trim())
          .filter(Boolean),
        credits: form.credits ? Number(form.credits) : null,
        category: form.category,
        lectureTutorial: form.lectureTutorial,
        courseType: form.courseType,
        prerequisites: form.prerequisites,
        continuousEvaluation: form.continuousEvaluation ? Number(form.continuousEvaluation) : null,
        semesterEndExamination: form.semesterEndExamination ? Number(form.semesterEndExamination) : null,
        totalMarks: form.totalMarks ? Number(form.totalMarks) : null,
        status: form.status,
      };

      if (showTeacherSelect) {
        payload.assignedTeacherId = form.teacherId;
      }

      const requestPath = endpoint || (isEdit ? `/admin/courses/${course._id}` : '/admin/courses');
      const requestMethod = methodProp || (isEdit ? 'patch' : 'post');
      await api[requestMethod](requestPath, payload);

      toast.success(isEdit ? 'Course updated!' : 'Course created!');
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} course`);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900 text-lg">{isEdit ? 'Edit Course' : 'Create New Course'}</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Data Structures & Algorithms"
              className={inputCls}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Code</label>
              <input
                value={form.courseCode}
                onChange={(e) => set('courseCode', e.target.value)}
                placeholder="20AM3303 / 20DS3303"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Credits</label>
              <input
                value={form.credits}
                onChange={(e) => set('credits', e.target.value)}
                type="number"
                min="0"
                className={inputCls}
                placeholder="3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <input
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={inputCls}
                placeholder="Engineering Sciences"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Type</label>
              <input
                value={form.courseType}
                onChange={(e) => set('courseType', e.target.value)}
                className={inputCls}
                placeholder="Theory"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Lecture-Tutorial-Practical</label>
              <input
                value={form.lectureTutorial}
                onChange={(e) => set('lectureTutorial', e.target.value)}
                className={inputCls}
                placeholder="3-0-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Prerequisites</label>
              <input
                value={form.prerequisites}
                onChange={(e) => set('prerequisites', e.target.value)}
                className={inputCls}
                placeholder="Programming for Problem Solving Using C"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Continuous Eval</label>
              <input
                value={form.continuousEvaluation}
                onChange={(e) => set('continuousEvaluation', e.target.value)}
                type="number"
                min="0"
                className={inputCls}
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Semester End Exam</label>
              <input
                value={form.semesterEndExamination}
                onChange={(e) => set('semesterEndExamination', e.target.value)}
                type="number"
                min="0"
                className={inputCls}
                placeholder="70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Marks</label>
              <input
                value={form.totalMarks}
                onChange={(e) => set('totalMarks', e.target.value)}
                type="number"
                min="0"
                className={inputCls}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              className={inputCls + ' resize-none'}
              placeholder="Short course description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Departments *</label>
            <div className="flex gap-3 flex-wrap">
              {DEPTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDept(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.departments.includes(d) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                >
                  {d}
                </button>
              ))}
            </div>
            {errors.departments && <p className="text-xs text-red-500 mt-1">{errors.departments}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
              <select value={form.year} onChange={(e) => set('year', e.target.value)} className={inputCls + ' bg-white'}>
                {YEARS.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Semester</label>
              <select value={form.semester} onChange={(e) => set('semester', e.target.value)} className={inputCls + ' bg-white'}>
                {SEMS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sections</label>
            <input
              value={form.sectionsText}
              onChange={(e) => set('sectionsText', e.target.value)}
              placeholder="Section A, Section B"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls + ' bg-white'}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            {showTeacherSelect && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Teacher *</label>
                <select value={form.teacherId} onChange={(e) => set('teacherId', e.target.value)} className={inputCls + ' bg-white'}>
                  <option value="">Select a teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
                {errors.teacherId && <p className="text-xs text-red-500 mt-1">{errors.teacherId}</p>}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {loading && <Loader2 size={15} className="animate-spin" />} {isEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
