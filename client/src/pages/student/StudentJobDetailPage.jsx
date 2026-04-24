import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Bell,
  Loader2,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import Sidebar from '../../components/shared/Sidebar';

export default function StudentJobDetailPage() {
  const { id } = useParams();
  const { data, loading, refetch } = useFetch(`/jobs/${id}`, [id]);
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post(`/jobs/${id}/register`);
      toast.success('Registration tracked successfully!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[var(--sidebar-width)] flex-1 flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </main>
      </div>
    );
  }

  if (!data?.job) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[var(--sidebar-width)] flex-1 flex items-center justify-center bg-slate-50 p-10">
          <p className="text-slate-600">Job not found.</p>
        </main>
      </div>
    );
  }

  const { job, registrations, announcements } = data;
  const isRegistered = registrations.length > 0;
  const isExpired = new Date(job.deadline) < new Date();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <Link
            to="/student/jobs"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Jobs
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  
                  {/* Company + Role */}
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-2xl shadow-inner">
                      {job?.companyName?.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                        {job?.role}
                      </h1>
                      <p className="text-lg text-slate-500 font-medium">
                        {job?.companyName}
                      </p>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="flex items-center gap-3">
                    <a
                      href={job?.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-white border-2 border-slate-900 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      Apply Externally <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-t border-slate-100">
                  
                  {/* Deadline */}
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Application Deadline
                      </p>
                      <p
                        className={cn(
                          "font-bold text-sm",
                          isExpired ? "text-rose-500" : "text-slate-900"
                        )}
                      >
                        {job?.deadline &&
                          new Date(job.deadline).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Job Category
                      </p>
                      <p className="font-bold text-sm text-slate-900">
                        Campus Recruitment
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Section */}
                <div className="mt-8">
                  {isRegistered ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900">
                          You're Registered!
                        </h3>
                        <p className="text-emerald-700 text-sm">
                          We've tracked your application. Look out for updates in the announcements feed.
                        </p>
                      </div>
                    </div>
                  ) : isExpired ? (
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 flex items-center gap-4 grayscale">
                      <div className="w-12 h-12 rounded-full bg-slate-300 text-white flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-600">
                          Application Closed
                        </h3>
                        <p className="text-slate-500 text-sm">
                          The deadline for this job has passed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-slate-500 leading-relaxed italic border-l-2 border-indigo-100 pl-4">
                        Once you've submitted your application on the company's portal, mark yourself as "Registered" below.
                      </p>

                      <button
                        onClick={handleRegister}
                        disabled={registering}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {registering ? (
                          <Loader2 className="animate-spin" size={24} />
                        ) : (
                          <CheckCircle2 size={24} />
                        )}
                        Mark as Registered
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - ANNOUNCEMENTS */}
            <div className="space-y-6">
              <div className="bg-indigo-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-4">
                    <Bell size={14} />
                    Announcements
                  </div>

                  <div className="space-y-6">
                    {announcements.length === 0 ? (
                      <p className="text-indigo-300 text-sm italic py-4">
                        No updates for this role yet.
                      </p>
                    ) : (
                      announcements.map((ann, i) => (
                        <div
                          key={ann._id}
                          className={cn(
                            "relative pl-6 pb-6",
                            i !== announcements.length - 1 &&
                              "border-l border-indigo-700/50"
                          )}
                        >
                          <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-400" />

                          <p className="text-sm text-indigo-50 leading-relaxed">
                            {ann.message}
                          </p>

                          <p className="text-[10px] font-bold text-indigo-400 mt-2 tracking-wider">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}