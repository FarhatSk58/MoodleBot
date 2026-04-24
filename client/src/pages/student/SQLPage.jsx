import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Import,
  PlaySquare,
  PlusCircle,
  RotateCcw,
  Search,
  Shuffle,
  Star,
} from 'lucide-react';
import Sidebar from '../../components/shared/Sidebar';
import api from '../../lib/axios';
import { cn } from '../../lib/utils';
import { SQL_PROBLEMS } from '../../data/sqlProblems';

const SHEET_META = {
  title: 'SQL Practice Sheet',
  subtitle: 'Track your SQL problems topic-by-topic.',
  lastUpdated: 'April 13, 2026',
  knowMoreLabel: 'Know more',
};

const SHEET_SECTIONS = Array.from(
  SQL_PROBLEMS.reduce((map, p) => {
    if (!map.has(p.topic)) {
      map.set(p.topic, {
        id: String(p.topic).toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        title: p.topic,
        groups: [{ id: 'problems', title: 'Problems', items: [] }],
      });
    }
    map.get(p.topic).groups[0].items.push({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      resourceArticle: '',
      resourceVideo: '',
      practice: p.url,
      notes: '',
      topic: p.topic,
      url: p.url,
    });
    return map;
  }, new Map()).values()
);

function makeItemKey({ item }) {
  return String(item?.id || '');
}

