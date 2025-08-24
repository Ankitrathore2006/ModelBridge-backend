import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    request_id: {
      type: String,
      required: true,
      unique: true,
    },
    client_id: {
      type: String,
      required: true,
    },
    conversation_id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    context: {
      type: String,
      default: "general",
    },
    safety_result: {
      is_safe: Boolean,
      category: String,
      severity: String,
      risk_score: Number,
      detection_method: String,
      flagged_keywords: [String],
      rule_id: String,
      confidence: Number,
      error: String,
    },
    action: {
      type: String,
      enum: ["ALLOW", "WARN", "BLOCK", "ESC", "ERROR"],
      required: true,
    },
    response: {
      content: String,
      model: String,
      generated_at: String,
      error: String,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    logged_at: {
      type: Date,
      default: Date.now,
    },
    ip_address: {
      type: String,
      default: "127.0.0.1",
    },
    user_agent: {
      type: String,
      default: "API-Client/1.0",
    },
    processing_time_ms: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
logSchema.index({ request_id: 1 });
logSchema.index({ client_id: 1 });
logSchema.index({ conversation_id: 1 });
logSchema.index({ timestamp: 1 });
logSchema.index({ action: 1 });
logSchema.index({ "safety_result.category": 1 });
logSchema.index({ "safety_result.risk_score": 1 });

const Log = mongoose.model("Log", logSchema);

export default Log;
