// 1. Load environment variables first
require('dotenv').config();

// 2. Import core dependencies
const express = require('express');
const cors = require('cors');

// 3. Import config
const connectDB = require('./config/db');

// 4. Import route files
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const materialRoutes = require('./routes/materialRoutes');
const jobRoutes = require('./routes/jobRoutes');

// 5. Import and start cron job
const startCronJob = require('./utils/cronJob');

// Initialize Express app
const app = express();

// 6. Connect to MongoDB
connectDB();

// 7. Apply global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 8. Mount all routes under /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/jobs', jobRoutes);

// Dev routes
if (process.env.NODE_ENV !== 'production') {
  const devRoutes = require('./routes/devRoutes');
  app.use('/api/dev', devRoutes);
  console.log('Dev routes enabled — manual batch trigger available at POST /api/dev/trigger-batch');
}

// Health check route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'LMS Backend is running.' });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.', data: null });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error', data: null });
});

// 9. Start cron job
startCronJob();

// 10. Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app for testing
module.exports = app;
