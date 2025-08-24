import express from "express";
import { createApiKey, deleteApiKey, deleteAdmin } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/create-api-key", protectRoute, createApiKey);
router.post("/delete-api-key", protectRoute, deleteApiKey);
router.post("/delete-admin", protectRoute, deleteAdmin);

export default router;
