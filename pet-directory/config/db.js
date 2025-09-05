const fs = require("fs");
const { Sequelize } = require("sequelize");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });

// Helper to read env or Docker secret
const getSecret = (envVar, fileVar, defaultValue = null) => {
  if (process.env[envVar]) return process.env[envVar];
  if (process.env[fileVar] && fs.existsSync(process.env[fileVar])) {
    return fs.readFileSync(process.env[fileVar], "utf8").trim();
  }
  return defaultValue;
};

// DB configuration
const isTest = process.env.NODE_ENV === 'test';
const DB_NAME = isTest ? 'pet_directory_test' : getSecret("DB_NAME", "DB_NAME_FILE", "pet_directory");
const DB_USER = getSecret("DB_USER", "DB_USER_FILE", "postgres");
const DB_PASS = getSecret("DB_PASS", "DB_PASS_FILE", "Lamberto75");
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;

const sequelizeConfig = {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: isTest ? false : (msg) => console.log(`[Sequelize] ${msg}`),
  pool: { 
    max: isTest ? 1 : 20, 
    min: 0, 
    acquire: 30000, 
    idle: 10000 
  },
  // Disable SQL logging in test environment
  benchmark: !isTest,
  define: {
    timestamps: true,
    underscored: true
  }
};

// For test environment, use SQLite in-memory database
if (isTest) {
  sequelizeConfig.dialect = 'sqlite';
  sequelizeConfig.storage = ':memory:';
  sequelizeConfig.logging = false;
}

const sequelize = new Sequelize(
  isTest ? 'sqlite::memory:' : DB_NAME, 
  isTest ? null : DB_USER, 
  isTest ? null : DB_PASS, 
  sequelizeConfig
);

// Only authenticate in non-test environments
if (!isTest) {
  sequelize
    .authenticate()
    .then(() => console.log("✅ Database connection established"))
    .catch((err) => {
      console.error("❌ Database connection failed:", err);
      process.exit(1);
    });
}

module.exports = { 
  sequelize,
  // Export for testing purposes
  isTestDatabase: isTest
};
