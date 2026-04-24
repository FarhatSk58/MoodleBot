import { Link } from 'react-router-dom';
import { Briefcase, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import Sidebar from '../../components/shared/Sidebar';
import { cn } from '../../lib/utils';

export default function StudentJobsPage() {
  const { data: jobs, loading } = useFetch('/jobs/student');
  const list = jobs || [];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Discover</h1>
            <p className="text-slate-500 mt-1">
              Explore curated opportunities and track your applications.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-slate-900">No active jobs</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                New job opportunities will appear here once posted by teachers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((job) => (
                <div
                  key={job._id}
                  className="group bg-white border border-slate-200 rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-indigo-100/30 hover:border-indigo-100 flex flex-col h-full relative overflow-hidden"
                >
                  {job.isRegistered && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-sm">
                      Registered
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      {job.companyName.charAt(0)}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {job.role}
                  </h3>
                  <p className="text-slate-500 font-medium mt-1">{job.companyName}</p>

                  <div className="mt-6 flex items-center gap-2.5 text-sm text-slate-600 flex-1">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="font-medium">Apply by</span>
                    <span
                      className={cn(
                        'font-bold',
                        new Date(job.deadline) < new Date() ? 'text-rose-500' : 'text-slate-900'
                      )}
                    >
                      {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <Link
                      to={`/student/jobs/${job._id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                      View Job Details
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
