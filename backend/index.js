import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose"; // Import mongoose directly
import dns from "dns";
import AuthRouter from "./routes/authRoute.js";
import TeacherRouter from "./routes/teacherRoute.js";
import StudentsRouter from "./routes/studentsRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js";
import classRouter from "./routes/classRoute.js";
import healthRouter from "./routes/healthRouter.js";
import examRouter from "./routes/examRouter.js";
import subjectsRouter from "./routes/subjectsRoute.js";
import disciplineRouter from "./routes/disciplineRoute.js";
import teachersAttendanceRouter from "./routes/teachersAttendanceRoute.js";
import financeRouter from "./routes/financeRoute.js";
import feeRouter from "./routes/feeRoute.js";
import familyFeeRouter from "./routes/familyFeeRoute.js";
import salaryRouter from "./routes/salaryRoute.js";
import DailyQuranRouter from "./routes/DailyQuranSession.js";
import halaqaRouter from "./routes/halaqaRoute.js";
import lessonRecordRouter from "./routes/lessonRecordRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS setup - permit local development hosts and production frontend
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV === "production") {
      const allowed = process.env.CORS_ORIGIN || "https://your-school-app.vercel.app";
      return callback(null, origin === allowed ? true : new Error(`CORS policy does not allow access from ${origin}`));
    }

    // In development, allow all origins to avoid localhost/127.0.0.1 mismatches.
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());

// Request logging - EXACTLY like working project
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// DATABASE CONNECTION - EXACTLY like working project
let isConnected = false;

function configureSrvDns() {
  const uri = process.env.MONGO_URI;
  if (uri?.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
      console.log('🔧 Configured public DNS servers for SRV resolution: 1.1.1.1, 8.8.8.8');
    } catch (err) {
      console.warn('⚠️ Failed to configure custom DNS servers:', err.message);
    }
  }
}

async function connectDB() {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  const MONGODB_URI = process.env.MONGO_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define MONGO_URI in your environment variables');
  }

  configureSrvDns();

  console.log('🔄 Connecting to MongoDB...');
  
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to DB');
      isConnected = true;
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from DB');
      isConnected = false;
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.code,
    });
    if (error.code === 'ECONNREFUSED' && error.message.includes('querySrv')) {
      console.error('💡 DNS SRV lookup failed. Ensure your network allows DNS SRV resolution or try a DNS server with SRV support.');
    }
    throw error;
  }
}

// CRITICAL: Per-request DB connection middleware - EXACTLY like working project
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Routes
app.use("/api/auth", AuthRouter);
app.use("/api/teachers", TeacherRouter);
app.use("/api/students", StudentsRouter);
app.use("/api/classes", classRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/health", healthRouter);
app.use("/api/exams", examRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/teachersAttendance", teachersAttendanceRouter);
app.use("/api/discipline", disciplineRouter);
app.use("/api/finance", financeRouter);
app.use("/api/fees", feeRouter);
app.use("/api/family-fees", familyFeeRouter);
app.use("/api/salaries", salaryRouter);
app.use("/api/halaqas", halaqaRouter);
app.use("/api/lesson-records", lessonRecordRouter);
app.use("/api/dailyQuran", DailyQuranRouter);

// Diagnostics endpoint - EXACTLY like working project
app.get("/api", (_req, res) => {
  res.json({
    message: "School Management System API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoConnected: mongoose.connection.readyState === 1,
    mongoState: mongoose.connection.readyState,
    cors: {
      allowedOrigins: corsOptions.origin,
      credentials: corsOptions.credentials,
    },
  });
});

// Health check endpoint - SIMPLE
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Something went wrong",
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Only start HTTP server locally (Vercel sets VERCEL=1)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(
      `CORS Origin: ${
        process.env.NODE_ENV === "production"
          ? process.env.CORS_ORIGIN || "https://your-school-app.vercel.app"
          : "http://localhost:5173"
      }`
    );
  });
}

export default app;