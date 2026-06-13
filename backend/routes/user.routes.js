import { Router } from "express";
import * as userController from '../controllers/user.controller.js';
import { body } from "express-validator";
import * as authMiddleware from '../middleware/auth.middleware.js';
import { upload } from "../config/cloudinary.js";


const router = Router();



router.post('/register',
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    userController.createUserController);

router.post('/verify-signup', userController.verifySignupOTPController);

router.post('/login',
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    userController.loginController);

router.post('/verify-login', userController.verifyLoginOTPController);

router.get('/profile', authMiddleware.authUser, userController.profileController);

router.get('/logout', authMiddleware.authUser, userController.logoutController);

router.get('/all', authMiddleware.authUser, userController.getAllUsersController);


//Update Profile Router
router.put('/update-profile', authMiddleware.authUser, userController.updateProfile);

router.put('/update-avatar', authMiddleware.authUser, upload.single('avatar'), userController.updateAvatar);

router.put('/update-password', authMiddleware.authUser, userController.updatePassword);

router.post('/request-email-change', authMiddleware.authUser, userController.requestEmailChange);

router.post('/verify-email-change', authMiddleware.authUser, userController.verifyEmailChange);

//Password change routes
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);


export default router;