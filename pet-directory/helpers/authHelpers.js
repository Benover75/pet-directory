const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const { JWT_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = require('../config/jwt');

const generateAccessToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const generateRefreshToken = async (user) => {
  const token = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  await redis.set(`refresh_token:${user.id}`, token, 'EX', 7 * 24 * 3600);
  return token;
};

const verifyAccessToken = (token) => jwt.verify(token, JWT_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);

const revokeRefreshToken = async (userId) => await redis.del(`refresh_token:${userId}`);

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, revokeRefreshToken };
