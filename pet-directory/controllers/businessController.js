const { Business } = require('../models');
const { Op } = require('sequelize');
const redis = require('../config/redis');

// Helper: Generate cache key
const getCacheKey = (search, page, limit) =>
  `businesses:${search || 'all'}:page:${page}:limit:${limit}`;

// Helper: Invalidate all business-related cache keys
const invalidateCache = async () => {
  const keys = await redis.keys('businesses:*');
  if (keys.length > 0) await redis.del(keys);
};

// Create a new business
exports.createBusiness = async (req, res) => {
  try {
    const business = await Business.create({
      ...req.body,
      userId: req.user.id,
    });

    // Invalidate cache
    await invalidateCache();

    res.status(201).json({ business });
  } catch (err) {
    console.error('CREATE BUSINESS ERROR:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Update a business
exports.updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    await business.update(req.body);

    // Invalidate cache
    await invalidateCache();

    res.json({ business });
  } catch (err) {
    console.error('UPDATE BUSINESS ERROR:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Delete a business
exports.deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    await business.destroy();

    // Invalidate cache
    await invalidateCache();

    res.status(204).send();
  } catch (err) {
    console.error('DELETE BUSINESS ERROR:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Get businesses with optional search, pagination, and caching
exports.getBusinesses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    const cacheKey = getCacheKey(search, page, limit);

    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    // Query DB
    const where = search ? { name: { [Op.iLike]: `%${search}%` } } : {};

    const { rows: businesses, count } = await Business.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    const response = { total: count, page: parseInt(page), limit: parseInt(limit), businesses };

    // Cache response
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 60);

    res.json(response);
  } catch (err) {
    console.error('GET BUSINESSES ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get single business by ID with caching
exports.getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `business:${id}`;

    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const business = await Business.findByPk(id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    // Cache the response
    await redis.set(cacheKey, JSON.stringify(business), 'EX', 60);

    res.json(business);
  } catch (err) {
    console.error('GET BUSINESS BY ID ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};
