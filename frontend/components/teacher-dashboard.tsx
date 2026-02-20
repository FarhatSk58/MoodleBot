"use client"

import { useState, useRef, useCallback } from "react"
import {
  ArrowLeft,
  Upload,
  FileText,
  File,
  Presentation,
  Trash2,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface TeacherDashboardProps {
  onBack: () => void
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
}

const teacherCourses = [
  { id: "cs301", code: "CS 301", name: "Operating Systems", topics: 18 },
  { id: "cs201", code: "CS 201", name: "Data Structures", topics: 22 },
  { id: "cs302", code: "CS 302", name: "Computer Networks", topics: 16 },
  { id: "cs303", code: "CS 303", name: "Database Systems", topics: 20 },
  { id: "cs401", code: "CS 401", name: "Machine Learning", topics: 24 },
  { id: "cs304", code: "CS 304", name: "Software Engineering", topics: 15 },
]

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return <FileText className="h-4 w-4 text-rose-500" />
  if (ext === "ppt" || ext === "pptx") return <Presentation className="h-4 w-4 text-amber-500" />
  return <File className="h-4 w-4 text-primary" />
}

export function TeacherDashboard({ onBack }: TeacherDashboardProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(teacherCourses[0].id)
  const [filesByCourse, setFilesByCourse] = useState<Record<string, UploadedFile[]>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedCourse = teacherCourses.find((c) => c.id === selectedCourseId)!
  const currentFiles = filesByCourse[selectedCourseId] || []

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const validFiles = Array.from(newFiles).filter((f) =>
        ACCEPTED_TYPES.includes(f.type) ||
        ACCEPTED_EXTENSIONS.split(",").some((ext) => f.name.toLowerCase().endsWith(ext))
      )

      if (validFiles.length === 0) return

      const mapped: UploadedFile[] = validFiles.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        type: f.type,
      }))

      setFilesByCourse((prev) => ({
        ...prev,
        [selectedCourseId]: [...(prev[selectedCourseId] || []), ...mapped],
      }))
    },
    [selectedCourseId]
  )

  const removeFile = (fileId: string) => {
    setFilesByCourse((prev) => ({
      ...prev,
      [selectedCourseId]: (prev[selectedCourseId] || []).filter((f) => f.id !== fileId),
    }))
  }

  const handleUpload = () => {
    if (currentFiles.length === 0) return
    setSuccessMessage(
      currentFiles.length + " file(s) uploaded to " + selectedCourse.name + " successfully!"
    )
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Go back to role selection"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-card-foreground">StudyAI</span>
            <Badge variant="secondary" className="text-[10px] font-medium">Teacher</Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 lg:flex-row">
        {/* Course List */}
        <aside className="w-full shrink-0 lg:w-64">
          <h2 className="mb-1 text-sm font-semibold text-foreground">Your Courses</h2>
          <p className="mb-4 text-xs text-muted-foreground">Select a course to manage materials</p>

          <nav className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {teacherCourses.map((course) => {
              const fileCount = (filesByCourse[course.id] || []).length
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={cn(
                    "flex shrink-0 flex-col items-start rounded-xl border px-4 py-3 text-left transition-all duration-150",
                    selectedCourseId === course.id
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-transparent bg-card hover:bg-secondary/60"
                  )}
                >
                  <span className="text-[10px] font-medium text-muted-foreground">{course.code}</span>
                  <span className="text-sm font-medium text-card-foreground">{course.name}</span>
                  <span className="mt-1 text-[10px] text-muted-foreground">
                    {fileCount > 0 ? fileCount + " file(s) added" : "No files yet"}
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Upload Area */}
        <section className="flex-1">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedCourse.name}</h2>
              <p className="text-xs text-muted-foreground">{selectedCourse.code + " - " + selectedCourse.topics + " topics"}</p>
            </div>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30"
            )}
            role="button"
            tabIndex={0}
            aria-label="Upload files by clicking or dragging and dropping"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOC, DOCX, PPT, PPTX
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ""
              }}
            />
          </div>

          {/* File List */}
          {currentFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                {"Uploaded Files (" + currentFiles.length + ")"}
              </h3>
              <ScrollArea className="max-h-72">
                <div className="flex flex-col gap-2">
                  {currentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors"
                    >
                      {getFileIcon(file.name)}
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={"Remove " + file.name}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <button
                onClick={handleUpload}
                className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {"Upload " + currentFiles.length + " File(s)"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
