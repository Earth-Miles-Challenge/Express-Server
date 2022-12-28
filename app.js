require('dotenv').config({path: './.env'});

const app = require('./src/configs/express.config');

module.exports = app;