import React from 'react';
import { X, Award, ThumbsUp, AlertTriangle, Lightbulb, MessageSquare, Cpu } from 'lucide-react';

function badgeClass(rec) {
  if (rec === 'Strong Fit') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (rec === 'Weak Fit') return 'bg-rose-100 text-rose-800 border-rose-200';
  return 'bg-amber-100 text-amber-900 border-amber-200';
}

export default function FeedbackModal({ isOpen, onClose, interview }) {
  if (!isOpen || !interview || !interview.feedback) return null;

  const { score, feedback, domain } = interview;
  const rec = feedback.recommendation || '';
  const hasStructured =
    Boolean(feedback.overallSummary) ||
    Boolean(feedback.technicalSkills) ||
    Boolean(feedback.communicationSkills);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 mt-10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Interview Feedback</h2>
            <p className="text-slate-500 text-sm font-medium">{domain} Domain</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto overflow-x-hidden space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden shadow-sm">
            <div className="absolute -right-6 -top-6 opacity-[0.03]">
              <Award size={150} className="text-slate-900" />
            </div>
            <span className="text-slate-600 font-bold mb-2 z-10">Overall Performance Score</span>
            <div className="flex items-end gap-1 z-10">
              <span
                className={`text-5xl font-black ${
                  score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500'
                }`}
              >
                {score}
              </span>
              <span className="text-xl font-bold text-slate-400 mb-1">/100</span>
            </div>
            {rec && (
              <div className="mt-4 z-10">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Recommendation</p>
                <p
                  className={`mt-1 px-4 py-1.5 rounded-full text-sm font-black border inline-block ${badgeClass(rec)}`}
                >
                  {rec}
                </p>
              </div>
            )}
            <div className="w-full max-w-md h-2 bg-slate-200 rounded-full mt-5 overflow-hidden z-10">
              <div
                className={`h-full rounded-full ${
                  score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {hasStructured && (
            <div className="space-y-4">
              {feedback.overallSummary && (
                <div>
                  <h3 className="flex items-center gap-2 text-slate-800 font-bold text-lg mb-2">
                    <MessageSquare size={18} /> Overall Summary
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-4">
                    {feedback.overallSummary}
                  </p>
                </div>
              )}
              {feedback.technicalSkills && (
                <div>
                  <h3 className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-2">
                    <Cpu size={18} /> Technical Skills
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed bg-indigo-50/50 border border-indigo-100 rounded-lg p-4">
                    {feedback.technicalSkills}
                  </p>
                </div>
              )}
              {feedback.communicationSkills && (
                <div>
                  <h3 className="flex items-center gap-2 text-cyan-800 font-bold text-lg mb-2">
                    <MessageSquare size={18} /> Communication Skills
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed bg-cyan-50/40 border border-cyan-100 rounded-lg p-4">
                    {feedback.communicationSkills}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-3">
                  <ThumbsUp size={18} /> Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((str, idx) => (
                    <li
                      key={idx}
                      className="flex gap-3 text-slate-700 text-sm font-medium bg-emerald-50 border border-emerald-100 rounded-lg p-3"
                    >
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-rose-600 font-bold text-lg mb-3">
                  <AlertTriangle size={18} /> Weaknesses
                </h3>
                <ul className="space-y-2">
                  {feedback.weaknesses.map((weak, idx) => (
                    <li
                      key={idx}
                      className="flex gap-3 text-slate-700 text-sm font-medium bg-rose-50 border border-rose-100 rounded-lg p-3"
                    >
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.suggestions && feedback.suggestions.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 text-indigo-600 font-bold text-lg mb-3">
                  <Lightbulb size={18} /> Specific Improvement Suggestions
                </h3>
                <ul className="space-y-2">
                  {feedback.suggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      className="flex gap-3 text-slate-700 text-sm font-medium bg-indigo-50 border border-indigo-100 rounded-lg p-3"
                    >
                      <span className="text-indigo-500 font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
