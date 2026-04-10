import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileX } from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EmptyState from '../../components/shared/EmptyState';
import TopicCard from '../../components/student/TopicCard';
import CourseMaterialsSection from '../../components/shared/CourseMaterialsSection';
import { useFetch } from '../../hooks/useFetch';

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data: topics, loading, error } = useFetch(`/student/courses/${courseId}/topics`);
  const { data: courses } = useFetch('/student/courses');
  const course = courses?.find(c => c._id === courseId);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <button onClick={() => navigate('/student/courses')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to My Courses
          </button>

          <PageHeader
            title={course?.title || 'Course Topics'}
            subtitle={`${topics?.length || 0} topics available`}
          />

          {loading && <LoadingSkeleton count={5} height="h-20" />}
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

          {!loading && !error && (
            <>
              {topics?.length === 0 ? (
                <EmptyState icon={FileX} title="No topics published yet" subtitle="Your teacher is still preparing the content for this course." />
              ) : (
                <div className="space-y-3">
                  {topics.map(topic => (
                    <TopicCard key={topic._id} topic={topic} courseId={courseId} />
                  ))}
                </div>
              )}

              <CourseMaterialsSection courseId={courseId} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
