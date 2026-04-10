import { useState, useRef } from 'react';
import {
  FileUp, FileText, Loader2, ExternalLink,
  RefreshCw, X, Cpu, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Trash2, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useFetch } from '../../hooks/useFetch';
import { cn } from '../../lib/utils';

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];
const ACCEPTED_EXT_RE = /\.(docx?|doc)$/i;

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file) {
  if (!ACCEPTED_EXT_RE.test(file.name) && !ACCEPTED_TYPES.includes(file.type)) {
    return 'Only Word (.docx) files are supported.';
  }
  return null;
}

// ── Single file upload slot ───────────────────────────────────────────────────
function FileSlot({ label, hint, courseId, sectionId, onUploaded }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const queryParams = new URLSearchParams({ section: sectionId });
  const { data: materials, loading, refetch } = useFetch(
    `/materials/courses/${courseId}?${queryParams}`,
    [sectionId]
  );
  const fileList = materials || [];
  const latestFile = fileList[fileList.length - 1] || null;

  const handleBrowse = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;

    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setFileError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^.]+$/, ''));
    formData.append('section', sectionId);

    setUploading(true);
    try {
      await api.post(`/materials/courses/${courseId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`${label} uploaded`);
      await refetch();
      onUploaded?.();
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
      toast.success('File removed');
      await refetch();
      onUploaded?.();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.doc"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{label}</p>

      {loading ? (
        <div className="animate-pulse bg-slate-100 rounded-xl h-14 w-full" />
      ) : latestFile ? (
        /* File card */
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 group">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{latestFile.title}</p>
            <p className="text-xs text-slate-400">{latestFile.fileName} {latestFile.fileSize ? `· ${formatBytes(latestFile.fileSize)}` : ''}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <a
              href={latestFile.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all"
              title="View"
            >
              <ExternalLink size={14} />
            </a>
            <button
              onClick={handleBrowse}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
              title="Replace"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => handleDelete(latestFile._id)}
              disabled={deleteId === latestFile._id}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all disabled:opacity-40"
              title="Remove"
            >
              {deleteId === latestFile._id
                ? <Loader2 size={14} className="animate-spin" />
                : <Trash2 size={14} />}
            </button>
          </div>
        </div>
      ) : (
        /* Upload zone */
        <button
          type="button"
          onClick={handleBrowse}
          disabled={uploading}
          className={cn(
            'w-full flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-4 transition-all',
            uploading
              ? 'border-indigo-300 bg-indigo-50/30 cursor-wait'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer'
          )}
        >
          {uploading
            ? <Loader2 size={18} className="text-indigo-400 animate-spin flex-shrink-0" />
            : <FileUp size={18} className="text-slate-400 flex-shrink-0" />}
          <div className="text-left">
            <p className="text-sm font-medium text-slate-700">
              {uploading ? 'Uploading...' : `Upload ${label}`}
            </p>
            <p className="text-xs text-slate-400">{hint}</p>
          </div>
        </button>
      )}

      {fileError && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} /> {fileError}
        </p>
      )}
    </div>
  );
}

// ── Parsed structure preview ──────────────────────────────────────────────────
function ParsedPreview({ units }) {
  const [openUnits, setOpenUnits] = useState({});
  const toggle = (n) => setOpenUnits((p) => ({ ...p, [n]: !p[n] }));
  const isOpen = (n) => openUnits[n] === undefined ? true : openUnits[n];

  return (
    <div className="space-y-3">
      {units.map((unit) => (
        <div key={unit.unitNumber} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle(unit.unitNumber)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-800 text-sm">
              Unit {unit.unitNumber}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {unit.topics.length} topic{unit.topics.length !== 1 ? 's' : ''}
              </span>
              {isOpen(unit.unitNumber)
                ? <ChevronUp size={14} className="text-slate-400" />
                : <ChevronDown size={14} className="text-slate-400" />}
            </div>
          </button>

          {isOpen(unit.unitNumber) && (
            <div className="border-t border-slate-100 divide-y divide-slate-50">
              {unit.topics.map((topic, ti) => (
                <div key={ti} className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-800 mb-1.5">{topic.title}</p>
                  {topic.subtopics && topic.subtopics.length > 0 && (
                    <ul className="space-y-1 pl-3">
                      {topic.subtopics.map((sub, si) => (
                        <li key={si} className="text-xs text-slate-500 flex gap-1.5">
                          <span className="text-indigo-300 flex-shrink-0 mt-0.5">•</span>
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(!topic.subtopics || topic.subtopics.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No subtopics found for this topic</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main SyllabusParserSection ────────────────────────────────────────────────
/**
 * Combined syllabus + micro-syllabus upload widget with auto-parse and topic review.
 *
 * Flow:
 *  1. Teacher uploads Syllabus DOCX → SectionUploader saves to Cloudinary via /materials
 *  2. Teacher uploads Micro Syllabus DOCX → same
 *  3. Both present → "Parse Topics" button appears → POST /teacher/courses/:id/syllabi/parse
 *  4. Preview appears → teacher reviews → Confirm → POST /teacher/courses/:id/syllabi/confirm
 *  5. Topics saved to DB → callback
 *
 * @param {{ courseId: string, onConfirmed: function }} props
 */
export default function SyllabusParserSection({ courseId, onConfirmed }) {
  // Track file presence so we can re-check after uploads
  const [fileChangeKey, setFileChangeKey] = useState(0);

  // Parsed preview state
  const [parsing, setParsing] = useState(false);
  const [parsedUnits, setParsedUnits] = useState(null); // null = not parsed yet
  const [parseError, setParseError] = useState('');
  const [confirming, setConfirming] = useState(false);

  // Fetch current file counts to know if we have both files
  const { data: syllabusFiles } = useFetch(
    `/materials/courses/${courseId}?section=syllabus`,
    [fileChangeKey]
  );
  const { data: microFiles } = useFetch(
    `/materials/courses/${courseId}?section=micro-syllabus`,
    [fileChangeKey]
  );

  const hasSyllabus = (syllabusFiles || []).length > 0;
  const hasMicro = (microFiles || []).length > 0;
  const canParse = hasSyllabus && hasMicro;

  const handleFileUploaded = () => setFileChangeKey((k) => k + 1);

  const handleParse = async () => {
    setParsing(true);
    setParseError('');
    setParsedUnits(null);
    try {
      const res = await api.post(`/teacher/courses/${courseId}/syllabi/parse`);
      const { units } = res.data.data;
      if (!units || units.length === 0) {
        setParseError('Parser returned no units. Check the document structure and try again.');
        return;
      }
      setParsedUnits(units);
    } catch (err) {
      const msg = err.response?.data?.message || 'Parsing failed. Please check your files and try again.';
      setParseError(msg);
      toast.error(msg);
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedUnits) return;
    setConfirming(true);
    try {
      await api.post(`/teacher/courses/${courseId}/syllabi/confirm`, { units: parsedUnits });
      toast.success('Topics saved successfully!');
      setParsedUnits(null);
      onConfirmed?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save topics');
    } finally {
      setConfirming(false);
    }
  };

  const handleDiscard = () => {
    setParsedUnits(null);
    setParseError('');
  };

  return (
    <div className="space-y-6">

      {/* ── Step 1: Upload both files ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
          <h3 className="text-sm font-semibold text-slate-800">Upload Documents</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5 ml-7">
          Upload both files below. Once both are present, you can run the parser.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <FileSlot
            label="Syllabus"
            hint="Word document (.docx) with unit table"
            courseId={courseId}
            sectionId="syllabus"
            onUploaded={handleFileUploaded}
          />
          <div className="hidden sm:flex items-center text-slate-300 flex-shrink-0 self-center pt-5">
            <span className="text-lg">+</span>
          </div>
          <FileSlot
            label="Micro Syllabus"
            hint="Word document (.docx) with detailed subtopics"
            courseId={courseId}
            sectionId="micro-syllabus"
            onUploaded={handleFileUploaded}
          />
        </div>
      </div>

      {/* ── Step 2: Parse ── */}
      <div className={cn(
        'bg-white border rounded-2xl p-6 transition-all',
        canParse ? 'border-slate-200' : 'border-slate-100 opacity-60'
      )}>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            'w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0',
            canParse ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
          )}>2</span>
          <h3 className="text-sm font-semibold text-slate-800">Parse Topics</h3>
          {!canParse && (
            <span className="text-xs text-slate-400 ml-1">— upload both files first</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-5 ml-7">
          Extracts units → topics → subtopics from your documents and shows a preview for review.
        </p>

        {!parsedUnits && (
          <button
            onClick={handleParse}
            disabled={!canParse || parsing}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              canParse && !parsing
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {parsing ? (
              <><Loader2 size={15} className="animate-spin" /> Parsing documents...</>
            ) : (
              <><Cpu size={15} /> Parse Topics</>
            )}
          </button>
        )}

        {parseError && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}
      </div>

      {/* ── Step 3: Review + Confirm ── */}
      {parsedUnits && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
              <h3 className="text-sm font-semibold text-slate-800">Review &amp; Confirm</h3>
            </div>
            <button
              onClick={handleDiscard}
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
            >
              <X size={13} /> Discard
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-700">
            ⚠ Confirming will replace all existing topics for this course. Review carefully before proceeding.
          </div>

          <ParsedPreview units={parsedUnits} />

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleDiscard}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            >
              {confirming
                ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                : <><CheckCircle2 size={15} /> Confirm &amp; Save Topics</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
