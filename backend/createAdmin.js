require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user/User');

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    const existing = await User.findOne({
      email: 'admin@example.com',
    });

    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'super-admin',
      isActive: true,
    });

    console.log('=================================');
    console.log('Admin Created Successfully');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
    console.log('=================================');

    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });