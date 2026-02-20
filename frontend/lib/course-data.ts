export type TopicStatus = "strong" | "moderate" | "needs-practice"

export interface Topic {
  id: string
  name: string
  status: TopicStatus
  description: string
  keyTakeaways: string[]
  formulas?: string[]
  examQuestions?: string[]
}

export interface Unit {
  id: string
  name: string
  progress: number
  topics: Topic[]
}

export interface Course {
  id: string
  name: string
  code: string
  units: Unit[]
}

export const courseData: Course = {
  id: "cs301",
  name: "Operating Systems",
  code: "CS 301",
  units: [
    {
      id: "unit-1",
      name: "Process Management",
      progress: 62,
      topics: [
        {
          id: "t1",
          name: "Introduction to Processes",
          status: "strong",
          description:
            "A process is an instance of a program in execution. It includes the program code (text section), current activity (program counter, registers), the process stack (temporary data), the data section (global variables), and the heap (dynamically allocated memory). The operating system manages processes through a Process Control Block (PCB) which stores the process state, program counter, CPU registers, scheduling information, memory management information, and I/O status.",
          keyTakeaways: [
            "A process is a program in execution with its own address space",
            "The PCB contains all information needed to manage a process",
            "Process states: New, Ready, Running, Waiting, Terminated",
            "Context switching saves and restores process state",
          ],
          formulas: ["Turnaround Time = Completion Time - Arrival Time", "Waiting Time = Turnaround Time - Burst Time"],
          examQuestions: [
            "Explain the difference between a process and a program.",
            "Describe all five process states and the transitions between them.",
          ],
        },
        {
          id: "t2",
          name: "Process Scheduling",
          status: "strong",
          description:
            "Process scheduling determines which process runs on the CPU at any given time. The scheduler uses various algorithms like FCFS, SJF, Priority, and Round Robin to optimize CPU utilization, throughput, turnaround time, waiting time, and response time. The ready queue holds processes waiting to be assigned the CPU. Short-term scheduling (CPU scheduler) selects from ready processes, while long-term scheduling controls the degree of multiprogramming.",
          keyTakeaways: [
            "FCFS is simple but can cause the convoy effect",
            "SJF is optimal for average waiting time but requires knowing burst times",
            "Round Robin provides fair time sharing with quantum-based preemption",
            "Priority scheduling can lead to starvation (solved with aging)",
          ],
          formulas: [
            "Average Waiting Time = Sum of Waiting Times / Number of Processes",
            "CPU Utilization = (Total Burst Time / Total Time) x 100%",
          ],
          examQuestions: [
            "Compare and contrast FCFS, SJF, and Round Robin scheduling.",
            "Solve a scheduling problem using the Round Robin algorithm with quantum = 4.",
          ],
        },
        {
          id: "t3",
          name: "Threads & Concurrency",
          status: "moderate",
          description:
            "A thread is the basic unit of CPU utilization. It comprises a thread ID, program counter, register set, and stack. Threads share the code section, data section, and OS resources with other threads in the same process. Multithreading allows a process to perform multiple tasks simultaneously. Benefits include responsiveness, resource sharing, economy, and scalability on multiprocessor architectures.",
          keyTakeaways: [
            "Threads share process resources but have their own stack and registers",
            "User-level threads are managed by a thread library without kernel support",
            "Kernel-level threads are managed directly by the OS",
            "Many-to-Many model multiplexes user threads to kernel threads",
          ],
          formulas: [],
          examQuestions: [
            "What are the advantages of multithreading over multiprocessing?",
            "Explain the difference between user-level and kernel-level threads.",
          ],
        },
        {
          id: "t4",
          name: "Inter-Process Communication",
          status: "moderate",
          description:
            "IPC mechanisms allow processes to communicate and synchronize their actions. The two fundamental models are shared memory and message passing. Shared memory requires processes to establish a shared region and manage access themselves. Message passing uses send/receive operations and can be implemented via direct or indirect communication, synchronous or asynchronous messaging.",
          keyTakeaways: [
            "Shared memory is faster but requires explicit synchronization",
            "Message passing is simpler but has higher overhead",
            "Pipes provide a simple one-way communication channel",
            "Sockets enable communication between processes on different machines",
          ],
          formulas: [],
          examQuestions: [
            "Compare shared memory and message passing IPC mechanisms.",
            "Design a producer-consumer solution using shared memory.",
          ],
        },
        {
          id: "t5",
          name: "Process Synchronization",
          status: "needs-practice",
          description:
            "When multiple processes access shared data concurrently, the outcome may depend on the order of execution, known as a race condition. The critical section problem requires mutual exclusion, progress, and bounded waiting. Solutions include Peterson's algorithm, hardware-based locks, mutex locks, semaphores, and monitors. Each provides different levels of abstraction for synchronization.",
          keyTakeaways: [
            "Race conditions occur when multiple processes modify shared data",
            "Critical section requires: mutual exclusion, progress, bounded waiting",
            "Semaphores generalize mutex locks with a counter",
            "Monitors provide a high-level synchronization construct",
          ],
          formulas: [
            "Semaphore wait(S): while (S <= 0); S--",
            "Semaphore signal(S): S++",
          ],
          examQuestions: [
            "Explain the critical section problem and its three requirements.",
            "Implement a solution using semaphores for the dining philosophers problem.",
          ],
        },
        {
          id: "t6",
          name: "Deadlocks",
          status: "needs-practice",
          description:
            "A deadlock occurs when a set of processes are each waiting for a resource held by another process in the set. Four necessary conditions must hold simultaneously: mutual exclusion, hold and wait, no preemption, and circular wait. Deadlocks can be handled through prevention (ensuring one condition cannot hold), avoidance (Banker's algorithm), detection (resource-allocation graph), or recovery.",
          keyTakeaways: [
            "Four conditions for deadlock: mutual exclusion, hold & wait, no preemption, circular wait",
            "Banker's algorithm checks if resource allocation leaves system in safe state",
            "Resource-allocation graphs can detect deadlocks in single-instance systems",
            "Recovery options: process termination or resource preemption",
          ],
          formulas: [
            "Safe State: exists a sequence where each process can finish with available + released resources",
            "Need[i] = Max[i] - Allocation[i]",
          ],
          examQuestions: [
            "Apply the Banker's algorithm to determine if a state is safe.",
            "Explain all four necessary conditions for deadlock with examples.",
          ],
        },
        {
          id: "t7",
          name: "CPU Scheduling Algorithms",
          status: "strong",
          description:
            "Advanced scheduling algorithms build upon basic concepts to handle real-world complexity. Multilevel Queue scheduling partitions the ready queue into separate queues with different scheduling algorithms. Multilevel Feedback Queue allows processes to move between queues based on behavior. Real-time scheduling uses EDF (Earliest Deadline First) and Rate Monotonic algorithms to meet timing constraints.",
          keyTakeaways: [
            "Multilevel queues separate processes into classes",
            "Feedback queues allow dynamic priority adjustment",
            "EDF schedules tasks by nearest deadline",
            "Rate Monotonic assigns priority inversely to period",
          ],
          formulas: [
            "Rate Monotonic: Priority inversely proportional to period Ti",
            "EDF Schedulability: Sum(Ci/Ti) <= 1",
          ],
          examQuestions: [
            "Design a multilevel feedback queue scheduling system.",
            "Determine schedulability using Rate Monotonic for a task set.",
          ],
        },
        {
          id: "t8",
          name: "Process Creation & Termination",
          status: "strong",
          description:
            "Processes are created via the fork() system call, which creates a copy of the calling process. The exec() family of calls replaces the process image with a new program. The parent can wait for child termination using wait(). Process termination occurs via exit() or abnormally. Orphan processes are adopted by init, and zombie processes have terminated but not been waited on.",
          keyTakeaways: [
            "fork() creates a child process as a copy of the parent",
            "exec() replaces the process address space with a new program",
            "Zombie: terminated process whose parent hasn't called wait()",
            "Orphan: child process whose parent has terminated",
          ],
          formulas: [],
          examQuestions: [
            "Trace the output of a program with multiple fork() calls.",
            "Explain the difference between zombie and orphan processes.",
          ],
        },
        {
          id: "t9",
          name: "Semaphores in Depth",
          status: "moderate",
          description:
            "Semaphores are integer variables accessed through two atomic operations: wait (P) and signal (V). Counting semaphores allow a value that ranges over an unrestricted domain, useful for controlling access to a resource with finite instances. Binary semaphores (mutex locks) restrict the value to 0 and 1. Common problems solved with semaphores include bounded buffer, readers-writers, and dining philosophers.",
          keyTakeaways: [
            "Counting semaphores manage access to finite resource pools",
            "Binary semaphores provide simple mutual exclusion",
            "Bounded buffer uses full, empty, and mutex semaphores",
            "Readers-writers problem balances concurrent reads with exclusive writes",
          ],
          formulas: [
            "Bounded Buffer: mutex=1, full=0, empty=n",
            "Readers-Writers: mutex=1, wrt=1, readcount=0",
          ],
          examQuestions: [
            "Solve the bounded-buffer problem using semaphores.",
            "Implement a readers-writers solution with writer priority.",
          ],
        },
        {
          id: "t10",
          name: "Classical Synchronization Problems",
          status: "needs-practice",
          description:
            "The classical synchronization problems are standard benchmark problems used to test new synchronization schemes. The Bounded-Buffer Problem coordinates producer and consumer processes sharing a fixed-size buffer. The Readers-Writers Problem manages concurrent access where multiple readers can access simultaneously but writers need exclusive access. The Dining Philosophers Problem models resource allocation among competing processes.",
          keyTakeaways: [
            "These problems are templates for real-world synchronization scenarios",
            "Each problem has multiple valid solutions with different trade-offs",
            "Solutions must avoid deadlock and starvation",
            "Monitor-based solutions are often cleaner than semaphore-based",
          ],
          formulas: [],
          examQuestions: [
            "Solve the dining philosophers problem avoiding deadlock.",
            "Implement a bounded buffer using monitors instead of semaphores.",
          ],
        },
      ],
    },
    {
      id: "unit-2",
      name: "Memory Management",
      progress: 35,
      topics: [],
    },
    {
      id: "unit-3",
      name: "File Systems",
      progress: 10,
      topics: [],
    },
    {
      id: "unit-4",
      name: "I/O Systems",
      progress: 0,
      topics: [],
    },
    {
      id: "unit-5",
      name: "Security & Protection",
      progress: 0,
      topics: [],
    },
  ],
}

