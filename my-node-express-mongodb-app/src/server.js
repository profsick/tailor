require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  let dbConnected = false;

  try {
    await connectDB();
    dbConnected = true;
  } catch (error) {
    console.error("⚠️ MongoDB connection failed:", error.message);
    console.error("⚠️ Starting server in degraded mode (no database).");
  }

  app.locals.dbConnected = dbConnected;
  app.listen(PORT, () => {
    const modeLabel = dbConnected ? "DB connected" : "degraded mode";
    console.log(`🚀 Server running at http://localhost:${PORT} (${modeLabel})`);
  });
}

startServer();
