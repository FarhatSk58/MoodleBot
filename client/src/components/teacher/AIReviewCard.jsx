import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { cn, difficultyColor } from '../../lib/utils';

export default function AIReviewCard({ topic, aiContent, courseName, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(null); // 'approve' | 'reject' | null
  const [showConfirm, setShowConfirm] = useState(false);

  const approve = async () => {
    setLoading('approve');
    try {
      await api.patch(`/teacher/topics/${topic._id}/ai-content/approve`);
      toast.success('Content approved and published!');
      onAction?.(topic._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
      setLoading(null);
    }
  };

  const reject = async () => {
    setLoading('reject');
    setShowConfirm(false);
    try {
      await api.patch(`/teacher/topics/${topic._id}/ai-content/reject`);
      toast.success('Content rejected. AI will reprocess tonight.');
      onAction?.(topic._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-slate-900">{topic.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{courseName}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {aiContent?.importance_score && <Chip label={`Score: ${aiContent.importance_score}/10`} />}
            {aiContent?.complexity_level && <Chip label={aiContent.complexity_level} />}
            {aiContent?.weightage_tag && <Chip label={aiContent.weightage_tag} />}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>📋 {aiContent?.interview_questions?.length || 0} Questions</span>
          <span>🏢 {aiContent?.industry_use_cases?.length || 0} Use Cases</span>
          <span>⚙️ {aiContent?.tasks?.length || 0} Tasks</span>
          {aiContent?.mini_project && <span>🚀 1 Project</span>}
        </div>
        <button onClick={() => setExpanded(p => !p)} className="mt-4 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          {expanded ? <><ChevronUp size={14} /> Hide Review</> : <><ChevronDown size={14} /> Review Content</>}
        </button>
      </div>

      {/* Expanded review content */}
      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-6 bg-slate-50">
          {/* Interview Questions */}
          {aiContent?.interview_questions?.length > 0 && (
            <Section title="Interview Questions">
              {aiContent.interview_questions.map((q, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', difficultyColor(q.difficulty))}>{q.difficulty}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{q.type}</span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium mb-2">{q.question}</p>
                  <details className="text-xs text-slate-500"><summary className="cursor-pointer font-medium text-slate-600">Expected outline</summary>
                    <ol className="mt-2 space-y-1 pl-4">
                      {q.expected_answer_outline?.map((pt, j) => <li key={j} className="list-decimal">{pt}</li>)}
                    </ol>
                  </details>
                </div>
              ))}
            </Section>
          )}

          {/* Use Cases */}
          {aiContent?.industry_use_cases?.length > 0 && (
            <Section title="Industry Use Cases">
              {aiContent.industry_use_cases.map((uc, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-400 uppercase">{uc.domain}</p>
                  <p className="font-medium text-slate-800 text-sm">{uc.use_case_title}</p>
                  <p className="text-sm text-slate-600 mt-1">{uc.description}</p>
                </div>
              ))}
            </Section>
          )}

          {/* Tasks */}
          {aiContent?.tasks?.length > 0 && (
            <Section title="Tasks">
              {aiContent.tasks.map((t, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
                  <p className="font-medium text-slate-800 text-sm">{t.task_title}</p>
                  <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                  <p className="text-xs text-slate-400 mt-1">⏱ {t.estimated_time}</p>
                </div>
              ))}
            </Section>
          )}

          {/* Mini Project */}
          {aiContent?.mini_project && (
            <Section title="Mini Project">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-900 text-sm">{aiContent.mini_project.project_title}</p>
                <p className="text-sm text-slate-600 mt-1">{aiContent.mini_project.problem_statement}</p>
                <ul className="mt-2 space-y-1">
                  {aiContent.mini_project.features_to_implement?.map((f, i) => <li key={i} className="text-xs text-slate-600">• {f}</li>)}
                </ul>
              </div>
            </Section>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={approve} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-xl transition-all disabled:opacity-60">
              {loading === 'approve' ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Approve & Publish
            </button>
            <button onClick={() => setShowConfirm(true)} disabled={!!loading}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-all disabled:opacity-60">
              {loading === 'reject' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />} Reject
            </button>
          </div>

          {/* Confirm reject dialog */}
          {showConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                <h3 className="font-semibold text-slate-900 mb-2">Reject this content?</h3>
                <p className="text-sm text-slate-500 mb-5">This will require AI to reprocess this topic. The AI will try again tonight.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                  <button onClick={reject} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium">Confirm Reject</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Chip = ({ label }) => <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{label}</span>;
const Section = ({ title, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-slate-700 mb-3">{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);
