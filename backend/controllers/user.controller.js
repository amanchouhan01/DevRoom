import userModel from '../models/user.model.js';
import redisClient from '../services/redis.service.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import { generateOTP, storeOTP, verifyOTP } from '../services/otp.service.js';
import { sendOTP } from '../services/email.service.js';


export const createUserController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name } = req.body;

    const existing = await userModel.findOne({ email })
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Email already registered" })
    }

    const hashedPassword = await userModel.hashPassword(password)
    await userModel.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hashedPassword,
        isVerified: false
      },
      {
        upsert: true,
        new: true
      }
    )

    const otp = generateOTP()
    await storeOTP(`signup:${email}`, otp)
    await sendOTP(email, otp)

    res.status(200).json({ message: 'OTP sent to your email' })

  } catch (error) {
    res.status(400).send(error.message);
  }
}


export const verifySignupOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body

    const result = await verifyOTP(`signup:${email}`, otp)
    if (!result.valid) {
      return res.status(400).json({ message: result.message })
    }

    const user = await userModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    )

    const token = await user.generateJWT()
    delete user._doc.password

    res.status(200).json({ user, token })

  } catch (error) {
    res.status(400).send(error.message)
  }
}


export const loginController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        errors: 'Invalid credentials'
      })
    }

    if (!user.isVerified) {
      return res.status(401).json({ errors: 'Email not verified. Please register again.' })
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        errors: 'Invalid credentials'
      })
    }

    const otp = generateOTP()
    await storeOTP(`login:${email}`, otp)
    await sendOTP(email, otp)

    res.status(200).json({ message: 'OTP sent to your email' })

  } catch (error) {
    res.status(400).send(error.message);
  }
}


export const verifyLoginOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body

    const result = await verifyOTP(`login:${email}`, otp)
    if (!result.valid) {
      return res.status(400).json({ message: result.message })
    }

    const user = await userModel.findOne({ email })
    const token = await user.generateJWT()
    delete user._doc.password

    res.status(200).json({ user, token })

  } catch (error) {
    res.status(400).send(error.message)
  }
}


export const profileController = async (req, res) => {
  const user = await userModel.findById(req.user._id);
  res.status(200).json({
    user: req.user
  });
}

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

    res.status(200).json({
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
}

export const getAllUsersController = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email
    })
    const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

    return res.status(200).json({
      user: allUsers
    })

  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message })
  }
}