import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/shared/Sidebar';
import PageHeader from '../../components/shared/PageHeader';
import api from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || '',
        currentPassword: '',
        newPassword: '',
      }));
    }
  }, [user]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = { name: form.name };
      if (form.currentPassword || form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const response = await api.patch('/auth/me', payload);
      login(response.data.data);
      toast.success('Profile updated successfully');
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <PageHeader title="Edit Profile" subtitle="Update your basic details or change your password." />

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Profile Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Name</span>
                  <span className="text-slate-900 font-medium text-right">{user?.name || '-'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-900 font-medium text-right break-all">{user?.email || '-'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Role</span>
                  <span className="text-slate-900 font-medium text-right">{user?.role || '-'}</span>
                </div>
                {(user?.department || user?.role === 'teacher' || user?.role === 'student') && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Department</span>
                    <span className="text-slate-900 font-medium text-right">{user?.department || '-'}</span>
                  </div>
                )}
                {user?.role === 'student' && (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Year</span>
                      <span className="text-slate-900 font-medium text-right">{user?.year || '-'}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Semester</span>
                      <span className="text-slate-900 font-medium text-right">{user?.semester || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Edit Profile</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => updateField('currentPassword', e.target.value)}
                    placeholder="Leave blank if not changing password"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => updateField('newPassword', e.target.value)}
                    placeholder="Leave blank if not changing password"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg text-sm transition-all disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
