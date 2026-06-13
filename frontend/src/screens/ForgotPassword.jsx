import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { toast } from 'react-toastify'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: email, 2: otp + new password
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    function showApiError(err, fallback = 'Something went wrong') {
        const data = err.response?.data
        if (data?.errors?.length) data.errors.forEach((e) => toast.error(e.msg))
        else toast.error(data?.message || fallback)
    }

    const handleSendOtp = async () => {
        if (!email) return
        setLoading(true)
        try {
            await axios.post('/users/forgot-password', { email })
            toast.success('OTP sent to your email')
            setStep(2)
        } catch (err) {
            showApiError(err, 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match")
            return
        }
        setLoading(true)
        try {
            await axios.post('/users/reset-password', { email, otp, newPassword })
            toast.success('Password reset successfully! Please login.')
            navigate('/login')
        } catch (err) {
            showApiError(err, 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className='min-h-screen bg-slate-900 text-white flex items-center justify-center px-4'>
            <div className='w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8'>
                <h1 className='text-2xl font-bold mb-2'>Reset Password</h1>
                <p className='text-sm text-slate-400 mb-6'>
                    {step === 1
                        ? "Enter your email to receive a reset OTP."
                        : `Enter the OTP sent to ${email} and your new password.`}
                </p>

                {step === 1 ? (
                    <div className='space-y-4'>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Enter your email'
                            className='w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm outline-none focus:border-blue-500 placeholder-slate-500'
                        />
                        <button
                            onClick={handleSendOtp}
                            disabled={loading || !email}
                            className='w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-semibold transition'>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder='Enter OTP'
                            maxLength={6}
                            className='w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm outline-none focus:border-blue-500 placeholder-slate-500'
                        />
                        <input
                            type='password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder='New password'
                            className='w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm outline-none focus:border-blue-500 placeholder-slate-500'
                        />
                        <input
                            type='password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder='Confirm new password'
                            className='w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm outline-none focus:border-blue-500 placeholder-slate-500'
                        />
                        <button
                            onClick={handleResetPassword}
                            disabled={loading || !otp || !newPassword}
                            className='w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-semibold transition'>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <button
                            onClick={() => setStep(1)}
                            className='w-full px-5 py-2.5 border border-slate-600 hover:bg-slate-700 rounded-lg text-sm transition'>
                            Back
                        </button>
                    </div>
                )}

                <p className='text-sm text-slate-400 mt-6 text-center'>
                    Remember your password?{' '}
                    <span onClick={() => navigate('/login')} className='text-blue-400 hover:underline cursor-pointer'>Login</span>
                </p>
            </div>
        </main>
    )
}

export default ForgotPassword