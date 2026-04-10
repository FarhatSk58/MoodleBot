import { useEffect, useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function UserTable({ users, onDelete }) {
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    setPage(1);
  }, [users]);

  const paged = users.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(users.length / PER_PAGE);

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/admin/users/${deleteId}`);
      toast.success('User deleted');
      onDelete?.(deleteId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase font-medium">Name</th>
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase font-medium">Email</th>
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase font-medium">Details</th>
                <th className="text-left px-5 py-3 text-xs text-slate-400 uppercase font-medium">Joined</th>
                <th className="text-center px-5 py-3 text-xs text-slate-400 uppercase font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{user.name}</td>
                  <td className="px-5 py-3 text-slate-500 truncate max-w-48">{user.email}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {user.role === 'student'
                      ? `${user.department || '-'} / ${user.year || '-'} / ${user.semester || '-'}`
                      : user.department || '-'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => setDeleteId(user._id)} aria-label={`Delete ${user.name}`} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, users.length)} of {users.length}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Prev</button>
              <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-semibold text-slate-900 mb-2">Delete this user?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={confirmDelete} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                {loading ? <Loader2 size={14} className="animate-spin" /> : null} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

