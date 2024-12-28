const express = require('express');
const expenseController = require('../controllers/expenses');
const userauthentication = require('../middleware/auth')

const router = express.Router();


router.post('/',userauthentication.authenticate, expenseController.addExpense);

router.get('/', userauthentication.authenticate, expenseController.getExpenses);

router.put('/:expenseId',userauthentication.authenticate, expenseController.updateExpense);

router.delete('/:expenseId',userauthentication.authenticate, expenseController.deleteExpense);

router.get('/download',userauthentication.authenticate, expenseController.downloadExpense)

router.get('/downloaded-content',userauthentication.authenticate, expenseController.getDownloadedContent);

router.get('/date-range', userauthentication.authenticate, expenseController.getExpensesByDateRange);

module.exports = router;
