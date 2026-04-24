import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Code2, Database, Layers, RefreshCw, Server, Layout } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../lib/axios';

const STATUS_META = [
  { min: 0, max: 4, label: 'Needs significant improvement', cls: 'text-red-500' },
  { min: 4, max: 6, label: 'Average — you can do better', cls: 'text-amber-500' },
  { min: 6, max: 8, label: 'Good — keep pushing', cls: 'text-indigo-500' },
  { min: 8, max: Infinity, label: 'Excellent work', cls: 'text-emerald-500' },
];

const to1 = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Number(num.toFixed(1));
};

const pct0100 = (score0to10) => {
  const s = Number(score0to10) || 0;
  return Math.max(0, Math.min(100, (s / 10) * 100));
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 border-l-4 border-l-indigo-500">
        <div className="h-3 w-40 bg-slate-100 rounded" />
        <div className="mt-3 h-12 w-56 bg-slate-100 rounded" />
        <div className="mt-3 h-4 w-64 bg-slate-100 rounded" />
        <div className="mt-5 h-3 w-full bg-slate-100 rounded" />
        <div className="mt-3 flex gap-4">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-slate-100 rounded" />
              <div className="h-7 w-16 bg-slate-100 rounded" />
            </div>
            <div className="mt-4 h-2 bg-slate-100 rounded-full" />
            <div className="mt-4 h-4 w-64 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="h-5 w-56 bg-slate-100 rounded" />
        <div className="mt-2 h-4 w-64 bg-slate-100 rounded" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-12 w-full bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PillarIcon({ pillar, className }) {
  if (pillar === 'corecs') return <BookOpen className={className} size={18} />;
  if (pillar === 'dsa') return <Layers className={className} size={18} />;
  if (pillar === 'sql') return <Database className={className} size={18} />;
  return <Code2 className={className} size={18} />;
}

const PILLAR_ROUTE = { corecs: '/student/courses', dsa: '/student/dsa', sql: '/student/sql', webdev: '/student/webdev' };

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/student/dashboard');
      setData(res?.data?.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const overallScore = to1(data?.overallScore || 0);
  const coreCS = data?.coreCS || null;
  const dsa = data?.dsa || null;
  const sql = data?.sql || null;
  const webDev = data?.webDev || null;
  const focusAreas = Array.isArray(data?.focusAreas) ? data.focusAreas : [];

  const status = useMemo(() => {
    const row = STATUS_META.find((r) => overallScore >= r.min && overallScore < r.max) || STATUS_META[0];
    return row;
  }, [overallScore]);

  const segments = useMemo(() => {
    const contributions = [
      { key: 'corecs', label: 'Core CS', color: 'bg-indigo-500', value: (Number(coreCS?.score || 0) * 0.40) },
      { key: 'dsa', label: 'DSA', color: 'bg-emerald-500', value: (Number(dsa?.score || 0) * 0.25) },
      { key: 'sql', label: 'SQL', color: 'bg-amber-500', value: (Number(sql?.score || 0) * 0.20) },
      { key: 'webdev', label: 'Web Dev', color: 'bg-blue-500', value: (Number(webDev?.score || 0) * 0.15) },
    ];
    const total = contributions.reduce((sum, c) => sum + c.value, 0);
    const fallback = [
      { key: 'corecs', label: 'Core CS', color: 'bg-indigo-500', value: 0.40 },
      { key: 'dsa', label: 'DSA', color: 'bg-emerald-500', value: 0.25 },
      { key: 'sql', label: 'SQL', color: 'bg-amber-500', value: 0.20 },
      { key: 'webdev', label: 'Web Dev', color: 'bg-blue-500', value: 0.15 },
    ];
    const base = total > 0 ? contributions : fallback;
    const baseTotal = base.reduce((sum, c) => sum + c.value, 0) || 1;
    return base.map((s) => ({ ...s, width: `${Math.max(2, Math.round((s.value / baseTotal) * 100))}%` }));
  }, [coreCS?.score, dsa?.score, sql?.score, webDev?.score]);

  const toggleCard = useCallback((pillar) => {
    setActiveCard((prev) => (prev === pillar ? null : pillar));
  }, []);

  if (loading && !data) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen pb-12">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen pb-12 flex items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 max-w-md w-full mx-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
              <RefreshCw size={20} />
            </div>
            <p className="mt-4 text-slate-900 font-semibold">Failed to load dashboard. Try again.</p>
            <p className="mt-1 text-xs text-slate-400">{error}</p>
            <button
              type="button"
              onClick={loadDashboard}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 border-l-4 border-l-indigo-500">
            <p className="text-xs uppercase tracking-wide text-slate-400">Interview Readiness</p>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-5xl font-bold text-slate-900 tabular-nums">
                {overallScore} <span className="text-2xl text-slate-400 font-semibold">/ 10</span>
              </p>
            </div>
            <p className={`mt-2 text-sm font-semibold ${status.cls}`}>{status.label}</p>

            <div className="mt-5 h-3 rounded-full bg-slate-100 overflow-hidden flex">
              {segments.map((s) => (
                <div key={s.key} className={s.color} style={{ width: s.width }} />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {segments.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('corecs')}
              onKeyDown={(e) => (e.key === 'Enter' ? toggleCard('corecs') : null)}
              className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 border-l-4 border-l-indigo-500 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <BookOpen size={18} className="text-indigo-600" />
                    <span>Core CS</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-indigo-600 tabular-nums">{to1(coreCS?.score || 0)}</p>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform ${activeCard === 'corecs' ? 'rotate-180' : ''}`} />
              </div>

              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct0100(coreCS?.score || 0)}%` }} />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {(coreCS?.totalQuestionsAttempted || 0)} questions answered across {(coreCS?.strongCourses?.length || 0) + (coreCS?.weakCourses?.length || 0)} courses
              </p>

              <div className={`transition-all duration-300 overflow-hidden ${activeCard === 'corecs' ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pt-5 space-y-4">
                  {(coreCS?.strongCourses || []).length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Strong Courses</p>
                      <div className="mt-2 space-y-2">
                        {coreCS.strongCourses.map((c) => (
                          <div key={c.courseId} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm text-slate-700 font-semibold truncate">{c.title}</p>
                              <p className="text-sm font-bold text-emerald-600 tabular-nums">{to1(c.avgScore)}</p>
                            </div>
                            <div className="mt-2 h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct0100(c.avgScore)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(coreCS?.weakCourses || []).length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Weak Courses</p>
                      <div className="mt-2 space-y-2">
                        {coreCS.weakCourses.map((c) => (
                          <div key={c.courseId} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm text-slate-700 font-semibold truncate">{c.title}</p>
                              <p className="text-sm font-bold text-red-500 tabular-nums">{to1(c.avgScore)}</p>
                            </div>
                            <div className="mt-2 h-1.5 bg-red-50 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct0100(c.avgScore)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
                    Mock Interviews Attended: <span className="font-semibold text-slate-900 tabular-nums">{coreCS?.mockInterviewsAttended || 0}</span>
                    <span className="text-slate-300"> | </span>
                    Avg Score: <span className="font-semibold text-slate-900 tabular-nums">{to1(coreCS?.mockInterviewAvgScore || 0)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/student/courses');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                  >
                    Practice Now <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('dsa')}
              onKeyDown={(e) => (e.key === 'Enter' ? toggleCard('dsa') : null)}
              className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 border-l-4 border-l-emerald-500 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <Layers size={18} className="text-emerald-600" />
                    <span>DSA</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-emerald-600 tabular-nums">{to1(dsa?.score || 0)}</p>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform ${activeCard === 'dsa' ? 'rotate-180' : ''}`} />
              </div>

              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct0100(dsa?.score || 0)}%` }} />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {(dsa?.solved || 0)} of {(dsa?.total || 0)} problems solved
              </p>

              <div className={`transition-all duration-300 overflow-hidden ${activeCard === 'dsa' ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pt-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold text-emerald-700">Easy</p>
                      <p className="mt-1 text-sm font-bold text-emerald-800 tabular-nums">{dsa?.easyStats?.solved || 0} / {dsa?.easyStats?.total || 0}</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-700">Medium</p>
                      <p className="mt-1 text-sm font-bold text-amber-800 tabular-nums">{dsa?.mediumStats?.solved || 0} / {dsa?.mediumStats?.total || 0}</p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="text-xs font-semibold text-rose-700">Hard</p>
                      <p className="mt-1 text-sm font-bold text-rose-800 tabular-nums">{dsa?.hardStats?.solved || 0} / {dsa?.hardStats?.total || 0}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">Topic Breakdown</p>
                    <div className="mt-2 space-y-2">
                      {(dsa?.topicBreakdown || []).map((t) => {
                        const isWeak = (t.percentage || 0) < 30;
                        return (
                          <div key={t.topic} className={`rounded-xl border border-slate-200 p-3 ${isWeak ? 'bg-red-50' : 'bg-white'}`}>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-700 truncate">{t.topic}</p>
                              <p className="text-sm font-bold text-slate-900 tabular-nums">{t.percentage}%</p>
                            </div>
                            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, t.percentage || 0))}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-slate-500 tabular-nums">{t.solved} / {t.total} solved</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/student/dsa');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                  >
                    Continue Sheet <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('sql')}
              onKeyDown={(e) => (e.key === 'Enter' ? toggleCard('sql') : null)}
              className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 border-l-4 border-l-amber-500 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <Database size={18} className="text-amber-600" />
                    <span>SQL</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-amber-600 tabular-nums">{to1(sql?.score || 0)}</p>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform ${activeCard === 'sql' ? 'rotate-180' : ''}`} />
              </div>

              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct0100(sql?.score || 0)}%` }} />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {(sql?.solved || 0)} of {(sql?.total || 0)} problems solved
              </p>

              <div className={`transition-all duration-300 overflow-hidden ${activeCard === 'sql' ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pt-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold text-emerald-700">Easy</p>
                      <p className="mt-1 text-sm font-bold text-emerald-800 tabular-nums">{sql?.easyStats?.solved || 0} / {sql?.easyStats?.total || 0}</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-700">Medium</p>
                      <p className="mt-1 text-sm font-bold text-amber-800 tabular-nums">{sql?.mediumStats?.solved || 0} / {sql?.mediumStats?.total || 0}</p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="text-xs font-semibold text-rose-700">Hard</p>
                      <p className="mt-1 text-sm font-bold text-rose-800 tabular-nums">{sql?.hardStats?.solved || 0} / {sql?.hardStats?.total || 0}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">Topic Breakdown</p>
                    <div className="mt-2 space-y-2">
                      {(sql?.topicBreakdown || []).map((t) => {
                        const isWeak = (t.percentage || 0) < 30;
                        return (
                          <div key={t.topic} className={`rounded-xl border border-slate-200 p-3 ${isWeak ? 'bg-red-50' : 'bg-white'}`}>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-700 truncate">{t.topic}</p>
                              <p className="text-sm font-bold text-slate-900 tabular-nums">{t.percentage}%</p>
                            </div>
                            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, t.percentage || 0))}%` }} />
                            </div>
                            <p className="mt-1 text-xs text-slate-500 tabular-nums">{t.solved} / {t.total} solved</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/student/sql');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700"
                  >
                    Continue Sheet <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleCard('webdev')}
              onKeyDown={(e) => (e.key === 'Enter' ? toggleCard('webdev') : null)}
              className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 border-l-4 border-l-blue-500 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <Code2 size={18} className="text-blue-600" />
                    <span>Web Dev</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-blue-600 tabular-nums">{to1(webDev?.score || 0)}</p>
                </div>
                <ChevronDown className={`text-slate-400 transition-transform ${activeCard === 'webdev' ? 'rotate-180' : ''}`} />
              </div>

              <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct0100(webDev?.score || 0)}%` }} />
              </div>

              <p className="mt-4 text-sm text-slate-500">
                {webDev?.score ? `${webDev.completedTopics} of ${webDev.totalTopics} roadmap topics complete` : 'Roadmap not started yet'}
              </p>

              <div className={`transition-all duration-300 overflow-hidden ${activeCard === 'webdev' ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pt-5 space-y-4">
                  {!webDev?.currentRoadmap ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                            <Layout size={18} />
                          </span>
                          <p className="text-sm font-semibold text-slate-700">Frontend</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                            <Server size={18} />
                          </span>
                          <p className="text-sm font-semibold text-slate-700">Backend</p>
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                            <Code2 size={18} />
                          </span>
                          <p className="text-sm font-semibold text-slate-700">Fullstack</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800 truncate">Current roadmap: {webDev.currentRoadmap}</p>
                        <p className="text-sm font-bold text-slate-900 tabular-nums">{webDev.percentageComplete}%</p>
                      </div>
                      <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, webDev.percentageComplete || 0))}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/student/webdev');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    Go to Roadmap <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">Focus On These Today</p>
                <p className="text-sm text-slate-400">Based on your current performance</p>
              </div>
              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            {focusAreas.length === 0 ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-700">
                <CheckCircle2 size={18} />
                <p className="text-sm font-semibold">You&apos;re on track across all areas. Keep it up!</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {focusAreas.slice(0, 3).map((f) => (
                  <div key={`${f.pillar}-${f.priority}`} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-sm font-bold tabular-nums">
                      {f.priority}
                    </span>
                    <PillarIcon pillar={f.pillar} className={f.pillar === 'corecs' ? 'text-indigo-600' : f.pillar === 'dsa' ? 'text-emerald-600' : f.pillar === 'sql' ? 'text-amber-600' : 'text-blue-600'} />
                    <p className="text-sm text-slate-700 min-w-0">{f.message}</p>
                    <button
                      type="button"
                      onClick={() => navigate(PILLAR_ROUTE[f.pillar] || '/student/dashboard')}
                      className="ml-auto w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center"
                      aria-label="Go"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
