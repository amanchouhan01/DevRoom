import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaKey } from 'react-icons/fa';
import { UserContext } from '../context/user.context';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiUrl = import.meta.env.VITE_API_URL;

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('register');

    const { setUser } = useContext(UserContext);

    const navigate = useNavigate();

    const [resendCooldown, setResendCooldown] = useState(0);


    function showApiError(err, fallback = "Something went wrong") {
        const data = err.response?.data;
        if (data?.errors?.length) {
            data.errors.forEach((er) => toast.error(er.msg));
        } else {
            toast.error(data?.message || fallback);
        }
    }


    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [resendCooldown]);


    function submitHandler(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Password does not match")
            return;
        }

        axios.post(`${apiUrl}/users/register`, {
            email, password, name
        }).then((res) => {
            toast.success(res.data.message || "OTP sent to you email")
            setStep('otp')
        }).catch((err) => {
            showApiError(err, "Registration failed");
        })
    };

    function verifyOtpHandler(e) {
        e.preventDefault();
        axios.post(`${apiUrl}/users/verify-signup`, {
            email, otp
        }).then((res) => {
            toast.success("Email Verified! Welcome 🎉")
            localStorage.setItem('token', res.data.token)
            setUser(res.data.user)
            navigate('/home')
        }).catch((err) => {
            showApiError(err, "Invalid OTP");
        })
    };




    function resendOtpHandler() {
        axios.post(`${apiUrl}/users/register`, {
            email, password, name
        }).then((res) => {
            toast.success(res.response?.data?.message || "OTP resent to your email")
        }).catch((err) => {
            showApiError(err, "Failed to resend OTP");
        })
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-xl rounded-[28px] border border-slate-800 bg-slate-900/95 shadow-[0_30px_80px_rgba(15,23,42,0.35)] overflow-hidden">
                <div className="bg-slate-900 px-8 py-10 sm:px-10">

                    {step == 'register' && (
                        <>
                            <div className="mb-8">
                                <div className="inline-block rounded-full bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300">
                                    New account</div>
                                <h1 className="mt-6 text-3xl font-semibold text-white">Create your account</h1>
                                <p className="mt-3 max-w-xl text-sm text-slate-400">Start with a clean, calm registration form that feels intentional and grounded.</p>
                            </div>

                            <form onSubmit={submitHandler} className="space-y-5">


                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                                    <div className="relative rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="johndoe"
                                            className="w-full bg-transparent pl-11 text-base text-slate-100 placeholder:text-slate-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                    <div className="relative rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600">
                                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full bg-transparent pl-11 text-base text-slate-100 placeholder:text-slate-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                    <div className="relative rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a password"
                                            className="w-full bg-transparent pl-11 text-base text-slate-100 placeholder:text-slate-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm password</label>
                                    <div className="relative rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat your password"
                                            className="w-full bg-transparent pl-11 text-base text-slate-100 placeholder:text-slate-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 hover:cursor-pointer"
                                >
                                    Create account
                                </button>

                                {/* Divider */}
                                <div className='flex items-center gap-3 my-4'>
                                    <div className='flex-1 h-px bg-slate-700'></div>
                                    <span className='text-xs text-slate-500'>or</span>
                                    <div className='flex-1 h-px bg-slate-700'></div>
                                </div>

                                {/* Google Login */}
                                <a
                                    href={`${import.meta.env.VITE_API_URL}/auth/google`}
                                    className='w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-600 hover:bg-slate-800 rounded-lg text-sm text-slate-300 hover:text-white transition'>
                                    <svg width="18" height="18" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                        <path fill="none" d="M0 0h48v48H0z" />
                                    </svg>
                                    Continue with Google
                                </a>

                            </form>

                            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                                <span>Already have an account?</span>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="font-medium text-slate-100 transition hover:text-slate-50 hover:cursor-pointer"
                                >
                                    Sign in
                                </button>
                            </div>

                        </>
                    )}

                    {step === 'otp' && (
                        <>
                            <div className="mb-8">
                                <div className="inline-block rounded-full bg-emerald-600/15 px-4 py-2 text-sm font-medium text-emerald-300">
                                    Verify email</div>
                                <h1 className="mt-6 text-3xl font-semibold text-white">Enter OTP</h1>
                                <p className="mt-3 max-w-xl text-sm text-slate-400">
                                    We've sent a 6-digit code to <span className="text-slate-200">{email}</span>. Enter it below to verify your account.
                                </p>
                            </div>

                            <form onSubmit={verifyOtpHandler} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">OTP Code</label>
                                    <div className="relative rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 focus-within:border-slate-600 focus-within:ring-1 focus-within:ring-slate-600">
                                        <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
                                            maxLength={6}
                                            className="w-full bg-transparent pl-11 text-base text-slate-100 placeholder:text-slate-500 outline-none tracking-[6px]"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 hover:cursor-pointer"
                                >
                                    Verify & Continue
                                </button>
                            </form>

                            <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                                <span>Didn't get the code?</span>
                                <button
                                    type="button"
                                    onClick={resendOtpHandler}
                                    disabled={resendCooldown > 0}
                                    className={`font-medium transition hover:cursor-pointer 
                                        ${resendCooldown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-100 hover:text-slate-50'
                                        }`}
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                                </button>
                            </div>

                            <div className="mt-3 text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep('register')}
                                    className="text-sm font-medium text-slate-500 hover:text-slate-300 hover:cursor-pointer"
                                >
                                    Go back
                                </button>
                            </div>
                        </>
                    )}

                </div>

            </div>
        </div>
    );
};

export default Register;