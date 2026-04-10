import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn, difficultyColor, formatScore } from '../../lib/utils';
import AnswerInput from './AnswerInput';
import ScoreDisplay from './ScoreDisplay';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function QuestionCard({ question, topicId, index }) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState(null);
  const [answerUnlocked, setAnswerUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadResult = async () => {
      try {
        const res = await api.get(`/student/topics/${topicId}/questions/${question.question_id}/result`);
        if (ignore) return;
        const data = res.data.data || {};
        setResult({ ...data, answerUnlocked: true });
        setAnswerUnlocked(true);
        setExpanded(true);
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
      setExpanded(true);
      toast.success('Answer evaluated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-xs font-bold text-slate-400 w-6 flex-shrink-0">Q{index + 1}</span>
        <p className="flex-1 text-sm text-slate-800 font-medium leading-snug line-clamp-2">
          {question.question.substring(0, 80)}{question.question.length > 80 ? '...' : ''}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {result && (
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
              {formatScore(result.score)}/10
            </span>
          )}
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', difficultyColor(question.difficulty))}>
            {question.difficulty}
          </span>
          {expanded ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          <p className="text-sm text-slate-800 font-medium leading-relaxed">{question.question}</p>

          <AnswerInput onSubmit={handleSubmit} loading={loading} />

          {result && (
            <>
              <ScoreDisplay result={result} difficulty={question.difficulty} />
              {answerUnlocked && question.expected_answer_outline?.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700 mb-3">
                    Expected Answer Outline
                  </p>
                  <ol className="space-y-1.5 pl-4">
                    {question.expected_answer_outline.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-700 list-decimal leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
