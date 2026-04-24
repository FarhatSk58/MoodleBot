import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn, difficultyColor, formatScore } from '../../lib/utils';
import AnswerInput from './AnswerInput';
import ScoreDisplay from './ScoreDisplay';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function QuestionCard({ question, topicId, index, isExpanded, onToggle }) {
  const [result, setResult] = useState(null);
  const [answerUnlocked, setAnswerUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // 'feedback' | 'outline' | null

  useEffect(() => {
    let ignore = false;

    const loadResult = async () => {
      try {
        const res = await api.get(`/student/topics/${topicId}/questions/${question.question_id}/result`);
        if (ignore) return;
        const data = res.data.data || {};
        if (data.answerText || data.score) {
          setResult({ ...data, answerUnlocked: true });
          setAnswerUnlocked(true);
        }
      } catch {
        if (!ignore) {
          setAnswerUnlocked(false);
          setResult(null);
        }
      }
    };

    loadResult();
    return () => {
      ignore = true;
    };
  }, [question.question_id, topicId]);

  const handleSubmit = async (answerText) => {
    if (!answerText.trim()) { toast.error('Please write an answer first'); return; }
    setLoading(true);
    try {
      const res = await api.post(`/student/topics/${topicId}/questions/${question.question_id}/answer`, { answerText });
      const data = res.data.data || {};
      setResult({ ...data, answerUnlocked: true });
      setAnswerUnlocked(true);
      toast.success('Answer evaluated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "bg-white border rounded-2xl overflow-hidden transition-all duration-300",
      isExpanded ? "border-indigo-200 shadow-md ring-4 ring-indigo-500/5" : "border-slate-200 shadow-sm"
    )}>
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-4 p-5 text-left transition-colors",
          isExpanded ? "bg-indigo-50/50" : "hover:bg-slate-50"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors",
          isExpanded ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
        )}>
          {index + 1}
        </div>
        
        <p className="flex-1 text-sm text-slate-800 font-semibold leading-relaxed">
          {question.question}
        </p>

        <div className="flex items-center gap-3">
          {result?.score !== null && result?.score !== undefined && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
              Score: {formatScore(result.score)}
            </span>
          )}
          <span className={cn('text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md', difficultyColor(question.difficulty))}>
            {question.difficulty}
          </span>
          <div className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "")}>
            <ChevronDown size={18} className="text-slate-400" />
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
      )}>
        <div className="border-t border-slate-100 p-6 space-y-6">
          
          {/* Submission Area */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Your Response
            </label>
            <AnswerInput 
              onSubmit={handleSubmit} 
              loading={loading} 
              initialValue={result?.answerText || ''} 
            />
          </div>

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              
              {/* Tabs / Toggle Buttons */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button
                  onClick={() => setActiveTab(activeTab === 'feedback' ? null : 'feedback')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                    activeTab === 'feedback' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Feedback
                </button>
                <button
                  onClick={() => setActiveTab(activeTab === 'outline' ? null : 'outline')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                    activeTab === 'outline' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Expected Answer
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'feedback' && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <ScoreDisplay result={result} difficulty={question.difficulty} />
                </div>
              )}
              
              {activeTab === 'outline' && answerUnlocked && question.expected_answer_outline?.length > 0 && (
                <div className="animate-in fade-in zoom-in-95 duration-300 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">
                      Expected Answer Outline
                    </p>
                  </div>
                  <ol className="space-y-2.5">
                    {question.expected_answer_outline.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-600 flex gap-3 leading-relaxed">
                        <span className="font-bold text-indigo-300">0{i + 1}.</span>
                        {pt}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
