import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import routes directly
import { authRoutes } from "./routes/auth.js";
import { medicalRecordRoutes } from "./routes/medicalRecords.js";
import { appointmentRoutes } from "./routes/appointments.js";
import { wardRoutes } from "./routes/wards.js";
import { pharmacyRoutes } from "./routes/pharmacy.js";
import { userRoutes } from "./routes/users.js";

console.log("🔧 Starting server initialization...");

// Load environment variables
dotenv.config();
console.log("✅ Environment variables loaded");

const app = express();
const PORT = process.env.PORT || 5000;

console.log("🔧 Setting up middleware...");

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

console.log("✅ Middleware setup complete");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/wards", wardRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/users", userRoutes);
console.log("✅ Routes imported and mounted");

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root route
app.get("/", (_req, res) => {
  res.json({
    message: "Smart Healthcare System API",
    version: "1.0.0",
    status: "running",
  });
});

console.log("✅ Route handlers setup complete");

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare";
    console.log(`🔧 Connecting to MongoDB...`);

    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoURI);

    console.log("✅ Connected to MongoDB successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    return false;
  }
};

// Start server
const startServer = async () => {
  try {
    console.log("🔧 Starting server...");
    const connected = await connectDB();

    if (!connected) {
      throw new Error("Failed to connect to MongoDB");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🏥 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Error handling
process.on("uncaughtException", (error) => {
  console.error("🛑 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🛑 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer().catch(console.error);
