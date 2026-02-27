const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes/index");

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const frontendRoot = path.resolve(__dirname, "../../");
app.use(express.static(frontendRoot, { extensions: ["html"] }));

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendRoot, "index.html"));
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.use("/api", routes);

module.exports = app;
