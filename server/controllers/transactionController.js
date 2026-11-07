const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, search } = req.query;
    const filter = { userId: req.user._id || req.user.id };

    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      transactions,
      total,
      page,
      pages,
    });
  } catch (error) {
    console.error('Get transactions error:', error.message);
    return res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type, amount, category, description, date, title } = req.body;

    if (amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount is required and must be greater than zero' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id || req.user.id,
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      title: title || description || `${type === 'income' ? 'Income' : 'Expense'} - ${category}`,
      date: date ? new Date(date) : new Date(),
    });

    return res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error.message);
    return res.status(500).json({ message: 'Server error creating transaction' });
  }
};

const updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (!transaction.userId.equals(req.user._id || req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this transaction' });
    }

    const { type, amount, category, description, date, title } = req.body;

    if (type) transaction.type = type;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = new Date(date);
    if (title) transaction.title = title;

    await transaction.save();

    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error.message);
    return res.status(500).json({ message: 'Server error updating transaction' });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    if (!transaction.userId.equals(req.user._id || req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }
    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Get transaction by id error:', error.message);
    return res.status(500).json({ message: 'Server error fetching transaction' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (!transaction.userId.equals(req.user._id || req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this transaction' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    return res.status(500).json({ message: 'Server error deleting transaction' });
  }
};

module.exports = { getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction };