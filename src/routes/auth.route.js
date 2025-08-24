import express from "express";
import { checkAuthAdmin, adminSignup, adminLogin, adminLogout ,checkAuth, login, logout, signup } from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth);

router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);
router.post("/admin/logout", adminLogout);

router.get("/admin/check", protectRoute, checkAuthAdmin);

export default router;