export interface QuizQuestion {
  id: string
  topicId: string
  question: string
  options: string[]
  correctIndex: number
  difficulty: "easy" | "medium" | "hard"
  explanation: string
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    topicId: "t1",
    question: "Which of the following is NOT a process state?",
    options: ["New", "Ready", "Compiled", "Terminated"],
    correctIndex: 2,
    difficulty: "easy",
    explanation: "The five standard process states are: New, Ready, Running, Waiting, and Terminated. 'Compiled' is not a process state.",
  },
  {
    id: "q2",
    topicId: "t2",
    question: "Which scheduling algorithm is optimal for minimizing average waiting time?",
    options: ["FCFS", "SJF", "Round Robin", "Priority"],
    correctIndex: 1,
    difficulty: "medium",
    explanation: "Shortest Job First (SJF) is provably optimal for minimizing average waiting time, though it requires knowing burst times in advance.",
  },
  {
    id: "q3",
    topicId: "t5",
    question: "What is NOT a requirement for a solution to the critical section problem?",
    options: ["Mutual Exclusion", "Progress", "Throughput Optimization", "Bounded Waiting"],
    correctIndex: 2,
    difficulty: "medium",
    explanation: "The three requirements are Mutual Exclusion, Progress, and Bounded Waiting. Throughput Optimization is not a requirement.",
  },
  {
    id: "q4",
    topicId: "t6",
    question: "Which is NOT a necessary condition for deadlock?",
    options: ["Mutual Exclusion", "Hold and Wait", "Preemption", "Circular Wait"],
    correctIndex: 2,
    difficulty: "medium",
    explanation: "The four necessary conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. 'Preemption' itself is not a condition; 'No Preemption' is.",
  },
  {
    id: "q5",
    topicId: "t3",
    question: "What do threads in the same process share?",
    options: ["Stack only", "Code, data, and OS resources", "Registers only", "Nothing"],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "Threads within the same process share the code section, data section, and operating system resources. Each thread has its own stack and registers.",
  },
  {
    id: "q6",
    topicId: "t8",
    question: "What is a zombie process?",
    options: [
      "A process with no parent",
      "A terminated process whose parent hasn't called wait()",
      "A process stuck in an infinite loop",
      "A process waiting for I/O",
    ],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "A zombie process is one that has completed execution but still has an entry in the process table because its parent hasn't read its exit status via wait().",
  },
  {
    id: "q7",
    topicId: "t9",
    question: "In the bounded-buffer problem, what is the initial value of the 'empty' semaphore?",
    options: ["0", "1", "n (buffer size)", "-1"],
    correctIndex: 2,
    difficulty: "hard",
    explanation: "The 'empty' semaphore is initialized to n (the buffer size) representing all available slots. 'full' is initialized to 0, and 'mutex' to 1.",
  },
  {
    id: "q8",
    topicId: "t7",
    question: "In Rate Monotonic scheduling, how is priority assigned?",
    options: [
      "Higher priority to longer period tasks",
      "Higher priority to shorter period tasks",
      "Equal priority to all tasks",
      "Random priority assignment",
    ],
    correctIndex: 1,
    difficulty: "hard",
    explanation: "Rate Monotonic assigns higher priority to tasks with shorter periods (higher rates). It is a fixed-priority algorithm for real-time scheduling.",
  },
  {
    id: "q9",
    topicId: "t4",
    question: "Which IPC mechanism allows communication between processes on different machines?",
    options: ["Pipes", "Shared Memory", "Sockets", "Semaphores"],
    correctIndex: 2,
    difficulty: "medium",
    explanation: "Sockets provide an endpoint for communication and can be used for inter-machine communication over a network. Pipes and shared memory are local to a single machine.",
  },
  {
    id: "q10",
    topicId: "t10",
    question: "In the dining philosophers problem, what resource do philosophers compete for?",
    options: ["Plates", "Chopsticks/Forks", "Food portions", "Seats"],
    correctIndex: 1,
    difficulty: "easy",
    explanation: "In the dining philosophers problem, philosophers compete for shared chopsticks (or forks) placed between them, modeling resource contention.",
  },
]
