import { useState, useContext } from 'react'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const { user, setUser } = useContext(UserContext)
    const navigate = useNavigate()

    const [name, setName] = useState(user?.name || '')
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
    const [avatarFile, setAvatarFile] = useState(null)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [newEmail, setNewEmail] = useState('')
    const [emailOtpSent, setEmailOtpSent] = useState(false)
    const [emailOtp, setEmailOtp] = useState('')

    const [loading, setLoading] = useState(false)

    function showApiError(err, fallback = 'Something went wrong') {
        const data = err.response?.data
        if (data?.errors?.length) data.errors.forEach((e) => toast.error(e.msg))
        else toast.error(data?.message || fallback)
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleAvatarUpload = async () => {
        if (!avatarFile) return
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('avatar', avatarFile)
            const res = await axios.put('/users/update-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setUser(res.data.user)
            setAvatarFile(null)
            toast.success('Avatar updated!')
        } catch (err) {
            showApiError(err, 'Failed to upload avatar')
        } finally {
            setLoading(false)
        }
    }

    const handleNameUpdate = async () => {
        if (!name.trim() || name.trim() === user?.name) return
        setLoading(true)
        try {
            const res = await axios.put('/users/update-profile', { name })
            setUser(res.data.user)
            toast.success('Name updated!')
        } catch (err) {
            showApiError(err, 'Failed to update name')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match")
            return
        }
        setLoading(true)
        try {
            await axios.put('/users/update-password', { currentPassword, newPassword })
            toast.success('Password updated!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            showApiError(err, 'Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    const handleRequestEmailOtp = async () => {
        if (!newEmail) return
        setLoading(true)
        try {
            await axios.post('/users/request-email-change', { newEmail })
            setEmailOtpSent(true)
            toast.success('OTP sent to new email!')
        } catch (err) {
            showApiError(err, 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyEmailOtp = async () => {
        if (!emailOtp) return
        setLoading(true)
        try {
            const res = await axios.post('/users/verify-email-change', { otp: emailOtp })
            setUser(res.data.user)
            setEmailOtpSent(false)
            setNewEmail('')
            setEmailOtp('')
            toast.success('Email updated!')
        } catch (err) {
            showApiError(err, 'Failed to verify OTP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className='min-h-screen bg-slate-900 text-white px-6 md:px-10 py-12'>
            <div className='max-w-2xl mx-auto'>
                <button onClick={() => navigate(-1)} className='text-sm text-slate-400 hover:text-white mb-6 flex items-center gap-2'>
                    <i className='ri-arrow-left-line'></i> Back
                </button>

                <h1 className='text-2xl md:text-3xl font-bold mb-8'>Profile Settings</h1>

                {/* Avatar */}
                <section className='bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6'>
                    <h2 className='text-sm font-semibold text-slate-300 mb-4'>Profile Picture</h2>
                    <div className='flex items-center gap-4'>
                        <div className='w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden shrink-0'>
                            {avatarPreview ? (
                                <img src={avatarPreview} alt='avatar' className='w-full h-full object-cover' />
                            ) : (
                                user?.name?.[0]?.toUpperCase()
                            )}
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm cursor-pointer transition w-fit'>
                                Choose Image
                                <input type='file' accept='image/*' onChange={handleAvatarChange} className='hidden' />
                            </label>
                            {avatarFile && (
                                <button onClick={handleAvatarUpload} disabled={loading}
                                    className='px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm transition w-fit'>
                                    {loading ? 'Uploading...' : 'Save Picture'}
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Name */}
                <section className='bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6'>
                    <h2 className='text-sm font-semibold text-slate-300 mb-4'>Name</h2>
                    <div className='flex gap-3'>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='flex-1 px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm outline-none focus:border-blue-500'
                        />
                        <button onClick={handleNameUpdate} disabled={loading}
                            className='px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition'>
                            Save
                        </button>
                    </div>
                </section>

                {/* Email */}
                <section className='bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6'>
                    <h2 className='text-sm font-semibold text-slate-300 mb-4'>Email Address</h2>
                    <p className='text-sm text-slate-400 mb-4'>Current: <span className='text-white'>{user?.email}</span></p>

                    {!emailOtpSent ? (
                        <div className='flex gap-3'>
                            <input
                                type='email'
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder='New email address'
                                className='flex-1 px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm outline-none focus:border-blue-500 placeholder-slate-500'
                            />
                            <button onClick={handleRequestEmailOtp} disabled={loading || !newEmail}
                                className='px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition whitespace-nowrap'>
                                Send OTP
                            </button>
                        </div>
                    ) : (
                        <div className='flex gap-3'>
                            <input
                                value={emailOtp}
                                onChange={(e) => setEmailOtp(e.target.value)}
                                placeholder='Enter OTP'
                                maxLength={6}
                                className='flex-1 px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm outline-none focus:border-blue-500 placeholder-slate-500'
                            />
                            <button onClick={handleVerifyEmailOtp} disabled={loading || !emailOtp}
                                className='px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg text-sm font-medium transition'>
                                Verify
                            </button>
                            <button onClick={() => { setEmailOtpSent(false); setEmailOtp('') }}
                                className='px-4 py-2.5 border border-slate-600 hover:bg-slate-700 rounded-lg text-sm transition'>
                                Cancel
                            </button>
                        </div>
                    )}
                </section>

                {/* Password */}
                <section className='bg-slate-800 border border-slate-700 rounded-xl p-6'>
                    <h2 className='text-sm font-semibold text-slate-300 mb-4'>Change Password</h2>
                    <div className='space-y-3'>
                        <input
                            type='password'
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder='Current password'
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
                        <button onClick={handlePasswordUpdate} disabled={loading || !currentPassword || !newPassword}
                            className='px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition'>
                            Update Password
                        </button>
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Profile