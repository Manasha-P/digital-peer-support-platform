require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('../models/User');

  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log('⚠️  Admin already exists:', process.env.ADMIN_EMAIL);
    process.exit(0);
  }

  await User.create({
    name: 'Platform Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
    isApproved: true,
    isActive: true,
  });

  console.log('👑 Admin created!');
  console.log('   Email:   ', process.env.ADMIN_EMAIL);
  console.log('   Password:', process.env.ADMIN_PASSWORD);
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });