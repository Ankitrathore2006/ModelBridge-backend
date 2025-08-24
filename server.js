const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
import { clients } from "@clerk/clerk-sdk-node";
import { serve } from "inngest/express";
import { inngest } from "./config/inngest";

dotenv.config();
const app = express();
app.use(express.json());

connectDB();

// Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.NODE_ENV != "production") {
      app.listen(process.env.PORT, () => {
        console.log("Server started on port:", process.env.PORT);
      });
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
