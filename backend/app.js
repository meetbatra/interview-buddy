const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const chalk = require('chalk');
const interviewRoutes = require('./routes/interview');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(chalk.greenBright.bold(`Server running on port ${PORT}`));
});