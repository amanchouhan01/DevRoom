import redisClient from '../services/redis.service.js'

// OTP generate karo
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Redis mein store karo — 5 min expiry
export const storeOTP = async (email, otp) => {
    await redisClient.set(`otp:${email}`, otp, 'EX', 300)
}

// Verify karo
export const verifyOTP = async (email, otp) => {
    const stored = await redisClient.get(`otp:${email}`)
    if (!stored) return { valid: false, message: 'OTP expired' }
    if (stored !== otp) return { valid: false, message: 'Invalid OTP' }
    await redisClient.del(`otp:${email}`)  // use hone ke baad delete
    return { valid: true }
}