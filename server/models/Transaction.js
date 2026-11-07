const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Education',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Bills',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Scholarship',
  'Other',
];

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
const CATEGORY_ALIASES = {
  Transport: 'Transportation',
  Housing: 'Bills',
  Health: 'Healthcare',
  Utilities: 'Bills',
  Freelance: 'Freelancing',
  Investment: 'Business',
  Gift: 'Other',
};

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: '',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.pre('validate', function normalizeCategory(next) {
  if (this.category) {
    const normalized = String(this.category).trim();
    this.category = CATEGORY_ALIASES[normalized] || normalized;
  }
  next();
});

transactionSchema.index({ userId: 1, date: -1 });

transactionSchema.statics.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
transactionSchema.statics.INCOME_CATEGORIES = INCOME_CATEGORIES;
transactionSchema.statics.ALL_CATEGORIES = ALL_CATEGORIES;
transactionSchema.statics.CATEGORY_ALIASES = CATEGORY_ALIASES;

module.exports = mongoose.model('Transaction', transactionSchema);