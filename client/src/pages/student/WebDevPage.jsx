import { Monitor, Server, MonitorSmartphone, ExternalLink } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import { cn } from '../../lib/utils';

const ROADMAPS = [
  { 
    id: 'frontend', 
    title: 'Frontend Developer', 
    description: 'Step by step guide to becoming a frontend developer in 2026',
    url: 'https://roadmap.sh/frontend', 
    icon: Monitor, 
    accent: 'indigo'
  },
  { 
    id: 'backend', 
    title: 'Backend Developer', 
    description: 'Step by step guide to becoming a backend developer in 2026',
    url: 'https://roadmap.sh/backend', 
    icon: Server, 
    accent: 'emerald'
  },
  { 
    id: 'fullstack', 
    title: 'Full Stack Developer', 
    description: 'Step by step guide to becoming a full stack developer in 2026',
    url: 'https://roadmap.sh/full-stack', 
    icon: MonitorSmartphone, 
    accent: 'violet'
  },
];

export default function WebDevPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col">
          
          <div className="mb-8">
            <PageHeader title="Web Development" subtitle="Interactive learning roadmaps for every discipline" />
          </div>

          {/* Cards View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {ROADMAPS.map((roadmap) => {
              const Icon = roadmap.icon;
              return (
                <a
                  key={roadmap.id}
                  href={roadmap.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-left transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-300 block"
                >
                  <div className={cn(
                    'absolute top-0 right-0 -m-12 w-32 h-32 blur-3xl rounded-full transition-opacity opacity-0 group-hover:opacity-20 pointer-events-none',
                    roadmap.accent === 'indigo' && 'bg-indigo-500',
                    roadmap.accent === 'emerald' && 'bg-emerald-500',
                    roadmap.accent === 'violet' && 'bg-violet-500'
                  )}></div>

                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110',
                    roadmap.accent === 'indigo' && 'bg-indigo-50 text-indigo-600 border border-indigo-100',
                    roadmap.accent === 'emerald' && 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                    roadmap.accent === 'violet' && 'bg-violet-50 text-violet-600 border border-violet-100'
                  )}>
                    <Icon size={24} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{roadmap.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    {roadmap.description}
                  </p>

                  <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 opacity-60 group-hover:opacity-100 transition-opacity">
                    Open Roadmap <ExternalLink size={14} />
                  </div>
                </a>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
