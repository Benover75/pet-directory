// index.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });

const { sequelize } = require("./config/db");       // Sequelize instance
const redisClient = require("./config/redis");       // Redis client
const db = require("./models");

// Middlewares
const latencyMiddleware = require("./middlewares/latencyMiddleware");

// Routes
const authRoutes = require("./routes/auth");
const businessRoutes = require("./routes/businesses");
const reviewRoutes = require("./routes/reviews");
const serviceRoutes = require("./routes/services");

// Swagger
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

// Express app
const app = express();

// Security & CORS
app.use(helmet());
app.use(cors());

// Parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Latency middleware
app.use(latencyMiddleware);

// Swagger docs
const swaggerDocument = YAML.load("./swagger.yml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/businesses", businessRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/services", serviceRoutes);

// Health check
app.get("/health", async (req, res) => {
  let dbStatus = "down";
  let redisStatus = "down";

  try {
    await sequelize.authenticate();
    dbStatus = "ok";
  } catch (_) {}

  try {
    const ping = await redisClient.ping();
    if (ping === "PONG") redisStatus = "ok";
  } catch (_) {}

  res.json({
    status: dbStatus === "ok" && redisStatus === "ok" ? "ok" : "degraded",
    database: dbStatus,
    redis: redisStatus,
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
let server;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    await sequelize.sync({ alter: false }); // Safe sync
    server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`⚠️  Shutting down gracefully due to ${signal}...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await sequelize.close();
        console.log("Database connection closed.");
        await redisClient.quit();
        console.log("Redis connection closed.");
      } catch (err) {
        console.error("Error during shutdown:", err);
      }
      process.exit(0);
    });
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start server if not in test
if (process.env.NODE_ENV !== "test") startServer();

module.exports = app;
