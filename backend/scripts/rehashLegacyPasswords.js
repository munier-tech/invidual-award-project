import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined. Set the backend environment first.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
      const password = String(user.password || '');
      const isHashed = password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$');

      if (isHashed) {
        skipped += 1;
        continue;
      }

      user.password = await bcrypt.hash(password, 12);
      await user.save();
      migrated += 1;
      console.log(`Rehashed password for ${user.email}`);
    }

    console.log(`Migration complete. Rehashed: ${migrated}, already hashed: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('Password rehash migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

run();
