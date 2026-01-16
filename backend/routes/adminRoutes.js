const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// ✅ Helper to safely attach routes only if controller exists
const safeRoute = (method, path, handlerName) => {
  if (typeof adminController[handlerName] === "function") {
    router[method](path, adminController[handlerName]);
  } else {
    console.warn(
      `⚠️ Missing adminController.${handlerName}, route [${method.toUpperCase()} ${path}] not attached`
    );
  }
};

// User management
safeRoute("get", "/users", "getAllUsers");
safeRoute("put", "/users/:id/role", "updateUserRole");
safeRoute("put", "/users/:id/status", "updateUserStatus");
safeRoute("put", "/users/:id/ban", "banUser");
safeRoute("put", "/users/:id/unban", "unbanUser");
safeRoute("delete", "/users/:id", "deleteUser");

// Content moderation
safeRoute("get", "/flagged", "getFlaggedContent");
safeRoute("delete", "/reviews/:id", "removeFlaggedReview");

// Club management
safeRoute("get", "/clubs", "getAllClubs");
safeRoute("put", "/clubs/:id/status", "updateClubStatus");
safeRoute("put", "/clubs/:id/approve", "approveClub");
safeRoute("put", "/clubs/:id/reject", "rejectClub");
safeRoute("delete", "/clubs/:id", "deleteClub");

// Admin dashboard
safeRoute("get", "/stats", "getAdminStats");
safeRoute("get", "/logs", "getSystemLogs");

// Export functionality
safeRoute("get", "/export/users", "exportUsers");
safeRoute("get", "/export/clubs", "exportClubs");

module.exports = router;
