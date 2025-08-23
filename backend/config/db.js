const mongoose = require('mongoose');
const chalk = require('chalk');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.greenBright.bold('MongoDB connected successfully'));
  } catch (error) {
    console.error(chalk.redBright.bold('MongoDB connection error:'), error.message);
    process.exit(1);
  }
};

module.exports = connectDB;