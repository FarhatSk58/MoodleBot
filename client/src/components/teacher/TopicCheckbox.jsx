import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { cn, } from '../../lib/utils';

export default function TopicCheckbox({ topic, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const isCompleted = !!topic.completedAt;

  const handleToggle = async () => {
    if (isCompleted || loading) return;
    setLoading(true);
    try {
      await api.patch(`/teacher/topics/${topic._id}/complete`);
      toast.success('Topic marked complete! AI processing queued.');
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark complete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isCompleted || loading}
      aria-label={isCompleted ? 'Topic completed' : 'Mark topic as complete'}
      className={cn(
        'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
        isCompleted
          ? 'bg-emerald-500 border-emerald-500 cursor-default'
          : loading
          ? 'border-indigo-300 cursor-wait'
          : 'border-slate-300 hover:border-indigo-400 cursor-pointer'
      )}
    >
      {loading ? <Loader2 size={13} className="animate-spin text-indigo-400" /> : isCompleted ? <Check size={14} className="text-white" /> : null}
    </button>
  );
}
