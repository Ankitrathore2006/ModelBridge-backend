const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/userController");
const requireAuth = require("../middleware/auth");

router.get("/dashboard", requireAuth, getDashboard);

module.exports = router;
