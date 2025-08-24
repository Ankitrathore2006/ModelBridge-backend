const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requests: { type: Number, default: 0 },
  category: { type: String, enum: ["normal", "spam"], default: "normal" },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Usage", usageSchema);
