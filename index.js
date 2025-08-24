import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { serve } from "inngest/express";

import { inngest, functions } from "./src/inngest/index.js";
import { connectDB } from "./src/lib/db.js";
import authRoutes from "./src/routes/auth.route.js";
import { validateClient, detectSafetyIssues, generateLLMResponse, performSafetyAction, logRequest } from "./src/inngest/functions.js";
import detectionRoutes from "./src/routes/detection.route.js";
import adminRoutes from "./src/routes/admin.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Commercial AI Safety API");
});


// Inngest endpoint
app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/v1/", detectionRoutes);
app.use("/api/admin/", adminRoutes);




// Normal routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log("🚀 Commercial AI Safety API Server running on PORT:" + PORT);
  console.log("📊 Inngest dashboard: http://localhost:" + PORT + "/api/inngest");
  console.log("🔍 Functions registered:", functions.length);
  console.log("💼 API endpoint: http://localhost:" + PORT + "/api/v1/chat");
  connectDB();
});

