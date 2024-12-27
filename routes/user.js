const express = require('express');
const userController = require('../controllers/user');

//const mid = require('../middleware/auth');


const router = express.Router();

router.post('/sign-up', userController.signup);

router.post('/sign-in',userController.login)

//router.get('/status', mid.authenticate, userController.login);

module.exports = router;
