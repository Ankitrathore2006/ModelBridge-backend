import ApiKey from "../models/apiKey.model.js";
import Logs from "../models/log.model.js";
import User from "../models/user.model.js";

// Create a new API key
export const createApiKey = async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
console.log(userId,name);

    // Generate a random API key
    const key = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);

    const newApiKey = await ApiKey.create({ name, key, createdBy: userId });
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

export const getAllApiKeys = async (req, res) => {
    try {
       
            const apiKeys = await ApiKey.find({ createdBy: userId });

  
      if (!apiKeys || apiKeys.length === 0) {
        return res.status(404).json({ message: "No API keys found for this user" });
      }
  
      res.status(200).json(apiKeys);
    } catch (error) {
      res.status(500).json({ message: "Error fetching API keys", error });
    }
  };
export const getApiKeys = async (req, res) => {
    try {
       
            const { userId } = req.body;
            if (!userId) return res.status(400).json({ message: "User ID is required" });

            const apiKeys = await ApiKey.find({ createdBy: userId });

  
      if (!apiKeys || apiKeys.length === 0) {
        return res.status(404).json({ message: "No API keys found for this user" });
      }
  
      res.status(200).json(apiKeys);
    } catch (error) {
      res.status(500).json({ message: "Error fetching API keys", error });
    }
  };

  
// ✅ Get logs for a specific user by userId
export const getLogsById = async (req, res) => {
    try {
      const { userId } = req.body; // you might want to use req.params if it's from URL
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      const logs = await Logs.find({ client_id: userId });
  
      if (!logs || logs.length === 0) {
        return res.status(404).json({ message: "No logs found for this user" });
      }
  
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching logs", error: error.message });
    }
  };
  
  // ✅ Get all logs
  export const getLogs = async (req, res) => {
    try {
      const logs = await Logs.find();
  
      if (!logs || logs.length === 0) {
        return res.status(404).json({ message: "No logs found" });
      }
  
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching logs", error: error.message });
    }
  };
  