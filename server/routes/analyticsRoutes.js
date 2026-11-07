const express = require('express');
const router  = express.Router();
const {
  getSummary,
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getInsights,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary',    getSummary);
router.get('/monthly',    getMonthlyAnalytics);
router.get('/categories', getCategoryAnalytics);
router.get('/insights',   getInsights);

module.exports = router;
