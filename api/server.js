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

app.use((req, res) => {
  res.status(404).json({ 
    error: "Not Found",
    message: "The requested resource does not exist" 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: "Something went wrong!" 
  });
});

export default app;
