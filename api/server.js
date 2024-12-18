import express from "express";
import cors from "cors";
import logger from "./middleware/logger.js";
import authenticationRouter from "./routes/authentication.js";
import userManagementRouter from "./routes/user-management.js";
import boxSelectionRouter from "./routes/box-selection.js";

const app = express();

// Configure CORS with specific options
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://mystery-box-drab.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
      "https://cny.kakikaki.shop",
    ];
    console.log("Incoming request from origin:", origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("No origin provided");
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log("Origin allowed:", origin);
      callback(null, true);
    } else {
      console.log("Origin not allowed:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
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
  preflightContinue: false,
};

// First apply CORS
app.use(cors(corsOptions));

// Then apply express.json() for body parsing
app.use(express.json());

// Then apply logging middleware
app.use((req, res, next) => {
  console.log("--------------------");
  console.log("New Request:");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));

  // Log the raw body
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    console.log("Raw Body:", req.body);
    try {
      console.log("Stringified Body:", JSON.stringify(req.body));
    } catch (e) {
      console.log("Could not stringify body:", e.message);
    }
  }

  console.log("Origin:", req.headers.origin);
  console.log("--------------------");

  // Add response logging
  const oldJson = res.json;
  res.json = function (data) {
    console.log("Response:", JSON.stringify(data, null, 2));
    return oldJson.apply(res, arguments);
  };

  next();
});

app.use(logger);

// Add OPTIONS handling for preflight requests
app.options("*", cors(corsOptions));

app.get("/", async (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Apply routes
app.use("/api/auth", authenticationRouter);
app.use("/api/user-management", userManagementRouter);
app.use("/api/box-selection", boxSelectionRouter);

// 404 handler
app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.url);
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error occurred:");
  console.error("URL:", req.url);
  console.error("Method:", req.method);
  console.error("Headers:", req.headers);
  console.error("Body:", req.body);
  console.error("Error:", err);
  console.error("Stack:", err.stack);

  // If it's a CORS error, log it specifically
  if (err.message === "Not allowed by CORS") {
    console.error("CORS Error - Origin not allowed:", req.headers.origin);
    return res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed",
      origin: req.headers.origin,
    });
  }

  // If it's a body parsing error
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON",
      message: "The request body contains invalid JSON",
    });
  }

  // Check for Supabase errors
  if (err.message && err.message.includes("supabase")) {
    console.error("Supabase Error:", err);
    return res.status(500).json({
      error: "Database Error",
      message: "Error connecting to the database",
    });
  }

  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong!",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
