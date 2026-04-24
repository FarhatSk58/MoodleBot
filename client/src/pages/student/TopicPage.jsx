import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronLeft, Layout, 
  MessageSquare, Rocket, Zap, BookOpen 
} from 'lucide-react';
import api from '../../lib/axios';

// Shared Components
import QuestionCard from '../../components/student/QuestionCard';
import TaskSummaryCard from '../../components/student/tasks/TaskSummaryCard';
import IndustryUseCaseCard from '../../components/student/IndustryUseCaseCard';
import UnitSidebar from '../../components/student/UnitSidebar';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import { cn } from '../../lib/utils';

export default function TopicPage() {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState([]);
  const [unitData, setUnitData] = useState(null);
  const [topicContent, setTopicContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null); // 'interview', 'usecase', 'task'
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/student/courses');
        setCourses(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch Sidebar (By Unit)
  useEffect(() => {
    const fetchUnits = async () => {
      if (!courseId) return;
      try {
        const res = await api.get(`/student/courses/${courseId}/topics/by-unit`);
        setUnitData(res.data.data?.units || []);
      } catch (err) {
        console.error('Failed to fetch units', err);
      }
    };
    fetchUnits();
  }, [courseId]);

  // Fetch Topic Content
  useEffect(() => {
    const fetchTopic = async () => {
      if (!topicId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/student/topics/${topicId}`);
        setTopicContent(res.data.data);
        setActiveSection(null); // Reset when topic changes
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load topic content');
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [topicId]);

  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    navigate(`/student/courses/${newCourseId}`);
  };

  if (loading && !topicContent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <LoadingSkeleton count={3} height="h-32" containerClass="w-full max-w-4xl px-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6">
        <div className="bg-white border border-red-100 p-8 rounded-3xl shadow-xl shadow-red-500/5 text-center max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <X size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button 
            onClick={() => navigate('/student/courses')}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
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
      {/* Premium Header */}
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
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Course Topic</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <select
                value={courseId}
                onChange={handleCourseChange}
                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-indigo-600 p-0"
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {topic?.title || 'Loading Topic...'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/student/learning')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all bg-slate-100/50 hover:bg-slate-100 rounded-xl"
          >
            <Layout size={14} /> Full Dashboard
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <UnitSidebar 
          courseId={courseId}
          units={unitData} 
          currentTopicId={topicId}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-500 bg-[#fcfcfd]",
          sidebarOpen ? "ml-72" : "ml-0"
        )}>
          <div className="max-w-5xl mx-auto px-8 py-10">
            
            {!activeSection ? (
              /* Step 1: 3 Big Selection Cards */
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
                      Start Exploring <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Step 2: Tabbed Focused View */
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Horizontal Tabs at top */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
                  <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-xs font-black transition-all",
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
                    Back to Selection
                  </button>
                </div>

                <div className="max-w-4xl pt-4">
                  {activeSection === 'interview' && (
                    <div className="space-y-6">
                      {aiContent?.interview_questions?.map((q, idx) => (
                        <QuestionCard 
                          key={idx} 
                          question={q} 
                          index={idx} 
                          topicId={topicId} 
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
                          taskId={`${topicId}--${idx}`}
                          task={task}
                          taskIndex={idx}
                          topicId={topicId}
                          courseId={courseId}
                          topicComplexity={aiContent.complexity_level}
                          progress={taskProgress?.[idx]}
                          workspaceBackTo={`/student/courses/${courseId}/topics/${topicId}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
