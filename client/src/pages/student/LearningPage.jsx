import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronLeft, Layout, 
  MessageSquare, Rocket, Zap, BookOpen,
  ChevronDown, ChevronRight, CheckCircle2 
} from 'lucide-react';
import api from '../../lib/axios';

// Shared Components
import QuestionCard from '../../components/student/QuestionCard';
import TaskSummaryCard from '../../components/student/tasks/TaskSummaryCard';
import IndustryUseCaseCard from '../../components/student/IndustryUseCaseCard';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import { cn } from '../../lib/utils';

export default function LearningPage() {
  const navigate = useNavigate();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [unitData, setUnitData] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [topicContent, setTopicContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // 'interview', 'usecase', 'task'
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  // Fetch initial data: Courses
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const res = await api.get('/student/courses');
        const list = res.data.data || [];
        setCourses(list);
        if (list.length > 0) setSelectedCourseId(list[0]._id);
      } catch (err) {
        console.error('Init failed', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch Sidebar (Units Structure) when course changes
  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedCourseId) return;
      try {
        const res = await api.get(`/student/courses/${selectedCourseId}/topics/by-unit`);
        const structure = res.data.data?.units || [];
        setUnitData(structure);
        // Default to first topic if none selected
        if (!selectedTopicId && structure.length > 0 && structure[0].topics?.length > 0) {
          setSelectedTopicId(structure[0].topics[0]._id);
        }
      } catch (err) {
        console.error('Units fetch failed', err);
      }
    };
    fetchUnits();
  }, [selectedCourseId]);

  // Fetch Topic Content
  useEffect(() => {
    const fetchTopic = async () => {
      if (!selectedTopicId) return;
      setLoadingContent(true);
      try {
        const res = await api.get(`/student/topics/${selectedTopicId}`);
        setTopicContent(res.data.data);
        setActiveSection(null); // Reset cards view on topic change
      } catch (err) {
        console.error('Topic fetch failed', err);
      } finally {
        setLoadingContent(false);
      }
    };
    fetchTopic();
  }, [selectedTopicId]);

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setTopicContent(null);
    setSelectedTopicId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingSkeleton count={3} height="h-32" containerClass="w-full max-w-4xl px-6" />
      </div>
    );
  }

  const { topic, aiContent, taskProgress } = topicContent || {};

  const TABS = [
    { id: 'interview', label: 'Interview Prep', icon: MessageSquare, color: 'indigo' },
    { id: 'usecase', label: 'Use Cases', icon: Zap, color: 'amber' },
    { id: 'task', label: 'Practice Tasks', icon: Rocket, color: 'emerald' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans">
      {/* Premium Top Bar */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 hover:bg-slate-100/80 rounded-2xl text-slate-500 transition-all active:scale-95"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Learning Pathway</span>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <select
                value={selectedCourseId}
                onChange={handleCourseChange}
                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-indigo-600 transition-colors p-0"
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {topic?.title || 'Learning Dashboard'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/student/courses')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all bg-slate-100/50 hover:bg-slate-100 rounded-xl"
          >
            <Layout size={14} /> Back to Courses
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <UnitSidebarOverride 
          courseId={selectedCourseId}
          units={unitData} 
          currentTopicId={selectedTopicId}
          isOpen={sidebarOpen}
          onSelectTopic={(id) => setSelectedTopicId(id)}
        />

        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-500 bg-[#fcfcfd]",
          sidebarOpen ? "ml-72" : "ml-0"
        )}>
          {loadingContent ? (
            <div className="max-w-5xl mx-auto px-8 py-12">
              <LoadingSkeleton count={3} height="h-64" />
            </div>
          ) : topicContent ? (
            <div className="max-w-5xl mx-auto px-8 py-10">
              
              {!activeSection ? (
                /* Step 1: 3 Big Interactive Cards */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSection(tab.id)}
                      className="group relative flex flex-col p-8 bg-white border border-slate-200/60 rounded-[32px] text-left transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 hover:border-indigo-100"
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110",
                        tab.color === 'indigo' ? "bg-indigo-600 text-white shadow-indigo-100" :
                        tab.color === 'amber' ? "bg-amber-500 text-white shadow-amber-100" :
                        "bg-emerald-500 text-white shadow-emerald-100"
                      )}>
                        <tab.icon size={28} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">{tab.label}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        {tab.id === 'interview' ? 'Master key concepts with AI-generated industry questions.' :
                         tab.id === 'usecase' ? 'Explore how this topic is applied in real-world scenarios.' :
                         'Apply your knowledge with hands-on coding challenges.'}
                      </p>
                      <div className="mt-8 flex items-center gap-2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Start Learning <ChevronRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Step 2: Tabbed View */
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Action Bar / Tabs */}
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-6 mb-8">
                    <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl">
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSection(tab.id)}
                          className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all",
                            activeSection === tab.id 
                              ? "bg-white text-slate-900 shadow-sm" 
                              : "text-slate-400 hover:text-slate-600"
                          )}
                        >
                          <tab.icon size={14} className={activeSection === tab.id ? `text-${tab.color}-600` : ""} />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setActiveSection(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      Back to Overview
                    </button>
                  </div>

                  {/* Section Content */}
                  <div className="max-w-4xl">
                    {activeSection === 'interview' && (
                      <div className="space-y-6">
                        {aiContent?.interview_questions?.map((q, idx) => (
                          <QuestionCard 
                            key={idx} 
                            question={q} 
                            index={idx} 
                            topicId={selectedTopicId} 
                            isExpanded={expandedQuestionId === q.question_id}
                            onToggle={() => setExpandedQuestionId(expandedQuestionId === q.question_id ? null : q.question_id)}
                          />
                        ))}
                      </div>
                    )}

                    {activeSection === 'usecase' && (
                      <div className="grid grid-cols-1 gap-6">
                        {aiContent?.industry_use_cases?.map((uc, idx) => (
                          <IndustryUseCaseCard key={idx} useCase={uc} />
                        ))}
                      </div>
                    )}

                    {activeSection === 'task' && (
                      <div className="grid grid-cols-1 gap-6">
                        {aiContent?.tasks?.map((task, idx) => (
                          <TaskSummaryCard
                            key={idx}
                            taskId={`${selectedTopicId}--${idx}`}
                            task={task}
                            taskIndex={idx}
                            topicId={selectedTopicId}
                            courseId={selectedCourseId}
                            topicComplexity={aiContent.complexity_level}
                            progress={taskProgress?.[idx]}
                            workspaceBackTo="/student/learning"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-32 h-32 bg-indigo-50/50 text-indigo-200 rounded-[48px] flex items-center justify-center mb-10 animate-pulse">
                <BookOpen size={64} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your Learning Path Awaits</h2>
              <p className="text-slate-500 text-base max-w-sm font-medium leading-relaxed">
                Choose a unit and topic from the sidebar to unlock professional interview prep, industry insights, and coding tasks.
              </p>
              <div className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">
                <div className="w-8 h-[2px] bg-indigo-100"></div>
                Knowledge Workspace
                <div className="w-8 h-[2px] bg-indigo-100"></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


// Internal Sidebar for Learning Page to handle local state selection instead of Link navigation 
function UnitSidebarOverride({ units, currentTopicId, isOpen, onSelectTopic }) {
  const [expandedUnits, setExpandedUnits] = useState(new Set([1]));

  const toggleUnit = (unitNum) => {
    const next = new Set(expandedUnits);
    if (next.has(unitNum)) next.delete(unitNum);
    else next.add(unitNum);
    setExpandedUnits(next);
  };

  const UNITS = [1, 2, 3, 4, 5];

  return (
    <aside
      className={cn(
        "fixed left-0 top-20 h-[calc(100vh-80px)] bg-white border-r border-slate-200 transition-all duration-300 z-10 overflow-y-auto shadow-xl shadow-slate-200/20",
        isOpen ? "w-72" : "w-0 overflow-hidden border-none"
      )}
    >
      <div className="p-4 space-y-2">
        {UNITS.map((uNum) => {
          const unitData = units?.find(u => u.unit_number === uNum);
          const topics = unitData?.topics || [];
          const isExpanded = expandedUnits.has(uNum);

          return (
            <div key={uNum} className="pb-2 border-b border-slate-50 last:border-none">
              <button
                onClick={() => toggleUnit(uNum)}
                className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all",
                    isExpanded ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-400"
                  )}>
                    {uNum}
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Unit</p>
                    <h4 className={cn(
                      "text-sm font-bold truncate max-w-[160px]",
                      isExpanded ? "text-slate-900" : "text-slate-600"
                    )}>
                      {unitData?.unit_name || `Unit ${uNum}`}
                    </h4>
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />}
              </button>

              {isExpanded && (
                <div className="mt-2 ml-11 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  {topics.length > 0 ? (
                    topics.map((topic) => {
                      const isActive = String(topic._id) === String(currentTopicId);
                      return (
                        <button
                          key={topic._id}
                          onClick={() => onSelectTopic(topic._id)}
                          className={cn(
                            "group w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all text-left",
                            isActive 
                              ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className={cn("w-1 h-4 rounded-full transition-all", isActive ? "bg-indigo-400" : "bg-transparent")}></div>
                            <span className={cn("truncate", isActive ? "font-bold" : "font-medium")}>{topic.title}</span>
                          </div>
                          {topic.completed && (
                            <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-slate-400 italic py-2 px-3 bg-slate-50 rounded-lg">No topics published</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
