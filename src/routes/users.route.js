const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/', usersController.get);

router.get('/:id', usersController.userExists, usersController.getOne);

router.post('/', usersController.create);

router.put('/:id', usersController.userExists, usersController.update);

router.delete('/:id', usersController.userExists, usersController.remove);

module.exports = router;
