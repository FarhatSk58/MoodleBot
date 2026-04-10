import { useState } from 'react';
import { Users, BookOpen, TrendingUp, BarChart2 } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MOCK_COURSES = [
  { id: 'cs101', name: 'Software Engineering' },
  { id: 'cs102', name: 'Data Structures' },
];

const MOCK_TOPICS = [
  { id: 1, name: 'Agile Methodology', attempted: 65, avgScore: 8.2, completion: 86, status: 'Published' },
  { id: 2, name: 'Requirements Engineering', attempted: 70, avgScore: 6.5, completion: 93, status: 'Published' },
  { id: 3, name: 'System Design', attempted: 45, avgScore: 4.1, completion: 60, status: 'Published' },
  { id: 4, name: 'Software Testing', attempted: 20, avgScore: 3.5, completion: 26, status: 'Pending Review' },
  { id: 5, name: 'Maintenance', attempted: 0, avgScore: null, completion: 0, status: 'Processing' },
];

const MOCK_RADAR_DATA = [
  { subject: 'S/W Design', cseAiml: 8.5, cseDs: 7.2 },
  { subject: 'Testing', cseAiml: 6.0, cseDs: 8.1 },
  { subject: 'Agile', cseAiml: 9.0, cseDs: 8.8 },
  { subject: 'Requirements', cseAiml: 7.5, cseDs: 6.9 },
  { subject: 'Maintenance', cseAiml: 5.5, cseDs: 6.2 },
];

const MOCK_STUDENTS = [
  { id: 1, name: 'Rahul Sharma', dept: 'CSE-AIML', attempted: 3, total: 12, avgScore: 3.2 },
  { id: 2, name: 'Priya Patel', dept: 'CSE-DS', attempted: 10, total: 12, avgScore: 5.5 },
  { id: 3, name: 'Amit Kumar', dept: 'CSE-AIML', attempted: 11, total: 12, avgScore: 4.8 },
  { id: 4, name: 'Sneha Gupta', dept: 'CSE-DS', attempted: 1, total: 12, avgScore: 2.1 },
];

const MOCK_QUESTIONS = [
  { id: 1, text: 'Explain the difference between coupling and cohesion with examples.', topic: 'System Design', difficulty: 'hard', avgScore: 2.8 },
  { id: 2, text: 'What are the primary disadvantages of the Waterfall model?', topic: 'Agile Methodology', difficulty: 'easy', avgScore: 3.5 },
  { id: 3, text: 'Design a scalable database schema for a ride-sharing application.', topic: 'System Design', difficulty: 'hard', avgScore: 3.9 },
  { id: 4, text: 'Write a unit test for a function that calculates leap years.', topic: 'Software Testing', difficulty: 'medium', avgScore: 4.2 },
  { id: 5, text: 'Identify the elicitation technique best suited for a legacy system.', topic: 'Requirements Engineering', difficulty: 'medium', avgScore: 4.8 },
];

