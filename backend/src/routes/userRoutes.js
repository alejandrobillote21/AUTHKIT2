import express from "express";
import { getUser, loginUser, logoutUser, registerUser, updateUser, userLoginStatus } from "../controllers/auth/userController.js";
import { adminMiddleware, creatorMiddleware, protect } from "../middleware/authMiddleware.js";
import { deleteUser, getAllUsers } from "../controllers/auth/adminController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);

// Admin Route
router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);

// Get All Users
router.get("/users", protect, creatorMiddleware, getAllUsers)

// Login Status
router.get("/login-status", userLoginStatus);

export default router;
