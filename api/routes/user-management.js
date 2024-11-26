import {
  createUser,
  deleteUser,
  updateUserCredits,
  getUser,
  getAllUsers,
  searchUsersByUsername,
} from "../controllers/user-management.js";
import express from "express";

const router = express.Router();

router.post("/admin/create-user", createUser);
router.delete("/admin/delete-user", deleteUser);
router.put("/admin/update-user-credits", updateUserCredits);
router.post("/admin/get-user", getUser);
router.get("/admin/get-all-users", getAllUsers);
router.post("/admin/search-users-by-username", searchUsersByUsername);
export default router;
