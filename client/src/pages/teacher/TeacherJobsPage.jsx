import { useState } from 'react';
import { Briefcase, Calendar, Plus, ExternalLink, Users, Loader2 } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';

export default function TeacherJobsPage() {
  const { data: jobs, loading, refetch } = useFetch('/jobs/teacher');
  const list = jobs || [];
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    applyLink: '',
    deadline: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/jobs', formData);
      toast.success('Job posted successfully!');
      setShowModal(false);
      setFormData({ companyName: '', role: '', applyLink: '', deadline: '' });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Opportunities</h1>
          <p className="text-slate-500 mt-1">Post and track openings for your students.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          Add New Job
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-900">No jobs posted yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">Start by adding your first job opportunity for students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((job) => (
            <div key={job._id} className="group bg-white border border-slate-200 rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                  {job.companyName.charAt(0)}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                {job.role}
              </h3>
              <p className="text-slate-500 font-medium mt-1">{job.companyName}</p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="font-medium">Deadline:</span>
                  <span>{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Users size={16} className="text-slate-400" />
                  <span className="font-medium">Registered:</span>
                  <span className="text-indigo-600 font-bold">{job.registrationCount || 0} students</span>
                </div>
              </div>

              <div className="mt-auto pt-6 flex gap-2">
                <Link
                  to={`/teacher/jobs/${job._id}`}
                  className="flex-1 text-center bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Manage
                </Link>
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 flex items-center justify-center border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-100 transition-all"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Post New Job</h2>
              <p className="text-slate-500 mt-1 text-sm">Fill in the details for the new opening.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Company Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Google, Microsoft"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Job Role</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Software Engineer I"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Application URL</label>
                <input
                  required
                  type="url"
                  placeholder="https://careers.google.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                  value={formData.applyLink}
                  onChange={e => setFormData({ ...formData, applyLink: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Deadline Date</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
      </main>
    </div>
  );
}
