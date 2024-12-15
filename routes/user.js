const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

// POST route for adding a user
router.post('/add-user', userController.addUser);

// GET route for fetching all users
router.get('/add-user', userController.getUsers);

// DELETE route for deleting a user
router.delete('/add-user/:userId', userController.deleteUser);

// PUT route for updating a user
router.put('/add-user/:userId', userController.updateUser);

router.post('/user/sign-in',userController.signin)

module.exports = router;
