"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const topicCoverageData = [
  { unit: "Unit 1", covered: 10, total: 12 },
  { unit: "Unit 2", covered: 9, total: 10 },
  { unit: "Unit 3", covered: 7, total: 10 },
  { unit: "Unit 4", covered: 8, total: 10 },
  { unit: "Unit 5", covered: 5, total: 8 },
]

const bloomDistribution = [
  { name: "Remember", value: 32, color: "hsl(221, 83%, 53%)" },
  { name: "Understand", value: 48, color: "hsl(173, 58%, 39%)" },
  { name: "Apply", value: 35, color: "hsl(142, 71%, 45%)" },
  { name: "Analyze", value: 28, color: "hsl(38, 92%, 50%)" },
  { name: "Evaluate", value: 18, color: "hsl(25, 95%, 53%)" },
  { name: "Create", value: 12, color: "hsl(0, 84%, 60%)" },
]

const frequencyHeatmap = [
  { topic: "Process Scheduling", u1: 0, u2: 8, u3: 2, u4: 0, u5: 0 },
  { topic: "Deadlocks", u1: 0, u2: 1, u3: 7, u4: 0, u5: 0 },
  { topic: "Virtual Memory", u1: 0, u2: 0, u3: 0, u4: 9, u5: 0 },
  { topic: "Page Replacement", u1: 0, u2: 0, u3: 0, u4: 6, u5: 1 },
  { topic: "File Systems", u1: 0, u2: 0, u3: 0, u4: 0, u5: 7 },
  { topic: "Semaphores", u1: 0, u2: 0, u3: 5, u4: 0, u5: 0 },
  { topic: "System Calls", u1: 6, u2: 0, u3: 0, u4: 0, u5: 0 },
  { topic: "Threads", u1: 0, u2: 4, u3: 0, u4: 0, u5: 0 },
]

const performanceData = [
  { name: "OS", avgScore: 72, students: 64 },
  { name: "DS", avgScore: 68, students: 58 },
  { name: "CN", avgScore: 55, students: 42 },
]

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0
  return (
    <div
      className={cn(
        "flex h-8 w-full items-center justify-center rounded text-[10px] font-medium",
        intensity === 0
          ? "bg-secondary text-muted-foreground/40"
          : intensity < 0.3
          ? "bg-primary/10 text-primary"
          : intensity < 0.6
          ? "bg-primary/25 text-primary"
          : "bg-primary/50 text-primary-foreground"
      )}
    >
      {value > 0 ? value : "-"}
    </div>
  )
}

export function AnalyticsView() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        <p className="text-xs text-muted-foreground">Course insights, question distribution, and performance metrics</p>
      </div>

      {/* Top Row Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Topic Coverage", value: "78%", trend: "+5%", positive: true },
          { label: "Avg Bloom Level", value: "Apply", trend: "Balanced", positive: true },
          { label: "Question Bank", value: "269", trend: "+24 this week", positive: true },
          { label: "PYP Analyzed", value: "3 years", trend: "Complete", positive: true },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-card-foreground">{stat.value}</p>
            <p className={cn("mt-0.5 text-[10px] font-medium", stat.positive ? "text-emerald-600" : "text-amber-600")}>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Topic Coverage Bar Chart */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Topic Coverage by Unit</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topicCoverageData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="unit" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid hsl(220, 13%, 91%)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="covered" name="Covered" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="Total" fill="hsl(220, 14%, 96%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bloom's Distribution Pie */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">{"Bloom's Level Distribution"}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={bloomDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {bloomDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid hsl(220, 13%, 91%)",
                }}
              />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Question Frequency Heatmap */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Question Frequency Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th className="pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Topic
                </th>
                {["U1", "U2", "U3", "U4", "U5"].map((u) => (
                  <th key={u} className="pb-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {u}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frequencyHeatmap.map((row) => (
                <tr key={row.topic}>
                  <td className="py-1 pr-4 text-xs font-medium text-foreground">{row.topic}</td>
                  <td className="p-1"><HeatmapCell value={row.u1} max={9} /></td>
                  <td className="p-1"><HeatmapCell value={row.u2} max={9} /></td>
                  <td className="p-1"><HeatmapCell value={row.u3} max={9} /></td>
                  <td className="p-1"><HeatmapCell value={row.u4} max={9} /></td>
                  <td className="p-1"><HeatmapCell value={row.u5} max={9} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Performance */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Student Performance Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={performanceData} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} width={40} />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid hsl(220, 13%, 91%)",
              }}
            />
            <Bar dataKey="avgScore" name="Avg Score %" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
          {performanceData.map((p) => (
            <span key={p.name}>
              {p.name}: {p.students} students enrolled
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
