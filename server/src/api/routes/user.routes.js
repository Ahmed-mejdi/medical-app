const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.getAllUsers);
router.delete('/:id', userController.deleteUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.get('/:id', userController.getUserById);

module.exports = router; 