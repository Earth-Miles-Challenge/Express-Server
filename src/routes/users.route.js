const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.get('/', usersController.get);

router.get('/:id', usersController.getOne);

router.post('/', usersController.create);

router.put('/:id', usersController.update);

router.delete('/:id', usersController.remove);

module.exports = router;
