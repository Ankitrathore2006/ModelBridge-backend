const User = require("../models/User");
const Usage = require("../models/Usage");

exports.getOverview = async (req, res) => {
  try {
    const users = await User.find();
    const usage = await Usage.aggregate([
      { $group: { _id: "$category", total: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers: users.length,
      usageStats: usage
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
