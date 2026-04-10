import { formatScore, } from '../../lib/utils';

const CRITERIA_LABELS = { accuracy: 'Accuracy', depth: 'Depth', use_of_examples: 'Examples', clarity: 'Clarity' };

export default function ScoreDisplay({ result, }) {
  const { score, scoring_type, criteria_scores, feedback } = result;

  return (
    <div className="space-y-4">
      {/* Score circle for holistic OR overall score for criteria-based */}
      <div className="flex items-center gap-4">
        <ScoreCircle score={score} />
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">Your Score</p>
          <p className="text-2xl font-bold text-slate-900">{formatScore(score)}<span className="text-base font-normal text-slate-400">/10</span></p>
          <p className="text-xs text-slate-500 capitalize">{scoring_type?.replace('-', ' ')} scoring</p>
        </div>
      </div>

      {/* Criteria bars for medium/hard */}
      {criteria_scores && (
        <div className="space-y-2.5 bg-slate-50 rounded-xl p-4">
          {Object.entries(criteria_scores).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">{CRITERIA_LABELS[key] || key}</span>
                <span className="text-slate-500">{val.score}/10 · wt {val.weight}</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(val.score / 10) * 100}%` }} />
              </div>
              {val.comment && <p className="text-xs text-slate-400 mt-0.5 italic">{val.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Feedback sections */}
      {feedback && (
        <div className="space-y-2">
          <FeedbackBlock color="emerald" label="✓ What You Got Right" text={feedback.correct_parts} />
          <FeedbackBlock color="red" label="✗ What Was Missing" text={feedback.missing_parts} />
          {feedback.improvement_tips?.length > 0 && (
            <div className="border-l-4 border-indigo-400 pl-4 py-2 bg-indigo-50/50 rounded-r-lg">
              <p className="text-xs font-semibold text-indigo-700 mb-1.5">💡 Tips to Improve</p>
              <ul className="space-y-1.5">
                {feedback.improvement_tips.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-600">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreCircle({ score }) {
  const pct = Math.min(score / 10, 1);
  const r = 20, c = 2 * Math.PI * r;
  const color = score >= 7 ? '#10B981' : score >= 4 ? '#F59E0B' : '#EF4444';
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="flex-shrink-0">
      <circle cx="28" cy="28" r={r} stroke="#E2E8F0" strokeWidth="5" fill="none" />
      <circle cx="28" cy="28" r={r} stroke={color} strokeWidth="5" fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round" transform="rotate(-90 28 28)" />
    </svg>
  );
}

function FeedbackBlock({ color, label, text }) {
  if (!text) return null;
  const colors = { emerald: 'border-emerald-400 bg-emerald-50/50 text-emerald-700', red: 'border-red-400 bg-red-50/50 text-red-700' };
  return (
    <div className={`border-l-4 pl-4 py-2 rounded-r-lg ${colors[color]}`}>
      <p className="text-xs font-semibold mb-0.5">{label}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}
