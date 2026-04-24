import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, RotateCcw, Play, Send } from 'lucide-react';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import TaskEditorPanel from '../../components/student/tasks/TaskEditorPanel';
import {
  detectLanguageFromSkills,
  taskDraftStorageKey,
  getBoilerplate,
} from '../../components/student/tasks/taskUiUtils';
import { useFetch } from '../../hooks/useFetch';
import axios from '../../lib/axios';
import { cn } from '../../lib/utils';
import UnitSidebar from '../../components/student/UnitSidebar';

const BOTTOM_TABS = [
  { id: 'output', label: 'Output' },
  { id: 'tests', label: 'Test Cases' },
  { id: 'console', label: 'Console' },
];

export default function TaskWorkspacePage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const parsedTaskId = useMemo(() => {
    const raw = String(taskId || '');
    const [parsedTopicId, parsedTaskIndex] = raw.split('--');
    const numericIndex = Number.parseInt(parsedTaskIndex, 10);
    return {
      topicId: parsedTopicId || '',
      taskIndex: Number.isInteger(numericIndex) ? numericIndex : -1,
    };
  }, [taskId]);

  const topicId = String(location.state?.topicId || parsedTaskId.topicId || '');
  const taskIndex = Number.isInteger(location.state?.taskIndex)
    ? Number(location.state.taskIndex)
    : parsedTaskId.taskIndex;

  const { data, loading, error, refetch } = useFetch(topicId ? `/student/topics/${topicId}` : '', [topicId]);

  const task = data?.aiContent?.tasks?.[taskIndex];
  const topic = data?.topic;
  const courseId = String(location.state?.courseId || topic?.courseId || '');

  // Sidebar State & Data
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unitData, setUnitData] = useState(null);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!courseId) return;
      try {
        const res = await axios.get(`/student/courses/${courseId}/topics/by-unit`);
        setUnitData(res.data.data?.units || []);
      } catch (err) {
        console.error('Failed to fetch units', err);
      }
    };
    fetchUnits();
  }, [courseId]);

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [bottomTab, setBottomTab] = useState('output');
  const [outputText, setOutputText] = useState('');
  const [consoleLines, setConsoleLines] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const testCases = task?.test_cases || [];
  const storageKey = useMemo(
    () => (topicId && Number.isInteger(taskIndex) ? taskDraftStorageKey(topicId, taskIndex) : null),
    [topicId, taskIndex]
  );

  useEffect(() => {
    if (!task || !storageKey) return;
    const fromSkills = detectLanguageFromSkills(task.skills_practiced);
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.code === 'string') setCode(parsed.code);
        if (typeof parsed.language === 'string') setLanguage(parsed.language);
        return;
      }
    } catch {
      /* ignore */
    }
    setLanguage(fromSkills);
    // If no draft, use boilerplate
    setCode(getBoilerplate(fromSkills));
  }, [task, storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ code, language }));
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [code, language, storageKey]);

  const appendConsole = useCallback((line) => {
    const stamp = new Date().toLocaleTimeString();
    setConsoleLines((prev) => [...prev.slice(-200), `[${stamp}] ${line}`]);
  }, []);

  const topicPagePath = courseId
    ? `/student/courses/${courseId}/topics/${topicId}`
    : '/student/learning';
  const workspaceBackTo =
    typeof location.state?.workspaceBackTo === 'string' ? location.state.workspaceBackTo : null;
  const backTarget = workspaceBackTo || topicPagePath;
  const backLabel = workspaceBackTo === '/student/learning' || !courseId ? 'Learning' : 'Topic';

  const handleBack = () => {
    navigate(backTarget);
  };

  const handleRunCode = async () => {
    setRunLoading(true);
    setBottomTab('output');
    try {
      const res = await axios.post('/student/run-code', {
        code,
        language,
      });
      const { stdout = '', stderr = '', exitCode } = res.data.data || {};
      setOutputText(stdout || '(no stdout)');
      appendConsole(`exit ${exitCode ?? '?'}`);
      if (stderr) appendConsole(`stderr: ${stderr}`);
      if (stdout) appendConsole(`stdout: ${stdout.replace(/\n/g, '\\n ')}`);
      toast.success('Code executed.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Run failed.';
      toast.error(msg);
      appendConsole(`Error: ${msg}`);
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!testCases.length) {
      toast.error('No test cases for this task yet. Ask your teacher to re-run AI generation.');
      setBottomTab('tests');
      return;
    }
    setSubmitLoading(true);
    setTestResults(null);
    setBottomTab('tests');
    try {
      const res = await axios.post('/student/code/run', {
        code,
        language,
        testCases,
      });
      const payload = res.data.data;
      setTestResults(payload);
      const score = (payload.totalPassed / testCases.length) * 10;
      try {
        await axios.post(`/student/topics/${topicId}/tasks/${taskIndex}/score`, { score });
      } catch (scoreErr) {
        console.error(scoreErr);
        toast.error('Tests ran but saving the score failed.');
      }
      toast.success(payload.allPassed ? 'All tests passed!' : 'Tests finished.');
      refetch();
    } catch (err) {
      const msg = err.response?.data?.message || 'Submit failed.';
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResetTemplate = () => {
    if (window.confirm('Reset code to the default template? This will erase your current work for this language.')) {
      setCode(getBoilerplate(language));
    }
  };

  if (loading) {
    return (
      <WorkspaceShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} courseId={courseId} units={unitData} topicId={topicId}>
        <LoadingSkeleton count={3} height="h-24" />
      </WorkspaceShell>
    );
  }

  if (error || !data) {
    return (
      <WorkspaceShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} courseId={courseId} units={unitData} topicId={topicId}>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || 'Not found.'}</div>
      </WorkspaceShell>
    );
  }

  if (!Number.isInteger(taskIndex) || taskIndex < 0 || !task) {
    return (
      <WorkspaceShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} courseId={courseId} units={unitData} topicId={topicId}>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This task does not exist. Return to the topic and pick a task from the list.
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back
        </button>
      </WorkspaceShell>
    );
  }

  const summaryTotal = testResults?.results?.length ?? 0;
  const summaryPassed = testResults?.totalPassed ?? 0;
  const sampleCase = testCases[0] || null;

  return (
    <WorkspaceShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} courseId={courseId} units={unitData} topicId={topicId}>
      <div className="max-w-[1500px] mx-auto w-full flex flex-col min-h-screen">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} />
              {backLabel}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mb-0.5">{topic?.title}</p>
              <h1 className="text-sm font-bold text-slate-900 truncate">{task.task_title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
              </select>
              <button
                type="button"
                onClick={handleResetTemplate}
                title="Reset to Template"
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleRunCode}
              disabled={runLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60 transition-all active:scale-95"
            >
              {runLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={14} />}
              Run Code
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 transition-all active:scale-95"
            >
              {submitLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
              Submit Solution
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col lg:flex-row min-h-0 bg-white overflow-hidden">
          <section className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/30 overflow-y-auto p-6 scrollbar-thin transition-all duration-300">
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Problem Statement</h2>
                <div className="prose prose-slate prose-sm max-w-none">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>

              {sampleCase && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Sample Input / Output</h2>
                  <div className="grid gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Input</p>
                      <pre className="text-xs rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 whitespace-pre-wrap">{sampleCase.input || '(empty)'}</pre>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Output</p>
                      <pre className="text-xs rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 whitespace-pre-wrap">{sampleCase.expected_output || '(empty)'}</pre>
                    </div>
                  </div>
                </div>
              )}

              {task.skills_practiced?.length > 0 && (
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Skills Involved</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {task.skills_practiced.map((s, i) => (
                      <span key={i} className="text-[10px] font-bold rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-600 uppercase">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Constraints & Notes</h2>
                <ul className="space-y-3">
                  {task.estimated_time && (
                    <li className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="font-semibold text-slate-400 mr-1">Time:</span> {task.estimated_time}
                    </li>
                  )}
                  {task.chained_topics?.length > 0 && (
                    <li className="flex items-start gap-2 text-xs text-slate-600">
                      <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5" />
                      <span className="font-semibold text-slate-400 mr-1 whitespace-nowrap">Builds on:</span> 
                      <span className="leading-relaxed">{task.chained_topics.join(', ')}</span>
                    </li>
                  )}
                  {!task.estimated_time && !task.chained_topics?.length && (
                    <li className="text-xs text-slate-400 italic">No specific constraints listed.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <section className="flex flex-1 flex-col min-h-0 bg-white border-r border-slate-50 p-2">
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <TaskEditorPanel language={language} code={code} onChange={setCode} className="h-full" />
            </div>
          </section>
        </div>

        <footer className="z-10 bg-white border-t border-slate-200 flex h-[min(40vh,320px)] min-h-[240px] flex-col">
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-2 h-11 items-center overflow-x-auto no-scrollbar">
            {BOTTOM_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBottomTab(tab.id)}
                className={cn(
                  'px-6 h-full text-xs font-bold border-b-2 -mb-[1px] transition-all flex items-center gap-2',
                  bottomTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 bg-white px-8'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", bottomTab === tab.id ? "bg-indigo-600" : "bg-transparent")}></div>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-4 bg-white">
            {bottomTab === 'output' && (
              <div className="h-full">
                <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap break-words bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 min-h-full leading-relaxed">
                  {outputText || 'Run your code to see stdout here.'}
                </pre>
              </div>
            )}

            {bottomTab === 'console' && (
              <div className="h-full">
                <pre className="font-mono text-xs text-slate-100 whitespace-pre-wrap break-words bg-slate-900 rounded-xl p-4 min-h-full leading-relaxed shadow-inner">
                  {consoleLines.length ? consoleLines.join('\n') : 'Console is empty. Run code or submit tests.'}
                </pre>
              </div>
            )}

            {bottomTab === 'tests' && (
              <div className="space-y-4 max-w-4xl mx-auto py-2">
                {!testCases.length && (
                  <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-amber-800 text-sm font-medium">No test cases found for this task.</p>
                  </div>
                )}
                {testCases.map((tc, index) => {
                  const result = testResults?.results?.[index];
                  let box = 'border-slate-200 bg-white text-slate-800 shadow-sm';
                  let badge = null;
                  if (result) {
                    if (result.passed) {
                      box = 'border-emerald-200 bg-emerald-50/30 text-emerald-950 shadow-emerald-500/5';
                      badge = (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-md">
                          <CheckCircle2 size={12} /> Passed
                        </span>
                      );
                    } else {
                      box = 'border-red-200 bg-red-50/30 text-red-950 shadow-red-500/5';
                      badge = (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-100/50 px-2 py-1 rounded-md">
                          <XCircle size={12} /> Failed
                        </span>
                      );
                    }
                  }
                  return (
                    <div key={index} className={cn('rounded-2xl border p-4 transition-all', box)}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Test Case {index + 1}</span>
                        {badge}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Input</span>
                          <div className="rounded-xl bg-slate-100/30 border border-slate-200/40 px-3 py-2 font-mono text-xs">{tc.input}</div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Expected</span>
                          <div className="rounded-xl bg-slate-100/30 border border-slate-200/40 px-3 py-2 font-mono text-xs">{tc.expected_output}</div>
                        </div>
                      </div>
                      {result && !result.passed && (
                        <div className="mt-3 space-y-1">
                          <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">Actual Actual Output</span>
                          <div className="rounded-xl bg-red-50/50 border border-red-100 px-3 py-2 font-mono text-xs text-red-600">{result.actual_output}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </footer>
      </div>
    </WorkspaceShell>
  );
}

function WorkspaceShell({ sidebarOpen, setSidebarOpen, courseId, units, topicId, children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Persistant Unit Sidebar */}
      <UnitSidebar 
        courseId={courseId} 
        units={units} 
        currentTopicId={topicId} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className={cn(
        "flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-500",
        sidebarOpen ? "ml-72" : "ml-0"
      )}>
        {children}
      </div>
    </div>
  );
}
