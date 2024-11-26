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
  res.json({ status: "ok", message: "API is running" });
});

app.use("/api/auth", authenticationRouter);
app.use("/api/user-management", userManagementRouter);
app.use("/api/box-selection", boxSelectionRouter);

app.use((req, res) => {
  res.status(404).json({ 
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}` 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: "Something went wrong!" 
  });
});

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
