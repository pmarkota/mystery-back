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
    "https://mystery-box-drab.vercel.app/",
    ...(process.env.NODE_ENV !== "production"
      ? ["http://localhost:3000", "http://localhost:5173"]
      : []),
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(logger);
app.use(cors(corsOptions));
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
