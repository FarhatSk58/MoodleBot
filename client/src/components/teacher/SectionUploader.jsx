import { useState, useRef } from 'react';
import {
  UploadCloud, FileText, Trash2, ExternalLink,
  Loader2, Plus, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useFetch } from '../../hooks/useFetch';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Reusable section file uploader — used for all 8 section types.
 *
 * @param {{ courseId: string, sectionId: string, unitNumber?: number, label?: string }} props
 */
export default function SectionUploader({ courseId, sectionId, unitNumber = null, label }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Build query string for fetching only this section's files (optionally by unit)
  const queryParams = new URLSearchParams({ section: sectionId });
  if (unitNumber !== null) queryParams.set('unit', unitNumber);
  const fetchUrl = `/materials/courses/${courseId}?${queryParams}`;

  const { data: materials, loading, refetch } = useFetch(fetchUrl, [sectionId, unitNumber]);
  const fileList = materials || [];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile) { toast.error('Please select a file'); return; }
    if (!title.trim()) { toast.error('Please enter a title'); return; }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim());
    formData.append('section', sectionId);
    if (unitNumber !== null) formData.append('unitNumber', unitNumber);

    setUploading(true);
    try {
      await api.post(`/materials/courses/${courseId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded successfully');
      setSelectedFile(null);
      setTitle('');
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    setDeleteId(materialId);
    try {
      await api.delete(`/materials/${materialId}`);
      toast.success('File deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-slate-200 rounded-xl h-16 w-full" />;
  }

  return (
    <div className="space-y-4">
      {/* Uploaded files list */}
      {fileList.length > 0 && (
        <div className="space-y-2">
          {fileList.map((mat) => (
            <div
              key={mat._id}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 group hover:border-indigo-200 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{mat.title}</p>
                <p className="text-xs text-slate-400">
                  {mat.fileName} {mat.fileSize ? `· ${formatBytes(mat.fileSize)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
                  aria-label="View file"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  onClick={() => handleDelete(mat._id)}
                  disabled={deleteId === mat._id}
                  aria-label="Delete file"
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all disabled:opacity-40"
                >
                  {deleteId === mat._id
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      {showForm ? (
        <div className="bg-white border border-indigo-200 rounded-xl p-5 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
          >
            <UploadCloud size={28} className="text-slate-400 mb-2" />
            {selectedFile ? (
              <p className="text-sm font-medium text-indigo-700">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-600">Click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF, Word, Images, Videos, etc.</p>
              </>
            )}
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a name for this file"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { setShowForm(false); setSelectedFile(null); setTitle(''); }}
              className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            >
              {uploading
                ? <><Loader2 size={15} className="animate-spin" /> Uploading...</>
                : <><UploadCloud size={15} /> Upload</>}
            </button>
          </div>
        </div>
      ) : (
        /* Add file button */
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-dashed border-indigo-300 rounded-xl px-4 py-3 w-full justify-center hover:bg-indigo-50/40 transition-all"
        >
          <Plus size={16} /> {fileList.length > 0 ? 'Add Another File' : `Upload ${label || 'File'}`}
        </button>
      )}
    </div>
  );
}
