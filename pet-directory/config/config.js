const fs = require('fs');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const getSecret = (envVar, fileVar, defaultValue) => {
  if (process.env[envVar]) return process.env[envVar];
  if (process.env[fileVar] && fs.existsSync(process.env[fileVar])) {
    return fs.readFileSync(process.env[fileVar], 'utf8').trim();
  }
  return defaultValue;
};

// JWT
const JWT_SECRET = getSecret('JWT_SECRET', 'JWT_SECRET_FILE', 'devsecret');
const JWT_REFRESH_SECRET = getSecret('JWT_REFRESH_SECRET', 'JWT_REFRESH_SECRET_FILE', 'devrefreshsecret');
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

// DB
const DB_NAME = getSecret('DB_NAME', 'DB_NAME_FILE', 'petdirectory');
const DB_USER = getSecret('DB_USER', 'DB_USER_FILE', 'postgres');
const DB_PASS = getSecret('DB_PASS', 'DB_PASS_FILE', '');
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 5432;

// Redis
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

module.exports = {
  jwt: { JWT_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY },
  db: { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT },
  redis: { REDIS_HOST, REDIS_PORT }
};
