import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import StudentDashboard from './pages/student/StudentDashboard';
import CoursePage from './pages/student/CoursePage';
import TopicPage from './pages/student/TopicPage';
import ProgressPage from './pages/student/ProgressPage';
import LearningPage from './pages/student/LearningPage';
import DSAPage from './pages/student/DSAPage';
import ProfilePage from './pages/shared/ProfilePage';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CourseProgressPage from './pages/teacher/CourseProgressPage';
import AIReviewPage from './pages/teacher/AIReviewPage';
import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage';
import TeacherCourseDetailPage from './pages/teacher/TeacherCourseDetailPage';
import TeacherSectionPage from './pages/teacher/TeacherSectionPage';

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
        <Route path="/student/learning" element={<ProtectedRoute role="student"><LearningPage /></ProtectedRoute>} />
        <Route path="/student/dsa" element={<ProtectedRoute role="student"><DSAPage /></ProtectedRoute>} />
        <Route path="/student/progress" element={<ProtectedRoute role="student"><ProgressPage /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="student"><ProfilePage /></ProtectedRoute>} />

        <Route path="/teacher/courses" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/courses/:courseId/sections/:sectionId" element={<ProtectedRoute role="teacher"><TeacherSectionPage /></ProtectedRoute>} />
        <Route path="/teacher/courses/:courseId" element={<ProtectedRoute role="teacher"><TeacherCourseDetailPage /></ProtectedRoute>} />
        <Route path="/teacher/progress" element={<ProtectedRoute role="teacher"><CourseProgressPage /></ProtectedRoute>} />
        <Route path="/teacher/review" element={<ProtectedRoute role="teacher"><AIReviewPage /></ProtectedRoute>} />
        <Route path="/teacher/analytics" element={<ProtectedRoute role="teacher"><TeacherAnalyticsPage /></ProtectedRoute>} />
        <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><ProfilePage /></ProtectedRoute>} />

        <Route path="/admin/overview" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/courses" element={<ProtectedRoute role="admin"><ManageCoursesPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsersPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

