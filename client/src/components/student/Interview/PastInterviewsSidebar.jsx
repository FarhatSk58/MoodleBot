import React from 'react';
import { X, Clock, Calendar, ChevronRight, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';

export default function PastInterviewsSidebar({ isOpen, onClose, interviews, onViewFeedback }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={20} />
              Interview Records
            </h2>
            <p className="text-slate-500 text-sm mt-0.5 font-medium">Your past mock sessions</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {interviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <AlertCircle size={32} className="text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-700">No records found</p>
                <p className="text-sm font-medium mt-1">You haven't completed any mock interviews yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((interview) => (
                <div 
                  key={interview._id} 
                  className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${interview.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <h3 className="font-bold text-slate-900">{interview.domain}</h3>
                    </div>
                    {interview.status === 'completed' && (
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-indigo-50 border border-indigo-100 text-indigo-700">
                        Score: {interview.score}/100
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600 font-bold">
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                      <Calendar size={12} className="text-slate-400" />
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                      <Clock size={12} className="text-slate-400" />
                      {interview.duration}m
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded capitalize">
                      {interview.difficulty}
                    </span>
                  </div>

                  {interview.status === 'completed' ? (
                    <button
                      onClick={() => onViewFeedback(interview)}
                      className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg py-2 text-sm font-bold transition-colors shadow-sm"
                    >
                      <CheckCircle size={16} className="text-emerald-500" />
                      View Feedback
                    </button>
                  ) : (
                    <div className="mt-2 text-center text-xs text-amber-600 font-bold border border-amber-200 bg-amber-50 py-2 rounded-lg">
                      Interview Incomplete
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
