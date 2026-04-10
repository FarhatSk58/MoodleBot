// ─────────────────────────────────────────────────────────────
// DUMMY DATA — Replace with AI-generated content in the future.
// Each subject maps to topics, each topic has structured content.
// ─────────────────────────────────────────────────────────────

export const SUBJECTS = [
  { id: 'java', label: 'Java', icon: '☕', color: 'orange' },
  { id: 'python', label: 'Python', icon: '🐍', color: 'blue' },
  { id: 'dsa', label: 'Data Structures & Algorithms', icon: '🌲', color: 'emerald' },
  { id: 'dbms', label: 'Database Management', icon: '🗄️', color: 'violet' },
  { id: 'os', label: 'Operating Systems', icon: '💻', color: 'slate' },
  { id: 'cn', label: 'Computer Networks', icon: '🌐', color: 'cyan' },
];

export const SUBJECT_CONTENT = {
  java: {
    topic: 'Core Java Fundamentals',
    interview_questions: [
      {
        difficulty: 'easy',
        question: 'What is the difference between JDK, JRE, and JVM?',
        hint: 'Think about compilation vs execution vs runtime environment.',
      },
      {
        difficulty: 'easy',
        question: 'What are the main features of Java (OOP principles)?',
        hint: 'Encapsulation, Inheritance, Polymorphism, Abstraction.',
      },
      {
        difficulty: 'easy',
        question: 'What is the difference between == and .equals() in Java?',
        hint: 'Reference equality vs value equality.',
      },
      {
        difficulty: 'medium',
        question: 'Explain method overloading vs method overriding with examples.',
        hint: 'Compile-time vs runtime polymorphism.',
      },
      {
        difficulty: 'medium',
        question: 'What is the difference between an abstract class and an interface?',
        hint: 'Default methods, multiple inheritance, constructor differences.',
      },
      {
        difficulty: 'medium',
        question: 'How does the garbage collector work in Java?',
        hint: 'Heap regions, generational GC, finalize().',
      },
      {
        difficulty: 'hard',
        question: 'Explain Java memory model — heap, stack, method area.',
        hint: 'Thread memory, volatile, happens-before relationship.',
      },
      {
        difficulty: 'hard',
        question: 'What are ClassLoaders in Java? Explain with the delegation model.',
        hint: 'Bootstrap → Extension → Application ClassLoader chain.',
      },
    ],
    mcqs: [
      {
        id: 1,
        question: 'Which keyword is used to prevent method overriding in Java?',
        options: ['static', 'final', 'abstract', 'private'],
        answer: 1,
      },
      {
        id: 2,
        question: 'What is the default value of a boolean variable in Java?',
        options: ['true', 'false', 'null', '0'],
        answer: 1,
      },
      {
        id: 3,
        question: 'Which collection class allows null keys and null values?',
        options: ['Hashtable', 'TreeMap', 'HashMap', 'LinkedHashMap'],
        answer: 2,
      },
      {
        id: 4,
        question: 'What is the output of: System.out.println(10 + 20 + "Java")?',
        options: ['"1020Java"', '"30Java"', 'Error', '"Java3020"'],
        answer: 1,
      },
      {
        id: 5,
        question: 'Which interface must be implemented to make a class sortable?',
        options: ['Serializable', 'Comparable', 'Cloneable', 'Runnable'],
        answer: 1,
      },
    ],
    tasks: [
      {
        title: 'Reverse a String',
        description: 'Write a Java program to reverse a given string without using StringBuilder.reverse().',
        difficulty: 'easy',
        skills: ['String manipulation', 'Loops'],
      },
      {
        title: 'Implement a Stack using Arrays',
        description: 'Implement push, pop, peek, and isEmpty operations using a fixed-size array.',
        difficulty: 'medium',
        skills: ['Arrays', 'OOP design'],
      },
      {
        title: 'Fibonacci with Memoization',
        description: 'Write a recursive Fibonacci function optimized with memoization using a HashMap.',
        difficulty: 'medium',
        skills: ['Recursion', 'HashMap', 'Dynamic Programming'],
      },
      {
        title: 'Custom LinkedList',
        description: 'Implement a singly linked list with add, delete, and search operations.',
        difficulty: 'hard',
        skills: ['Pointers / References', 'OOP', 'Data Structures'],
      },
    ],
    mini_projects: [
      {
        title: 'Student Management System',
        description:
          'Build a console-based application to add, update, delete, and search student records using OOP concepts.',
        features: [
          'Add / update / delete student records',
          'Search by name or roll number',
          'Persist data to a text file',
          'Use inheritance for different student types',
        ],
        estimated_time: '3–4 days',
      },
      {
        title: 'Library Book Tracker',
        description:
          'Create a Java application that tracks books in a library — issue, return, overdue calculation.',
        features: [
          'Manage book inventory',
          'Issue and return books with timestamps',
          'Calculate overdue fines',
          'Export report to CSV',
        ],
        estimated_time: '4–5 days',
      },
    ],
  },

  python: {
    topic: 'Python Programming Essentials',
    interview_questions: [
      { difficulty: 'easy', question: 'What is the difference between a list and a tuple in Python?', hint: 'Mutability.' },
      { difficulty: 'easy', question: 'What are Python decorators?', hint: 'Function wrappers, @syntax.' },
      { difficulty: 'medium', question: 'Explain Python\'s GIL (Global Interpreter Lock).', hint: 'Thread safety, CPython.' },
      { difficulty: 'medium', question: 'What is the difference between *args and **kwargs?', hint: 'Positional vs keyword arguments.' },
      { difficulty: 'hard', question: 'How does Python manage memory? Explain reference counting and garbage collection.', hint: 'gc module, cyclic references.' },
    ],
    mcqs: [
      { id: 1, question: 'Which method is used to remove an item from a list at a given index?', options: ['remove()', 'del()', 'pop()', 'discard()'], answer: 2 },
      { id: 2, question: 'What does the "is" operator check in Python?', options: ['Value equality', 'Type equality', 'Identity (memory address)', 'None equality'], answer: 2 },
    ],
    tasks: [
      { title: 'Palindrome Checker', description: 'Write a Python function to check if a string is a palindrome.', difficulty: 'easy', skills: ['Strings', 'Slicing'] },
      { title: 'File Word Counter', description: 'Read a text file and count the frequency of each word, display top 10.', difficulty: 'medium', skills: ['File I/O', 'Dictionaries'] },
    ],
    mini_projects: [
      { title: 'To-Do CLI App', description: 'Build a command-line to-do list manager with add, remove, complete, and list features.', features: ['Add/delete tasks', 'Mark complete', 'Save to JSON file'], estimated_time: '2–3 days' },
    ],
  },

  dsa: {
    topic: 'Arrays, Linked Lists & Sorting',
    interview_questions: [
      { difficulty: 'easy', question: 'What is the time complexity of binary search?', hint: 'O(log n).' },
      { difficulty: 'medium', question: 'Explain quicksort and its average vs worst-case complexity.', hint: 'Pivot selection, partitioning.' },
      { difficulty: 'hard', question: 'How would you detect a cycle in a linked list?', hint: 'Floyd\'s cycle detection algorithm.' },
    ],
    mcqs: [
      { id: 1, question: 'Which data structure uses FIFO ordering?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 1 },
      { id: 2, question: 'What is the worst-case time complexity of merge sort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 1 },
    ],
    tasks: [
      { title: 'Two Sum Problem', description: 'Find two numbers in an array that add up to a target value.', difficulty: 'easy', skills: ['HashMap', 'Arrays'] },
      { title: 'Detect Cycle in Linked List', description: 'Implement Floyd\'s algorithm to detect cycles.', difficulty: 'hard', skills: ['Linked List', 'Two Pointers'] },
    ],
    mini_projects: [
      { title: 'Visualizer for Sorting Algorithms', description: 'Build a simple visualizer (CLI or web) showing bubble, selection, and merge sort step by step.', features: ['Multiple algorithms', 'Step-by-step display', 'Comparison counter'], estimated_time: '5–7 days' },
    ],
  },

  dbms: {
    topic: 'SQL & Relational DB Fundamentals',
    interview_questions: [
      { difficulty: 'easy', question: 'What is the difference between DELETE, TRUNCATE, and DROP?', hint: 'Rollback, DDL vs DML.' },
      { difficulty: 'medium', question: 'Explain ACID properties in databases.', hint: 'Atomicity, Consistency, Isolation, Durability.' },
      { difficulty: 'hard', question: 'What are the different types of database indexes and when would you use each?', hint: 'B-tree, hash, bitmap, clustered vs non-clustered.' },
    ],
    mcqs: [
      { id: 1, question: 'Which SQL clause is used to filter grouped results?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], answer: 1 },
      { id: 2, question: 'Which normal form eliminates transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 2 },
    ],
    tasks: [
      { title: 'Student DB Schema', description: 'Design and create tables for a student management system with proper relationships.', difficulty: 'medium', skills: ['DDL', 'Foreign keys', 'Normalization'] },
    ],
    mini_projects: [
      { title: 'Inventory Management DB', description: 'Design a relational database for a small store inventory with products, categories, and transactions.', features: ['ER diagram', 'Full SQL schema', 'Sample queries'], estimated_time: '3–4 days' },
    ],
  },

  os: {
    topic: 'Processes, Threads & Scheduling',
    interview_questions: [
      { difficulty: 'easy', question: 'What is the difference between a process and a thread?', hint: 'Memory space, context switching.' },
      { difficulty: 'medium', question: 'Explain deadlock and the four necessary conditions.', hint: 'Mutual exclusion, hold and wait, no preemption, circular wait.' },
      { difficulty: 'hard', question: 'How does virtual memory work? Explain paging and segmentation.', hint: 'Page table, TLB, demand paging.' },
    ],
    mcqs: [
      { id: 1, question: 'Which scheduling algorithm has the minimum average waiting time?', options: ['FCFS', 'Round Robin', 'SJF', 'Priority'], answer: 2 },
    ],
    tasks: [
      { title: 'Simulate Round Robin Scheduling', description: 'Implement a round-robin CPU scheduler simulation with a given time quantum.', difficulty: 'medium', skills: ['Queues', 'Simulation', 'Algorithms'] },
    ],
    mini_projects: [
      { title: 'Process Scheduler Simulator', description: 'Simulate multiple CPU scheduling algorithms with Gantt chart output.', features: ['FCFS, SJF, Round Robin', 'Gantt chart', 'Average waiting & turnaround time'], estimated_time: '5–6 days' },
    ],
  },

  cn: {
    topic: 'OSI Model & Network Protocols',
    interview_questions: [
      { difficulty: 'easy', question: 'What are the 7 layers of the OSI model?', hint: 'Physical → Application.' },
      { difficulty: 'medium', question: 'Explain TCP 3-way handshake.', hint: 'SYN, SYN-ACK, ACK.' },
      { difficulty: 'hard', question: 'How does BGP routing work at an ISP level?', hint: 'Autonomous systems, path vector protocol.' },
    ],
    mcqs: [
      { id: 1, question: 'Which protocol is used to assign IP addresses dynamically?', options: ['DNS', 'FTP', 'DHCP', 'ARP'], answer: 2 },
    ],
    tasks: [
      { title: 'Subnet Calculator', description: 'Write a program to calculate subnet mask, network address, and broadcast address from a CIDR notation.', difficulty: 'medium', skills: ['Bitwise ops', 'Networking'] },
    ],
    mini_projects: [
      { title: 'Chat Application (TCP Sockets)', description: 'Build a simple multi-client chat application using TCP sockets.', features: ['Server-client architecture', 'Multiple clients', 'Broadcast messages'], estimated_time: '4–5 days' },
    ],
  },
};