export default function TeacherAnalyticsPage() {
  const [selectedCourse, setSelectedCourse] = useState(MOCK_COURSES[0].id);

  const getScoreColor = (score) => {
    if (score == null) return 'text-slate-400 bg-slate-50';
    if (score >= 7) return 'text-emerald-700 bg-emerald-50';
    if (score >= 4) return 'text-amber-700 bg-amber-50';
    return 'text-red-700 bg-red-50';
  };

  const getRiskColor = (student) => {
    const attemptRate = student.attempted / student.total;
    if (student.avgScore < 4 || attemptRate < 0.2) return 'bg-red-500';
    if (student.avgScore >= 4 && student.avgScore <= 6) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <PageHeader title="Student Analytics" subtitle="Monitor class performance and identify weak areas" />
            
            {/* Section 1: Course Selector */}
            <div className="md:-mt-8">
              <select 
                value={selectedCourse} 
                onChange={e => setSelectedCourse(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
              >
                {MOCK_COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Section 2: Stat Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Students" value="75" />
            <StatCard icon={TrendingUp} label="Class Average" value="6.8" />
            <StatCard icon={BookOpen} label="Topics Published" value="12" />
            <StatCard icon={BarChart2} label="Avg Completion Rate" value="64%" />
          </div>

          {/* Section 3: Topic Performance Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
             <div className="p-5 border-b border-slate-100">
               <h3 className="font-semibold text-slate-900 text-lg">Topic-wise Breakdown</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="border-b border-slate-100 bg-slate-50/50">
                     <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase font-semibold">Topic Name</th>
                     <th className="text-center px-5 py-3 text-xs text-slate-500 uppercase font-semibold">Students Attempted</th>
                     <th className="text-center px-5 py-3 text-xs text-slate-500 uppercase font-semibold">Average Score</th>
                     <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase font-semibold w-48">Completion %</th>
                     <th className="text-right px-5 py-3 text-xs text-slate-500 uppercase font-semibold">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {MOCK_TOPICS.map((topic, i) => (
                     <tr key={topic.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-5 py-4 text-slate-800 font-medium">#{i+1} {topic.name}</td>
                       <td className="px-5 py-4 text-center text-slate-600">{topic.attempted} <span className="text-xs text-slate-400">/ 75</span></td>
                       <td className="px-5 py-4 text-center">
                         <span className={`px-2.5 py-1 rounded-md font-semibold text-xs ${getScoreColor(topic.avgScore)}`}>
                           {topic.avgScore != null ? topic.avgScore.toFixed(1) : '---'}
                         </span>
                       </td>
                       <td className="px-5 py-4">
                         <div className="flex items-center gap-2">
                           <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${topic.completion}%` }} />
                           </div>
                           <span className="text-xs text-slate-500 w-8">{topic.completion}%</span>
                         </div>
                       </td>
                       <td className="px-5 py-4 text-right">
                         <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                           topic.status === 'Published' ? 'bg-emerald-100 text-emerald-700' :
                           topic.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                         }`}>
                           {topic.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Section 4: Department Comparison */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-900">Department Comparison</h3>
              <p className="text-sm text-slate-500 mb-6">CSE-AIML vs CSE-DS performance</p>
              
              <div className="h-72 mt-auto w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_RADAR_DATA}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Radar name="CSE-AIML" dataKey="cseAiml" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    <Radar name="CSE-DS" dataKey="cseDs" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Section 5: Struggling Students */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Needs Attention</h3>
                  <p className="text-sm text-slate-500">Students with low engagement or low scores</p>
                </div>
                <span className="text-[10px] text-slate-400 max-w-[120px] text-right leading-tight">Based on attempt rate and average score</span>
              </div>
              
              <div className="space-y-4">
                {MOCK_STUDENTS.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${getRiskColor(student)}`} />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{student.name}</p>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded mt-0.5 inline-block">
                          {student.dept}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Attempted</p>
                        <p className="text-sm font-semibold text-slate-700">{student.attempted}/{student.total}</p>
                      </div>
                      <div>
                         <p className="text-xs text-slate-400 mb-0.5">Avg Score</p>
                         <p className={`text-sm font-semibold ${student.avgScore < 4 ? 'text-red-600' : 'text-amber-600'}`}>
                           {student.avgScore.toFixed(1)}
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section 6: Question Difficulty Insights */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900">Hardest Questions</h3>
            <p className="text-sm text-slate-500 mb-6">Questions with lowest average scores across the class</p>
            
            <div className="space-y-3">
              {MOCK_QUESTIONS.map((q, i) => (
                <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 gap-4">
                  <div className="flex gap-4">
                    <span className="text-slate-300 font-bold text-lg">0{i+1}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-1">{q.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {q.topic}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          q.difficulty === 'hard' ? 'bg-red-50 text-red-600 border-red-100' :
                          q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 bg-white px-3 py-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Class Avg</span>
                    <span className="text-lg font-bold text-red-500 leading-none">{q.avgScore.toFixed(1)}</span>
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

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
        <Icon size={24} className="text-indigo-500" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
