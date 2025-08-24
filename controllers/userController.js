const ApiKey = require("../models/ApiKey");
const Usage = require("../models/Usage");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const usage = await Usage.find({ userId });
    res.json({ success: true, usage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
