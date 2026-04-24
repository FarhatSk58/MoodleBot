import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import StudentDashboard from './pages/student/StudentDashboard';
import CoursePage from './pages/student/CoursePage';
import TopicPage from './pages/student/TopicPage';
import TaskWorkspacePage from './pages/student/TaskWorkspacePage';
import ProgressPage from './pages/student/ProgressPage';
import LearningPage from './pages/student/LearningPage';
import DSAPage from './pages/student/DSAPage';
import SQLPage from './pages/student/SQLPage';
import WebDevPage from './pages/student/WebDevPage';
import ProgressDashboardPage from './pages/student/ProgressDashboardPage';
import MockInterviewDashboardPage from './pages/student/MockInterviewDashboardPage';
import InterviewSessionPage from './pages/student/InterviewSessionPage';
import StudentJobsPage from './pages/student/StudentJobsPage';
import StudentJobDetailPage from './pages/student/StudentJobDetailPage';
import CoreLandingPage from './pages/student/CoreLandingPage';
import ProfilePage from './pages/shared/ProfilePage';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CourseProgressPage from './pages/teacher/CourseProgressPage';
import AIReviewPage from './pages/teacher/AIReviewPage';
import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage';
import TeacherCourseDetailPage from './pages/teacher/TeacherCourseDetailPage';
import TeacherSectionPage from './pages/teacher/TeacherSectionPage';
import TeacherJobsPage from './pages/teacher/TeacherJobsPage';
import TeacherJobDetailPage from './pages/teacher/TeacherJobDetailPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCoursesPage from './pages/admin/ManageCoursesPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';

import ProtectedRoute from './components/shared/ProtectedRoute';

const ROLE_HOME = { student: '/student/courses', teacher: '/teacher/courses', admin: '/admin/overview' };

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/student/courses" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/courses/:courseId" element={<ProtectedRoute role="student"><CoursePage /></ProtectedRoute>} />
        <Route path="/student/courses/:courseId/topics/:topicId" element={<ProtectedRoute role="student"><TopicPage /></ProtectedRoute>} />
        <Route path="/student/tasks/:taskId" element={<ProtectedRoute role="student"><TaskWorkspacePage /></ProtectedRoute>} />
        <Route path="/student/core" element={<ProtectedRoute role="student"><CoreLandingPage /></ProtectedRoute>} />
        <Route path="/student/learning" element={<ProtectedRoute role="student"><LearningPage /></ProtectedRoute>} />
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><ProgressDashboardPage /></ProtectedRoute>} />
        <Route path="/student/dsa" element={<ProtectedRoute role="student"><DSAPage /></ProtectedRoute>} />
        <Route path="/student/sql" element={<ProtectedRoute role="student"><SQLPage /></ProtectedRoute>} />
        <Route path="/student/webdev" element={<ProtectedRoute role="student"><WebDevPage /></ProtectedRoute>} />
        <Route path="/student/interviews" element={<ProtectedRoute role="student"><MockInterviewDashboardPage /></ProtectedRoute>} />
        <Route path="/student/interviews/session/:id" element={<ProtectedRoute role="student"><InterviewSessionPage /></ProtectedRoute>} />
        <Route path="/student/progress" element={<ProtectedRoute role="student"><ProgressPage /></ProtectedRoute>} />
        <Route path="/student/jobs" element={<ProtectedRoute role="student"><StudentJobsPage /></ProtectedRoute>} />
        <Route path="/student/jobs/:id" element={<ProtectedRoute role="student"><StudentJobDetailPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><ProfilePage /></ProtectedRoute>} />

        <Route path="/teacher/courses" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/courses/:courseId/sections/:sectionId" element={<ProtectedRoute role="teacher"><TeacherSectionPage /></ProtectedRoute>} />
        <Route path="/teacher/courses/:courseId" element={<ProtectedRoute role="teacher"><TeacherCourseDetailPage /></ProtectedRoute>} />
        <Route path="/teacher/progress" element={<ProtectedRoute role="teacher"><CourseProgressPage /></ProtectedRoute>} />
        <Route path="/teacher/review" element={<ProtectedRoute role="teacher"><AIReviewPage /></ProtectedRoute>} />
        <Route path="/teacher/analytics" element={<ProtectedRoute role="teacher"><TeacherAnalyticsPage /></ProtectedRoute>} />
        <Route path="/teacher/jobs" element={<ProtectedRoute role="teacher"><TeacherJobsPage /></ProtectedRoute>} />
        <Route path="/teacher/jobs/:id" element={<ProtectedRoute role="teacher"><TeacherJobDetailPage /></ProtectedRoute>} />
        <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><ProfilePage /></ProtectedRoute>} />

        <Route path="/admin/overview" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute role="admin"><ManageCoursesPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsersPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

