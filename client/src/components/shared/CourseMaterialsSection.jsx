import { useState } from 'react';
import {
  BookOpen, BookCopy, ClipboardList,
  FileText, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { formatFileSize } from '../../lib/utils';

// Section metadata — display labels and grouping
const SECTION_GROUPS = [
  {
    id: 'academic',
    label: 'Academic Structure',
    icon: BookOpen,
    color: 'indigo',
    sections: [
      { id: 'syllabus', label: 'Syllabus' },
      { id: 'micro-syllabus', label: 'Micro Syllabus' },
      { id: 'units', label: 'Units' },
    ],
  },
  {
    id: 'learning',
    label: 'Learning Resources',
    icon: BookCopy,
    color: 'emerald',
    sections: [
      { id: 'textbooks', label: 'Textbooks' },
      { id: 'notes', label: 'Notes' },
    ],
  },
  {
    id: 'assessment',
    label: 'Assessment',
    icon: ClipboardList,
    color: 'amber',
    sections: [
      { id: 'mcqs', label: 'MCQs' },
      { id: 'question-banks', label: 'Question Banks' },
      { id: 'previous-papers', label: 'Previous Papers' },
    ],
  },
];

const GROUP_COLORS = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-500', border: 'border-indigo-100', heading: 'text-indigo-700' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', border: 'border-emerald-100', heading: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-100', heading: 'text-amber-700' },
};

/**
 * Student-facing course materials viewer.
 * Groups uploaded files by section and hides empty sections.
 */
export default function CourseMaterialsSection({ courseId }) {
  const { data: materials, loading } = useFetch(`/materials/courses/${courseId}`);
  const [openGroups, setOpenGroups] = useState({ academic: true, learning: true, assessment: true });

  if (loading) return null;
  if (!materials || materials.length === 0) return null;

  // Build a map: sectionId → materials[]
  const bySection = {};
  for (const mat of materials) {
    if (!bySection[mat.section]) bySection[mat.section] = [];
    bySection[mat.section].push(mat);
  }

  // Filter groups that have ANY content
  const activeGroups = SECTION_GROUPS.filter((g) =>
    g.sections.some((s) => (bySection[s.id]?.length || 0) > 0)
  );

  if (activeGroups.length === 0) return null;

  const toggleGroup = (id) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="mt-10 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Course Materials</h2>

      {activeGroups.map((group) => {
        const c = GROUP_COLORS[group.color];
        const Icon = group.icon;
        const isOpen = openGroups[group.id];

        // Only include sections that have files
        const activeSections = group.sections.filter(
          (s) => (bySection[s.id]?.length || 0) > 0
        );

        return (
          <div
            key={group.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
          >
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <Icon size={16} className={c.icon} />
                </div>
                <span className="font-semibold text-slate-800 text-sm">{group.label}</span>
                <span className="text-xs text-slate-400">
                  {activeSections.reduce((s, sec) => s + (bySection[sec.id]?.length || 0), 0)} files
                </span>
              </div>
              {isOpen
                ? <ChevronUp size={16} className="text-slate-400" />
                : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {/* Sections + files */}
            {isOpen && (
              <div className={`border-t ${c.border}`}>
                {activeSections.map((sec, si) => (
                  <div key={sec.id}>
                    {si > 0 && <div className="h-px bg-slate-100 mx-5" />}
                    <div className="px-5 py-4">
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${c.heading}`}>
                        {sec.label}
                      </p>
                      <div className="space-y-2">
                        {(bySection[sec.id] || []).map((mat) => (
                          <FileRow key={mat._id} material={mat} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FileRow({ material }) {
  const isUnitFile = material.unitNumber !== null && material.unitNumber !== undefined;
  return (
    <a
      href={material.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 group p-2.5 rounded-xl hover:bg-slate-50 transition-all -mx-2.5"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
        <FileText size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
          {material.title}
        </p>
        <p className="text-xs text-slate-400">
          {isUnitFile && <span className="mr-2">Unit {material.unitNumber}</span>}
          {material.fileSize ? formatFileSize(material.fileSize) : ''}
        </p>
      </div>
      <ExternalLink size={13} className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
    </a>
  );
}
