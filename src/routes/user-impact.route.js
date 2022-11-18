const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impact.controller');
const { userExists } = require('../controllers/users.controller');
const { authenticateToken, userHasAuthorization } = require('../middlewares/authentication.middleware');

router.all('*', authenticateToken, userHasAuthorization, userExists);
router.get('/emissionsAvoided', impactController.getEmissionsAvoidedByUser);

module.exports = router;
