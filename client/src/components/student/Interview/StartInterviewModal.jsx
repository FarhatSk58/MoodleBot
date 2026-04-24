import React, { useState } from 'react';
import { X, PlayCircle, Settings2 } from 'lucide-react';

export default function StartInterviewModal({ isOpen, onClose, domain, onStart }) {
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState('medium');
  const [topics, setTopics] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  if (!isOpen) return null;

  const isCustom = domain === 'Custom';
  const effectiveDomain = isCustom ? customDomain : domain;

  const handleStart = () => {
    if (isCustom && !customDomain.trim()) return; // Validation
    
    onStart({
      domain: effectiveDomain,
      duration,
      difficulty,
      subtopics: topics.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Settings2 className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Configure Interview</h2>
              <p className="text-slate-500 text-sm">Set up your mock session</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Domain Selection if Custom */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Domain / Role</label>
            {isCustom ? (
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g., Data Scientist, DevOps Engineer"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                autoFocus
              />
            ) : (
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 opacity-70 cursor-not-allowed font-medium">
                {domain}
              </div>
            )}
          </div>

          {/* Specific Topics */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Specific Topics (Optional)</label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g., React hooks, System Design, REST APIs"
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
            />
            <p className="text-xs text-slate-500 font-medium">Leave blank to let the AI decide relevant topics based on the domain.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                      difficulty === level 
                        ? 'bg-indigo-600 text-white shadow-md block' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 block'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700">Duration</label>
              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none font-bold"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={isCustom && !customDomain.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayCircle size={18} />
            Initialize AI
          </button>
        </div>
      </div>
    </div>
  );
}
