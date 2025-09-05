const fs = require('fs');

// Helper to read Docker secret or env variable
const getSecret = (envVar, fileVar, defaultValue) => {
  if (process.env[envVar]) return process.env[envVar];
  if (process.env[fileVar] && fs.existsSync(process.env[fileVar])) {
    return fs.readFileSync(process.env[fileVar], 'utf8').trim();
  }
  return defaultValue;
};

const JWT_SECRET = getSecret('JWT_SECRET', 'JWT_SECRET_FILE', 'devsecret');
const JWT_REFRESH_SECRET = getSecret('JWT_REFRESH_SECRET', 'JWT_REFRESH_SECRET_FILE', 'devrefreshsecret');
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

module.exports = { JWT_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY };
