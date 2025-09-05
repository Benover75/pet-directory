const { User } = require('../models');
const bcrypt = require('bcrypt');
const redis = require('../config/redis');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken
} = require('../helpers/authHelpers');

const loginAttemptTTL = 300; // 5 minutes
const maxLoginAttempts = 5;

// Track login attempts
const checkLoginAttempts = async (email) => {
  const key = `login_attempts:${email}`;
  const attempts = await redis.get(key);
  if (attempts && attempts >= maxLoginAttempts) return false;
  await redis.multi().incr(key).expire(key, loginAttemptTTL).exec();
  return true;
};

// Reset login attempts
const resetLoginAttempts = async (email) => {
  await redis.del(`login_attempts:${email}`);
};

// Register new user
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    const { password: _, ...userData } = user.toJSON();
    res.status(201).json({ accessToken, refreshToken, user: userData });
  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Login existing user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allowed = await checkLoginAttempts(email);
    if (!allowed) return res.status(429).json({ error: 'Too many failed login attempts. Try later.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    await resetLoginAttempts(email);

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    const { password: _, ...userData } = user.toJSON();
    res.json({ accessToken, refreshToken, user: userData });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Refresh JWT token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const payload = verifyRefreshToken(refreshToken);
    const storedToken = await redis.get(`refresh_token:${payload.id}`);
    if (!storedToken || storedToken !== refreshToken) return res.status(403).json({ error: 'Invalid refresh token' });

    const user = await User.findByPk(payload.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const accessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('REFRESH TOKEN ERROR:', err.message);
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const userId = req.user.id; // requires auth middleware
    await revokeRefreshToken(userId);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('LOGOUT ERROR:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
