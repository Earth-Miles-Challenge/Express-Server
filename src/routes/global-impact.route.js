const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impact.controller');

router.get('/emissionsAvoided', impactController.getEmissionsAvoided);

module.exports = router;
