import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { serve } from "inngest/express";

import { inngest, functions } from "./src/inngest/index.js";
import { connectDB } from "./src/lib/db.js";
import authRoutes from "./src/routes/auth.route.js";
import adminRoutes from "./src/routes/admin.routes.js";
import {
  validateClient,
  detectSafetyIssues,
  generateLLMResponse,
  performSafetyAction,
  logRequest
} from "./src/inngest/functions.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Root
app.get("/", (req, res) => {
  res.send("Commercial AI Safety API");
});

// Inngest endpoint
app.use("/api/inngest", serve({ client: inngest, functions }));

// ============================================================
// COMMERCIAL API ENDPOINT
// ============================================================
app.post("/api/v1/chat", async (req, res) => {
  try {
    const {
      text,
      apiKey,
      clientId,
      conversationId = `conv_${Date.now()}`,
      context = "general"
    } = req.body || {};

    if (!text || !apiKey || !clientId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: text, apiKey, clientId",
        timestamp: new Date().toISOString()
      });
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // 1. Validate client
    const clientValidation = await validateClient(apiKey, clientId);
    if (!clientValidation.valid) {
      await logRequest({
        requestId,
        clientId,
        conversationId,
        text,
        context,
        safetyResult: { error: "Invalid API key or client" },
        action: "ERROR",
        response: "Authentication failed",
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      });

      return res.status(401).json({
        success: false,
        request_id: requestId,
        status: "error",
        error: "Invalid API key or client",
        timestamp: new Date().toISOString()
      });
    }

    // 2. Safety detection
    const safetyResult = await detectSafetyIssues(text);

    if (safetyResult.is_safe) {
      // ✅ Safe query
      const llmResponse = await generateLLMResponse(text, clientValidation.client_config);

      await logRequest({
        requestId,
        clientId,
        conversationId,
        text,
        context,
        safetyResult,
        action: "ALLOW",
        response: llmResponse,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      });

      return res.json({
        success: true,
        request_id: requestId,
        status: "success",
        is_safe: true,
        safety_score: safetyResult.risk_score,
        category: safetyResult.category,
        severity: safetyResult.severity,
        response: llmResponse,
        timestamp: new Date().toISOString()
      });
    } else {
      // ❌ Unsafe query
      const actionResult = await performSafetyAction(safetyResult, clientValidation.client_config);

      await logRequest({
        requestId,
        clientId,
        conversationId,
        text,
        context,
        safetyResult,
        action: actionResult.action,
        response: actionResult.message,
        timestamp: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime
      });

      return res.json({
        success: false,
        request_id: requestId,
        status: "blocked",
        is_safe: false,
        safety_score: safetyResult.risk_score,
        category: safetyResult.category,
        severity: safetyResult.severity,
        action: actionResult.action,
        message: actionResult.message,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);

    try {
      await logRequest({
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientId: req.body?.clientId || "unknown",
        conversationId: req.body?.conversationId || "unknown",
        text: req.body?.text || "unknown",
        context: req.body?.context || "general",
        safetyResult: { error: error.message },
        action: "ERROR",
        response: "Processing failed",
        timestamp: new Date().toISOString(),
        processingTimeMs: 0
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// ADMIN & MONITORING ENDPOINTS
// ============================================================

app.get("/api/v1/health", async (req, res) => {
  let dbStatus = "disconnected";
  if (mongoose.connection.readyState === 1) dbStatus = "connected";

  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      inngest: "running",
      database: dbStatus,
      api: "active"
    }
  });
});

app.get("/api/v1/stats", (req, res) => {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      system_status: "healthy",
      functions_registered: Array.isArray(functions)
        ? functions.length
        : Object.keys(functions).length,
      api_version: "v1",
      endpoints: {
        chat: "/api/v1/chat",
        health: "/api/health",
        stats: "/api/stats",
        inngest: "/api/inngest"
      },
      features: {
        safety_detection: true,
        llm_response: true,
        request_logging: true,
        audit_trail: true
      },
      detection_categories: [
        "Self-harm",
        "Violence",
        "Fraud",
        "Phishing",
        "Harassment",
        "PII",
        "Malware",
        "Extremism"
      ]
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({
      error: "Error getting stats",
      message: error.message
    });
  }
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Commercial AI Safety API running on http://localhost:${PORT}`);
  console.log(`📊 Inngest dashboard: http://localhost:${PORT}/api/inngest`);
  console.log(
    `🔍 Functions registered: ${
      Array.isArray(functions) ? functions.length : Object.keys(functions).length
    }`
  );
  connectDB();
});
