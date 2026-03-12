require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// Read the listening port from the environment, with a local fallback.
const PORT = Number(process.env.PORT || 3000);

// Starts the web server and tries to establish the database connection first.
async function startServer() {
  let dbConnected = false;

  try {
    // If MongoDB is reachable, the app runs in normal mode.
    await connectDB();
    dbConnected = true;
  } catch (error) {
    // The frontend can still be served even if the database is currently offline.
    console.error("⚠️ MongoDB connection failed:", error.message);
    console.error("⚠️ Starting server in degraded mode (no database).");
  }

  // Expose DB availability to the app in case future logic needs it.
  app.locals.dbConnected = dbConnected;
  app.listen(PORT, () => {
    const modeLabel = dbConnected ? "DB connected" : "degraded mode";
    console.log(`🚀 Server running at http://localhost:${PORT} (${modeLabel})`);
  });
}

// Kick off application startup as soon as this file is executed.
startServer();
