"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Code2,
  GitCompare,
  Dumbbell,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Topic } from "@/lib/course-data"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AiAssistantProps {
  selectedTopic: Topic | null
  unitName: string
}

const quickActions = [
  { label: "Explain Simply", icon: BookOpen },
  { label: "Give Example", icon: Code2 },
  { label: "Compare Topics", icon: GitCompare },
  { label: "Generate Practice", icon: Dumbbell },
  { label: "What Should I Study Next?", icon: Compass },
]

function getAIResponse(question: string, topic: Topic | null): string {
  const topicName = topic?.name || "this unit"

  if (question.toLowerCase().includes("explain simply") || question.toLowerCase().includes("explain")) {
    return topic
      ? `Here's a simple explanation of **${topic.name}**:\n\nThink of it like this - ${topic.description.split(".").slice(0, 2).join(".")}.\n\nThe key idea is that ${topic.keyTakeaways[0]?.toLowerCase() || "understanding the core concept"}.`
      : `Please select a topic first, and I'll provide a simplified explanation!`
  }

  if (question.toLowerCase().includes("example") || question.toLowerCase().includes("give example")) {
    return topic
      ? `Here's a real-world example of **${topic.name}**:\n\nImagine you're at a restaurant. ${
          topic.name.includes("Deadlock")
            ? "Four diners are sitting at a round table, each holding one fork. Each needs two forks to eat, and no one will put down the fork they're holding. Everyone is stuck - that's a deadlock!"
            : topic.name.includes("Scheduling")
              ? "Customers arrive at different times with different order sizes. The chef must decide who to serve first. FCFS means first-come-first-served. SJF would serve the quickest orders first to minimize average wait."
              : topic.name.includes("Thread")
                ? "Think of a web browser: one thread renders the page, another downloads files, and a third handles your clicks. All share the same browser resources (memory, cookies) but work independently."
                : topic.name.includes("Synchronization")
                  ? "Two cashiers at a store share one receipt printer. Without synchronization, their receipts could get mixed up. A mutex lock ensures only one cashier uses the printer at a time."
                  : "Consider a computer running multiple applications - each one is a separate process with its own memory space and resources, managed by the operating system."
        }`
      : `Select a specific topic and I'll give you a concrete example!`
  }

  if (question.toLowerCase().includes("compare") || question.toLowerCase().includes("compare topics")) {
    return `Great question! Here's a comparison of key topics in this unit:\n\n**Processes vs Threads:**\n- Processes have separate memory spaces; threads share memory\n- Thread creation is faster and more lightweight\n- Threads share resources; processes are isolated\n\n**Shared Memory vs Message Passing:**\n- Shared memory is faster but needs synchronization\n- Message passing is simpler but has higher overhead\n\n**Semaphores vs Monitors:**\n- Semaphores are lower-level, more error-prone\n- Monitors provide high-level abstraction with built-in mutual exclusion`
  }

  if (question.toLowerCase().includes("practice") || question.toLowerCase().includes("generate practice")) {
    return topic
      ? `Here are some practice questions for **${topic.name}**:\n\n1. ${topic.examQuestions?.[0] || `Define the key concepts of ${topic.name}.`}\n\n2. ${topic.examQuestions?.[1] || `What are the advantages and disadvantages of different approaches to ${topic.name}?`}\n\nTry answering these on paper first, then switch to the Practice tab to test yourself with multiple-choice questions!`
      : `Select a topic and I'll generate targeted practice questions for you!`
  }

  if (question.toLowerCase().includes("study next") || question.toLowerCase().includes("what should")) {
    return `Based on your progress, here's my recommendation:\n\n1. **Focus on weak areas first** - Topics marked in red need the most attention\n2. **Revise moderate topics** - These are close to mastery with a bit more practice\n3. **Quick review strong topics** - Don't neglect them, a quick flashcard session keeps them fresh\n\nI'd suggest starting with the Practice tab for any "Needs Practice" topics, then using the Revise tab for a comprehensive review.`
  }

  return topic
    ? `That's a great question about **${topicName}**!\n\n${topic.description.split(".").slice(0, 3).join(".")}.\n\nWould you like me to elaborate on any specific aspect? You can also try the quick action buttons below for common study actions.`
    : `I'm your AI study assistant for this course. Select a topic from the left panel and I can help you:\n\n- Explain concepts simply\n- Give real-world examples\n- Compare related topics\n- Generate practice questions\n- Recommend what to study next\n\nJust ask a question or tap one of the quick action buttons!`
}

export function AiAssistant({ selectedTopic, unitName }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your AI course assistant. I'm currently tuned into **${unitName}**. Select a topic and ask me anything, or use the quick actions below to get started.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = getAIResponse(text, selectedTopic)
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 800 + Math.random() * 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input.trim())
  }

  const handleQuickAction = (label: string) => {
    sendMessage(label)
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              AI Assistant
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {selectedTopic
                ? `Context: ${selectedTopic.name}`
                : `Studying: ${unitName}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2.5",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  msg.role === "assistant"
                    ? "bg-primary/10"
                    : "bg-secondary"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-secondary text-card-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                )}
              >
                {msg.content.split("\n").map((line, idx) => (
                  <span key={idx} className="block">
                    {line.split("**").map((segment, sIdx) =>
                      sIdx % 2 === 1 ? (
                        <strong key={sIdx}>{segment}</strong>
                      ) : (
                        <span key={sIdx}>{segment}</span>
                      )
                    )}
                    {idx < msg.content.split("\n").length - 1 && line === "" && (
                      <span className="block h-2" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t px-3 py-2">
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.label)}
              disabled={isTyping}
              className="flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-card-foreground disabled:opacity-50"
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this unit..."
            disabled={isTyping}
            className="flex-1 rounded-xl border bg-secondary/50 px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="h-10 w-10 shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
