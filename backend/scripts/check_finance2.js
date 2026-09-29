import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import Salary from '../models/salaryModel.js';
import Finance from '../models/financeModel.js';

dotenv.config();

function configureSrvDns() {
  const uri = process.env.MONGO_URI;
  if (uri && uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
      console.log('Configured DNS servers for SRV resolution');
    } catch (err) {
      console.warn('Failed to configure DNS servers:', err.message);
    }
  }
}

async function run() {
  configureSrvDns();
  const MONGODB_URI = process.env.MONGO_URI;
  if (!MONGODB_URI) {
    console.error('MONGO_URI not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to DB:', mongoose.connection.name);

    const now = new Date();
    const month = now.getMonth() + 1; // current month
    const year = now.getFullYear();

    console.log(`Checking salaries and finance for ${month}/${year}`);

    const salaries = await Salary.find({ month, year }).lean();
    console.log('Salaries count:', salaries.length);
    salaries.slice(0, 50).forEach(s => console.log(JSON.stringify({ _id: s._id, teacher: s.teacher, amount: s.amount, bonus: s.bonus, deductions: s.deductions, totalAmount: s.totalAmount, paid: s.paid }, null, 2)));

    const finance = await Finance.findOne({ month, year }).lean();
    console.log('Finance record:', JSON.stringify(finance, null, 2));

    const totalSalarySum = salaries.reduce((sum, s) => sum + (Number(s.totalAmount || 0)), 0);
    console.log('Computed salary total for month:', totalSalarySum);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(2);
  }
}

run();
