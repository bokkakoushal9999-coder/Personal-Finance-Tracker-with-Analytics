const { validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const enrichBudgetsWithSpending = async (budgets) => {
  if (budgets.length === 0) return [];

  const enriched = await Promise.all(
    budgets.map(async (budget) => {
      const startDate = new Date(budget.year, budget.month - 1, 1);
      const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59, 999);

      const result = await Transaction.aggregate([
        {
          $match: {
            userId: budget.userId,
            type: 'expense',
            category: budget.category,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const actualSpent = result.length > 0 ? result[0].total : 0;
      const limitAmount = Number(budget.limitAmount ?? budget.monthlyLimit) || 0;
      const usedPercent = limitAmount > 0 ? (actualSpent / limitAmount) * 100 : 0;

      return {
        ...budget,
        monthlyLimit: limitAmount,
        limitAmount: limitAmount,
        spent: Number(actualSpent.toFixed(2)),
        remaining: Number((limitAmount - actualSpent).toFixed(2)),
        usedPercent: Number(usedPercent.toFixed(2)),
        actualSpent: Number(actualSpent.toFixed(2)),
        percentage: Number(usedPercent.toFixed(2)),
        isOverBudget: actualSpent > limitAmount,
      };
    })
  );

  return enriched;
};

const getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({
      userId: req.user._id || req.user.id,
      month,
      year,
    }).lean();

    const enriched = await enrichBudgetsWithSpending(budgets);
    return res.status(200).json({ budgets: enriched });
  } catch (error) {
    console.error('Get budgets error:', error.message);
    return res.status(500).json({ message: 'Server error fetching budgets' });
  }
};

const createBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { category, month, year, limitAmount, monthlyLimit } = req.body;
    const finalLimit = limitAmount !== undefined ? parseFloat(limitAmount) : (monthlyLimit !== undefined ? parseFloat(monthlyLimit) : 0);

    const existing = await Budget.findOne({
      userId: req.user._id || req.user.id,
      category,
      month: parseInt(month),
      year: parseInt(year),
    });

    if (existing) {
      return res.status(400).json({
        message: `A budget for ${category} in ${month}/${year} already exists`,
      });
    }

    const budget = await Budget.create({
      userId: req.user._id || req.user.id,
      category,
      month: parseInt(month),
      year: parseInt(year),
      limitAmount: finalLimit,
      monthlyLimit: finalLimit,
    });

    return res.status(201).json({ ...budget.toObject(), budget });
  } catch (error) {
    console.error('Create budget error:', error.message);
    return res.status(500).json({ message: 'Server error creating budget' });
  }
};

const updateBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (!budget.userId.equals(req.user._id || req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this budget' });
    }

    if (req.body.limitAmount !== undefined || req.body.monthlyLimit !== undefined) {
      const val = parseFloat(req.body.limitAmount ?? req.body.monthlyLimit);
      budget.limitAmount = val;
      budget.monthlyLimit = val;
    }

    await budget.save();

    return res.status(200).json(budget);
  } catch (error) {
    console.error('Update budget error:', error.message);
    return res.status(500).json({ message: 'Server error updating budget' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (!budget.userId.equals(req.user._id || req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this budget' });
    }

    await Budget.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('Delete budget error:', error.message);
    return res.status(500).json({ message: 'Server error deleting budget' });
  }
};

module.exports = { getBudgets, createBudget, createOrUpdateBudget: createBudget, updateBudget, deleteBudget };