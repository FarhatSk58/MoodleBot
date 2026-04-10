import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function DevPanel({ onResetSuccess }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load all topics for the dropdown
  useEffect(() => {
    fetchCoursesAndTopics();
  }, []);

  const fetchCoursesAndTopics = async () => {
    try {
      // Assuming GET /api/teacher/courses returns courses with populated topics
      // Or we can just reuse a simple endpoint if we had one.
      // Wait, we can fetch all courses and extract topics
      const res = await api.get('/teacher/courses');
      if (res.data.success) {
        let allTopics = [];
        res.data.data.forEach(course => {
          if (course.topics) {
            course.topics.forEach(t => allTopics.push({ ...t, courseName: course.title }));
          }
        });
        setTopics(allTopics);
      }
    } catch (err) {
      console.error('[DevPanel] Failed to fetch topics', err);
    }
  };

  const handleTriggerBatch = async () => {
    try {
      setIsTriggering(true);
      const res = await api.post('/dev/trigger-batch');
      if (res.data.success) {
        toast.success('Batch triggered. Reloading page...');
        setTimeout(() => {
          window.location.reload();
        }, 3000); // Give it a short delay
      }
    } catch (err) {
      toast.error('Failed to trigger batch');
      console.error(err);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleResetTopic = async () => {
    if (!selectedTopicId) return;
    try {
      setIsResetting(true);
      const res = await api.patch(`/dev/topics/${selectedTopicId}/reset`);
      if (res.data.success) {
        toast.success('Topic reset successfully.');
        if (onResetSuccess) onResetSuccess();
        fetchCoursesAndTopics(); // refresh list
      }
    } catch (err) {
      toast.error('Failed to reset topic');
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  if (import.meta.env.MODE === 'production') return null;

  return (
    <div className="bg-yellow-50 border border-yellow-400 p-4 rounded-xl mb-6 font-mono text-sm shadow-sm relative">
      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-bl-lg rounded-tr-xl font-bold">
        DEV ONLY
      </div>
      <h3 className="font-bold text-yellow-800 mb-3 text-base flex items-center gap-2">
        🛠 Development Testing Tools
      </h3>
      
      <div className="flex flex-col gap-4">
        {/* Trigger Batch */}
        <div className="flex items-center justify-between border-b border-yellow-200 pb-4">
          <div>
            <p className="text-yellow-900 font-semibold mb-1">Manually Trigger Batch Processor</p>
            <p className="text-yellow-700 text-xs">Runs the AI batch exactly as it would run at 11 PM.</p>
          </div>
          <button
            onClick={handleTriggerBatch}
            disabled={isTriggering}
            className="bg-yellow-500 hover:bg-yellow-600 outline-none text-yellow-950 px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 min-w-[150px]"
          >
            {isTriggering ? 'Running...' : 'Trigger Batch Now'}
          </button>
        </div>

        {/* Reset Topic */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-yellow-900 font-semibold mb-1">Reset Topic Status</p>
            <p className="text-yellow-700 text-xs mb-2">Reverts a topic back to pending_ai so you can test it again.</p>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-yellow-100 border border-yellow-400 text-yellow-900 rounded px-3 py-2 outline-none text-sm"
            >
              <option value="">-- Select a topic to reset --</option>
              {topics.map(t => (
                <option key={t._id} value={t._id}>
                  [{t.aiStatus}] {t.courseName} - {t.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleResetTopic}
            disabled={!selectedTopicId || isResetting}
            className="mt-8 bg-yellow-800 hover:bg-yellow-900 outline-none text-yellow-50 px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isResetting ? 'Resetting...' : 'Reset to Pending AI'}
          </button>
        </div>
      </div>
    </div>
  );
}
