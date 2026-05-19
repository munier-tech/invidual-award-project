import mongoose from "mongoose"
import dns from "dns"

function configureSrvDns() {
  const uri = process.env.MONGO_URI
  if (uri?.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['1.1.1.1', '8.8.8.8'])
      console.log('🔧 Configured public DNS servers for SRV resolution: 1.1.1.1, 8.8.8.8')
    } catch (err) {
      console.warn('⚠️ Failed to configure custom DNS servers:', err.message)
    }
  }
}

export const connectDb = async () => {
  try {
    configureSrvDns()
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected')
      return
    }
    
    // Connect with supported options only
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    })
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected')
    })
    
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB reconnected')
    })
    
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    // Never exit in production/Vercel
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      console.log('💥 Exiting in development mode due to DB failure')
      process.exit(1)
    } else {
      console.log('🔄 Continuing in production despite DB failure')
    }
  }
}