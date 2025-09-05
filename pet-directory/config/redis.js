const Redis = require("ioredis");
const fs = require("fs");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });

// Helper to read env or Docker secret
const getSecret = (envVar, fileVar, defaultValue) => {
  if (process.env[envVar]) return process.env[envVar];
  if (process.env[fileVar] && fs.existsSync(process.env[fileVar])) {
    return fs.readFileSync(process.env[fileVar], "utf8").trim();
  }
  return defaultValue;
};

// Redis config
const REDIS_HOST = getSecret("REDIS_HOST", "REDIS_HOST_FILE", "localhost");
const REDIS_PORT = parseInt(getSecret("REDIS_PORT", "REDIS_PORT_FILE", "6379"), 10);
const REDIS_URL = process.env.REDIS_URL || null;

let redisClient;
if (REDIS_URL) {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
} else {
  redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

// Event listeners
redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis error", err));

module.exports = redisClient;
