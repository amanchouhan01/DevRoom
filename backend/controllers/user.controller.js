import userModel from '../models/user.model.js';
import redisClient from '../services/redis.service.js';
import * as userService from '../services/user.service.js';
import * as projectService from '../services/project.service.js'
import { validationResult } from 'express-validator';
import { generateOTP, storeOTP, verifyOTP } from '../services/otp.service.js';
import { sendOTP } from '../services/email.service.js';
import bcrypt from 'bcrypt'
import { Resend } from 'resend'


const resend = new Resend(process.env.RESEND_API_KEY)


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

    // Linking pending email invites
    await projectService.convertEmailInvitesToUserInvites({ email, userId: user._id })

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
  const user = await userModel.findById(req.user._id).select('-password');
  res.status(200).json({
    user
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

//Update Profile Controller
// Update name
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: 'Name must be at least 3 characters' })
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true }
    ).select('-password')

    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update profile' })
  }
}

// Update avatar
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    ).select('-password')

    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to upload avatar' })
  }
}

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const user = await userModel.findById(req.user._id).select('+password')

    const isValid = await user.isValidPassword(currentPassword)
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    user.password = await userModel.hashPassword(newPassword)
    await user.save()

    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update password' })
  }
}

// Request email change - sends OTP to new email
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body

    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      return res.status(400).json({ message: 'Valid email required' })
    }

    const existing = await userModel.findOne({ email: newEmail })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await userModel.findByIdAndUpdate(req.user._id, {
      pendingEmail: newEmail,
      emailChangeOTP: otp,
      emailChangeOTPExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 min
    })

    await resend.emails.send({
      from: 'DevRoom <noreply@devroom.sbs>',
      to: newEmail,
      subject: 'Verify your new email - DevRoom',
      html: `
            <div style="font-family: Arial; max-width: 400px; margin: auto; padding: 20px; background: #1e293b; color: white; border-radius: 12px;">
                <h2 style="color: #3b82f6;">DevRoom: New Email Verification</h2>
                <p>Your OTP to confirm this email change is: </p>
                <h1 style="letter-spacing: 8px; color: #3b82f6; font-size: 36px;">${otp}</h1>
                <p style="color: #94a3b8;">This code expires in 10 minutes. Do not share this with anyone.</p>
            </div>
        `
    })

    res.json({ message: 'OTP sent to new email' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to send OTP' })
  }
}

// Verify OTP and update email
export const verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body
    const user = await userModel.findById(req.user._id)

    if (!user.emailChangeOTP || !user.pendingEmail) {
      return res.status(400).json({ message: 'No pending email change request' })
    }

    if (user.emailChangeOTPExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' })
    }

    if (user.emailChangeOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    user.email = user.pendingEmail
    user.pendingEmail = undefined
    user.emailChangeOTP = undefined
    user.emailChangeOTPExpiry = undefined
    await user.save()

    const updatedUser = await userModel.findById(user._id).select('-password')
    res.json({ message: 'Email updated successfully', user: updatedUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to verify OTP' })
  }
}

//Forgot Password Flow:
// Step 1: Request OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    user.resetPasswordOTP = otp
    user.resetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await resend.emails.send({
      from: 'DevRoom <noreply@devroom.sbs>',
      to: email,
      subject: 'Reset your DevRoom password',
      html: `
            <div style="font-family: Arial; max-width: 400px; margin: auto; padding: 20px; background: #1e293b; color: white; border-radius: 12px;">
                <h2 style="color: #3b82f6;">DevRoom: Password Reset Request</h2>
                <p>Your OTP to reset your password is: </p>
                <h1 style="letter-spacing: 8px; color: #3b82f6; font-size: 36px;">${otp}</h1>
                <p style="color: #94a3b8;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
            </div>
      `

    })

    res.json({ message: 'OTP sent to your email' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Failed to send OTP' })
  }
}

//Step 2: Verify OTP + Set new password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' })
    }

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({ message: 'No OTP requested' })
    }

    if (user.resetPasswordOTPExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired' })
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }

    user.password = await userModel.hashPassword(newPassword)
    user.resetPasswordOTP = undefined
    user.resetPasswordOTPExpiry = undefined
    await user.save()

    res.json({ message: 'Password reset successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to reset password' })
  }
}

// Search user controller
export const searchUser = async (req, res) => {
  try {
    const { email } = req.query

    if (!email || email.trim().length < 3) {
      return res.status(400).json({ message: 'Please type at least 3 characters' })
    }

    const users = await userModel.find({
      email: { $regex: email.trim(), $options: 'i' }, // case-insensitive partial match
      _id: { $ne: req.user._id } // apna khud ka email result mein na aaye
    }).select('_id email').limit(5)

    res.json({ users })
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ message: 'Search failed' })
  }
}
