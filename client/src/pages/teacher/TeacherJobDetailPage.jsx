import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Users,
  Bell,
  CheckCircle2,
  Mail,
  Loader2,
  Send,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import Sidebar from '../../components/shared/Sidebar';

export default function TeacherJobDetailPage() {
  const { id } = useParams();
  const { data, loading, refetch } = useFetch(`/jobs/${id}`, [id]);
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/jobs/${id}/announcement`, { message: announcementMsg });
      toast.success('Announcement posted!');
      setAnnouncementMsg('');
      refetch();
    } catch (err) {
      toast.error('Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[var(--sidebar-width)] flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </main>
      </div>
    );
  }

  if (!data?.job) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[var(--sidebar-width)] flex-1 flex items-center justify-center bg-slate-50 min-h-screen p-10">
          <p className="text-slate-600">Job not found.</p>
        </main>
      </div>
    );
  }

  const { job, registrations, announcements } = data;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <Link
        to="/teacher/jobs"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl shadow-inner">
                {job.companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">{job.role}</h1>
                <p className="text-lg text-slate-500 font-medium">{job.companyName}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 py-6 border-y border-slate-100">
              <div className="flex items-center gap-2.5">
                <Calendar className="text-slate-400" size={20} />
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Deadline:</span>
                <span className="text-sm font-bold text-slate-900">
                  {new Date(job.deadline).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="text-slate-400" size={20} />
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tracked:</span>
                <span className="text-sm font-bold text-indigo-600">{registrations.length} Students</span>
              </div>
              <a
                href={job.applyLink}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1.5"
              >
                External Application Link <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Student Registrations Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Registered Students</h2>
              <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
                {registrations.length} Total
              </span>
            </div>
            {registrations.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Users className="mx-auto mb-4 opacity-20" size={48} />
                <p>No students have registered for this job yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Department / Year</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {registrations.map((reg) => (
                      <tr key={reg._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{reg.studentId?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Applied on {new Date(reg.appliedAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 font-medium">{reg.studentId?.department}</span>
                          <span className="mx-2 text-slate-300">|</span>
                          <span className="text-sm text-slate-500">{reg.studentId?.year} Year</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={12} />
                            Registered
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`mailto:${reg.studentId?.email}`}
                            className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 flex items-center justify-center transition-all bg-white shadow-sm"
                            title="Send Email"
                          >
                            <Mail size={16} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="text-indigo-600" size={20} />
              Announcements
            </h2>
            <form onSubmit={handlePostAnnouncement} className="space-y-3 mb-6">
              <textarea
                placeholder="Post an update for students..."
                className="w-full h-24 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
              />
              <button
                type="submit"
                disabled={submitting || !announcementMsg.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Send Update
              </button>
            </form>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {announcements.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No announcements yet.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">{ann.message}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-wider">
                      {new Date(ann.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  );
}
