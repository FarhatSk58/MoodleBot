import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const DEPTS = ['CSE-AIML', 'CSE-DS'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMS = ['Semester 1', 'Semester 2'];

export default function CourseFormModal({ onClose, onSuccess, teachers = [] }) {
  const [form, setForm] = useState({ title: '', description: '', departments: [], year: '2nd Year', semester: 'Semester 1', teacherId: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const toggleDept = (d) => set('departments', form.departments.includes(d) ? form.departments.filter(x => x !== d) : [...form.departments, d]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.departments.length) e.departments = 'Select at least one department';
    if (!form.teacherId) e.teacherId = 'Assign a teacher';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        assignedTeacherId: form.teacherId,
      };
      delete payload.teacherId;
      await api.post('/admin/courses', payload);
      toast.success('Course created!');
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900 text-lg">Create New Course</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Data Structures & Algorithms" className={inputCls} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className={inputCls + ' resize-none'} placeholder="Short course description" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Departments *</label>
            <div className="flex gap-3">
              {DEPTS.map(d => (
                <button key={d} type="button" onClick={() => toggleDept(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.departments.includes(d) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                  {d}
                </button>
              ))}
            </div>
            {errors.departments && <p className="text-xs text-red-500 mt-1">{errors.departments}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
              <select value={form.year} onChange={e => set('year', e.target.value)} className={inputCls + ' bg-white'}>
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Semester</label>
              <select value={form.semester} onChange={e => set('semester', e.target.value)} className={inputCls + ' bg-white'}>
                {SEMS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Teacher *</label>
            <select value={form.teacherId} onChange={e => set('teacherId', e.target.value)} className={inputCls + ' bg-white'}>
              <option value="">Select a teacher</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            {errors.teacherId && <p className="text-xs text-red-500 mt-1">{errors.teacherId}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-60">
              {loading && <Loader2 size={15} className="animate-spin" />} Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
