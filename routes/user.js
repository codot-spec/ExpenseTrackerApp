const express = require('express');
const userController = require('../controllers/user');

const Authentication = require("../middleware/auth");

const router = express.Router();

router.post('/sign-up', userController.signup);

router.post('/sign-in',userController.login)

router.get('/:userId',Authentication.authenticate,userController.fetchUserProfile)
router.put('/:userId',Authentication.authenticate,userController.editUser)
router.delete('/:userId',Authentication.authenticate,userController.deleteUser)

module.exports = router;
