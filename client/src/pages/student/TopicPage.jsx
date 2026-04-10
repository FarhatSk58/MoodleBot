import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import QuestionCard from '../../components/student/QuestionCard';
import { useFetch } from '../../hooks/useFetch';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

export default function TopicPage() {
  const { courseId, topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error } = useFetch(`/student/topics/${topicId}`);

  if (loading) {
    return (
      <PageShell>
        <LoadingSkeleton count={4} height="h-24" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
      </PageShell>
    );
  }

  if (!data) return null;

  const { topic, aiContent, departmentExtras } = data;
  const questionGroups = DIFFICULTY_ORDER.reduce((acc, difficulty) => {
    acc[difficulty] = (aiContent?.interview_questions || []).filter((question) => question.difficulty === difficulty);
    return acc;
  }, {});

  const hasUseCases = (aiContent?.industry_use_cases || []).length > 0;
  const hasTasks = (aiContent?.tasks || []).length > 0;
  const hasProject = !!aiContent?.mini_project;

  return (
    <PageShell>
      <button
        onClick={() => navigate(`/student/courses/${courseId}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Course
      </button>

      <PageHeader title={topic.title} subtitle={`Syllabus position: #${topic.syllabusOrder}`} />

      <div className="flex flex-wrap gap-2 mb-6">
        {aiContent?.importance_score && <Chip label={`Importance: ${aiContent.importance_score}/10`} color="indigo" />}
        {aiContent?.complexity_level && <Chip label={aiContent.complexity_level} color="blue" />}
        {aiContent?.weightage_tag && <Chip label={aiContent.weightage_tag} color="slate" />}
      </div>

      {departmentExtras?.notes && (
        <div className="border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50 rounded-r-xl mb-6">
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">
            Department Notes ({user?.department})
          </p>
          <p className="text-sm text-slate-700">{departmentExtras.notes}</p>
          {departmentExtras.additionalTasks?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {departmentExtras.additionalTasks.map((task, index) => (
                <li key={index} className="text-xs text-slate-600">
                  • {task}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <TabLayout
        tabs={[
          { label: 'Questions', content: <QuestionsTab groups={questionGroups} topicId={topicId} /> },
          ...(hasUseCases ? [{ label: 'Use Cases', content: <UseCasesTab items={aiContent.industry_use_cases} /> }] : []),
          ...(hasTasks ? [{ label: 'Tasks', content: <TasksTab tasks={aiContent.tasks} /> }] : []),
          ...(hasProject ? [{ label: 'Mini Project', content: <ProjectTab project={aiContent.mini_project} topicId={topicId} /> }] : []),
        ]}
      />
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

const chipColors = {
  indigo: 'bg-indigo-100 text-indigo-700',
  blue: 'bg-blue-100 text-blue-700',
  slate: 'bg-slate-100 text-slate-600',
};

const Chip = ({ label, color = 'slate' }) => (
  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${chipColors[color] || chipColors.slate}`}>
    {label}
  </span>
);

function TabLayout({ tabs }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActive(index)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap',
              active === index
                ? 'bg-white border border-b-white border-slate-200 text-indigo-600 -mb-px'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[active]?.content}
    </div>
  );
}

function QuestionsTab({ groups, topicId }) {
  const labels = {
    easy: { label: 'Easy', cls: 'bg-emerald-100 text-emerald-700' },
    medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
    hard: { label: 'Hard', cls: 'bg-red-100 text-red-600' },
  };

  return (
    <div className="space-y-8">
      {DIFFICULTY_ORDER.map((difficulty) =>
        groups[difficulty]?.length > 0 ? (
          <div key={difficulty}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide', labels[difficulty].cls)}>
                {labels[difficulty].label}
              </span>
              <span className="text-xs text-slate-400">
                {groups[difficulty].length} question{groups[difficulty].length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {groups[difficulty].map((question, index) => (
                <QuestionCard key={question.question_id} question={question} topicId={topicId} index={index} />
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

function UseCasesTab({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((useCase, index) => (
        <div key={index} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{useCase.domain}</p>
              <h4 className="font-semibold text-slate-900 text-sm">{useCase.use_case_title}</h4>
            </div>
            {useCase.verified_company_example && (
              <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex-shrink-0">
                <CheckCircle size={11} /> {useCase.verified_company_example}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-3">{useCase.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {useCase.tools_or_technologies_involved?.map((tool, toolIndex) => (
              <span key={toolIndex} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {tool}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksTab({ tasks }) {
  return (
    <div className="space-y-4">
       <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Task viewer coming soon.</div>
    </div>
  );
}

function ProjectTab({ project, topicId }) {
  return <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">Project submission coming soon.</div>;
}
