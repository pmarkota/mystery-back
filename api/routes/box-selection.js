import {
  getBoxes,
  getBox,
  submitSelectedBoxes,
  setAllBoxesToUnselected,
  setBoxColor,
  getBoxColor,
} from "../controllers/box-selection.js";
import express from "express";
import { testEmail } from "../utils/emailService.js";

const router = express.Router();

router.get("/boxes", getBoxes);
router.get("/box", getBox);
router.post("/submit-selected-boxes", submitSelectedBoxes);
router.put("/set-all-boxes-to-unselected", setAllBoxesToUnselected);
router.put("/admin/set-box-color", setBoxColor);
router.get("/box-color", getBoxColor);
router.get("/test-email", async (req, res) => {
  try {
    await testEmail();
    res.json({ message: "Test email sent! Check the console for details." });
  } catch (error) {
    res.status(500).json({ error: "Failed to send test email" });
  }
});

export default router;
