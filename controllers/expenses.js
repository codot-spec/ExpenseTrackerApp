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
