import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Brain, ExternalLink, Target } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import DomainCard from '../../components/student/Interview/DomainCard';
import StartInterviewModal from '../../components/student/Interview/StartInterviewModal';
import PastInterviewsSidebar from '../../components/student/Interview/PastInterviewsSidebar';
import FeedbackModal from '../../components/student/Interview/FeedbackModal';

const DOMAINS = [
  { id: '1', title: 'Technical Screen', duration: 30, tags: ['General', 'CS Fundamentals'], description: 'Brush up on overall computer science concepts and basic algorithmic thinking.' },
  { id: '2', title: 'Coding', duration: 45, tags: ['DSA', 'Algorithms'], description: 'Focus heavily on data structures, algorithms, and logical problem solving.' },
  { id: '3', title: 'System Design', duration: 60, tags: ['Architecture', 'Scale'], description: 'Design large-scale distributed systems, focusing on scalability and reliability.' },
  { id: '4', title: 'Behavioral', duration: 30, tags: ['Leadership', 'Soft Skills'], description: 'Practice answering questions about past experiences, conflict resolution, and teamwork.' },
  { id: '5', title: 'AI Fluency', duration: 30, tags: ['Prompt Eng.', 'LLMs'], description: 'Demonstrate your understanding of modern AI tools and their engineering applications.' },
  { id: '6', title: 'Custom', duration: 30, tags: ['User Defined'], description: 'Type in any specific role or domain you want to practice for, and we will simulate it.' },
];

export default function MockInterviewDashboardPage() {
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState(null); // 'start', 'history', 'feedback'
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/student/interviews');
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load past interviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const masteryScore = useMemo(() => {
    const completed = interviews.filter(i => i.status === 'completed' && i.score);
    if (!completed.length) return 0;
    const sum = completed.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(sum / completed.length);
  }, [interviews]);

  const handleStartModalOpen = (domain) => {
    setSelectedDomain(domain);
    setActiveModal('start');
  };

  const handleStartInterview = async (config) => {
    try {
      toast.loading('Initializing...', { id: 'init-interview' });
      const res = await api.post('/student/interviews', config);
      
      if (res.data.success) {
        toast.success('Interview started!', { id: 'init-interview' });
        navigate(`/student/interviews/session/${res.data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview', { id: 'init-interview' });
    }
  };

  const handleViewFeedback = (interview) => {
    setSelectedInterview(interview);
    setActiveModal('feedback');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 w-full pb-12">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <PageHeader title="Mock Interviews" subtitle="Practice your interviewing skills with our adaptive AI." />

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Mastery Score Panel */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-6 shadow-sm flex-1 max-w-md">
              <div className="w-16 h-16 rounded-full bg-slate-50 border-4 border-indigo-500 flex items-center justify-center relative shadow-sm">
                <span className="text-xl font-black text-slate-900">{masteryScore}</span>
                <div className="absolute -bottom-2 bg-indigo-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">Overall</div>
              </div>
              <div>
                <p className="text-slate-600 text-sm font-bold">Mastery Breakdown</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 rounded text-indigo-700 border border-indigo-100">AI: 60%</span>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-50 rounded text-emerald-700 border border-emerald-100">Manual: 40%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Based on {interviews.filter(i => i.status === 'completed').length} completed sessions</p>
              </div>
              <button 
                onClick={() => setActiveModal('history')}
                className="ml-auto p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
                title="View History"
              >
                <Target size={20} />
              </button>
            </div>

            {/* Manual Interviews Pitch */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 flex-1">
              <div>
                <h3 className="text-lg font-bold text-indigo-900">External / Manual Interviews</h3>
                <p className="text-sm text-indigo-700/80 mt-1 max-w-lg">Want human feedback? Schedule a manual interview with the faculty to get personalized coaching.</p>
              </div>
              <button className="whitespace-nowrap px-6 py-2.5 bg-white hover:bg-slate-50 border border-indigo-200 rounded-lg text-sm font-bold text-indigo-600 flex items-center gap-2 transition-colors shadow-sm">
                Schedule Manual <ExternalLink size={16} />
              </button>
            </div>

          </div>

          {/* Domain Grid */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-slate-900">Select Domain</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DOMAINS.map(domain => (
                <DomainCard
                  key={domain.id}
                  title={domain.title}
                  description={domain.description}
                  duration={domain.duration}
                  tags={domain.tags}
                  onStart={() => handleStartModalOpen(domain.title)}
                  onViewPrevious={() => setActiveModal('history')}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Modals */}
        <StartInterviewModal
          isOpen={activeModal === 'start'}
          onClose={() => setActiveModal(null)}
          domain={selectedDomain}
          onStart={handleStartInterview}
        />

        <PastInterviewsSidebar
          isOpen={activeModal === 'history'}
          onClose={() => setActiveModal(null)}
          interviews={interviews}
          onViewFeedback={handleViewFeedback}
        />

        <FeedbackModal
          isOpen={activeModal === 'feedback'}
          onClose={() => {
            setActiveModal('history');
            setSelectedInterview(null);
          }}
          interview={selectedInterview}
        />
      </main>
    </div>
  );
}
