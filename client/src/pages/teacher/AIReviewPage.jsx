import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers,
  ListChecks,
  Rocket,
  Sparkles,
  XCircle,
} from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import { cn } from '../../lib/utils';
import DevPanel from '../../components/dev/DevPanel';

const DIFF_META = {
  easy: { label: 'Easy', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  hard: { label: 'Hard', cls: 'bg-red-100 text-red-600 border-red-200' },
};

const CONTENT_SECTIONS = [
  {
    id: 'questions',
    label: 'Interview Questions',
    icon: HelpCircle,
    flag: 'generate_questions',
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    getCount: (aiData) => aiData?.interview_questions?.length || 0,
  },
  {
    id: 'use_cases',
    label: 'Use Cases',
    icon: ListChecks,
    flag: 'generate_use_cases',
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    getCount: (aiData) => aiData?.industry_use_cases?.length || 0,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: Layers,
    flag: 'generate_tasks',
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
    getCount: (aiData) => aiData?.tasks?.length || 0,
  },
  {
    id: 'projects',
    label: 'Mini Project',
    flag: 'generate_project',
    icon: Rocket,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
    getCount: (aiData) => (aiData?.mini_project ? 1 : 0),
  },
];

export default function AIReviewPage() {
  const [activeSection, setActiveSection] = useState('questions');
  const [pendingTopics, setPendingTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  const currentTopic = useMemo(
    () => pendingTopics.find((topic) => topic._id === selectedTopicId) || null,
    [pendingTopics, selectedTopicId]
  );

  const resolvedActiveSection = useMemo(() => {
    if (!aiData) return 'questions';
    const matchingSection = CONTENT_SECTIONS.find((section) => section.id === activeSection);
    if (matchingSection && isSectionEnabled(aiData, matchingSection)) {
      return activeSection;
    }
    return CONTENT_SECTIONS.find((section) => isSectionEnabled(aiData, section))?.id || 'questions';
  }, [activeSection, aiData]);

  const fetchPendingTopics = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/teacher/topics/pending-review');
      if (res.data.success) {
        const topics = res.data.data;
        setPendingTopics(topics);
        setSelectedTopicId((current) => {
          if (!topics.length) return null;
          if (current && topics.some((topic) => topic._id === current)) {
            return current;
          }
          return topics[0]._id;
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch pending topics');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchAIContent = useCallback(async (topicId) => {
    setLoadingContent(true);
    try {
      const res = await api.get(`/teacher/topics/${topicId}/ai-content`);
      if (res.data.success) {
        setAiData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch AI content for topic');
      setAiData(null);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingTopics();
  }, [fetchPendingTopics]);

  useEffect(() => {
    if (selectedTopicId) {
      fetchAIContent(selectedTopicId);
    } else {
      setAiData(null);
    }
  }, [fetchAIContent, selectedTopicId]);

  const handleAction = async (action) => {
    if (!selectedTopicId) return;

    try {
      const res = await api.patch(`/teacher/topics/${selectedTopicId}/ai-content/${action}`);
      if (res.data.success) {
        toast.success(`Content ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        const updatedList = pendingTopics.filter((topic) => topic._id !== selectedTopicId);
        setPendingTopics(updatedList);
        setSelectedTopicId(updatedList.length > 0 ? updatedList[0]._id : null);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${action} content`);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen pb-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <PageHeader
            title="AI Content Review"
            subtitle="Review, approve, or reject AI-generated content before students see it."
          />

          {import.meta.env.DEV && <DevPanel onResetSuccess={fetchPendingTopics} />}

          {!loadingList && pendingTopics.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Inbox Zero</h3>
              <p className="text-slate-500 mt-2">There are currently no topics awaiting AI review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)] gap-6">
              <aside className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 px-1">
                  <Sparkles size={14} /> Pending Review ({pendingTopics.length})
                </div>

                {pendingTopics.map((topic) => {
                  const isActive = selectedTopicId === topic._id;
                  return (
                    <button
                      key={topic._id}
                      onClick={() => setSelectedTopicId(topic._id)}
                      className={cn(
                        'w-full text-left rounded-2xl border p-4 transition-all shadow-sm',
                        isActive
                          ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500/15 shadow-md'
                          : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'
                      )}
                    >
                      <p className={cn('text-xs font-semibold uppercase tracking-wide mb-1', isActive ? 'text-indigo-600' : 'text-slate-500')}>
                        {topic.courseId?.title}
                      </p>
                      <h3 className={cn('font-semibold leading-snug', isActive ? 'text-indigo-950' : 'text-slate-900')}>
                        {topic.title}
                      </h3>
                    </button>
                  );
                })}

                {loadingList && (
                  <div className="animate-pulse space-y-3 pt-2">
                    <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
                    <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
                  </div>
                )}
              </aside>

              <section className="min-w-0">
                {loadingContent ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-10 flex justify-center items-center h-64 shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : aiData && currentTopic ? (
                  <>
                    <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 mb-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                        <div>
                          <p className="text-xs text-indigo-600 mb-1.5 uppercase tracking-wider font-bold">
                            {currentTopic.courseId?.title || 'Unknown Subject'}
                          </p>
                          <h2 className="text-2xl font-bold text-slate-900">{currentTopic.title}</h2>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full font-bold shadow-sm">
                          Pending Review
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-5">
                        <MetaBadge label={`Importance ${aiData.importance_score}/10`} />
                        <MetaBadge label={aiData.complexity_level} />
                        <MetaBadge label={aiData.weightage_tag} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {CONTENT_SECTIONS.map((section) => {
                          const Icon = section.icon;
                          const enabled = isSectionEnabled(aiData, section);
                          const selected = resolvedActiveSection === section.id;
                          const count = section.getCount(aiData);

                          return (
                            <button
                              key={section.id}
                              type="button"
                              disabled={!enabled}
                              onClick={() => enabled && setActiveSection(section.id)}
                              className={cn(
                                'rounded-2xl border p-4 text-left transition-all',
                                enabled ? 'bg-white hover:shadow-md' : 'bg-slate-50 text-slate-400 cursor-not-allowed',
                                selected && enabled ? 'border-indigo-300 ring-2 ring-indigo-500/15 shadow-md' : 'border-slate-200',
                              )}
                            >
                              <div className="flex items-center justify-between gap-3 mb-4">
                                <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center', enabled ? section.accent : 'bg-slate-100 border-slate-200 text-slate-400')}>
                                  <Icon size={18} />
                                </div>
                                <span className="text-xs font-semibold text-slate-500">
                                  {enabled ? `${count} item${count !== 1 ? 's' : ''}` : 'Not generated'}
                                </span>
                              </div>
                              <h3 className="font-semibold text-slate-900">{section.label}</h3>
                              <p className="text-xs text-slate-500 mt-1">
                                {enabled ? 'Click to review this section' : 'This section was not generated for this topic'}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-20">
                      {resolvedActiveSection === 'questions' && <QuestionsTab questions={aiData.interview_questions || []} />}
                      {resolvedActiveSection === 'use_cases' && <UseCasesTab useCases={aiData.industry_use_cases || []} />}
                      {resolvedActiveSection === 'tasks' && <TasksTab tasks={aiData.tasks || []} />}
                      {resolvedActiveSection === 'projects' && <ProjectsTab project={aiData.mini_project} />}
                    </div>

                    <div className="fixed bottom-0 left-[var(--sidebar-width)] right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
                        <div>
                          <p className="text-sm font-bold text-slate-800">Ready to publish?</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ensure the generated content looks right before students see it.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction('reject')}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                          >
                            Reject & Delete
                          </button>
                          <button
                            onClick={() => handleAction('approve')}
                            className="px-8 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} /> Approve & Publish
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function isSectionEnabled(aiData, section) {
  if (!aiData) return false;
  if (section.flag === 'generate_questions') {
    return (aiData.interview_questions?.length || 0) > 0;
  }
  return !!aiData.generationFlags?.[section.flag];
}

function MetaBadge({ label }) {
  return (
    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-bold border border-slate-200 capitalize shadow-sm">
      {label}
    </span>
  );
}

function QuestionsTab({ questions }) {
  const [open, setOpen] = useState(null);
  const groups = ['easy', 'medium', 'hard'];

  if (!questions.length) return <p className="text-slate-500 text-sm">No questions generated.</p>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {groups.map((diff) => {
        const qs = questions.filter((question) => question.difficulty === diff);
        if (!qs.length) return null;
        const meta = DIFF_META[diff];

        return (
          <div key={diff}>
            <div className="flex items-center gap-2 mb-4 pl-1">
              <span className={cn('text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-widest', meta.cls)}>
                {meta.label}
              </span>
              <span className="text-xs font-semibold text-slate-400">{qs.length} QUESTION{qs.length !== 1 ? 'S' : ''}</span>
            </div>
            <div className="space-y-3">
              {qs.map((question, idx) => {
                const key = `${diff}-${idx}`;
                const isOpen = open === key;
                return (
                  <div key={key} className={cn('bg-white border rounded-xl overflow-hidden shadow-sm transition-colors duration-200', isOpen ? 'border-indigo-200 ring-1 ring-indigo-500/10' : 'border-slate-200')}>
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div>
                        {question.type && (
                          <span className="inline-block mb-2 text-[9px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                            {question.type.replace('-', ' ')}
                          </span>
                        )}
                        <p className="text-[15px] font-semibold text-slate-800 leading-snug pr-4">{question.question}</p>
                      </div>
                      <div className="flex-shrink-0 bg-slate-50 p-1.5 rounded-full border border-slate-200 text-slate-400">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 pt-4 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Expected Answer Outline
                        </p>
                        <ul className="list-none space-y-2.5">
                          {question.expected_answer_outline?.map((point, index) => (
                            <li key={index} className="text-sm text-slate-600 font-medium pl-3 border-l-2 border-indigo-200 leading-relaxed">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UseCasesTab({ useCases }) {
  if (!useCases.length) return <p className="text-slate-500 text-sm">No use cases generated.</p>;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {useCases.map((useCase, index) => (
        <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 relative overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
          {useCase.verified_company_example && (
            <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl border-b border-l border-indigo-100 flex items-center gap-1.5 shadow-sm">
              <Rocket size={10} className="text-indigo-500" /> Verified: {useCase.verified_company_example}
            </div>
          )}
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
              {useCase.domain}
            </span>
            <h3 className="font-bold text-slate-900 mt-2.5 text-lg">{useCase.use_case_title}</h3>
          </div>
          <p className="text-sm text-slate-600 mb-5 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {useCase.description}
          </p>
          {useCase.tools_or_technologies_involved?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">Tools & Tech:</span>
              {useCase.tools_or_technologies_involved.map((tool, toolIndex) => (
                <span key={toolIndex} className="text-[11px] font-bold bg-white text-slate-700 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TasksTab({ tasks }) {
  if (!tasks.length) return <p className="text-slate-500 text-sm">No tasks generated.</p>;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {tasks.map((task, index) => (
        <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h4 className="font-bold text-slate-900 text-lg leading-snug">{task.task_title}</h4>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex-shrink-0 border border-slate-200 whitespace-nowrap font-bold shadow-sm">
              {task.estimated_time || 'N/A'}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-5 leading-relaxed">{task.description}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
            {task.skills_practiced?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Skills:</span>
                {task.skills_practiced.map((skill, skillIndex) => (
                  <span key={skillIndex} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md font-bold shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {task.chained_topics?.length > 0 && (
              <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 tracking-wide bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                <Layers size={11} className="text-indigo-400" /> + {task.chained_topics.join(', ')}
              </p>
            )}

            {task.uses_real_data && (
              <span className="text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold shadow-sm sm:ml-auto">
                {task.data_source ? `Real Data: ${task.data_source}` : 'Uses Real Data'}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsTab({ project }) {
  if (!project) return <p className="text-slate-500 text-sm">No mini project generated.</p>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white border border-indigo-100 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10 -z-0"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50/30 rounded-br-full -ml-10 -mt-10 -z-0"></div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 mb-3 inline-block shadow-sm">
                Mini Project
              </span>
              <h3 className="font-black text-slate-900 text-2xl leading-tight text-balance">{project.project_title}</h3>
            </div>
            <span className="text-xs bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl flex-shrink-0 font-bold shadow-sm whitespace-nowrap flex items-center gap-2 mt-1">
              {project.estimated_time}
            </span>
          </div>

          <div className="mb-8">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Problem Statement</h4>
            <p className="text-[15px] text-slate-600 leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
              {project.problem_statement}
            </p>
          </div>

          <div className="mb-8">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Features to Implement</h4>
            <ul className="space-y-3.5">
              {project.features_to_implement?.map((feature, index) => (
                <li key={index} className="flex items-start gap-4 text-[15px] font-medium text-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-100 shadow-sm">
                    {index + 1}
                  </div>
                  <span className="pt-0.5 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {project.tech_stack_suggestion?.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Suggested Tech Stack</h4>
              <div className="flex flex-wrap gap-2.5">
                {project.tech_stack_suggestion.map((tech, index) => (
                  <span key={index} className="text-[11px] font-bold bg-slate-800 text-white px-4 py-1.5 rounded-lg border border-slate-700 shadow-md">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
