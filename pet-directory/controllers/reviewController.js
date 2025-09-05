const { Review, Business } = require('../models');
const redis = require('../config/redis');

// Helper: Invalidate business review caches
const invalidateBusinessReviewCache = async (businessId) => {
  const keys = await redis.keys(`reviews:${businessId}:*`);
  if (keys.length > 0) await redis.del(keys);
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { businessId, rating, comment, serviceId } = req.body;
    const business = await Business.findByPk(businessId);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    const review = await Review.create({ userId: req.user.id, businessId, rating, comment, serviceId: serviceId || null });

    await invalidateBusinessReviewCache(businessId);

    res.status(201).json({ review });
  } catch (err) {
    console.error('CREATE REVIEW ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get business reviews
exports.getBusinessReviews = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const cacheKey = `reviews:${businessId}:page:${page}:limit:${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const { rows: reviews, count } = await Review.findAndCountAll({
      where: { businessId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    const response = { total: count, page: parseInt(page), limit: parseInt(limit), reviews };
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 60);

    res.json(response);
  } catch (err) {
    console.error('GET REVIEWS ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    await review.destroy();
    await invalidateBusinessReviewCache(review.businessId);

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('DELETE REVIEW ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};
