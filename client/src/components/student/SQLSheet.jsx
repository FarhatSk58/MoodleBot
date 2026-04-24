import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ExternalLink } from 'lucide-react';
import api from '../../lib/axios';
import { cn } from '../../lib/utils';

const SQL_PROBLEMS = [
  // SELECT BASICS
  { id: 'sql_001', title: 'Select All Columns', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/recyclable-and-low-fat-products/' },
  { id: 'sql_002', title: 'Find Customer Referee', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/find-customer-referee/' },
  { id: 'sql_003', title: 'Big Countries', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/big-countries/' },
  { id: 'sql_004', title: 'Article Views', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/article-views-i/' },
  { id: 'sql_005', title: 'Invalid Tweets', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/invalid-tweets/' },

  // JOINS
  { id: 'sql_006', title: 'Replace Employee ID', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/' },
  { id: 'sql_007', title: 'Product Sales Analysis', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/product-sales-analysis-i/' },
  { id: 'sql_008', title: 'Customer Who Visited', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/' },
  { id: 'sql_009', title: 'Rising Temperature', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/rising-temperature/' },
  { id: 'sql_010', title: 'Average Time Process', topic: 'JOINs', difficulty: 'medium', url: 'https://leetcode.com/problems/average-time-of-process-per-machine/' },
  { id: 'sql_011', title: 'Employee Bonus', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/employee-bonus/' },
  { id: 'sql_012', title: 'Students and Examinations', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/students-and-examinations/' },
  { id: 'sql_013', title: 'Managers with 5 Reports', topic: 'JOINs', difficulty: 'medium', url: 'https://leetcode.com/problems/managers-with-at-least-5-direct-reports/' },
  { id: 'sql_014', title: 'Confirmation Rate', topic: 'JOINs', difficulty: 'medium', url: 'https://leetcode.com/problems/confirmation-rate/' },

  // AGGREGATE FUNCTIONS
  { id: 'sql_015', title: 'Not Boring Movies', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/not-boring-movies/' },
  { id: 'sql_016', title: 'Average Selling Price', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/average-selling-price/' },
  { id: 'sql_017', title: 'Project Employees I', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/project-employees-i/' },
  { id: 'sql_018', title: 'Percentage of Users', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/percentage-of-users-attended-a-contest/' },
  { id: 'sql_019', title: 'Queries Quality', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/queries-quality-and-percentage/' },
  { id: 'sql_020', title: 'Monthly Transactions', topic: 'Aggregate Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/monthly-transactions-i/' },

  // SORTING AND GROUPING
  { id: 'sql_021', title: 'Count Salary Categories', topic: 'Sorting & Grouping', difficulty: 'medium', url: 'https://leetcode.com/problems/count-salary-categories/' },
  { id: 'sql_022', title: 'Last Person to Fit Bus', topic: 'Sorting & Grouping', difficulty: 'medium', url: 'https://leetcode.com/problems/last-person-to-fit-in-the-bus/' },
  { id: 'sql_023', title: 'Food Delivery', topic: 'Sorting & Grouping', difficulty: 'medium', url: 'https://leetcode.com/problems/immediate-food-delivery-ii/' },

  // SUBQUERIES
  { id: 'sql_024', title: 'Employees Whose Manager Left', topic: 'Subqueries', difficulty: 'easy', url: 'https://leetcode.com/problems/employees-whose-manager-left-the-company/' },
  { id: 'sql_025', title: 'Exchange Seats', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/exchange-seats/' },
  { id: 'sql_026', title: 'Movie Rating', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/movie-rating/' },
  { id: 'sql_027', title: 'Restaurant Growth', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/restaurant-growth/' },
  { id: 'sql_028', title: 'Friend Requests II', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/friend-requests-ii-who-has-the-most-friends/' },
  { id: 'sql_029', title: 'Investments in 2016', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/investments-in-2016/' },
  { id: 'sql_030', title: 'Department Top Three', topic: 'Subqueries', difficulty: 'hard', url: 'https://leetcode.com/problems/department-top-three-salaries/' },

  // WINDOW FUNCTIONS
  { id: 'sql_031', title: 'Rank Scores', topic: 'Window Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/rank-scores/' },
  { id: 'sql_032', title: 'Consecutive Numbers', topic: 'Window Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/consecutive-numbers/' },
  { id: 'sql_033', title: 'Department Highest Salary', topic: 'Window Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/department-highest-salary/' },
  { id: 'sql_034', title: 'Delete Duplicate Emails', topic: 'Window Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/delete-duplicate-emails/' },
  { id: 'sql_035', title: 'Second Highest Salary', topic: 'Window Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/second-highest-salary/' },
];

const DIFFICULTY_STYLES = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function SQLSheet() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [solvedSet, setSolvedSet] = useState(() => new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/student/sql/progress');
        const solvedProblems = res?.data?.data?.solvedProblems || [];
        const next = new Set(solvedProblems.map((p) => p.problemId));
        if (mounted) setSolvedSet(next);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || 'Failed to load SQL progress');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const p of SQL_PROBLEMS) {
      if (!map.has(p.topic)) map.set(p.topic, []);
      map.get(p.topic).push(p);
    }
    return Array.from(map.entries()).map(([topic, problems]) => ({ topic, problems }));
  }, []);

  const totals = useMemo(() => {
    const total = SQL_PROBLEMS.length;
    const solved = SQL_PROBLEMS.filter((p) => solvedSet.has(p.id)).length;
    const pct = total ? Math.round((solved / total) * 100) : 0;

    const byTopic = grouped.map((g) => {
      const tTotal = g.problems.length;
      const tSolved = g.problems.filter((p) => solvedSet.has(p.id)).length;
      const tPct = tTotal ? Math.round((tSolved / tTotal) * 100) : 0;
      return { topic: g.topic, solved: tSolved, total: tTotal, pct: tPct };
    });

    return { total, solved, pct, byTopic };
  }, [grouped, solvedSet]);

  const toggleSolved = async (problem) => {
    const nextSolved = !solvedSet.has(problem.id);

    setSolvedSet((prev) => {
      const next = new Set(prev);
      if (nextSolved) next.add(problem.id);
      else next.delete(problem.id);
      return next;
    });

    try {
      if (nextSolved) {
        await api.post('/student/sql/solve', {
          problemId: problem.id,
          topic: problem.topic,
          difficulty: problem.difficulty,
        });
      } else {
        await api.delete(`/student/sql/solve/${problem.id}`);
      }
    } catch (e) {
      setSolvedSet((prev) => {
        const next = new Set(prev);
        if (nextSolved) next.delete(problem.id);
        else next.add(problem.id);
        return next;
      });
      toast.error(e?.response?.data?.message || 'Failed to update SQL progress');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}
      {loading && !error && (
        <div className="rounded-xl border border-slate-200 bg-white text-slate-600 px-4 py-3 text-sm">
          Loading your SQL progress...
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Overall</p>
            <p className="text-slate-600 text-sm">
              <span className="font-bold text-slate-900">{totals.solved}</span> / {totals.total} solved
            </p>
          </div>
          <div className="w-full sm:w-72 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totals.pct}%` }} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {totals.byTopic.map((t) => (
            <div key={t.topic} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">{t.topic}</p>
                <p className="text-xs text-slate-500 tabular-nums">
                  {t.solved}/{t.total}
                </p>
              </div>
              <div className="mt-2 h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${t.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.topic} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
              <p className="text-sm font-bold text-slate-900">{group.topic}</p>
              <p className="text-xs text-slate-500 mt-1">
                {group.problems.filter((p) => solvedSet.has(p.id)).length} / {group.problems.length} solved
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {group.problems.map((p) => {
                const solved = solvedSet.has(p.id);
                return (
                  <div key={p.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <label className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={solved}
                        onChange={() => toggleSolved(p)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-slate-900 hover:underline truncate inline-flex items-center gap-2"
                        title={p.title}
                      >
                        {p.title} <ExternalLink size={14} className="text-slate-400 flex-shrink-0" />
                      </a>
                    </label>

                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold',
                          DIFFICULTY_STYLES[p.difficulty] || DIFFICULTY_STYLES.easy
                        )}
                      >
                        {p.difficulty}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full">
                        {p.topic}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