const DIFFICULTY_META = {
  easy: { label: 'Easy', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  hard: { label: 'Hard', cls: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};

const STATUS_META = {
  all: { label: 'All problems' },
  solved: { label: 'Solved' },
  unsolved: { label: 'Unsolved' },
};

const SQL_REVISION_STORAGE_KEY = 'sql_revision_keys_v1';

const readRevisionKeys = () => {
  try {
    const raw = localStorage.getItem(SQL_REVISION_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const writeRevisionKeys = (keys) => {
  try {
    localStorage.setItem(SQL_REVISION_STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore
  }
};

export default function SQLPage() {
  const [activeTab, setActiveTab] = useState('all'); // all | revision
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | solved | unsolved
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // all | easy | medium | hard
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [expandedGroupId, setExpandedGroupId] = useState(null);

  const fileInputRef = useRef(null);

  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState('');
  const [solvedIds, setSolvedIds] = useState(() => new Set());
  const [revisionIds, setRevisionIds] = useState(() => new Set(readRevisionKeys()));

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setProgressLoading(true);
        setProgressError('');
        const res = await api.get('/student/sql/progress');
        const solvedProblems = res?.data?.data?.solvedProblems || [];
        const solvedKeys = solvedProblems.map((p) => p.problemId);
        if (!isMounted) return;
        setSolvedIds(new Set(solvedKeys));
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load SQL progress';
        if (!isMounted) return;
        setProgressError(message);
      } finally {
        if (isMounted) setProgressLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    writeRevisionKeys(Array.from(revisionIds));
  }, [revisionIds]);

  const itemsFlat = useMemo(() => {
    const items = [];

    for (let sectionIndex = 0; sectionIndex < SHEET_SECTIONS.length; sectionIndex += 1) {
      const section = SHEET_SECTIONS[sectionIndex];
      const sectionId = section?.id || `section-${sectionIndex + 1}`;
      const sectionTitle = section?.title || `Section ${sectionIndex + 1}`;
      const groups = Array.isArray(section?.groups) ? section.groups : [];

      for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        const group = groups[groupIndex];
        const groupId = group?.id || `group-${groupIndex + 1}`;
        const groupTitle = group?.title || `Group ${groupIndex + 1}`;
        const groupItems = Array.isArray(group?.items) ? group.items : [];

        for (let itemIndex = 0; itemIndex < groupItems.length; itemIndex += 1) {
          const item = groupItems[itemIndex];
          const itemKey = makeItemKey({ item });
          items.push({
            ...item,
            itemKey,
            solved: solvedIds.has(itemKey),
            revision: revisionIds.has(itemKey),
            sectionId,
            sectionTitle,
            groupId,
            groupTitle,
          });
        }
      }
    }

    return items;
  }, [revisionIds, solvedIds]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return itemsFlat.filter((item) => {
      if (activeTab === 'revision' && !item.revision) return false;
      if (statusFilter === 'solved' && !item.solved) return false;
      if (statusFilter === 'unsolved' && item.solved) return false;
      if (difficultyFilter !== 'all' && item.difficulty !== difficultyFilter) return false;

      if (!normalizedQuery) return true;
      const haystack = `${item.title} ${item.sectionTitle} ${item.groupTitle}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [activeTab, difficultyFilter, itemsFlat, query, statusFilter]);

  const totals = useMemo(() => {
    const total = itemsFlat.length;
    const solved = itemsFlat.filter((p) => p.solved).length;
    const byDifficulty = {
      easy: itemsFlat.filter((p) => p.difficulty === 'easy').length,
      medium: itemsFlat.filter((p) => p.difficulty === 'medium').length,
      hard: itemsFlat.filter((p) => p.difficulty === 'hard').length,
    };
    const solvedByDifficulty = {
      easy: itemsFlat.filter((p) => p.difficulty === 'easy' && p.solved).length,
      medium: itemsFlat.filter((p) => p.difficulty === 'medium' && p.solved).length,
      hard: itemsFlat.filter((p) => p.difficulty === 'hard' && p.solved).length,
    };
    const pct = total ? Math.round((solved / total) * 100) : 0;
    return { total, solved, pct, byDifficulty, solvedByDifficulty };
  }, [itemsFlat]);

  const sectionRows = useMemo(() => {
    return SHEET_SECTIONS.map((section) => {
      const sectionItems = filteredItems.filter((item) => item.sectionId === section.id);
      const solved = sectionItems.filter((p) => p.solved).length;
      const total = sectionItems.length;
      return {
        sectionId: section.id,
        sectionTitle: section.title,
        total,
        solved,
        pct: total ? Math.round((solved / total) * 100) : 0,
      };
    }).filter((row) => row.total > 0);
  }, [filteredItems]);

  const groupRowsForSection = useCallback(
    (sectionId) => {
      const section = SHEET_SECTIONS.find((s) => s.id === sectionId);
      if (!section) return [];

      return section.groups
        .map((group) => {
          const groupItems = filteredItems.filter((item) => item.sectionId === sectionId && item.groupId === group.id);
          const solved = groupItems.filter((p) => p.solved).length;
          const total = groupItems.length;
          return {
            groupId: group.id,
            groupTitle: group.title,
            total,
            solved,
            pct: total ? Math.round((solved / total) * 100) : 0,
          };
        })
        .filter((row) => row.total > 0);
    },
    [filteredItems]
  );

  const itemsForGroup = useCallback(
    (sectionId, groupId) => {
      return filteredItems.filter((item) => item.sectionId === sectionId && item.groupId === groupId);
    },
    [filteredItems]
  );

  const handleReset = () => {
    setActiveTab('all');
    setQuery('');
    setStatusFilter('all');
    setDifficultyFilter('all');
    setExpandedSectionId(null);
    setExpandedGroupId(null);
    toast.success('Filters reset');
  };

  const handleRandom = () => {
    if (!filteredItems.length) {
      toast.error('No problems match the current filters');
      return;
    }
    const randomItem = filteredItems[Math.floor(Math.random() * filteredItems.length)];
    setExpandedSectionId(randomItem.sectionId);
    setExpandedGroupId(randomItem.groupId);
    toast(`Random: ${randomItem.title}`, { icon: '🎯' });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const toggleSolved = async (item) => {
    const itemKey = item.itemKey;
    const nextSolved = !solvedIds.has(itemKey);

    setSolvedIds((prev) => {
      const next = new Set(prev);
      if (nextSolved) next.add(itemKey);
      else next.delete(itemKey);
      return next;
    });

    try {
      if (nextSolved) {
        await api.post('/student/sql/solve', {
          problemId: itemKey,
          topic: item.topic,
          difficulty: item.difficulty,
        });
      } else {
        await api.delete(`/student/sql/solve/${itemKey}`);
      }
    } catch (err) {
      setSolvedIds((prev) => {
        const next = new Set(prev);
        if (nextSolved) next.delete(itemKey);
        else next.add(itemKey);
        return next;
      });
      toast.error(err?.response?.data?.message || 'Failed to save progress');
    }
  };

  const toggleRevision = async (itemKey) => {
    const nextRevision = !revisionIds.has(itemKey);

    setRevisionIds((prev) => {
      const next = new Set(prev);
      if (nextRevision) next.add(itemKey);
      else next.delete(itemKey);
      return next;
    });

    // keep the same UX as DSA (async), even though we persist locally
    await Promise.resolve();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)] flex-1 bg-slate-50 min-h-screen pb-12">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
          {progressError && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
              {progressError}
            </div>
          )}
          {progressLoading && !progressError && (
            <div className="rounded-xl border border-slate-200 bg-white text-slate-600 px-4 py-3 text-sm">
              Loading your SQL progress...
            </div>
          )}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">{SHEET_META.title}</h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {SHEET_META.subtitle}{' '}
                <button
                  type="button"
                  className="text-indigo-600 hover:underline font-medium"
                  onClick={() => toast('Add link later')}
                >
                  {SHEET_META.knowMoreLabel}
                </button>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-orange-200 hover:text-orange-700 transition-colors text-sm"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-sm"
              >
                <Import size={16} /> Import
              </button>
              <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm">
                <span className="font-medium">Last updated</span>: {SHEET_META.lastUpdated}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={() => toast('Import wiring will be added later')}
                aria-label="Import SQL sheet"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1 w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={cn(
                  'px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors',
                  activeTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                All Problems
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('revision')}
                className={cn(
                  'px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors',
                  activeTab === 'revision' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                Revision
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-44 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                aria-label="Problem status filter"
              >
                {Object.entries(STATUS_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full sm:w-40 bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                aria-label="Difficulty filter"
              >
                <option value="all">Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <button
                type="button"
                onClick={handleRandom}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-sm font-semibold"
              >
                <Shuffle size={16} /> Random Problem
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <CircularProgress percentage={totals.pct} />
                <div>
                  <p className="text-sm text-slate-600 font-semibold">Overall Progress</p>
                  <p className="text-xl font-bold text-slate-900">
                    {totals.solved} <span className="text-slate-500 font-semibold">/ {totals.total}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {['easy', 'medium', 'hard'].map((key) => {
                  const meta = DIFFICULTY_META[key];
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className={cn('w-2.5 h-2.5 rounded-full', meta.dot)} />
                      <span className="font-semibold">{meta.label}</span>
                      <span className="text-slate-500">
                        {totals.solvedByDifficulty[key]}/{totals.byDifficulty[key]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {sectionRows.map((row, idx) => {
              const isOpen = expandedSectionId === row.sectionId;
              return (
                <div
                  key={row.sectionId}
                  className={cn('border-slate-200', idx === sectionRows.length - 1 ? 'border-b-0' : 'border-b')}
                >
                  <button
                    type="button"
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    onClick={() => {
                      setExpandedGroupId(null);
                      setExpandedSectionId((cur) => (cur === row.sectionId ? null : row.sectionId));
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-slate-500">
                        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </span>
                      <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">{row.sectionTitle}</p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="w-36 sm:w-44 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${row.pct}%` }} />
                      </div>
                      <p className="text-sm text-slate-600 font-semibold tabular-nums">
                        {row.solved} / {row.total}
                      </p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <div className="mt-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
                        {groupRowsForSection(row.sectionId).map((groupRow, groupIndex, groups) => {
                          const isGroupOpen = expandedGroupId === groupRow.groupId;
                          const groupItems = isGroupOpen ? itemsForGroup(row.sectionId, groupRow.groupId) : [];

                          return (
                            <div
                              key={groupRow.groupId}
                              className={cn(groupIndex === groups.length - 1 ? '' : 'border-b border-slate-200')}
                            >
                              <button
                                type="button"
                                className="w-full px-4 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                                onClick={() => setExpandedGroupId((cur) => (cur === groupRow.groupId ? null : groupRow.groupId))}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="text-slate-500">
                                    {isGroupOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                  </span>
                                  <p className="text-sm font-semibold text-slate-900 truncate">{groupRow.groupTitle}</p>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                  <div className="w-36 sm:w-44 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${groupRow.pct}%` }} />
                                  </div>
                                  <p className="text-sm text-slate-600 font-semibold tabular-nums">
                                    {groupRow.solved} / {groupRow.total}
                                  </p>
                                </div>
                              </button>

                              {isGroupOpen && (
                                <div className="px-4 pb-4">
                                  <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden bg-white">
                                    <div className="overflow-x-auto">
                                      <table className="min-w-[980px] w-full text-sm">
                                        <thead className="bg-slate-50">
                                          <tr className="text-left text-slate-600">
                                            <th className="px-4 py-3 font-semibold w-24">Status</th>
                                            <th className="px-4 py-3 font-semibold">Problem</th>
                                            <th className="px-4 py-3 font-semibold w-40">Resource</th>
                                            <th className="px-4 py-3 font-semibold w-32">Practice</th>
                                            <th className="px-4 py-3 font-semibold w-28">Notes</th>
                                            <th className="px-4 py-3 font-semibold w-28">Revision</th>
                                            <th className="px-4 py-3 font-semibold w-28">Difficulty</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {groupItems.map((item, itemIndex) => {
                                            const difficulty = DIFFICULTY_META[item.difficulty] || DIFFICULTY_META.easy;
                                            const isSolved = !!item.solved;

                                            return (
                                              <tr
                                                key={item.id}
                                                className={cn(itemIndex === groupItems.length - 1 ? '' : 'border-b border-slate-200')}
                                              >
                                                <td className="px-4 py-3">
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleSolved(item)}
                                                    className={cn(
                                                      'inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors',
                                                      isSolved
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                                    )}
                                                    aria-label={isSolved ? 'Mark unsolved' : 'Mark solved'}
                                                    title={isSolved ? 'Solved' : 'Unsolved'}
                                                  >
                                                    {isSolved ? <CheckCircle2 size={18} /> : <Code2 size={16} />}
                                                  </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-semibold text-slate-900 hover:underline"
                                                  >
                                                    {item.title}
                                                  </a>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <div className="flex items-center gap-2">
                                                    <a
                                                      href={item.resourceArticle || undefined}
                                                      onClick={(e) => {
                                                        if (!item.resourceArticle) {
                                                          e.preventDefault();
                                                          toast('Add article link later');
                                                        }
                                                      }}
                                                      className={cn(
                                                        'inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors',
                                                        item.resourceArticle
                                                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                          : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                                                      )}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      aria-label="Article resource"
                                                      title="Article"
                                                    >
                                                      <FileText size={16} />
                                                    </a>
                                                    <a
                                                      href={item.resourceVideo || undefined}
                                                      onClick={(e) => {
                                                        if (!item.resourceVideo) {
                                                          e.preventDefault();
                                                          toast('Add video link later');
                                                        }
                                                      }}
                                                      className={cn(
                                                        'inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors',
                                                        item.resourceVideo
                                                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                          : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                                                      )}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      aria-label="Video resource"
                                                      title="Video"
                                                    >
                                                      <PlaySquare size={16} />
                                                    </a>
                                                  </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <a
                                                    href={item.practice || undefined}
                                                    onClick={(e) => {
                                                      if (!item.practice) {
                                                        e.preventDefault();
                                                        toast('Add practice link later');
                                                      }
                                                    }}
                                                    className={cn(
                                                      'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold border transition-colors',
                                                      item.practice
                                                        ? 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50'
                                                        : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                                                    )}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                  >
                                                    Solve
                                                  </a>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <button
                                                    type="button"
                                                    onClick={() => toast('Notes editor wiring later')}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                                                    aria-label="Add note"
                                                    title="Add note"
                                                  >
                                                    <PlusCircle size={18} />
                                                  </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <button
                                                    type="button"
                                                    onClick={() => toggleRevision(item.itemKey)}
                                                    className={cn(
                                                      'inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors',
                                                      item.revision
                                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                                    )}
                                                    aria-label={item.revision ? 'Remove from revision' : 'Mark for revision'}
                                                    title={item.revision ? 'Revision' : 'Mark revision'}
                                                  >
                                                    <Star size={18} className={cn(item.revision ? 'fill-indigo-600' : '')} />
                                                  </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                  <span
                                                    className={cn(
                                                      'inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold',
                                                      difficulty.cls
                                                    )}
                                                  >
                                                    {difficulty.label}
                                                  </span>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>

                                    {!groupItems.length && (
                                      <div className="px-4 py-5 text-sm text-slate-500">
                                        No problems in this subsection for the current filters.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!groupRowsForSection(row.sectionId).length && (
                          <div className="px-4 py-5 text-sm text-slate-500">No subsections in this section for the current filters.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {!sectionRows.length && (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-slate-800 mb-1">No problems match your filters.</p>
                <p className="text-xs text-slate-500">Try clearing search or switching filters back to &quot;All&quot;.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function CircularProgress({ percentage }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-orange-100" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-orange-500 transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-900 tabular-nums">{percentage}%</span>
    </div>
  );
}

