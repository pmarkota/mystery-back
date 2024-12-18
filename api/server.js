import express from "express";
import cors from "cors";
import logger from "./middleware/logger.js";
import authenticationRouter from "./routes/authentication.js";
import userManagementRouter from "./routes/user-management.js";
import boxSelectionRouter from "./routes/box-selection.js";

const app = express();

// Configure CORS with specific options
const corsOptions = {
  origin: [
    "https://mystery-box-drab.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://cny.kakikaki.shop",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "X-Requested-With",
    "Accept",
    "Accept-Version",
    "Content-Length",
    "Content-MD5",
    "Date",
    "X-Api-Version",
  ],
  exposedHeaders: [
    "Content-Length",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));
app.use(logger);
app.use(express.json());

// Add OPTIONS handling for preflight requests
app.options("*", cors(corsOptions));

app.get("/", async (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

app.use("/api/auth", authenticationRouter);
app.use("/api/user-management", userManagementRouter);
app.use("/api/box-selection", boxSelectionRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong!",
  });
});

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
