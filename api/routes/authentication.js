import express from "express";
import { createClient } from "@supabase/supabase-js";

import {
  loginUser,
  loginAdmin,
  createAdmin,
} from "../controllers/authentication.js";

const router = express.Router();

// Login endpoint for users
router.post("/user/login", loginUser);

// Admin login endpoint
router.post("/admin/login", loginAdmin);

// Create admin endpoint
router.post("/admin/create", createAdmin);

export default router;
