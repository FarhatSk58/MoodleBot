export const SHEET_META = {
  title: "Striver's A2Z Sheet - Learn DSA from A to Z",
  subtitle:
    'This course is made for people who want to learn DSA from A to Z for free in a well-organised and structured manner.',
  lastUpdated: 'December 13, 2025',
  knowMoreLabel: 'Know more',
};

// Mock/fixed data for now.
// You can safely add more sections / groups / items here later.
//
// Important: progress is stored per-student in Mongo keyed by:
// `${section.id}::${group.id}::${item.id}` (fallbacks to a slug of `item.title` if `item.id` is missing).
// To avoid collisions (and losing/mixing progress), keep these stable + unique:
// - `section.id` unique across the array
// - `group.id` unique within a section
// - `item.id` unique within a group
export const SHEET_SECTIONS = [
  {
    id: 'basics',
    title: 'Learn the basics',
    groups: [
      {
        id: 'lang_basics',
        title: 'Things to Know in C++/Java/Python or any language',
        items: [
          { id: 'lb1', title: 'Input Output', difficulty: 'easy', resourceArticle: 'Learn input/output basics', resourceVideo: '', practice: '', notes: 'Understand stdin, stdout, fast IO' },
          { id: 'lb2', title: 'CPP Basics', difficulty: 'easy', resourceArticle: 'Variables, loops, functions', resourceVideo: '', practice: '', notes: '' },
          { id: 'lb3', title: 'If Else', difficulty: 'easy', resourceArticle: 'Conditional logic', resourceVideo: '', practice: '', notes: '' },
          { id: 'lb4', title: 'Switch Case', difficulty: 'easy', resourceArticle: 'Switch statements', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'logical_thinking',
        title: 'Build-up Logical Thinking',
        items: [
          { id: 'lt1', title: 'Patterns (basic)', difficulty: 'easy', resourceArticle: 'Star patterns', resourceVideo: '', practice: '', notes: 'Focus on loops & observation' },
        ],
      },
      {
        id: 'stl',
        title: 'Learn STL/Java-Collections or similar thing in your language',
        items: [
          { id: 'stl1', title: 'Arrays / Lists', difficulty: 'easy', resourceArticle: 'Vectors, ArrayList', resourceVideo: '', practice: '', notes: '' },
          { id: 'stl2', title: 'Maps / Sets', difficulty: 'easy', resourceArticle: 'HashMap, HashSet', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'math',
        title: 'Know Basic Maths',
        items: [
          { id: 'm1', title: 'GCD / LCM', difficulty: 'easy', resourceArticle: 'Euclidean algorithm', resourceVideo: '', practice: '', notes: '' },
          { id: 'm2', title: 'Prime check', difficulty: 'easy', resourceArticle: 'Check up to sqrt(n)', resourceVideo: '', practice: '', notes: '' },
          { id: 'm3', title: 'Sieve of Eratosthenes', difficulty: 'medium', resourceArticle: 'Precompute primes', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'recursion_basic',
        title: 'Learn Basic Recursion',
        items: [
          { id: 'rb1', title: 'Factorial', difficulty: 'easy', resourceArticle: 'Basic recursion', resourceVideo: '', practice: '', notes: '' },
          { id: 'rb2', title: 'Fibonacci', difficulty: 'easy', resourceArticle: 'Recursive tree', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'hashing_basic',
        title: 'Learn Basic Hashing',
        items: [
          { id: 'hb1', title: 'Frequency array', difficulty: 'easy', resourceArticle: 'Count frequencies', resourceVideo: '', practice: '', notes: '' },
          { id: 'hb2', title: 'Hashmap frequency', difficulty: 'easy', resourceArticle: 'Use map for counting', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // ✅ ARRAYS EXPANDED
  {
    id: 'arrays',
    title: 'Solve Problems on Arrays [Easy -> Medium -> Hard]',
    groups: [
      {
        id: 'arrays_easy',
        title: 'Easy',
        items: [
          { id: 'a1', title: 'Largest Element in Array', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a2', title: 'Second Largest Element', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a3', title: 'Check if array is sorted', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a4', title: 'Remove duplicates from sorted array', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a5', title: 'Left rotate array by one place', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a6', title: 'Move zeros to end', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a7', title: 'Linear Search', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a8', title: 'Union of two sorted arrays', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a9', title: 'Missing number', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'arrays_medium',
        title: 'Medium',
        items: [
          { id: 'a10', title: 'Two Sum', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a11', title: 'Sort Colors (Dutch National Flag)', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a12', title: 'Majority Element (> n/2)', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a13', title: 'Kadane’s Algorithm', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a14', title: 'Stock Buy and Sell', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a15', title: 'Rearrange array by sign', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a16', title: 'Next Permutation', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a17', title: 'Leaders in array', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'arrays_hard',
        title: 'Hard',
        items: [
          { id: 'a18', title: 'Longest Consecutive Sequence', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a19', title: 'Set Matrix Zeroes', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a20', title: 'Rotate Matrix', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a21', title: 'Spiral Matrix', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a22', title: 'Count Subarrays with given sum', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a23', title: 'Pascal Triangle', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a24', title: 'Majority Element (> n/3)', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a25', title: '3 Sum', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a26', title: '4 Sum', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a27', title: 'Merge Intervals', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a28', title: 'Merge Sorted Arrays without extra space', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'a29', title: 'Count Inversions', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // ✅ STRINGS (NEW SECTION)
  {
    id: 'strings',
    title: 'Solve Problems on Strings',
    groups: [
      {
        id: 'strings_basic',
        title: 'String Basics',
        items: [
          { id: 'str1', title: 'Reverse String', difficulty: 'easy', resourceArticle: 'Two pointers', resourceVideo: '', practice: '', notes: '' },
          { id: 'str2', title: 'Palindrome Check', difficulty: 'easy', resourceArticle: 'Compare ends', resourceVideo: '', practice: '', notes: '' },
          { id: 'str3', title: 'Valid Anagram', difficulty: 'easy', resourceArticle: 'Frequency count', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'strings_medium',
        title: 'Medium String Problems',
        items: [
          { id: 'str4', title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', resourceArticle: 'Sliding window', resourceVideo: '', practice: '', notes: '' },
          { id: 'str5', title: 'String to Integer (atoi)', difficulty: 'medium', resourceArticle: 'Parsing', resourceVideo: '', practice: '', notes: '' },
          { id: 'str6', title: 'Longest Palindromic Substring', difficulty: 'medium', resourceArticle: 'Expand around center', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // ✅ RECURSION + BACKTRACKING
  {
    id: 'recursion',
    title: 'Recursion & Backtracking',
    groups: [
      {
        id: 'recursion_problems',
        title: 'Basic Recursion Problems',
        items: [
          { id: 'rec1', title: 'Print all subsequences', difficulty: 'medium', resourceArticle: 'Pick/Not Pick', resourceVideo: '', practice: '', notes: '' },
          { id: 'rec2', title: 'Subset Sum', difficulty: 'medium', resourceArticle: 'Backtracking', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'backtracking',
        title: 'Backtracking Problems',
        items: [
          { id: 'rec3', title: 'Combination Sum', difficulty: 'medium', resourceArticle: 'Recursive choices', resourceVideo: '', practice: '', notes: '' },
          { id: 'rec4', title: 'N Queens', difficulty: 'hard', resourceArticle: 'Backtracking + board checks', resourceVideo: '', practice: '', notes: '' },
          { id: 'rec5', title: 'Sudoku Solver', difficulty: 'hard', resourceArticle: 'Constraint recursion', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // ✅ LINKED LIST
  {
    id: 'linked_list',
    title: 'Linked List',
    groups: [
      {
        id: 'll_basic',
        title: 'Basic LL Problems',
        items: [
          { id: 'll1', title: 'Reverse Linked List', difficulty: 'easy', resourceArticle: 'Iterative + recursive', resourceVideo: '', practice: '', notes: '' },
          { id: 'll2', title: 'Detect Cycle', difficulty: 'medium', resourceArticle: 'Floyd cycle detection', resourceVideo: '', practice: '', notes: '' },
          { id: 'll3', title: 'Middle of Linked List', difficulty: 'easy', resourceArticle: 'Slow-fast pointer', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // 🌳 TREES
  {
    id: 'trees',
    title: 'Binary Trees & Binary Search Trees',
    groups: [
      {
        id: 'tree_traversals',
        title: 'Tree Traversals',
        items: [
          { id: 't1', title: 'Inorder Traversal', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't2', title: 'Preorder Traversal', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't3', title: 'Postorder Traversal', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't4', title: 'Level Order Traversal', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'tree_medium',
        title: 'Medium Tree Problems',
        items: [
          { id: 't5', title: 'Height of Binary Tree', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't6', title: 'Balanced Binary Tree', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't7', title: 'Diameter of Binary Tree', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't8', title: 'Maximum Path Sum', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'bst',
        title: 'Binary Search Tree',
        items: [
          { id: 't9', title: 'Search in BST', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't10', title: 'Insert into BST', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't11', title: 'Delete Node in BST', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 't12', title: 'Validate BST', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // 🌐 GRAPHS
  {
    id: 'graphs',
    title: 'Graph Algorithms',
    groups: [
      {
        id: 'graph_basics',
        title: 'Graph Traversals',
        items: [
          { id: 'g1', title: 'BFS Traversal', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'g2', title: 'DFS Traversal', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'graph_cycles',
        title: 'Cycle Detection',
        items: [
          { id: 'g3', title: 'Detect Cycle in Undirected Graph (BFS/DFS)', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'g4', title: 'Detect Cycle in Directed Graph', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'shortest_path',
        title: 'Shortest Path Algorithms',
        items: [
          { id: 'g5', title: 'Dijkstra Algorithm', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'g6', title: 'Bellman Ford Algorithm', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'g7', title: 'Floyd Warshall Algorithm', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'mst',
        title: 'Minimum Spanning Tree',
        items: [
          { id: 'g8', title: 'Prim’s Algorithm', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'g9', title: 'Kruskal’s Algorithm', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // 🧠 DYNAMIC PROGRAMMING
  {
    id: 'dp',
    title: 'Dynamic Programming',
    groups: [
      {
        id: 'dp_basics',
        title: 'DP Basics',
        items: [
          { id: 'dp1', title: 'Climbing Stairs', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'dp2', title: 'Frog Jump', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'dp_subsequence',
        title: 'Subsequence DP',
        items: [
          { id: 'dp3', title: 'Subset Sum Equal to Target', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'dp4', title: '0/1 Knapsack', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'dp5', title: 'Coin Change', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'dp_strings',
        title: 'DP on Strings',
        items: [
          { id: 'dp6', title: 'Longest Common Subsequence', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'dp7', title: 'Edit Distance', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'dp_advanced',
        title: 'Advanced DP',
        items: [
          { id: 'dp8', title: 'Matrix Chain Multiplication', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'dp9', title: 'Partition DP', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // 🎯 GREEDY
  {
    id: 'greedy',
    title: 'Greedy Algorithms',
    groups: [
      {
        id: 'greedy_basic',
        title: 'Greedy Basics',
        items: [
          { id: 'gr1', title: 'Assign Cookies', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'gr2', title: 'Activity Selection', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'greedy_medium',
        title: 'Medium Greedy',
        items: [
          { id: 'gr3', title: 'Job Sequencing Problem', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'gr4', title: 'Minimum Platforms', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // 🔍 BINARY SEARCH
  {
    id: 'binary_search',
    title: 'Binary Search',
    groups: [
      {
        id: 'bs_basic',
        title: 'Basic Binary Search',
        items: [
          { id: 'bs1', title: 'Binary Search', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'bs2', title: 'Lower Bound / Upper Bound', difficulty: 'easy', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'bs_advanced',
        title: 'Advanced Binary Search',
        items: [
          { id: 'bs3', title: 'Search in Rotated Sorted Array', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'bs4', title: 'Allocate Books', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'bs5', title: 'Aggressive Cows', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },

  // 🪙 HEAP / PRIORITY QUEUE
  {
    id: 'heap',
    title: 'Heap / Priority Queue',
    groups: [
      {
        id: 'heap_basic',
        title: 'Heap Basics',
        items: [
          { id: 'h1', title: 'Implement Min Heap', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'h2', title: 'Kth Largest Element', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
      {
        id: 'heap_advanced',
        title: 'Advanced Heap Problems',
        items: [
          { id: 'h3', title: 'Top K Frequent Elements', difficulty: 'medium', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
          { id: 'h4', title: 'Merge K Sorted Lists', difficulty: 'hard', resourceArticle: '', resourceVideo: '', practice: '', notes: '' },
        ],
      },
    ],
  },
];