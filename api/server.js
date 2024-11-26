import express from "express";
import cors from "cors";
import logger from "./middleware/logger.js";
import authenticationRouter from "./routes/authentication.js";
import userManagementRouter from "./routes/user-management.js";
import boxSelectionRouter from "./routes/box-selection.js";

const app = express();

app.use(logger);
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authenticationRouter);
app.use("/user-management", userManagementRouter);
app.use("/box-selection", boxSelectionRouter);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
