const mongoose = require('mongoose');

const jobAnnouncementSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  message: {
    type: String,
    required: [true, 'Announcement message is required'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('JobAnnouncement', jobAnnouncementSchema);
