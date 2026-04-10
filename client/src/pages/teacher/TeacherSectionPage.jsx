import { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { useFetch } from '../../hooks/useFetch';
import SectionUploader from '../../components/teacher/SectionUploader';
import SyllabusParserSection from '../../components/teacher/SyllabusParserSection';
import UnitsSection from '../../components/teacher/UnitsSection';

const SECTION_TITLES = {
  syllabus: 'Syllabus & Topic Setup',
  units: 'Units',
  textbooks: 'Textbooks',
  notes: 'Notes',
  mcqs: 'MCQs',
  'question-banks': 'Question Banks',
  'previous-papers': 'Previous Papers',
};

// Sections that use the unit-tabs layout (5 units, each with their own uploader)
const UNIT_COUNT = 5;

// Simple sections — just one SectionUploader, no unit tabs
const SIMPLE_SECTIONS = ['textbooks', 'notes', 'previous-papers'];

export default function TeacherSectionPage() {
  const navigate = useNavigate();
  const { courseId, sectionId } = useParams();
  const [activeUnit, setActiveUnit] = useState(1);
  const [unitsRefetchKey, setUnitsRefetchKey] = useState(0);

  const title = SECTION_TITLES[sectionId] || 'Section';

  const handleSyllabiConfirmed = () => {
    setUnitsRefetchKey((k) => k + 1);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* Back button */}
          <button
            onClick={() => navigate(`/teacher/courses/${courseId}`)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="text-2xl font-semibold text-slate-900 mb-8">{title}</h1>

          {/* ── Syllabus & Topic Setup = combined syllabus + micro upload + parse/confirm ── */}
          {sectionId === 'syllabus' && (
            <SyllabusParserSection
              courseId={courseId}
              onConfirmed={handleSyllabiConfirmed}
            />
          )}

          {/* ── Units — topics list + per-unit file upload ── */}
          {sectionId === 'units' && (
            <div className="space-y-8">
              {/* Read-only topic list by unit */}
              <div>
                <p className="text-sm font-medium text-slate-600 mb-3">Course Topics</p>
                <UnitsSection courseId={courseId} refetchKey={unitsRefetchKey} />
              </div>

              {/* Per-unit file uploads */}
              <div>
                <p className="text-sm font-medium text-slate-600 mb-4">Unit Materials</p>
                <UnitTabs
                  activeUnit={activeUnit}
                  onUnitChange={setActiveUnit}
                  courseId={courseId}
                  sectionId="units"
                />
              </div>
            </div>
          )}

          {/* ── MCQs / Question Banks — unit-tabbed upload ── */}
          {(sectionId === 'mcqs' || sectionId === 'question-banks') && (
            <UnitTabs
              activeUnit={activeUnit}
              onUnitChange={setActiveUnit}
              courseId={courseId}
              sectionId={sectionId}
            />
          )}

          {/* ── Simple sections — single uploader ── */}
          {SIMPLE_SECTIONS.includes(sectionId) && (
            <SectionUploader
              courseId={courseId}
              sectionId={sectionId}
              label={title}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ── Unit Tabs sub-component ──────────────────────────────────────────────────
function UnitTabs({ activeUnit, onUnitChange, courseId, sectionId }) {
  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {Array.from({ length: UNIT_COUNT }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onUnitChange(n)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-all ${
              activeUnit === n
                ? 'bg-white border border-b-white border-slate-200 text-indigo-600 -mb-px'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Unit {n}
          </button>
        ))}
      </div>

      {/* Active unit uploader */}
      <SectionUploader
        key={`${sectionId}-${activeUnit}`}
        courseId={courseId}
        sectionId={sectionId}
        unitNumber={activeUnit}
        label={`Unit ${activeUnit} File`}
      />
    </div>
  );
}
