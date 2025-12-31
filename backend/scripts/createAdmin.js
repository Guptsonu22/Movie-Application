const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const readline = require('readline');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movieapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      // Update to admin
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`\nUser ${existingUser.email} is now an admin.`);
    } else {
      // Create new admin user
      const admin = await User.create({
        username,
        email,
        password,
        role: 'admin',
      });
      console.log(`\nAdmin user created successfully: ${admin.email}`);
    }

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  }
};

createAdmin();

