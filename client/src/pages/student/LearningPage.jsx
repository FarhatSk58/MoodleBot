import { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Database,
  ExternalLink,
  HelpCircle,
  Layers,
  ListChecks,
  Rocket,
  Search,
} from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import QuestionCard from '../../components/student/QuestionCard';
import { useFetch } from '../../hooks/useFetch';
import { cn } from '../../lib/utils';

const UNIT_COUNT = 5;

const DIFFICULTY_META = {
  easy: { label: 'Easy', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  hard: { label: 'Hard', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const SECTION_CARDS = [
  {
    id: 'questions',
    label: 'Interview Questions',
    icon: HelpCircle,
    accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    getCount: (topic) => topic?.aiContent?.interview_questions?.length || 0,
    isEnabled: (topic) => (topic?.aiContent?.interview_questions?.length || 0) > 0,
  },
  {
    id: 'use_cases',
    label: 'Use Cases',
    icon: ListChecks,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    getCount: (topic) => topic?.aiContent?.industry_use_cases?.length || 0,
    isEnabled: (topic) => (topic?.aiContent?.industry_use_cases?.length || 0) > 0,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: Layers,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
    getCount: (topic) => topic?.aiContent?.tasks?.length || 0,
    isEnabled: (topic) => (topic?.aiContent?.tasks?.length || 0) > 0,
  },
  {
    id: 'project',
    label: 'Mini Project',
    icon: Rocket,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
    getCount: (topic) => (topic?.aiContent?.mini_project ? 1 : 0),
    isEnabled: (topic) => !!topic?.aiContent?.mini_project,
  },
];

export default function LearningPage() {
  const { data: courses, loading: loadingCourses, error: coursesError } = useFetch('/student/courses');
  const { data: topics, loading: loadingTopics, error: topicsError } = useFetch('/student/learning');

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeUnit, setActiveUnit] = useState(1);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [activeSection, setActiveSection] = useState('questions');
  const [query, setQuery] = useState('');

  const resolvedSelectedCourseId = useMemo(() => {
    const courseList = Array.isArray(courses) ? courses : [];
    if (!courseList.length) return '';

    if (selectedCourseId && courseList.some((course) => course._id === selectedCourseId)) {
      return selectedCourseId;
    }

    const topicList = Array.isArray(topics) ? topics : [];
    const publishedCourseIds = new Set(topicList.map((t) => t.course?._id).filter(Boolean));
    const firstWithPublished = courseList.find((course) => publishedCourseIds.has(course._id));
    return (firstWithPublished || courseList[0])._id;
  }, [courses, selectedCourseId, topics]);

  const courseTopics = useMemo(() => {
    const topicList = Array.isArray(topics) ? topics : [];
    if (!resolvedSelectedCourseId) return [];

    return topicList
      .filter((topic) => topic.course?._id === resolvedSelectedCourseId)
      .sort((a, b) => (a.syllabusOrder || 0) - (b.syllabusOrder || 0));
  }, [resolvedSelectedCourseId, topics]);

  const filteredTopics = useMemo(() => {
    if (!courseTopics.length) return [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return courseTopics;
    return courseTopics.filter((topic) => {
      const haystack = `${topic.title || ''}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [courseTopics, query]);

  const selectableTopics = useMemo(() => {
    return filteredTopics;
  }, [filteredTopics]);

  const units = useMemo(() => {
    const result = Array.from({ length: UNIT_COUNT }, (_, i) => i + 1).map((n) => {
      const allTopics = courseTopics.filter((t) => (t.unitNumber || 1) === n);
      const visibleTopics = selectableTopics.filter((t) => (t.unitNumber || 1) === n);
      const completed = allTopics.filter((t) => t.completed).length;
      return {
        unitNumber: n,
        unitName: allTopics[0]?.unitName || `Unit ${n}`,
        allTopics,
        topics: visibleTopics,
        completed,
      };
    });

    return result;
  }, [courseTopics, selectableTopics]);

  const resolvedActiveUnit = useMemo(() => {
    const unit = Number(activeUnit) || 1;
    if (unit >= 1 && unit <= UNIT_COUNT) return unit;
    return 1;
  }, [activeUnit]);

  const topicsForActiveUnit = useMemo(() => {
    const unit = units.find((u) => u.unitNumber === resolvedActiveUnit);
    return unit ? unit.topics : [];
  }, [resolvedActiveUnit, units]);

  const resolvedSelectedTopicIdInActiveUnit = useMemo(() => {
    if (!topicsForActiveUnit.length) return null;
    if (selectedTopicId && topicsForActiveUnit.some((t) => t._id === selectedTopicId)) {
      return selectedTopicId;
    }
    return topicsForActiveUnit[0]._id;
  }, [selectedTopicId, topicsForActiveUnit]);

  const selectedTopic = useMemo(() => {
    if (!resolvedSelectedTopicIdInActiveUnit) return null;
    return courseTopics.find((topic) => topic._id === resolvedSelectedTopicIdInActiveUnit) || null;
  }, [courseTopics, resolvedSelectedTopicIdInActiveUnit]);

  const resolvedActiveSection = useMemo(() => {
    if (!selectedTopic) return 'questions';
    const currentSection = SECTION_CARDS.find((section) => section.id === activeSection);
    if (currentSection?.isEnabled(selectedTopic)) {
      return activeSection;
    }
    return SECTION_CARDS.find((section) => section.isEnabled(selectedTopic))?.id || 'questions';
  }, [activeSection, selectedTopic]);

  const loading = loadingCourses || loadingTopics;
  const error = coursesError || topicsError;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Learning</h1>
            <p className="text-sm text-slate-500">
              Browse the teacher-approved AI content that is already published for your enrolled courses.
            </p>
          </div>

          {loading && <LoadingSkeleton count={5} height="h-24" />}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
          )}

          {!loading && !error && (!topics || topics.length === 0) && (
            <EmptyState
              icon={BookOpen}
              title="No published learning content yet"
              subtitle="Your teacher has not approved any AI content for your courses yet."
            />
          )}

          {!loading && !error && topics?.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
              <aside className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Course</p>
                    <select
                      value={resolvedSelectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        setSelectedTopicId(null);
                        setActiveUnit(1);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                    >
                      {(Array.isArray(courses) ? courses : []).map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Search</p>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search topics across units..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Showing {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex gap-1 border-b border-slate-200 px-3 pt-3 overflow-x-auto">
                    {units.map((unit) => (
                      <button
                        key={unit.unitNumber}
                        type="button"
                        onClick={() => setActiveUnit(unit.unitNumber)}
                        className={cn(
                          'px-4 py-2.5 text-sm font-medium rounded-t-xl whitespace-nowrap transition-all',
                          resolvedActiveUnit === unit.unitNumber
                            ? 'bg-white border border-b-white border-slate-200 text-indigo-600 -mb-px'
                            : 'text-slate-500 hover:text-slate-800'
                        )}
                      >
                        Unit {unit.unitNumber}
                        <span className="text-xs text-slate-400 ml-1">
                          ({unit.completed}/{unit.allTopics.length} completed)
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="divide-y divide-slate-100">
                    {topicsForActiveUnit.length === 0 ? (
                      <div className="p-6 text-sm text-slate-500">
                        No topics found in this unit{query.trim() ? ' for your search.' : '.'}
                      </div>
                    ) : (
                      topicsForActiveUnit.map((topic) => {
                        const isActive = topic._id === resolvedSelectedTopicIdInActiveUnit;
                        return (
                          <button
                            key={topic._id}
                            type="button"
                            onClick={() => setSelectedTopicId(topic._id)}
                            className={cn(
                              'w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors',
                              isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                            )}
                          >
                            <div className="min-w-0">
                              <p className={cn('text-sm font-semibold truncate', isActive ? 'text-indigo-950' : 'text-slate-900')}>
                                {topic.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                #{topic.syllabusOrder || '-'} · {topic.completed ? 'Completed' : 'New'}
                              </p>
                            </div>
                            <ChevronRight size={16} className={cn('flex-shrink-0', isActive ? 'text-indigo-500' : 'text-slate-300')} />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </aside>

              <section className="min-w-0">
                {selectedTopic && resolvedSelectedTopicIdInActiveUnit ? (
                  <>
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-2">
                            {selectedTopic.course?.title || 'Course'}
                          </p>
                          <h2 className="text-2xl font-bold text-slate-900">{selectedTopic.title}</h2>
                          <p className="text-sm text-slate-500 mt-1">
                            Unit {selectedTopic.unitNumber || '-'}{selectedTopic.unitName ? ` - ${selectedTopic.unitName}` : ''}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge label={`Importance ${selectedTopic.aiContent?.importance_score || '-'}/10`} />
                          <Badge label={selectedTopic.aiContent?.complexity_level || 'N/A'} />
                          <Badge label={selectedTopic.aiContent?.weightage_tag || 'N/A'} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {SECTION_CARDS.map((section) => {
                          const Icon = section.icon;
                          const enabled = section.isEnabled(selectedTopic);
                          const selected = resolvedActiveSection === section.id;
                          const count = section.getCount(selectedTopic);

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
                                {enabled ? 'Click to view this section' : 'This section was not published for this topic'}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      {resolvedActiveSection === 'questions' && (
                        <QuestionsSection
                          questions={selectedTopic.aiContent?.interview_questions || []}
                          topicId={selectedTopic._id}
                        />
                      )}
                      {resolvedActiveSection === 'use_cases' && (
                        <UseCasesSection useCases={selectedTopic.aiContent?.industry_use_cases || []} />
                      )}
                      {resolvedActiveSection === 'tasks' && (
                        <TasksSection tasks={selectedTopic.aiContent?.tasks || []} />
                      )}
                      {resolvedActiveSection === 'project' && (
                        <ProjectSection
                          project={selectedTopic.aiContent?.mini_project || null}
                          topicId={selectedTopic._id}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 shadow-sm">
                    Select a topic to start learning.
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Badge({ label }) {
  return (
    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
      {label}
    </span>
  );
}

function QuestionsSection({ questions, topicId }) {
  const groupedQuestions = {
    easy: questions.filter((question) => question.difficulty === 'easy'),
    medium: questions.filter((question) => question.difficulty === 'medium'),
    hard: questions.filter((question) => question.difficulty === 'hard'),
  };

  if (!questions.length) {
    return <EmptySection message="No interview questions were published for this topic." />;
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedQuestions).map(([difficulty, items]) => {
        if (!items.length) return null;
        const meta = DIFFICULTY_META[difficulty];

        return (
          <div key={difficulty}>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn('text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wide', meta.cls)}>
                {meta.label}
              </span>
              <span className="text-xs text-slate-500">{items.length} question{items.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-3">
              {items.map((question, index) => (
                <QuestionCard key={question.question_id} question={question} topicId={topicId} index={index} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UseCasesSection({ useCases }) {
  if (!useCases.length) {
    return <EmptySection message="No industry use cases were published for this topic." />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {useCases.map((useCase, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">{useCase.domain}</p>
              <h3 className="font-semibold text-slate-900">{useCase.use_case_title}</h3>
            </div>
            {useCase.verified_company_example && (
              <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-2.5 py-1 font-medium">
                {useCase.verified_company_example}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{useCase.description}</p>
          <div className="flex flex-wrap gap-2">
            {(useCase.tools_or_technologies_involved || []).map((tool, toolIndex) => (
              <span key={toolIndex} className="text-xs bg-white border border-slate-200 rounded-full px-2.5 py-1 text-slate-600">
                {tool}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksSection({ tasks }) {
  if (!tasks.length) {
    return <EmptySection message="No tasks were published for this topic." />;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <TaskExecutionCard key={task.task_id || index} task={task} />
      ))}
    </div>
  );
}

function ProjectSection({ project, topicId }) {
  if (!project) {
    return <EmptySection message="No mini project was published for this topic." />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-violet-200 bg-violet-50/40 p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 mb-2">Mini Project</p>
            <h3 className="text-xl font-bold text-slate-900">{project.project_title}</h3>
          </div>
          <span className="text-xs bg-white border border-violet-200 rounded-full px-3 py-1.5 text-violet-700 whitespace-nowrap">
            {project.estimated_time || 'Self-paced'}
          </span>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mb-6">{project.problem_statement}</p>

        {!!project.features_to_implement?.length && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Features to build</h4>
            <div className="space-y-2">
              {project.features_to_implement.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-white border border-violet-200 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!project.tech_stack_suggestion?.length && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tech_stack_suggestion.map((tech, index) => (
              <span key={index} className="text-xs bg-white border border-slate-200 rounded-full px-2.5 py-1 text-slate-700">
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.uses_real_data && project.data_source && (
          <a
            href={project.data_source}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
          >
            <Database size={12} /> View dataset <ExternalLink size={11} />
          </a>
        )}

        {!!project.chained_topics?.length && (
          <p className="text-xs text-slate-500 mt-4">Builds on: {project.chained_topics.join(', ')}</p>
        )}
      </div>

      <MiniProjectSubmission topicId={topicId} project={project} />
    </div>
  );
}

function EmptySection({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
