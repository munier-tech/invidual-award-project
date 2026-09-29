// lib/mongodb.js - UPDATED VERSION
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGO_URI is undefined!');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
  throw new Error('Please define MONGO_URI in your environment variables');
}

console.log('🔍 Checking MongoDB URI format...');
console.log('URI starts with:', MONGODB_URI.substring(0, 50) + '...');

// Check if URI has proper format
if (!MONGODB_URI.startsWith('mongodb+srv://') && !MONGODB_URI.startsWith('mongodb://')) {
  console.error('❌ Invalid MongoDB URI format. Should start with mongodb+srv:// or mongodb://');
  throw new Error('Invalid MongoDB URI format');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // Log current connection state
  console.log('📊 Current mongoose connection state:', mongoose.connection.readyState);
  console.log('🔗 Connection cached?', !!cached.conn);
  
  // Return cached connection if exists
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  // Create new connection if doesn't exist
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 15000, // Increased to 15 seconds
      socketTimeoutMS: 45000,
      family: 4,
      connectTimeoutMS: 15000,
      retryWrites: true,
      w: 'majority',
    };

    console.log('🔄 Creating new MongoDB connection...');
    console.log('📝 Connection options:', JSON.stringify(opts, null, 2));
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected successfully');
        console.log('📊 Connection readyState:', mongooseInstance.connection.readyState);
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error details:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        
        // Check for specific error types
        if (error.name === 'MongooseServerSelectionError') {
          console.error('🔍 This is a server selection error. Possible causes:');
          console.error('- Network/firewall issues');
          console.error('- Incorrect connection string');
          console.error('- MongoDB Atlas cluster is paused or down');
        }
        
        cached.promise = null; // Reset on error
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;