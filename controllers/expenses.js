

const { Op } = require('sequelize');
const Expense = require('../models/expenses');
const User = require('../models/users')
const sequelize = require('../util/database')

exports.addExpense = async (req, res, next ) => {
  const t = await sequelize.transaction();
  const { amount, description, category } = req.body;
  
  // Check for missing or invalid amount
  if (amount == undefined || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid or missing amount' });
  }

  try {
    const newExpense = await Expense.create(
      { amount, description, category, userId: req.user.id },
      {transaction : t});
    const totalExpense = Number(req.user.totalExpenses) + Number(amount);
   
    await User.update( { totalExpenses: totalExpense} ,
      { where : { id: req.user.id}, transaction: t})
   
     await t.commit();
    res.status(201).json(newExpense);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Error adding expense', error: error.message });
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

exports.updateExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  const { amount, description, category } = req.body;
  const t = await sequelize.transaction();  // Start transaction

  try {
    // Find the expense to get the old amount
    const oldExpense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
      transaction: t
    });

    if (!oldExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update the expense
    await Expense.update(
      { amount, description, category },
      { where: { id: expenseId, userId: req.user.id }, transaction: t }
    );

    // Calculate the new total expense
    const oldTotalExpense = Number(req.user.totalExpenses);
    const newTotalExpense = oldTotalExpense - oldExpense.amount + amount;

    // Update user's total expenses
    await User.update(
      { totalExpenses: newTotalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();  // Commit the transaction
    const updatedExpense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id }
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    await t.rollback();  // Rollback in case of error
    console.error(error);
    res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  const t = await sequelize.transaction();  // Start transaction

  try {
    // Find the expense to get the amount
    const expense = await Expense.findOne({
      where: { id: expenseId, userId: req.user.id },
      transaction: t
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Delete the expense
    await Expense.destroy({
      where: { id: expenseId, userId: req.user.id },
      transaction: t
    });

    // Calculate the new total expense
    const oldTotalExpense = Number(req.user.totalExpenses);
    const newTotalExpense = oldTotalExpense - expense.amount;

    // Update user's total expenses
    await User.update(
      { totalExpenses: newTotalExpense },
      { where: { id: req.user.id }, transaction: t }
    );

    await t.commit();  // Commit the transaction

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    await t.rollback();  // Rollback in case of error
    console.error(error);
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};


exports.getExpensesByDateRange = async (req, res, next) => {
  const { range } = req.query;  // Expect 'daily', 'weekly', or 'monthly'
  const t = await sequelize.transaction();
  const userId = req.user.id;

  try {
    let dateCondition;

    const today = new Date();
    
    if (range === 'daily') {
      // Get today's expenses
      dateCondition = {
        createdAt: {
          [Op.gte]: new Date(today.setHours(0, 0, 0, 0)),
          [Op.lte]: new Date(today.setHours(23, 59, 59, 999))
        }
      };
    } else if (range === 'weekly') {
      // Get this week's expenses (from the last 7 days)
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay())); // Start of this week (Sunday)
      dateCondition = {
        createdAt: {
          [Op.gte]: weekStart,
          [Op.lte]: new Date()
        }
      };
    } else if (range === 'monthly') {
      // Get this month's expenses (from the start of this month)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1); // Start of this month
      dateCondition = {
        createdAt: {
          [Op.gte]: monthStart,
          [Op.lte]: new Date()
        }
      };
    } else {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const expenses = await Expense.findAll({
      where: {
        userId,
        ...dateCondition
      },
      transaction: t,
    });

    const totalIncome = expenses.filter(exp => exp.category === 'income').reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = expenses.filter(exp => exp.category !== 'income').reduce((sum, exp) => sum + exp.amount, 0);

    await t.commit();
    
    res.status(200).json({ expenses, totalIncome, totalExpenses });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};
