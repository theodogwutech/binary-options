import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const updatePassword = async (email: string, newPassword: string) => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!mongoUri) {
      console.error('MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection not established');
      process.exit(1);
    }

    const result = await db
      .collection('users')
      .updateOne({ email: email.toLowerCase() }, { $set: { password: hashedPassword } });

    if (result.matchedCount === 0) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Password for ${email} has been updated successfully!`);
    console.log(`New password: ${newPassword}`);
    console.log(`You can now login with this password.`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
};

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: ts-node updatePassword.ts <email> <newPassword>');
  process.exit(1);
}

updatePassword(email, newPassword);
