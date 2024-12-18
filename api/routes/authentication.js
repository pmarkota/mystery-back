import express from "express";
import { createClient } from "@supabase/supabase-js";

import {
  loginUser,
  loginAdmin,
  createAdmin,
} from "../controllers/authentication.js";

const router = express.Router();

// Wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Login endpoint for users
router.post("/user/login", asyncHandler(loginUser));

// Admin login endpoint
router.post("/admin/login", asyncHandler(loginAdmin));

// Create admin endpoint
router.post("/admin/create", asyncHandler(createAdmin));

export default router;
