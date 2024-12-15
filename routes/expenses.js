const express = require('express');
const expenseController = require('../controllers/expenses');

const router = express.Router();

router.post('/', expenseController.addExpense);
router.get('/', expenseController.getExpenses);
router.put('/:expenseId', expenseController.updateExpense);
router.delete('/:expenseId', expenseController.deleteExpense);

module.exports = router;
