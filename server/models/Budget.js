const mongoose = require('mongoose');

const CATEGORY_ALIASES = {
  Transport: 'Transportation',
  Housing: 'Bills',
  Health: 'Healthcare',
  Utilities: 'Bills',
  Freelance: 'Freelancing',
  Investment: 'Business',
  Gift: 'Other',
};

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  monthlyLimit: {
    type: Number,
  },
  limitAmount: {
    type: Number,
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

budgetSchema.pre('validate', function normalizeCategory(next) {
  if (this.category) {
    const normalized = String(this.category).trim();
    this.category = CATEGORY_ALIASES[normalized] || normalized;
  }
  next();
});

budgetSchema.pre('save', function (next) {
  if (this.monthlyLimit === undefined && this.limitAmount !== undefined) {
    this.monthlyLimit = this.limitAmount;
  }
  if (this.limitAmount === undefined && this.monthlyLimit !== undefined) {
    this.limitAmount = this.monthlyLimit;
  }
  next();
});

budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);