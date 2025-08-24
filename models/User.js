const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, 
  email: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  organization: { type: String, required: true },
  plan: { type: String, enum: ["free", "pro"], default: "free" }
});

module.exports = mongoose.model("User", userSchema);
