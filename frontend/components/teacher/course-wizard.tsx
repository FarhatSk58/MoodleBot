"use client"

import { useState, useRef, useCallback } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Trash2,
  Plus,
  X,
  Check,
  Sparkles,
  Loader2,
  BookOpen,
  ClipboardList,
  GraduationCap,
  FileSearch,
  Library,
  Eye,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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

interface CourseWizardProps {
  onClose: () => void
}

interface UploadedFile {
  id: string
  name: string
  size: number
}

interface DetectedTopic {
  id: string
  name: string
}

interface UnitTopics {
  unitName: string
  topics: DetectedTopic[]
}

interface PYPQuestion {
  label: string
  marks: number
}

interface PYPData {
  year: string
  questionCount: number
  totalMarks: number
  unitQuestions: { unit: string; questions: PYPQuestion[] }[]
  topicFrequency: { topic: string; count: number }[]
}

const steps = [
  { id: 1, label: "Course Details", icon: BookOpen },
  { id: 2, label: "Unit Documents", icon: FileText },
  { id: 3, label: "Syllabus", icon: ClipboardList },
  { id: 4, label: "PYP Analysis", icon: GraduationCap },
  { id: 5, label: "Textbooks", icon: Library },
  { id: 6, label: "Review", icon: Eye },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function CourseWizard({ onClose }: CourseWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1 state
  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [academicYear, setAcademicYear] = useState("2025-26")
  const [semester, setSemester] = useState("")
  const [credits, setCredits] = useState("")
  const [department, setDepartment] = useState("")
  const [examPattern, setExamPattern] = useState("")

  // Step 2 state
  const [unitFiles, setUnitFiles] = useState<Record<string, UploadedFile | null>>({
    "Unit 1": null,
    "Unit 2": null,
    "Unit 3": null,
    "Unit 4": null,
    "Unit 5": null,
  })
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedTopics, setExtractedTopics] = useState<UnitTopics[]>([])

  // Step 3 state
  const [syllabusFile, setSyllabusFile] = useState<UploadedFile | null>(null)
  const [microSyllabusFile, setMicroSyllabusFile] = useState<UploadedFile | null>(null)
  const [syllabusExtracted, setSyllabusExtracted] = useState(false)
  const [learningObjectives] = useState([
    "Understand the fundamentals of operating system design",
    "Apply process scheduling and synchronization concepts",
    "Analyze memory management strategies",
    "Evaluate file system and I/O management techniques",
    "Design solutions for deadlock prevention and recovery",
  ])

  // Step 4 state
  const [pypFiles, setPypFiles] = useState<UploadedFile[]>([])
  const [pypAnalyzed, setPypAnalyzed] = useState(false)
  const [pypData] = useState<PYPData>({
    year: "2022-2024",
    questionCount: 48,
    totalMarks: 672,
    unitQuestions: [
      {
        unit: "Unit 1",
        questions: [
          { label: "1a", marks: 7 },
          { label: "1b", marks: 7 },
          { label: "1c", marks: 14 },
        ],
      },
      {
        unit: "Unit 2",
        questions: [
          { label: "2a", marks: 7 },
          { label: "2b", marks: 7 },
        ],
      },
      {
        unit: "Unit 3",
        questions: [
          { label: "3a", marks: 7 },
          { label: "3b", marks: 7 },
          { label: "3c", marks: 14 },
        ],
      },
    ],
    topicFrequency: [
      { topic: "Process Scheduling", count: 6 },
      { topic: "Deadlocks", count: 5 },
      { topic: "Virtual Memory", count: 4 },
      { topic: "Page Replacement", count: 4 },
      { topic: "File Systems", count: 3 },
      { topic: "Semaphores", count: 3 },
      { topic: "Disk Scheduling", count: 2 },
    ],
  })

  // Step 5 state
  const [textbookFiles, setTextbookFiles] = useState<UploadedFile[]>([])
  const [textbooksIndexed, setTextbooksIndexed] = useState(false)
  const [indexedChapters] = useState([
    { chapter: "Ch 1: Introduction", topics: ["OS Overview", "System Structures"] },
    { chapter: "Ch 2: Process Management", topics: ["Process Concept", "Scheduling", "Threads"] },
    { chapter: "Ch 3: Synchronization", topics: ["Critical Section", "Semaphores", "Monitors"] },
    { chapter: "Ch 4: Memory", topics: ["Paging", "Segmentation", "Virtual Memory"] },
    { chapter: "Ch 5: Storage", topics: ["File Systems", "Disk Scheduling", "I/O Systems"] },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUnitFileUpload = useCallback(
    (unitName: string, files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      setUnitFiles((prev) => ({
        ...prev,
        [unitName]: { id: crypto.randomUUID(), name: file.name, size: file.size },
      }))
    },
    []
  )

  const simulateExtraction = () => {
    setIsExtracting(true)
    setTimeout(() => {
      setExtractedTopics([
        {
          unitName: "Unit 1",
          topics: [
            { id: "1a", name: "Introduction to Operating Systems" },
            { id: "1b", name: "System Structures" },
            { id: "1c", name: "OS Services and System Calls" },
            { id: "1d", name: "System Programs" },
          ],
        },
        {
          unitName: "Unit 2",
          topics: [
            { id: "2a", name: "Process Concept" },
            { id: "2b", name: "Process Scheduling" },
            { id: "2c", name: "Interprocess Communication" },
            { id: "2d", name: "Threads and Concurrency" },
          ],
        },
        {
          unitName: "Unit 3",
          topics: [
            { id: "3a", name: "Synchronization Concepts" },
            { id: "3b", name: "Semaphores" },
            { id: "3c", name: "Deadlocks" },
            { id: "3d", name: "Deadlock Prevention and Recovery" },
          ],
        },
        {
          unitName: "Unit 4",
          topics: [
            { id: "4a", name: "Memory Management Strategies" },
            { id: "4b", name: "Paging" },
            { id: "4c", name: "Virtual Memory" },
            { id: "4d", name: "Page Replacement Algorithms" },
          ],
        },
        {
          unitName: "Unit 5",
          topics: [
            { id: "5a", name: "File System Interface" },
            { id: "5b", name: "File System Implementation" },
            { id: "5c", name: "Disk Scheduling" },
            { id: "5d", name: "I/O Systems" },
          ],
        },
      ])
      setIsExtracting(false)
    }, 2000)
  }

  const addTopic = (unitIndex: number) => {
    setExtractedTopics((prev) => {
      const updated = [...prev]
      updated[unitIndex] = {
        ...updated[unitIndex],
        topics: [
          ...updated[unitIndex].topics,
          { id: crypto.randomUUID(), name: "New Topic" },
        ],
      }
      return updated
    })
  }

  const removeTopic = (unitIndex: number, topicId: string) => {
    setExtractedTopics((prev) => {
      const updated = [...prev]
      updated[unitIndex] = {
        ...updated[unitIndex],
        topics: updated[unitIndex].topics.filter((t) => t.id !== topicId),
      }
      return updated
    })
  }

  const renameTopic = (unitIndex: number, topicId: string, newName: string) => {
    setExtractedTopics((prev) => {
      const updated = [...prev]
      updated[unitIndex] = {
        ...updated[unitIndex],
        topics: updated[unitIndex].topics.map((t) =>
          t.id === topicId ? { ...t, name: newName } : t
        ),
      }
      return updated
    })
  }

  const handleMultiFileUpload = (
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
    files: FileList | null
  ) => {
    if (!files) return
    const mapped = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
    }))
    setter((prev) => [...prev, ...mapped])
  }

  const totalTopics = extractedTopics.reduce((sum, u) => sum + u.topics.length, 0)
  const uploadedUnitCount = Object.values(unitFiles).filter(Boolean).length

  return (
    <div className="flex h-full flex-col">
      {/* Wizard Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Create New Course</h2>
            <p className="text-xs text-muted-foreground">
              Step {currentStep} of 6 - {steps[currentStep - 1].label}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-1">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  currentStep > step.id
                    ? "bg-emerald-100 text-emerald-700"
                    : currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-medium sm:block",
                  currentStep === step.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <ScrollArea className="flex-1 p-6">
        {/* Step 1 - Course Details */}
        {currentStep === 1 && (
          <div className="mx-auto max-w-xl">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS 301"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-26">2025-26</SelectItem>
                      <SelectItem value="2024-25">2024-25</SelectItem>
                      <SelectItem value="2026-27">2026-27</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                      <SelectItem value="3">Semester 3</SelectItem>
                      <SelectItem value="4">Semester 4</SelectItem>
                      <SelectItem value="5">Semester 5</SelectItem>
                      <SelectItem value="6">Semester 6</SelectItem>
                      <SelectItem value="7">Semester 7</SelectItem>
                      <SelectItem value="8">Semester 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    placeholder="e.g. 4"
                    className="mt-1.5"
                    type="number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="examPattern">Exam Pattern (Optional)</Label>
                <textarea
                  id="examPattern"
                  value={examPattern}
                  onChange={(e) => setExamPattern(e.target.value)}
                  placeholder="Describe the exam pattern, e.g. 5 units, 14 marks per question..."
                  className="mt-1.5 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Unit Documents */}
        {currentStep === 2 && (
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-sm text-muted-foreground">
              Upload documents for each unit. After uploading, AI will extract topics automatically.
            </p>

            <div className="flex flex-col gap-3">
              {Object.entries(unitFiles).map(([unitName, file]) => (
                <div key={unitName} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {unitName.split(" ")[1]}
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{unitName}</span>
                    </div>
                    {file ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{file.name}</span>
                        <button
                          onClick={() =>
                            setUnitFiles((prev) => ({ ...prev, [unitName]: null }))
                          }
                          className="rounded-md p-1 text-muted-foreground hover:text-destructive"
                          aria-label={"Remove " + unitName + " file"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80">
                        <Upload className="mr-1.5 inline h-3 w-3" />
                        Upload
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => handleUnitFileUpload(unitName, e.target.files)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {uploadedUnitCount > 0 && extractedTopics.length === 0 && (
              <Button
                onClick={simulateExtraction}
                disabled={isExtracting}
                className="mt-4 w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI Extracting Topics...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extract Topics with AI
                  </>
                )}
              </Button>
            )}

            {extractedTopics.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[10px]">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI Detected Topics - Editable
                  </Badge>
                </div>

                <div className="flex flex-col gap-4">
                  {extractedTopics.map((unit, unitIdx) => (
                    <div key={unit.unitName} className="rounded-xl border bg-card p-4">
                      <h4 className="mb-2 text-sm font-semibold text-card-foreground">
                        {unit.unitName}
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        {unit.topics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-1.5"
                          >
                            <span className="text-xs text-muted-foreground">{"#"}</span>
                            <input
                              value={topic.name}
                              onChange={(e) =>
                                renameTopic(unitIdx, topic.id, e.target.value)
                              }
                              className="flex-1 bg-transparent text-xs text-foreground focus:outline-none"
                            />
                            <button
                              onClick={() => removeTopic(unitIdx, topic.id)}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={"Remove topic " + topic.name}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addTopic(unitIdx)}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/5"
                        >
                          <Plus className="h-3 w-3" />
                          Add Topic
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 - Syllabus */}
        {currentStep === 3 && (
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-sm text-muted-foreground">
              Upload your syllabus and micro-syllabus documents for AI alignment analysis.
            </p>

            <div className="flex flex-col gap-4">
              {/* Syllabus Upload */}
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground">Syllabus Document</h4>
                    <p className="text-xs text-muted-foreground">Official syllabus PDF</p>
                  </div>
                  {syllabusFile ? (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{syllabusFile.name}</span>
                      <button onClick={() => setSyllabusFile(null)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80">
                      <Upload className="mr-1.5 inline h-3 w-3" />
                      Upload
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setSyllabusFile({ id: crypto.randomUUID(), name: f.name, size: f.size })
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Micro Syllabus Upload */}
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground">Micro-Syllabus Document</h4>
                    <p className="text-xs text-muted-foreground">Detailed micro-syllabus PDF</p>
                  </div>
                  {microSyllabusFile ? (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{microSyllabusFile.name}</span>
                      <button onClick={() => setMicroSyllabusFile(null)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80">
                      <Upload className="mr-1.5 inline h-3 w-3" />
                      Upload
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) setMicroSyllabusFile({ id: crypto.randomUUID(), name: f.name, size: f.size })
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {(syllabusFile || microSyllabusFile) && !syllabusExtracted && (
                <Button
                  onClick={() => {
                    setTimeout(() => setSyllabusExtracted(true), 1500)
                  }}
                  className="w-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Syllabus with AI
                </Button>
              )}

              {syllabusExtracted && (
                <div className="rounded-xl border bg-card p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                      <Check className="mr-1 h-3 w-3" />
                      AI Analysis Complete
                    </Badge>
                  </div>
                  <h4 className="mb-2 text-sm font-semibold text-card-foreground">Learning Objectives</h4>
                  <div className="flex flex-col gap-1.5">
                    {learningObjectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                        <span className="mt-0.5 text-xs font-medium text-primary">LO{i + 1}</span>
                        <span className="text-xs text-foreground">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4 - PYP Analysis */}
        {currentStep === 4 && (
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-sm text-muted-foreground">
              Upload previous year question papers for AI-powered analysis and trend detection.
            </p>

            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mb-4 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed bg-card px-6 py-8 transition-colors hover:border-primary/40"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
              }}
            >
              <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Upload PYP files</p>
              <p className="text-xs text-muted-foreground">PDF format recommended</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(e) => handleMultiFileUpload(setPypFiles, e.target.files)}
              />
            </div>

            {pypFiles.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {pypFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="flex-1 truncate text-xs text-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    <button
                      onClick={() => setPypFiles((prev) => prev.filter((f) => f.id !== file.id))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pypFiles.length > 0 && !pypAnalyzed && (
              <Button
                onClick={() => setTimeout(() => setPypAnalyzed(true), 1500)}
                className="mb-4 w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze PYP with AI
              </Button>
            )}

            {pypAnalyzed && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                    <Check className="mr-1 h-3 w-3" />
                    AI Analysis Complete
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {pypData.year} / {pypData.questionCount} questions / {pypData.totalMarks} marks total
                  </span>
                </div>

                {/* Question Distribution */}
                <div className="rounded-xl border bg-card p-4">
                  <h4 className="mb-3 text-sm font-semibold text-card-foreground">Question Distribution</h4>
                  <div className="flex flex-col gap-3">
                    {pypData.unitQuestions.map((unit) => (
                      <div key={unit.unit}>
                        <p className="mb-1.5 text-xs font-medium text-foreground">{unit.unit}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {unit.questions.map((q) => (
                            <span
                              key={q.label}
                              className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary"
                            >
                              {q.label} ({q.marks}m)
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic Frequency */}
                <div className="rounded-xl border bg-card p-4">
                  <h4 className="mb-3 text-sm font-semibold text-card-foreground">Topic Frequency (across papers)</h4>
                  <div className="flex flex-col gap-2">
                    {pypData.topicFrequency.map((tf) => (
                      <div key={tf.topic} className="flex items-center gap-3">
                        <span className="w-36 truncate text-xs text-foreground">{tf.topic}</span>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{ width: (tf.count / 6) * 100 + "%" }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {tf.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5 - Textbooks */}
        {currentStep === 5 && (
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-sm text-muted-foreground">
              Optionally upload textbooks for chapter indexing and topic mapping.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="mb-4 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed bg-card px-6 py-8 transition-colors hover:border-primary/40"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
              }}
            >
              <Library className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Upload Textbooks</p>
              <p className="text-xs text-muted-foreground">PDF format, optional step</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={(e) => handleMultiFileUpload(setTextbookFiles, e.target.files)}
              />
            </div>

            {textbookFiles.length > 0 && (
              <>
                <div className="mb-4 flex flex-col gap-2">
                  {textbookFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="flex-1 truncate text-xs text-foreground">{file.name}</span>
                      <button
                        onClick={() => setTextbookFiles((prev) => prev.filter((f) => f.id !== file.id))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {!textbooksIndexed && (
                  <Button
                    onClick={() => setTimeout(() => setTextbooksIndexed(true), 1500)}
                    className="mb-4 w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Index Chapters with AI
                  </Button>
                )}
              </>
            )}

            {textbooksIndexed && (
              <div className="rounded-xl border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px]">
                    <Check className="mr-1 h-3 w-3" />
                    Indexing Complete
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {indexedChapters.map((ch) => (
                    <div key={ch.chapter}>
                      <p className="mb-1 text-xs font-semibold text-card-foreground">{ch.chapter}</p>
                      <div className="flex flex-wrap gap-1">
                        {ch.topics.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6 - Review & Publish */}
        {currentStep === 6 && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 rounded-xl border bg-card p-5">
              <h3 className="mb-4 text-base font-semibold text-card-foreground">Course Summary</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Course Name</p>
                  <p className="font-medium text-foreground">{courseName || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Course Code</p>
                  <p className="font-medium text-foreground">{courseCode || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Academic Year</p>
                  <p className="font-medium text-foreground">{academicYear}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">{department || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Course Structure */}
            <div className="mb-6 rounded-xl border bg-card p-5">
              <h4 className="mb-3 text-sm font-semibold text-card-foreground">Course Structure</h4>
              {extractedTopics.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {extractedTopics.map((unit) => (
                    <div key={unit.unitName} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                      <span className="text-xs font-medium text-foreground">{unit.unitName}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {unit.topics.length} Topics
                      </Badge>
                    </div>
                  ))}
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="font-semibold text-primary">{totalTopics} Topics across {extractedTopics.length} Units</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No topics extracted yet</p>
              )}
            </div>

            {/* PYP Summary */}
            {pypAnalyzed && (
              <div className="mb-6 rounded-xl border bg-card p-5">
                <h4 className="mb-3 text-sm font-semibold text-card-foreground">PYP Analysis</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-primary/5 p-3">
                    <p className="text-lg font-bold text-primary">{pypData.questionCount}</p>
                    <p className="text-[10px] text-muted-foreground">Questions</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-lg font-bold text-emerald-600">{pypData.totalMarks}</p>
                    <p className="text-[10px] text-muted-foreground">Total Marks</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-lg font-bold text-amber-600">{pypData.topicFrequency[0]?.topic}</p>
                    <p className="text-[10px] text-muted-foreground">Most Asked</p>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={onClose} className="w-full" size="lg">
              <Check className="mr-2 h-4 w-4" />
              Publish Course
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t bg-card px-6 py-3">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                currentStep >= step.id ? "bg-primary" : "bg-secondary"
              )}
            />
          ))}
        </div>

        {currentStep < 6 ? (
          <Button onClick={() => setCurrentStep((s) => Math.min(6, s + 1))}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <div className="w-24" />
        )}
      </div>
    </div>
  )
}
