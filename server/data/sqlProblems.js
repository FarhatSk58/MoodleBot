// Server-side copy of the SQL problem list used for progress calculations.
const SQL_PROBLEMS = [
  // SELECT BASICS
  { id: 'sql_001', title: 'Select All Columns', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/recyclable-and-low-fat-products/' },
  { id: 'sql_002', title: 'Find Customer Referee', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/find-customer-referee/' },
  { id: 'sql_003', title: 'Big Countries', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/big-countries/' },
  { id: 'sql_004', title: 'Article Views', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/article-views-i/' },
  { id: 'sql_005', title: 'Invalid Tweets', topic: 'SELECT Basics', difficulty: 'easy', url: 'https://leetcode.com/problems/invalid-tweets/' },

  // JOINS
  { id: 'sql_006', title: 'Replace Employee ID', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/' },
  { id: 'sql_007', title: 'Product Sales Analysis', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/product-sales-analysis-i/' },
  { id: 'sql_008', title: 'Customer Who Visited', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/' },
  { id: 'sql_009', title: 'Rising Temperature', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/rising-temperature/' },
  { id: 'sql_010', title: 'Average Time Process', topic: 'JOINs', difficulty: 'medium', url: 'https://leetcode.com/problems/average-time-of-process-per-machine/' },
  { id: 'sql_011', title: 'Employee Bonus', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/employee-bonus/' },
  { id: 'sql_012', title: 'Students and Examinations', topic: 'JOINs', difficulty: 'easy', url: 'https://leetcode.com/problems/students-and-examinations/' },
  { id: 'sql_013', title: 'Managers with 5 Reports', topic: 'JOINs', difficulty: 'medium', url: 'https://leetcode.com/problems/managers-with-at-least-5-direct-reports/' },
  { id: 'sql_014', title: 'Confirmation Rate', topic: 'JOINs', difficulty: 'medium', url: 'https://leetcode.com/problems/confirmation-rate/' },

  // AGGREGATE FUNCTIONS
  { id: 'sql_015', title: 'Not Boring Movies', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/not-boring-movies/' },
  { id: 'sql_016', title: 'Average Selling Price', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/average-selling-price/' },
  { id: 'sql_017', title: 'Project Employees I', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/project-employees-i/' },
  { id: 'sql_018', title: 'Percentage of Users', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/percentage-of-users-attended-a-contest/' },
  { id: 'sql_019', title: 'Queries Quality', topic: 'Aggregate Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/queries-quality-and-percentage/' },
  { id: 'sql_020', title: 'Monthly Transactions', topic: 'Aggregate Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/monthly-transactions-i/' },

  // SORTING AND GROUPING
  { id: 'sql_021', title: 'Count Salary Categories', topic: 'Sorting & Grouping', difficulty: 'medium', url: 'https://leetcode.com/problems/count-salary-categories/' },
  { id: 'sql_022', title: 'Last Person to Fit Bus', topic: 'Sorting & Grouping', difficulty: 'medium', url: 'https://leetcode.com/problems/last-person-to-fit-in-the-bus/' },
  { id: 'sql_023', title: 'Food Delivery', topic: 'Sorting & Grouping', difficulty: 'medium', url: 'https://leetcode.com/problems/immediate-food-delivery-ii/' },

  // SUBQUERIES
  { id: 'sql_024', title: 'Employees Whose Manager Left', topic: 'Subqueries', difficulty: 'easy', url: 'https://leetcode.com/problems/employees-whose-manager-left-the-company/' },
  { id: 'sql_025', title: 'Exchange Seats', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/exchange-seats/' },
  { id: 'sql_026', title: 'Movie Rating', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/movie-rating/' },
  { id: 'sql_027', title: 'Restaurant Growth', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/restaurant-growth/' },
  { id: 'sql_028', title: 'Friend Requests II', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/friend-requests-ii-who-has-the-most-friends/' },
  { id: 'sql_029', title: 'Investments in 2016', topic: 'Subqueries', difficulty: 'medium', url: 'https://leetcode.com/problems/investments-in-2016/' },
  { id: 'sql_030', title: 'Department Top Three', topic: 'Subqueries', difficulty: 'hard', url: 'https://leetcode.com/problems/department-top-three-salaries/' },

  // WINDOW FUNCTIONS
  { id: 'sql_031', title: 'Rank Scores', topic: 'Window Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/rank-scores/' },
  { id: 'sql_032', title: 'Consecutive Numbers', topic: 'Window Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/consecutive-numbers/' },
  { id: 'sql_033', title: 'Department Highest Salary', topic: 'Window Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/department-highest-salary/' },
  { id: 'sql_034', title: 'Delete Duplicate Emails', topic: 'Window Functions', difficulty: 'easy', url: 'https://leetcode.com/problems/delete-duplicate-emails/' },
  { id: 'sql_035', title: 'Second Highest Salary', topic: 'Window Functions', difficulty: 'medium', url: 'https://leetcode.com/problems/second-highest-salary/' },
];

module.exports = { SQL_PROBLEMS };
