import ApiKey from "../models/apiKey.model.js";
import User from "../models/user.model.js";

// Create a new API key
export const createApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    // Generate a random API key
    const key = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);

    const newApiKey = await ApiKey.create({ name, key });
    res.status(201).json({ message: "API key created", key: newApiKey.key });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an existing API key
export const deleteApiKey = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ message: "API key is required" });

    const deleted = await ApiKey.findOneAndDelete({ key });
    if (!deleted) return res.status(404).json({ message: "API key not found" });

    res.status(200).json({ message: "API key deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an admin by ID
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId) return res.status(400).json({ message: "Admin ID is required" });

    const deleted = await User.findByIdAndDelete(adminId);
    if (!deleted) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
