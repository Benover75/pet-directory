const { Service, Business } = require('../models');
const redis = require('../config/redis');

// Helper: Invalidate service cache for a business
const invalidateServiceCache = async (businessId) => {
  const keys = await redis.keys(`services:${businessId}:*`);
  if (keys.length > 0) await redis.del(keys);
};

// Create service
exports.createService = async (req, res) => {
  try {
    const { businessId, name, price, duration } = req.body;
    const business = await Business.findByPk(businessId);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    if (business.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    const service = await Service.create({ businessId, name, price, duration });
    await invalidateServiceCache(businessId);

    res.status(201).json({ service });
  } catch (err) {
    console.error('CREATE SERVICE ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get services for business
exports.getBusinessServices = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const cacheKey = `services:${businessId}:page:${page}:limit:${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const { rows: services, count } = await Service.findAndCountAll({
      where: { businessId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const response = { total: count, page: parseInt(page), limit: parseInt(limit), services };
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 60);

    res.json(response);
  } catch (err) {
    console.error('GET SERVICES ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const business = await Business.findByPk(service.businessId);
    if (business.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    await service.destroy();
    await invalidateServiceCache(service.businessId);

    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('DELETE SERVICE ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};
