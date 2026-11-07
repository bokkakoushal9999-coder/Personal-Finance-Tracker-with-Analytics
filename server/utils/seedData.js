const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/personal_finance_tracker';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at:', mongoUri);

    // Demo account details
    const demoEmail = 'demo@financetracker.com';
    const demoPassword = 'Password123!';

    // Remove old demo data if exists
    const existingDemoUser = await User.findOne({ email: demoEmail });
    if (existingDemoUser) {
      console.log('[Seed] Cleaning up previous demo data for:', demoEmail);
      await Transaction.deleteMany({ userId: existingDemoUser._id });
      await Budget.deleteMany({ userId: existingDemoUser._id });
      await User.deleteOne({ _id: existingDemoUser._id });
    }

    // Create demo user with hashed password
    const hashedPassword = await bcrypt.hash(demoPassword, 10);
    const demoUser = await User.create({
      name: 'Alex Sharma',
      email: demoEmail,
      password: hashedPassword,
    });
    console.log(`[Seed] Created Demo User: ${demoUser.name} (${demoUser.email})`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const transactions = [];
    const budgets = [];

    // Category budgets configuration
    const budgetTemplates = [
      { category: 'Food', limit: 12000 },
      { category: 'Bills', limit: 14000 },
      { category: 'Shopping', limit: 8000 },
      { category: 'Transportation', limit: 5000 },
      { category: 'Entertainment', limit: 6000 },
      { category: 'Healthcare', limit: 4000 },
      { category: 'Education', limit: 7000 },
      { category: 'Other', limit: 3000 },
    ];

    // Seed 6 months of historical data (from current month back 5 months)
    for (let m = 5; m >= 0; m--) {
      const monthDate = new Date(currentYear, currentMonth - m, 1);
      const year = monthDate.getFullYear();
      const monthNum = monthDate.getMonth() + 1; // 1-12

      // Create budgets for each month
      for (const b of budgetTemplates) {
        budgets.push({
          userId: demoUser._id,
          category: b.category,
          monthlyLimit: b.limit,
          limitAmount: b.limit,
          month: monthNum,
          year,
        });
      }

      // 1. Monthly Recurring Salary
      transactions.push({
        userId: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        date: new Date(year, monthNum - 1, 1, 9, 30),
        description: 'Monthly direct deposit salary from TechCorp',
      });

      // 2. Freelancing Income
      if (m % 2 === 0) {
        transactions.push({
          userId: demoUser._id,
          title: 'UI/UX Design Consulting',
          amount: 22000,
          type: 'income',
          category: 'Freelancing',
          date: new Date(year, monthNum - 1, 14, 14, 0),
          description: 'Client payment for mobile app UI overhaul',
        });
      } else {
        transactions.push({
          userId: demoUser._id,
          title: 'Web Development Project',
          amount: 18500,
          type: 'income',
          category: 'Freelancing',
          date: new Date(year, monthNum - 1, 18, 16, 20),
          description: 'Milestone 2 frontend implementation payout',
        });
      }

      // 3. Investment / Business dividend or Scholarship
      if (m % 3 === 0) {
        transactions.push({
          userId: demoUser._id,
          title: 'Merit Academic Scholarship',
          amount: 12000,
          type: 'income',
          category: 'Scholarship',
          date: new Date(year, monthNum - 1, 8, 11, 0),
          description: 'Higher education research grant stipend',
        });
      }

      // 4. Expenses for this month
      // Bills
      transactions.push({
        userId: demoUser._id,
        title: 'Apartment Rent & Society Maintenance',
        amount: 8500,
        type: 'expense',
        category: 'Bills',
        date: new Date(year, monthNum - 1, 3, 10, 0),
        description: 'Monthly residential flat rent and maintenance dues',
      });
      transactions.push({
        userId: demoUser._id,
        title: 'Electricity & High-speed Fiber Internet',
        amount: 2450,
        type: 'expense',
        category: 'Bills',
        date: new Date(year, monthNum - 1, 7, 18, 15),
        description: 'Utility power bill and 300 Mbps broadband',
      });

      // Food
      transactions.push({
        userId: demoUser._id,
        title: 'Weekly Supermarket Groceries',
        amount: 3850,
        type: 'expense',
        category: 'Food',
        date: new Date(year, monthNum - 1, 5, 17, 30),
        description: 'Fresh vegetables, fruits, pantry staples, and dairy',
      });
      transactions.push({
        userId: demoUser._id,
        title: 'Weekend Dining & Cafe',
        amount: 2150,
        type: 'expense',
        category: 'Food',
        date: new Date(year, monthNum - 1, 12, 20, 45),
        description: 'Dinner with colleagues at Italian bistro',
      });
      transactions.push({
        userId: demoUser._id,
        title: 'Mid-Month Grocery Restock',
        amount: 2900,
        type: 'expense',
        category: 'Food',
        date: new Date(year, monthNum - 1, 19, 15, 10),
        description: 'Organic groceries and gourmet ingredients',
      });

      // Transportation
      transactions.push({
        userId: demoUser._id,
        title: 'Vehicle Fuel & Metro Smartcard',
        amount: 2800,
        type: 'expense',
        category: 'Transportation',
        date: new Date(year, monthNum - 1, 9, 8, 45),
        description: 'Petrol refill and monthly metro transit pass',
      });

      // Education & Certifications
      if (m % 2 === 1) {
        transactions.push({
          userId: demoUser._id,
          title: 'Cloud Certification Exam Voucher',
          amount: 4500,
          type: 'expense',
          category: 'Education',
          date: new Date(year, monthNum - 1, 16, 12, 0),
          description: 'AWS Solutions Architect professional exam registration',
        });
      }

      // Shopping
      transactions.push({
        userId: demoUser._id,
        title: 'Electronics & Desk Accessories',
        amount: m === 0 ? 7400 : 4200,
        type: 'expense',
        category: 'Shopping',
        date: new Date(year, monthNum - 1, 21, 19, 0),
        description: 'Ergonomic mechanical keyboard and USB-C hub',
      });

      // Entertainment
      transactions.push({
        userId: demoUser._id,
        title: 'Streaming & Music Subscriptions',
        amount: 1299,
        type: 'expense',
        category: 'Entertainment',
        date: new Date(year, monthNum - 1, 10, 11, 20),
        description: 'Netflix Premium, Spotify Family & Prime Video',
      });
      transactions.push({
        userId: demoUser._id,
        title: 'Cinema & Weekend Concert Passes',
        amount: 2600,
        type: 'expense',
        category: 'Entertainment',
        date: new Date(year, monthNum - 1, 24, 21, 0),
        description: 'IMAX movie tickets and weekend music festival',
      });

      // Healthcare
      transactions.push({
        userId: demoUser._id,
        title: 'Dental Checkup & Vitamins',
        amount: 1800,
        type: 'expense',
        category: 'Healthcare',
        date: new Date(year, monthNum - 1, 22, 10, 15),
        description: 'Routine dental cleaning and multivitamins',
      });
    }

    console.log(`[Seed] Inserting ${transactions.length} transactions and ${budgets.length} budget items...`);
    await Transaction.insertMany(transactions);
    await Budget.insertMany(budgets);

    console.log('----------------------------------------------------');
    console.log('[Seed] Sample data seeded successfully!');
    console.log('Demo Account Credentials:');
    console.log(`Email:    ${demoEmail}`);
    console.log(`Password: ${demoPassword}`);
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    process.exit(1);
  }
};

seedDatabase();