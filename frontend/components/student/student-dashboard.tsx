"use client"

import { useMemo, useState } from "react"
import {
  BookOpen,
  Brain,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Flame,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { StudentNavKey } from "@/lib/navigation-config"

type TopicFlag = "weak" | "moderate" | "strong" | "stale"
type UnitMode = "learn" | "practice" | "revise"
type CourseLayer = "course" | "unit"

interface Topic {
  id: string
  name: string
  status: TopicFlag
  highWeightage?: boolean
  frequency: number
  lastRevised: string
}

interface Unit {
  id: string
  name: string
  progress: number
  studyTime: string
  weakTopics: number
  highWeightageTopics: number
  topics: Topic[]
}

interface Course {
  id: string
  name: string
  progress: number
  completedUnits: number
  totalUnits: number
  examInDays: number
  examDate: string
  examPattern: string
  units: Unit[]
}

const courses: Course[] = [
  {
    id: "os",
    name: "Operating Systems",
    progress: 63,
    completedUnits: 3,
    totalUnits: 5,
    examInDays: 24,
    examDate: "March 12, 2026",
    examPattern: "7+7 format",
    units: [
      {
        id: "os-u1",
        name: "Unit 1: Process and Deadlocks",
        progress: 68,
        studyTime: "3h 40m",
        weakTopics: 1,
        highWeightageTopics: 2,
        topics: [
          { id: "t1", name: "Deadlock", status: "weak", highWeightage: true, frequency: 9, lastRevised: "5 days ago" },
          { id: "t2", name: "Banker's Algorithm", status: "moderate", frequency: 7, lastRevised: "3 days ago" },
          { id: "t3", name: "Prevention Techniques", status: "weak", frequency: 8, lastRevised: "9 days ago" },
          { id: "t4", name: "Detection", status: "strong", frequency: 6, lastRevised: "2 days ago" },
          { id: "t5", name: "Recovery", status: "stale", frequency: 5, lastRevised: "14 days ago" },
        ],
      },
      {
        id: "os-u2",
        name: "Unit 2: Memory Management",
        progress: 54,
        studyTime: "4h 10m",
        weakTopics: 2,
        highWeightageTopics: 2,
        topics: [
          { id: "t6", name: "Memory Allocation", status: "weak", highWeightage: true, frequency: 8, lastRevised: "11 days ago" },
          { id: "t7", name: "Paging", status: "moderate", frequency: 7, lastRevised: "4 days ago" },
          { id: "t8", name: "Segmentation", status: "moderate", frequency: 7, lastRevised: "6 days ago" },
          { id: "t9", name: "Virtual Memory", status: "weak", highWeightage: true, frequency: 9, lastRevised: "10 days ago" },
        ],
      },
      {
        id: "os-u3",
        name: "Unit 3: File Systems",
        progress: 75,
        studyTime: "2h 55m",
        weakTopics: 1,
        highWeightageTopics: 1,
        topics: [
          { id: "t10", name: "File Allocation Methods", status: "moderate", frequency: 7, lastRevised: "5 days ago" },
          { id: "t11", name: "Directory Structures", status: "strong", frequency: 6, lastRevised: "2 days ago" },
          { id: "t12", name: "Indexed Allocation", status: "weak", highWeightage: true, frequency: 8, lastRevised: "8 days ago" },
        ],
      },
      {
        id: "os-u4",
        name: "Unit 4: I/O Systems",
        progress: 49,
        studyTime: "3h 10m",
        weakTopics: 2,
        highWeightageTopics: 1,
        topics: [
          { id: "t13", name: "Disk Scheduling", status: "weak", frequency: 8, lastRevised: "9 days ago" },
          { id: "t14", name: "RAID", status: "moderate", frequency: 6, lastRevised: "7 days ago" },
          { id: "t15", name: "I/O Buffering", status: "stale", frequency: 6, lastRevised: "15 days ago" },
        ],
      },
      {
        id: "os-u5",
        name: "Unit 5: Security and Protection",
        progress: 38,
        studyTime: "2h 20m",
        weakTopics: 2,
        highWeightageTopics: 1,
        topics: [
          { id: "t16", name: "Access Control", status: "moderate", frequency: 6, lastRevised: "8 days ago" },
          { id: "t17", name: "Threat Models", status: "weak", frequency: 8, lastRevised: "12 days ago" },
          { id: "t18", name: "Authentication", status: "stale", frequency: 7, lastRevised: "16 days ago" },
        ],
      },
    ],
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    progress: 48,
    completedUnits: 2,
    totalUnits: 5,
    examInDays: 31,
    examDate: "March 19, 2026",
    examPattern: "14+14 format",
    units: [
      {
        id: "db-u1",
        name: "Unit 1: ER and Relational Model",
        progress: 58,
        studyTime: "3h 5m",
        weakTopics: 1,
        highWeightageTopics: 2,
        topics: [
          { id: "d1", name: "ER Modeling", status: "moderate", frequency: 8, lastRevised: "4 days ago" },
          { id: "d2", name: "Relational Algebra", status: "weak", highWeightage: true, frequency: 9, lastRevised: "10 days ago" },
        ],
      },
    ],
  },
]

function statusColor(status: TopicFlag) {
  if (status === "weak") return "text-red-600"
  if (status === "moderate") return "text-orange-500"
  if (status === "strong") return "text-emerald-600"
  return "text-slate-500"
}

function statusLabel(status: TopicFlag) {
  if (status === "weak") return "Weak"
  if (status === "moderate") return "Moderate"
  if (status === "strong") return "Strong"
  return "Not revised"
}

interface StudentDashboardProps {
  activeView: StudentNavKey
  onNavigate: (view: StudentNavKey) => void
}

export function StudentDashboard({ activeView, onNavigate }: StudentDashboardProps) {
  const [courseLayer, setCourseLayer] = useState<CourseLayer>("course")
  const [assistantOpen, setAssistantOpen] = useState(true)
  const [unitMode, setUnitMode] = useState<UnitMode>("learn")
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0].id)
  const [selectedUnitId, setSelectedUnitId] = useState(courses[0].units[0].id)
  const [selectedTopicId, setSelectedTopicId] = useState(courses[0].units[0].topics[0].id)
  const [practiceSubmitted, setPracticeSubmitted] = useState(false)
  const [practiceAnswer, setPracticeAnswer] = useState("")
  const [flashcardFlipped, setFlashcardFlipped] = useState(false)
  const [revisionMode, setRevisionMode] = useState<"quick" | "flashcards" | "important" | "weak">("quick")

  const selectedCourse = useMemo(() => {
    return courses.find((course) => course.id === selectedCourseId) ?? courses[0]
  }, [selectedCourseId])

  const selectedUnit = useMemo(() => {
    return selectedCourse.units.find((unit) => unit.id === selectedUnitId) ?? selectedCourse.units[0]
  }, [selectedCourse, selectedUnitId])

  const sortedTopics = useMemo(() => {
    return [...selectedUnit.topics].sort((a, b) => {
      const scoreA = (a.highWeightage ? 3 : 0) + (a.status === "weak" ? 3 : a.status === "stale" ? 2 : a.status === "moderate" ? 1 : 0) + a.frequency
      const scoreB = (b.highWeightage ? 3 : 0) + (b.status === "weak" ? 3 : b.status === "stale" ? 2 : b.status === "moderate" ? 1 : 0) + b.frequency
      return scoreB - scoreA
    })
  }, [selectedUnit])

  const selectedTopic = useMemo(() => {
    return sortedTopics.find((topic) => topic.id === selectedTopicId) ?? sortedTopics[0]
  }, [sortedTopics, selectedTopicId])

  const openCourse = (courseId: string) => {
    const course = courses.find((item) => item.id === courseId)
    if (!course || course.units.length === 0) return
    setSelectedCourseId(course.id)
    setSelectedUnitId(course.units[0].id)
    setSelectedTopicId(course.units[0].topics[0]?.id ?? "")
    onNavigate("courses")
    setCourseLayer("course")
  }

  const openUnit = (unitId: string, mode?: UnitMode) => {
    const unit = selectedCourse.units.find((item) => item.id === unitId)
    if (!unit || unit.topics.length === 0) return
    setSelectedUnitId(unitId)
    setSelectedTopicId(unit.topics[0].id)
    setCourseLayer("unit")
    if (mode) setUnitMode(mode)
  }

  const openPractice = () => {
    onNavigate("practice")
    setCourseLayer("unit")
    setUnitMode("practice")
  }

  const openRevision = () => {
    onNavigate("revision")
    setCourseLayer("unit")
    setUnitMode("revise")
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-blue-50 via-white to-violet-50 shadow-sm">
        <CardHeader>
          <CardDescription className="text-blue-700">Today&apos;s Recommended Focus</CardDescription>
          <CardTitle className="text-2xl text-blue-950">Adaptive Study Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-3 text-sm">
              <div className="font-medium text-red-600">Deadlock</div>
              <p className="mt-1 text-muted-foreground">High weightage + weak mastery</p>
            </div>
            <div className="rounded-lg border bg-white p-3 text-sm">
              <div className="font-medium text-orange-600">Memory Allocation</div>
              <p className="mt-1 text-muted-foreground">Needs revision in Unit 2</p>
            </div>
            <div className="rounded-lg border bg-white p-3 text-sm">
              <div className="font-medium text-blue-700">Practice Unit 2</div>
              <p className="mt-1 text-muted-foreground">14-mark combo likely this week</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => openUnit(selectedCourse.units[0].id, "learn")}>Start Learning</Button>
            <Button variant="secondary" onClick={openPractice}>Practice Now</Button>
            <Button variant="outline" onClick={openRevision}>Quick Revise</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Progress Overview</CardTitle>
          <CardDescription>Pick a course to continue where you left off.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => openCourse(course.id)}
              className="rounded-xl border bg-white p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">{course.name}</h3>
                <Badge variant="secondary">Exam in {course.examInDays} days</Badge>
              </div>
              <div className="mt-3">
                <Progress value={course.progress} className="h-2" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Units completed: {course.completedUnits}/{course.totalUnits}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Strong Topics</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">12</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Moderate</p>
            <p className="mt-2 text-2xl font-semibold text-orange-500">8</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-muted-foreground">Weak</p>
            <p className="mt-2 text-2xl font-semibold text-red-600">5</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCourseView = () => {
    if (courseLayer === "course") {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-2xl">{selectedCourse.name}</CardTitle>
                  <CardDescription className="mt-1">Exam Date: {selectedCourse.examDate} | Pattern: {selectedCourse.examPattern}</CardDescription>
                </div>
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Adaptive Priority Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <Progress value={selectedCourse.progress} className="h-3" />
              <p className="text-sm text-muted-foreground">{selectedCourse.completedUnits}/{selectedCourse.totalUnits} units completed</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {selectedCourse.units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => openUnit(unit.id)}
                className="rounded-xl border bg-white p-4 text-left transition hover:border-primary/60 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-card-foreground">{unit.name}</h3>
                  <Badge variant="secondary">{unit.progress}%</Badge>
                </div>
                <div className="mt-3">
                  <Progress value={unit.progress} className="h-2" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{unit.topics.length} topics</p>
                <p className="text-sm text-red-600">{unit.highWeightageTopics} high weightage topics</p>
                <p className="text-sm text-orange-600">{unit.weakTopics} weak topic</p>
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardDescription>{selectedCourse.name}</CardDescription>
                <CardTitle className="text-2xl">{selectedUnit.name}</CardTitle>
              </div>
              <Button variant="outline" onClick={() => setCourseLayer("course")}>Back to Units</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs text-muted-foreground">Completion</p>
                <p className="mt-1 text-lg font-semibold">{selectedUnit.progress}%</p>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs text-muted-foreground">Estimated Study Time</p>
                <p className="mt-1 text-lg font-semibold">{selectedUnit.studyTime}</p>
              </div>
              <div className="rounded-lg border bg-white p-3">
                <p className="text-xs text-muted-foreground">Priority Topics</p>
                <p className="mt-1 text-lg font-semibold">{selectedUnit.highWeightageTopics + selectedUnit.weakTopics}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button className="min-w-32" variant={unitMode === "learn" ? "default" : "secondary"} onClick={() => setUnitMode("learn")}>LEARN</Button>
              <Button className="min-w-32" variant={unitMode === "practice" ? "default" : "secondary"} onClick={() => setUnitMode("practice")}>PRACTICE</Button>
              <Button className="min-w-32" variant={unitMode === "revise" ? "default" : "secondary"} onClick={() => setUnitMode("revise")}>REVISE</Button>
            </div>
          </CardContent>
        </Card>

        {unitMode === "learn" && (
          <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-base">Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sortedTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                      selectedTopic.id === topic.id ? "border-primary bg-blue-50" : "hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{topic.name}</span>
                      <span className="text-xs">
                        {topic.highWeightage ? "??" : ""}
                        {topic.status === "weak" ? "?" : ""}
                        {topic.status === "strong" ? "??" : ""}
                        {topic.status === "stale" ? "?" : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{selectedTopic.name}</CardTitle>
                <CardDescription>{selectedTopic.highWeightage ? "High weightage and exam-relevant" : "Recommended for current study cycle"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <section>
                  <h4 className="font-semibold text-blue-950">Definition</h4>
                  <p className="mt-1 text-muted-foreground">A deadlock is a state where multiple processes are blocked because each process is waiting for a resource held by another process.</p>
                </section>
                <section>
                  <h4 className="font-semibold text-blue-950">Key Points</h4>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>Mutual exclusion and circular wait are core conditions.</li>
                    <li>Prevention and avoidance reduce deadlock risk with different tradeoffs.</li>
                    <li>Detection methods are useful in systems with dynamic workloads.</li>
                  </ul>
                </section>
                <section>
                  <h4 className="font-semibold text-blue-950">Example</h4>
                  <p className="mt-1 text-muted-foreground">Process P1 holds R1 and waits for R2, while P2 holds R2 and waits for R1.</p>
                </section>
                <section>
                  <h4 className="font-semibold text-blue-950">Diagram</h4>
                  <div className="mt-1 rounded-md border border-dashed bg-slate-50 p-4 text-center text-xs text-muted-foreground">Resource allocation graph placeholder</div>
                </section>
                <section>
                  <h4 className="font-semibold text-blue-950">Summary</h4>
                  <p className="mt-1 rounded-md bg-violet-50 p-3 text-violet-800">Prioritize this topic because it appears frequently in both 7-mark and 14-mark papers.</p>
                </section>
                <section>
                  <h4 className="font-semibold text-blue-950">Important Exam Notes</h4>
                  <p className="mt-1 text-muted-foreground">Prepare all four necessary conditions with one practical system-level example.</p>
                </section>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm">Mark Complete</Button>
                  <Button size="sm" variant="secondary" onClick={openPractice}>Practice This Topic</Button>
                  <Button size="sm" variant="outline">Generate Summary</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {unitMode === "practice" && (
          <Card>
            <CardHeader>
              <CardTitle>Practice Mode</CardTitle>
              <CardDescription>Adaptive questions from weak and high-frequency topics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Question Type</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">7 Mark</Badge>
                    <Badge variant="secondary">14 Mark Combo</Badge>
                    <Badge variant="secondary">PYP Only</Badge>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Difficulty</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">Easy</Badge>
                    <Badge variant="secondary">Medium</Badge>
                    <Badge variant="secondary">Hard</Badge>
                  </div>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Focus</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">Weak Topics</Badge>
                    <Badge variant="secondary">High Weightage</Badge>
                    <Badge variant="secondary">Random</Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-4">
                <p className="text-sm text-muted-foreground">Unit 1 - 1a</p>
                <h3 className="mt-1 text-lg font-semibold">Explain Deadlock with necessary conditions. (7 marks)</h3>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Word Counter: {practiceAnswer.trim() ? practiceAnswer.trim().split(/\s+/).length : 0}</span>
                  <span>Timer: optional</span>
                </div>
                <Textarea
                  value={practiceAnswer}
                  onChange={(event) => setPracticeAnswer(event.target.value)}
                  placeholder="Write your answer here..."
                  className="mt-3 min-h-40"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={() => setPracticeSubmitted(true)}>Submit</Button>
                  <Button variant="secondary">Save Draft</Button>
                  <Button variant="outline">Skip</Button>
                </div>
              </div>

              {practiceSubmitted && (
                <div className="rounded-xl border bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-900">Feedback Summary</h4>
                  <p className="mt-2 text-sm text-blue-900">Score: 6.5 / 10 | Concept coverage: 72% | Add one real-world example for full marks.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm">Retry</Button>
                    <Button size="sm" variant="secondary">View Model Answer</Button>
                    <Button size="sm" variant="outline">Practice Similar</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {unitMode === "revise" && (
          <Card>
            <CardHeader>
              <CardTitle>Revise Mode</CardTitle>
              <CardDescription>Fast recall focused on weak and high-priority topics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={revisionMode === "quick" ? "default" : "secondary"} onClick={() => setRevisionMode("quick")}>Quick Revision</Button>
                <Button size="sm" variant={revisionMode === "flashcards" ? "default" : "secondary"} onClick={() => setRevisionMode("flashcards")}>Flashcards</Button>
                <Button size="sm" variant={revisionMode === "important" ? "default" : "secondary"} onClick={() => setRevisionMode("important")}>Important Only</Button>
                <Button size="sm" variant={revisionMode === "weak" ? "default" : "secondary"} onClick={() => setRevisionMode("weak")}>Weak Only</Button>
              </div>

              {(revisionMode === "flashcards" || revisionMode === "quick") && (
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-muted-foreground">Flashcard</p>
                  <button
                    className="mt-2 w-full rounded-lg border bg-violet-50 p-6 text-left"
                    onClick={() => setFlashcardFlipped((state) => !state)}
                  >
                    {!flashcardFlipped ? (
                      <p className="font-medium text-violet-900">What are the four necessary conditions of deadlock?</p>
                    ) : (
                      <p className="text-violet-900">Mutual exclusion, hold and wait, no preemption, and circular wait.</p>
                    )}
                  </button>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">Easy</Button>
                    <Button size="sm" variant="secondary">Medium</Button>
                    <Button size="sm">Hard</Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {sortedTopics.slice(0, 4).map((topic) => (
                  <details key={topic.id} className="rounded-md border bg-white p-3">
                    <summary className="cursor-pointer text-sm font-medium">{topic.name} summary</summary>
                    <p className="mt-2 text-sm text-muted-foreground">Core definition, two exam pointers, and one frequent mistake to avoid during revision.</p>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Topic Mastery Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 pr-4">Topic</th>
                  <th className="py-2 pr-4">Mastery</th>
                  <th className="py-2 pr-4">Frequency</th>
                  <th className="py-2">Last Revised</th>
                </tr>
              </thead>
              <tbody>
                {sortedTopics.map((topic) => (
                  <tr key={topic.id} className="border-b">
                    <td className="py-2 pr-4">{topic.name}</td>
                    <td className={cn("py-2 pr-4 font-medium", statusColor(topic.status))}>{statusLabel(topic.status)}</td>
                    <td className="py-2 pr-4">{topic.frequency}/10</td>
                    <td className="py-2">{topic.lastRevised}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Unit Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedCourse.units.slice(0, 3).map((unit) => (
            <div key={unit.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{unit.name.split(":")[0]}</span>
                <span>{unit.progress}%</span>
              </div>
              <Progress value={unit.progress} className="h-2.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Exam Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Exam Readiness</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-3 w-full rounded-full bg-secondary">
                <div className="h-3 w-[72%] rounded-full bg-primary" />
              </div>
              <span className="font-semibold">72%</span>
            </div>
          </div>
          <div className="rounded-lg border bg-blue-50 p-3 text-sm text-blue-900">
            <p>Improve Unit 2 analytical questions.</p>
            <p className="mt-1">Revise high-frequency topic: Deadlock.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Settings</CardTitle>
        <CardDescription>Personalization and notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border p-3">
          <p className="font-medium">Study reminder time</p>
          <Input className="mt-2 max-w-xs" placeholder="7:00 PM" />
        </div>
        <div className="rounded-md border p-3">
          <p className="font-medium">Preferred question style</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">Concept-first</Badge>
            <Badge variant="secondary">Exam-first</Badge>
            <Badge variant="secondary">Mixed</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#eef2ff,_#f8fafc_38%,_#ffffff_78%)]">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <main className="min-h-screen flex-1 px-4 py-4 md:px-6 md:py-6 lg:px-8">
          {activeView === "dashboard" && renderDashboard()}
          {(activeView === "courses" || activeView === "practice" || activeView === "revision") && renderCourseView()}
          {activeView === "analytics" && renderAnalytics()}
          {activeView === "settings" && renderSettings()}
        </main>

        <aside className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-l bg-white/90 px-3 py-6 backdrop-blur xl:flex xl:flex-col",
          assistantOpen ? "w-80" : "w-16"
        )}>
          <div className="mb-4 flex items-center justify-between">
            {assistantOpen && (
              <div>
                <p className="text-sm font-semibold text-blue-950">Smart Assistant</p>
                <p className="text-xs text-muted-foreground">Context-aware help</p>
              </div>
            )}
            <Button size="icon" variant="ghost" onClick={() => setAssistantOpen((state) => !state)}>
              {assistantOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {assistantOpen && (
            <>
              <div className="grid gap-2">
                <Button variant="secondary" size="sm" className="justify-start"><BookOpen className="h-4 w-4" />Explain this topic</Button>
                <Button variant="secondary" size="sm" className="justify-start"><Target className="h-4 w-4" />Give 5 important questions</Button>
                <Button variant="secondary" size="sm" className="justify-start"><Sparkles className="h-4 w-4" />Simplify explanation</Button>
                <Button variant="secondary" size="sm" className="justify-start"><TrendingUp className="h-4 w-4" />Predict 14-mark question</Button>
                <Button variant="secondary" size="sm" className="justify-start"><Brain className="h-4 w-4" />Summarize unit</Button>
              </div>

              <div className="mt-4 flex-1 rounded-xl border bg-slate-50 p-3">
                <div className="space-y-3 text-sm">
                  <div className="rounded-md bg-white p-2">
                    <p className="text-xs text-muted-foreground">Assistant</p>
                    <p className="mt-1">Deadlock has appeared in 4 of the last 6 papers. Practice one 7-mark and one 14-mark variant.</p>
                  </div>
                  <div className="rounded-md bg-blue-600 p-2 text-white">
                    <p className="text-xs text-blue-100">You</p>
                    <p className="mt-1">Give me a simplified memory allocation recap.</p>
                  </div>
                </div>
                <div className="mt-4 rounded-md border bg-white p-2 text-xs text-muted-foreground">Type a message...</div>
              </div>
            </>
          )}

          {!assistantOpen && (
            <div className="mt-4 flex flex-col items-center gap-3 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <Flame className="h-4 w-4" />
              <CalendarClock className="h-4 w-4" />
              <Clock3 className="h-4 w-4" />
              <Circle className="h-2 w-2 fill-current" />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}


