const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

//router.use(authController.isLoggedIn); //this middleware stores user data if the user is logged in

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/login', authController.isLoggedIn, viewController.getOverview);
router.get('/me', authController.protect, viewController.getAccount);

module.exports = router;
