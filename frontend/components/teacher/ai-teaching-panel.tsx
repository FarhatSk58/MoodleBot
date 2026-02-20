"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  Send,
  FileQuestion,
  ListChecks,
  Brain,
  Target,
  TrendingUp,
  ClipboardList,
  X,
  Bot,
  User,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const quickActions = [
  { label: "Create 20 MCQs", icon: ListChecks, prompt: "Generate 20 MCQs for Unit 1 topics" },
  { label: "Bloom Level Generator", icon: Brain, prompt: "Generate questions across all Bloom's taxonomy levels" },
  { label: "7-Mark Questions", icon: FileQuestion, prompt: "Generate 10 seven-mark descriptive questions" },
  { label: "Model Answers", icon: ClipboardList, prompt: "Create model answers for recent questions" },
  { label: "Important Topics", icon: Target, prompt: "Suggest the most important topics for the upcoming exam" },
  { label: "Exam Trends", icon: TrendingUp, prompt: "Predict exam trends based on PYP analysis" },
]

const sampleResponses: Record<string, string> = {
  "Generate 20 MCQs for Unit 1 topics":
    "Here are 20 MCQs generated for Unit 1 - Introduction to Operating Systems:\n\n1. Which of the following is NOT an OS function?\n   a) Memory Management  b) Word Processing\n   c) Process Management  d) I/O Management\n   Answer: b) Word Processing\n\n2. A multiprogramming OS allows...\n   a) Single user  b) Multiple programs in memory\n   c) Only batch jobs  d) None\n   Answer: b) Multiple programs in memory\n\n...18 more questions generated. Use the Question Bank to view, edit, and export all.",
  "Generate questions across all Bloom's taxonomy levels":
    "Bloom's Taxonomy Questions for Operating Systems:\n\nRemember: Define the term 'deadlock' in OS.\nUnderstand: Explain the difference between preemptive and non-preemptive scheduling.\nApply: Given a set of processes, apply the SJF algorithm.\nAnalyze: Compare Round Robin and Priority scheduling.\nEvaluate: Justify which page replacement algorithm is best for a given workload.\nCreate: Design a scheduling algorithm for a real-time system.",
  "Generate 10 seven-mark descriptive questions":
    "7-Mark Descriptive Questions:\n\n1. Explain the concept of virtual memory with a diagram. Discuss its advantages and disadvantages. (7 marks)\n\n2. Describe the Banker's Algorithm for deadlock avoidance with an example. (7 marks)\n\n3. Compare and contrast paging and segmentation memory management techniques. (7 marks)\n\n...7 more questions generated.",
}

interface AiTeachingPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AiTeachingPanel({ isOpen, onClose }: AiTeachingPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello Dr. Ramesh! I'm your AI Teaching Assistant. I can help you generate questions, create quizzes, analyze exam patterns, and more. Try one of the quick actions below or ask me anything.",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInputValue("")
    setIsLoading(true)

    setTimeout(() => {
      const response =
        sampleResponses[text.trim()] ||
        "I've analyzed your request. Based on the uploaded course materials and previous year papers, here's what I found:\n\nThe topic coverage suggests focusing on Unit 2 and Unit 4 for high-weightage areas. I can generate specific questions or provide a detailed analysis. Would you like me to proceed?"
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsLoading(false)
    }, 1200)
  }

  if (!isOpen) return null

  return (
    <div className="flex h-full w-80 flex-col border-l bg-card xl:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">AI Teaching Assistant</h3>
            <p className="text-[10px] text-muted-foreground">Powered by StudyAI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close AI panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="border-b px-3 py-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSend(action.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg border bg-secondary/50 px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50"
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3" ref={scrollRef}>
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t px-3 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(inputValue)
          }}
          className="flex items-center gap-2"
        >
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your AI assistant..."
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
