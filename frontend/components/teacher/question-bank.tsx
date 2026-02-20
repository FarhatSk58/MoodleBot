"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Download,
  Brain,
  Tag,
  ChevronDown,
  Sparkles,
  Loader2,
  Check,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const
type BloomLevel = (typeof bloomLevels)[number]

const bloomColors: Record<BloomLevel, string> = {
  Remember: "bg-blue-100 text-blue-700 border-blue-200",
  Understand: "bg-teal-100 text-teal-700 border-teal-200",
  Apply: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Analyze: "bg-amber-100 text-amber-700 border-amber-200",
  Evaluate: "bg-orange-100 text-orange-700 border-orange-200",
  Create: "bg-rose-100 text-rose-700 border-rose-200",
}

interface Question {
  id: string
  text: string
  unit: string
  topic: string
  bloom: BloomLevel
  marks: number
  difficulty: "Easy" | "Medium" | "Hard"
  modelAnswer?: string
}

const sampleQuestions: Question[] = [
  {
    id: "q1",
    text: "Define the term 'operating system' and list its primary functions.",
    unit: "Unit 1",
    topic: "Introduction to OS",
    bloom: "Remember",
    marks: 7,
    difficulty: "Easy",
    modelAnswer: "An operating system is system software that manages computer hardware, software resources, and provides common services for computer programs...",
  },
  {
    id: "q2",
    text: "Explain the difference between preemptive and non-preemptive scheduling with examples.",
    unit: "Unit 2",
    topic: "Process Scheduling",
    bloom: "Understand",
    marks: 7,
    difficulty: "Medium",
  },
  {
    id: "q3",
    text: "Given a set of 5 processes with their burst times, apply the Shortest Job First algorithm and calculate average waiting time.",
    unit: "Unit 2",
    topic: "Process Scheduling",
    bloom: "Apply",
    marks: 14,
    difficulty: "Medium",
  },
  {
    id: "q4",
    text: "Compare and contrast the Banker's Algorithm with Wait-Die scheme for deadlock handling.",
    unit: "Unit 3",
    topic: "Deadlocks",
    bloom: "Analyze",
    marks: 7,
    difficulty: "Hard",
  },
  {
    id: "q5",
    text: "Evaluate which page replacement algorithm (FIFO, LRU, Optimal) would be most suitable for a real-time operating system. Justify your answer.",
    unit: "Unit 4",
    topic: "Page Replacement",
    bloom: "Evaluate",
    marks: 14,
    difficulty: "Hard",
  },
  {
    id: "q6",
    text: "Design a scheduling algorithm for a multi-level feedback queue that minimizes both response time and turnaround time.",
    unit: "Unit 2",
    topic: "Process Scheduling",
    bloom: "Create",
    marks: 14,
    difficulty: "Hard",
  },
  {
    id: "q7",
    text: "Explain the concept of virtual memory and how demand paging works with a diagram.",
    unit: "Unit 4",
    topic: "Virtual Memory",
    bloom: "Understand",
    marks: 7,
    difficulty: "Medium",
  },
  {
    id: "q8",
    text: "Describe the file system implementation using indexed allocation. What are its advantages?",
    unit: "Unit 5",
    topic: "File Systems",
    bloom: "Understand",
    marks: 7,
    difficulty: "Easy",
  },
]

const difficultyColors = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
}

