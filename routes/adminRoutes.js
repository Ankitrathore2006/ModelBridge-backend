const express = require("express");
const router = express.Router();
const { getOverview } = require("../controllers/adminController");
const requireAuth = require("../middleware/auth");

router.get("/overview", requireAuth, getOverview);

module.exports = router;
