import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';

const ROLE_HOME = { student: '/student/courses', teacher: '/teacher/courses' };
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2'];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    year: '1st Year',
    semester: 'Semester 1',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const domain = import.meta.env.VITE_COLLEGE_DOMAIN || 'pvpsit.ac.in';

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    if (!form.email) nextErrors.email = 'Email is required';
    else if (!form.email.endsWith(`@${domain}`)) nextErrors.email = `Email must end with @${domain}`;
    if (!form.password || form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (form.role === 'student' || form.role === 'teacher') {
      if (!form.department) nextErrors.department = 'Department is required';
    }
    if (form.role === 'student') {
      if (!form.year) nextErrors.year = 'Year is required';
      if (!form.semester) nextErrors.semester = 'Semester is required';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      if (form.role === 'student' || form.role === 'teacher') payload.department = form.department;
      if (form.role === 'student') {
        payload.year = form.year;
        payload.semester = form.semester;
      }

      const res = await api.post('/auth/register', payload);
      login(res.data.data);
      toast.success('Account created!');
      navigate(ROLE_HOME[res.data.data.user.role] || '/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mb-3">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">Join EduAI LMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" className={inputCls} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className={labelCls}>College Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder={`you@${domain}`} className={inputCls} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className={labelCls}>Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min 8 characters" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowPw((prev) => !prev)} aria-label={showPw ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className={labelCls}>Role <span className="text-red-500">*</span></label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className={`${inputCls} bg-white`}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div className={`space-y-4 transition-all duration-300 overflow-hidden ${form.role === 'student' || form.role === 'teacher' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div>
              <label className={labelCls}>Department <span className="text-red-500">*</span></label>
              <select value={form.department} onChange={(e) => set('department', e.target.value)} className={`${inputCls} bg-white`}>
                <option value="">Select department</option>
                <option value="CSE-AIML">CSE-AIML</option>
                <option value="CSE-DS">CSE-DS</option>
              </select>
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
            </div>

            {form.role === 'student' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Year <span className="text-red-500">*</span></label>
                  <select value={form.year} onChange={(e) => set('year', e.target.value)} className={`${inputCls} bg-white`}>
                    {YEARS.map((year) => <option key={year}>{year}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Semester <span className="text-red-500">*</span></label>
                  <select value={form.semester} onChange={(e) => set('semester', e.target.value)} className={`${inputCls} bg-white`}>
                    {SEMESTERS.map((semester) => <option key={semester}>{semester}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
