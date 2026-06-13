import { useState } from 'react'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'


const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState(null) // { type: 'success'|'error', msg }
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubscribe = async () => {
        if (!email) return

        setLoading(true)
        setStatus(null)

        try {
            const res = await axios.post('/newsletter/subscribe', { email })
            setStatus({ type: 'success', msg: res.data.message })
            setEmail('')
        } catch (err) {
            setStatus({
                type: 'error',
                msg: err.response?.data?.message || 'Something went wrong'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex-1 p-8 md:p-10 flex flex-col justify-center'>
            <h3 className='text-xl md:text-2xl font-bold text-white mb-2'>Get the latest updates</h3>
            <p className='text-slate-400 text-sm mb-6'>Sign up for our newsletter — new features, tips, and dev insights.</p>

            <div className='flex flex-col sm:flex-row gap-3'>
                <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email address'
                    className='flex-1 w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition'
                />
                <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className='px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap'>
                    {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
            </div>

            {status && (
                <p className={`text-xs mt-2 ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {status.msg}
                </p>
            )}

            <p className='text-xs text-slate-500 mt-3'>
                By subscribing you agree to our{' '}
                <span onClick={() => navigate('/terms')} className='text-slate-400 underline cursor-pointer hover:text-white'>Terms of Service</span>
                {' '}and{' '}
                <span onClick={() => navigate('/privacy')} className='text-slate-400 underline cursor-pointer hover:text-white'>Privacy Policy</span>.
            </p>
        </div>
    )
}

export default Newsletter