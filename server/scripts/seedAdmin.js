/**
 * seedAdmin.js — Run once to create the admin user in MongoDB.
 * Usage: node scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/identity/User');

const ADMIN = {
  name: 'Admin',
  email: `admin@${process.env.COLLEGE_EMAIL_DOMAIN || 'pvpsit.ac.in'}`,
  password: 'Admin@1234',
  role: 'admin',
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log(`⚠️  Admin already exists: ${ADMIN.email}`);
    process.exit(0);
  }

  await User.create(ADMIN);
  console.log('🎉 Admin user created!');
  console.log(`   Email   : ${ADMIN.email}`);
  console.log(`   Password: ${ADMIN.password}`);
  console.log('\n👉 Change the password after first login!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
