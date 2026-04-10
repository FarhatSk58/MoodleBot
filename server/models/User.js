const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          const domain = process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu';
          return v.endsWith(`@${domain}`);
        },
        message: (props) =>
          `${props.value} is not a valid college email address`,
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      required: [true, 'Role is required'],
    },
    department: {
      type: String,
      enum: ['CSE-AIML', 'CSE-DS'],
      required: function () {
        return this.role === 'student' || this.role === 'teacher';
      },
    },
    year: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
    },
    semester: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook: hash password before saving
// Mongoose 7+ async middleware does NOT receive `next`.
// Errors propagate automatically via the returned promise.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method: compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