export function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterUnit, setFilterUnit] = useState("all")
  const [filterBloom, setFilterBloom] = useState("all")
  const [filterMarks, setFilterMarks] = useState("all")
  const [showGenerator, setShowGenerator] = useState(false)

  // Bloom's generator state
  const [genBloom, setGenBloom] = useState<string>("")
  const [genUnit, setGenUnit] = useState<string>("")
  const [genMarks, setGenMarks] = useState<string>("7")
  const [genCount, setGenCount] = useState<string>("5")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])

  const filteredQuestions = questions.filter((q) => {
    if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterUnit !== "all" && q.unit !== filterUnit) return false
    if (filterBloom !== "all" && q.bloom !== filterBloom) return false
    if (filterMarks !== "all" && q.marks !== parseInt(filterMarks)) return false
    return true
  })

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const selectedBloom = (genBloom || "Remember") as BloomLevel
      const newQuestions: Question[] = Array.from({ length: parseInt(genCount) || 5 }, (_, i) => ({
        id: crypto.randomUUID(),
        text: `[AI Generated] ${selectedBloom}-level question ${i + 1} for ${genUnit || "Unit 1"}: Sample question about operating systems concepts at the ${selectedBloom.toLowerCase()} level...`,
        unit: genUnit || "Unit 1",
        topic: "AI Generated",
        bloom: selectedBloom,
        marks: parseInt(genMarks) || 7,
        difficulty: selectedBloom === "Remember" ? "Easy" as const : selectedBloom === "Create" || selectedBloom === "Evaluate" ? "Hard" as const : "Medium" as const,
      }))
      setGeneratedQuestions(newQuestions)
      setIsGenerating(false)
    }, 2000)
  }

  const addToBank = () => {
    setQuestions((prev) => [...prev, ...generatedQuestions])
    setGeneratedQuestions([])
    setShowGenerator(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Question Bank</h2>
          <p className="text-xs text-muted-foreground">{questions.length} questions across all courses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export PDF
          </Button>
          <Button size="sm" onClick={() => setShowGenerator(!showGenerator)}>
            <Brain className="mr-1.5 h-3.5 w-3.5" />
            {"Bloom's Generator"}
          </Button>
        </div>
      </div>

      {/* Bloom's Generator Panel */}
      {showGenerator && (
        <div className="rounded-xl border-2 border-primary/20 bg-primary/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{"Bloom's Taxonomy Question Generator"}</h3>
            </div>
            <button onClick={() => setShowGenerator(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <Label className="text-xs">{"Bloom's Level"}</Label>
              <Select value={genBloom} onValueChange={setGenBloom}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {bloomLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Unit</Label>
              <Select value={genUnit} onValueChange={setGenUnit}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Marks</Label>
              <Select value={genMarks} onValueChange={setGenMarks}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Marks</SelectItem>
                  <SelectItem value="7">7 Marks</SelectItem>
                  <SelectItem value="14">14 Marks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Count</Label>
              <Input
                value={genCount}
                onChange={(e) => setGenCount(e.target.value)}
                type="number"
                min={1}
                max={50}
                className="mt-1.5"
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>

          {generatedQuestions.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                  <Check className="mr-1 h-3 w-3" />
                  {generatedQuestions.length} questions generated
                </Badge>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setGeneratedQuestions([])}>
                    Regenerate
                  </Button>
                  <Button size="sm" onClick={addToBank}>
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add to Bank
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {generatedQuestions.map((q, i) => (
                  <div key={q.id} className="rounded-lg border bg-card px-3 py-2">
                    <p className="text-xs text-foreground">
                      <span className="mr-1.5 font-semibold text-primary">{i + 1}.</span>
                      {q.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="pl-9"
          />
        </div>
        <Select value={filterUnit} onValueChange={setFilterUnit}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            {["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"].map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterBloom} onValueChange={setFilterBloom}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Bloom Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {bloomLevels.map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMarks} onValueChange={setFilterMarks}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Marks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Marks</SelectItem>
            <SelectItem value="2">2 Marks</SelectItem>
            <SelectItem value="7">7 Marks</SelectItem>
            <SelectItem value="14">14 Marks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      <div className="flex flex-col gap-2">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-xl border bg-card py-12 text-center">
            <p className="text-sm text-muted-foreground">No questions match your filters.</p>
          </div>
        ) : (
          filteredQuestions.map((q, i) => (
            <div
              key={q.id}
              className="group rounded-xl border bg-card p-4 transition-all hover:shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <p className="text-sm leading-relaxed text-card-foreground">
                  <span className="mr-1.5 font-semibold text-primary">{i + 1}.</span>
                  {q.text}
                </p>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Edit question">
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))}
                    aria-label="Delete question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">{q.unit}</Badge>
                <Badge variant="outline" className="text-[10px]">{q.topic}</Badge>
                <Badge variant="outline" className={cn("border text-[10px]", bloomColors[q.bloom])}>
                  {q.bloom}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px]", difficultyColors[q.difficulty])}>
                  {q.difficulty}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">{q.marks}m</Badge>
                {q.modelAnswer && (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                    <Check className="mr-0.5 h-2.5 w-2.5" />
                    Model Answer
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
