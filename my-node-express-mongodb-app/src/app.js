const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/index");

// Create the Express application that serves both the API and the frontend files.
const app = express();

// Allow browser requests to reach the API even when frontend/backend origins differ.
app.use(
  cors({
    origin: "*",
  }),
);

// Parse JSON and form bodies sent by the frontend.
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Expose the root project folder so static HTML/CSS/JS files can be served directly.
const frontendRoot = path.resolve(__dirname, "../../");
app.use(express.static(frontendRoot, { extensions: ["html"] }));

// Default route for the main storefront page.
app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendRoot, "index.html"));
});

// Simple health-check endpoint used by the admin page and debugging.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "API is running" });
});

// Mount all order-related API routes under /api.
app.use("/api", routes);

module.exports = app;
