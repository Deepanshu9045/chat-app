const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedUsers = async () => {
  try {
    await User.deleteMany();
    
    const users = [
      {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'password123',
        profileImage: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        profileImage: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@example.com',
        password: 'password123',
        profileImage: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
      }
    ];

    await User.insertMany(users);
    console.log('Seed Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();
