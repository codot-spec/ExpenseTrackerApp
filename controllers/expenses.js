const Expense = require('../models/expenses');

exports.addExpense = async (req, res, next ) => {
  const { amount, description, category } = req.body;
  
  // Check for missing or invalid amount
  if (amount == undefined || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid or missing amount' });
  }

  try {
    const newExpense = await Expense.create({ amount, description, category, userId: req.user.id });
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
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

  try {
    const [updatedCount] = await Expense.update(
      { amount, description, category },
      { where: { id: expenseId, userId: req.user.id } }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updatedExpense = await Expense.findOne({
      where: {
        id: expenseId,
        userId: req.user.id
      }
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating expense', error: error.message });
  }
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;

  try {
    const deletedCount = await Expense.destroy({
      where: { id: expenseId, userId: req.user.id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting expense', error: error.message });
  }
};
