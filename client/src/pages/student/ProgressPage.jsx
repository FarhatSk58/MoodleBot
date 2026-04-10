import { useState } from 'react';
import {
  Book, TrendingUp, BookOpen, ChevronDown, ChevronUp,
  CheckCircle2, Circle, ListTodo, Award, CheckCircle
} from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

const MOCK_DSA_TOPICS = [
  { name: 'Arrays', solved: 18, total: 25 },
  { name: 'Linked Lists', solved: 12, total: 20 },
  { name: 'Binary Trees', solved: 8, total: 20 },
  { name: 'Dynamic Programming', solved: 4, total: 25 },
  { name: 'Graphs', solved: 6, total: 20 },
  { name: 'Sorting & Searching', solved: 14, total: 15 },
  { name: 'Stack & Queue', solved: 10, total: 10 },
];

const MOCK_CS_PERFORMANCE = [
  { subject: 'SE', score: 7.2, fullName: 'Software Engineering' },
  { subject: 'DSA', score: 6.1, fullName: 'Data Structures' },
  { subject: 'DBMS', score: 8.4, fullName: 'DBMS' },
  { subject: 'OS', score: 5.3, fullName: 'Operating Systems' },
  { subject: 'CN', score: 4.8, fullName: 'Computer Networks' },
];

const MOCK_TASKS = [
  { id: 1, name: 'Design ER Diagram for Library Management', subject: 'DBMS' },
  { id: 2, name: 'Implement Merge Sort in Java', subject: 'DSA' },
  { id: 3, name: 'Create Agile Sprint Plan', subject: 'SE' },
  { id: 4, name: 'Set up multithreaded server', subject: 'OS' },
];

const MOCK_PROJECTS = [
  { id: 1, name: 'E-Commerce Backend', url: 'github.com/farhan/ecommerce-api' },
  { id: 2, name: 'Library Management System', url: 'github.com/farhan/library-ui' },
];

const MOCK_COURSES = [
  { id: 1, name: 'Software Engineering', dept: 'CSE-AIML', topicsCompleted: 8, totalTopics: 12, avgScore: 7.2 },
  { id: 2, name: 'Data Structures', dept: 'CSE-AIML', topicsCompleted: 5, totalTopics: 15, avgScore: 6.1 },
];

export default function ProgressPage() {
  const readinessScore = 52;

  let readinessMessage = "You're just getting started. Keep going.";
  if (readinessScore >= 40 && readinessScore <= 60) readinessMessage = "Good progress. Focus on your weak areas.";
  else if (readinessScore > 60 && readinessScore <= 80) readinessMessage = "You're on the right track. Push harder.";
  else if (readinessScore > 80) readinessMessage = "Excellent. You're industry ready.";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <PageHeader title="My Progress" subtitle="Track your industry readiness across all areas" />

          {/* Section 1: Industry Readiness Score */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 w-full text-center">
            <h2 className="text-3xl font-bold text-slate-900">{readinessScore}%</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Overall Industry Readiness</p>
            <p className="text-sm text-slate-400 mt-2">{readinessMessage}</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <CircularProgress label="DSA Proficiency" percentage={42} />
              <CircularProgress label="Core CS Concepts" percentage={67} />
              <CircularProgress label="Practical Skills" percentage={35} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 2: DSA Sheet */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900">DSA Sheet</h3>
              <p className="text-sm text-slate-500 mb-6">Topic-wise problem tracking</p>
              
              <div className="flex-1 space-y-4">
                {MOCK_DSA_TOPICS.map((topic, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm">
                    <span className="w-1/3 font-medium text-slate-700 truncate">{topic.name}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full" 
                        style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-slate-500 text-xs">
                      {topic.solved} / {topic.total}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-right">
                <p className="text-sm text-slate-600 font-medium">Total: 72 of 135 problems solved</p>
              </div>
            </div>

            {/* Section 3: Core CS Performance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900">Core CS Performance</h3>
              <p className="text-sm text-slate-500 mb-6">Based on your interview question scores</p>
              
              <div className="h-64 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_CS_PERFORMANCE} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val, name, props) => [val, props.payload.fullName]}
                      labelStyle={{ display: 'none' }}
                    />
                    <ReferenceLine y={7} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: '#94a3b8', fontSize: 12 }} />
                    <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 flex gap-4 text-sm justify-center">
                <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"><span className="font-semibold">Strongest:</span> DBMS</span>
                <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full"><span className="font-semibold">Needs Work:</span> Computer Networks</span>
              </div>
            </div>
          </div>

          {/* Section 4: Practical Skills */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900">Practical Skills</h3>
            <p className="text-sm text-slate-500 mb-6">Tasks completed and projects submitted</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Recent Tasks</h4>
                <div className="space-y-3">
                  {MOCK_TASKS.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-800 font-medium">{task.name}</p>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded mt-1 inline-block">
                          {task.subject}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Mini Projects</h4>
                <div className="space-y-3">
                  {MOCK_PROJECTS.map(proj => (
                    <div key={proj.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <Book size={18} className="text-slate-700" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{proj.name}</p>
                          <a href={`https://${proj.url}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">
                            {proj.url}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Empty state mock if needed */}
                  {/* <div className="p-4 rounded-lg border border-dashed border-slate-300 text-center text-slate-400 text-sm">Not submitted yet</div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Course-wise Progress */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Enrolled Courses</h3>
            
            <div className="space-y-4">
              {MOCK_COURSES.map(course => (
                <div key={course.id} className="p-5 rounded-xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{course.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                        {course.dept}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{course.topicsCompleted} of {course.totalTopics} topics completed</p>
                    <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(course.topicsCompleted / course.totalTopics) * 100}%` }} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs text-slate-500 mb-1">Average Score</span>
                    <span className={`text-lg font-bold px-3 py-1 rounded-lg ${course.avgScore >= 7 ? 'bg-emerald-50 text-emerald-600' : course.avgScore >= 4 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                      {course.avgScore} <span className="text-sm font-normal opacity-70">/ 10</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function CircularProgress({ label, percentage }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-24 h-24 mb-3">
        <svg className="transform -rotate-90 w-full h-full">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
          <circle
            cx="48" cy="48" r={radius}
            stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-indigo-500 transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-xl font-bold text-slate-800">{percentage}%</span>
      </div>
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
}
