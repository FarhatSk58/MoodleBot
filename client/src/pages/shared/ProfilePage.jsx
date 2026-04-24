import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Upload } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import api from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2'];
const DEPTS = ['CSE-AIML', 'CSE-DS'];
const SKILL_LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced'];

const inputCls =
  'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';
const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';
const sectionTitle = 'text-xs font-bold text-slate-400 uppercase tracking-widest mb-4';

const commaToTags = (s) =>
  String(s || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

const tagsToComma = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

function StudentProfile({ user, login }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    college: '',
    department: 'CSE-AIML',
    year: '1st Year',
    semester: 'Semester 1',
    cgpa: '',
    skillsText: '',
    interestsText: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    preferredRolesText: '',
    skillLevel: '',
    goals: '',
    weakAreas: '',
    resumeUrl: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      college: user.college || '',
      department: user.department || 'CSE-AIML',
      year: user.year || '1st Year',
      semester: user.semester || 'Semester 1',
      cgpa: user.cgpa != null && user.cgpa !== '' ? String(user.cgpa) : '',
      skillsText: tagsToComma(user.skills),
      interestsText: tagsToComma(user.interests),
      linkedIn: user.linkedIn || '',
      github: user.github || '',
      portfolio: user.portfolio || '',
      preferredRolesText: tagsToComma(user.preferredRoles),
      skillLevel: user.skillLevel || '',
      goals: user.goals || '',
      weakAreas: user.weakAreas || '',
      resumeUrl: user.resumeUrl || '',
      currentPassword: '',
      newPassword: '',
    }));
  }, [user]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        college: form.college,
        department: form.department,
        year: form.year,
        semester: form.semester,
        cgpa: form.cgpa === '' ? undefined : Number(form.cgpa),
        skills: commaToTags(form.skillsText),
        interests: commaToTags(form.interestsText),
        linkedIn: form.linkedIn,
        github: form.github,
        portfolio: form.portfolio,
        preferredRoles: commaToTags(form.preferredRolesText),
        skillLevel: form.skillLevel,
        goals: form.goals,
        weakAreas: form.weakAreas,
        resumeUrl: form.resumeUrl,
      };
      if (form.currentPassword || form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const res = await api.patch('/auth/me', payload);
      login(res.data.data);
      toast.success('Profile saved');
      setForm((p) => ({ ...p, currentPassword: '', newPassword: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading('photo');
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await api.post('/auth/me/photo', fd);
      login(res.data.data);
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const onResume = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading('resume');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await api.post('/auth/me/resume', fd);
      login(res.data.data);
      toast.success('Resume uploaded');
      setForm((p) => ({ ...p, resumeUrl: res.data.data.user.resumeUrl || '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>Profile</h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative flex-shrink-0">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <label className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 cursor-pointer hover:text-indigo-700">
              <Upload size={16} />
              {uploading === 'photo' ? 'Uploading…' : 'Change photo'}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} disabled={uploading === 'photo'} />
            </label>
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className={labelCls}>Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={`${inputCls} bg-slate-50 text-slate-500`} value={user?.email || ''} readOnly />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 …" />
            </div>
            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Short introduction"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>Academics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>College</label>
            <input className={inputCls} value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="Institution name" />
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <select className={inputCls} value={form.department} onChange={(e) => set('department', e.target.value)}>
              {DEPTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Year / Semester</label>
            <div className="flex gap-2">
              <select className={inputCls} value={form.year} onChange={(e) => set('year', e.target.value)}>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select className={inputCls} value={form.semester} onChange={(e) => set('semester', e.target.value)}>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>CGPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className={inputCls}
              value={form.cgpa}
              onChange={(e) => set('cgpa', e.target.value)}
              placeholder="e.g. 8.5"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>Skills &amp; interests</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Skills (comma-separated tags)</label>
            <input
              className={inputCls}
              value={form.skillsText}
              onChange={(e) => set('skillsText', e.target.value)}
              placeholder="React, Node.js, SQL"
            />
          </div>
          <div>
            <label className={labelCls}>Interests</label>
            <input
              className={inputCls}
              value={form.interestsText}
              onChange={(e) => set('interestsText', e.target.value)}
              placeholder="Systems, ML, …"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>Career</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Resume (file)</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Upload size={16} />
                {uploading === 'resume' ? 'Uploading…' : 'Upload resume'}
                <input type="file" className="hidden" onChange={onResume} disabled={uploading === 'resume'} />
              </label>
              {form.resumeUrl && (
                <a href={form.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 font-medium hover:underline">
                  View current file
                </a>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">Or paste a link below if you host your resume elsewhere.</p>
          </div>
          <div>
            <label className={labelCls}>Resume URL (optional)</label>
            <input
              className={inputCls}
              value={form.resumeUrl}
              onChange={(e) => set('resumeUrl', e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>LinkedIn</label>
              <input className={inputCls} value={form.linkedIn} onChange={(e) => set('linkedIn', e.target.value)} placeholder="Profile URL" />
            </div>
            <div>
              <label className={labelCls}>GitHub</label>
              <input className={inputCls} value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="Username or URL" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Portfolio</label>
            <input className={inputCls} value={form.portfolio} onChange={(e) => set('portfolio', e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <label className={labelCls}>Preferred roles (comma-separated)</label>
            <input
              className={inputCls}
              value={form.preferredRolesText}
              onChange={(e) => set('preferredRolesText', e.target.value)}
              placeholder="Backend, Full-stack, …"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>AI personalization</h2>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Skill level</label>
            <select className={inputCls} value={form.skillLevel} onChange={(e) => set('skillLevel', e.target.value)}>
              {SKILL_LEVELS.map((lvl) => (
                <option key={lvl || 'unset'} value={lvl}>
                  {lvl || 'Select…'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Goals</label>
            <textarea className={`${inputCls} min-h-[80px]`} value={form.goals} onChange={(e) => set('goals', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Weak areas</label>
            <textarea className={`${inputCls} min-h-[80px]`} value={form.weakAreas} onChange={(e) => set('weakAreas', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>Security</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              className={inputCls}
              value={form.currentPassword}
              onChange={(e) => set('currentPassword', e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className={labelCls}>New password</label>
            <input
              type="password"
              className={inputCls}
              value={form.newPassword}
              onChange={(e) => set('newPassword', e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : null}
        Save profile
      </button>
    </form>
  );
}

function TeacherProfile({ user, login }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    department: 'CSE-AIML',
    designation: '',
    experience: '',
    specialization: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      department: user.department || 'CSE-AIML',
      designation: user.designation || '',
      experience: user.experience || '',
      specialization: user.specialization || '',
      currentPassword: '',
      newPassword: '',
    }));
  }, [user]);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        department: form.department,
        designation: form.designation,
        experience: form.experience,
        specialization: form.specialization,
      };
      if (form.currentPassword || form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const res = await api.patch('/auth/me', payload);
      login(res.data.data);
      toast.success('Profile saved');
      setForm((p) => ({ ...p, currentPassword: '', newPassword: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await api.post('/auth/me/photo', fd);
      login(res.data.data);
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>Profile</h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative flex-shrink-0">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <label className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 cursor-pointer hover:text-indigo-700">
              <Upload size={16} />
              {uploading ? 'Uploading…' : 'Change photo'}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} disabled={uploading} />
            </label>
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className={labelCls}>Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={`${inputCls} bg-slate-50 text-slate-500`} value={user?.email || ''} readOnly />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Bio</label>
              <textarea className={`${inputCls} min-h-[100px]`} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>Professional</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Department</label>
            <select className={inputCls} value={form.department} onChange={(e) => set('department', e.target.value)}>
              {DEPTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Designation</label>
            <input className={inputCls} value={form.designation} onChange={(e) => set('designation', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Experience</label>
            <textarea className={`${inputCls} min-h-[80px]`} value={form.experience} onChange={(e) => set('experience', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Specialization</label>
            <input className={inputCls} value={form.specialization} onChange={(e) => set('specialization', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className={sectionTitle}>Security</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              className={inputCls}
              value={form.currentPassword}
              onChange={(e) => set('currentPassword', e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className={labelCls}>New password</label>
            <input
              type="password"
              className={inputCls}
              value={form.newPassword}
              onChange={(e) => set('newPassword', e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-all disabled:opacity-60"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : null}
        Save profile
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <PageHeader title="Edit profile" subtitle="Keep your details up to date for a better experience." />

          {user?.role === 'student' && <StudentProfile user={user} login={login} />}
          {user?.role === 'teacher' && <TeacherProfile user={user} login={login} />}
          {user?.role === 'admin' && (
            <p className="text-slate-600 text-sm">Use the admin tools to manage your account.</p>
          )}
        </div>
      </main>
    </div>
  );
}
