import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const AuthCallback = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { setUser } = useContext(UserContext)

    useEffect(() => {
        const token = searchParams.get('token')
        const error = searchParams.get('error')

        if (error) {
            navigate('/login?error=' + error)
            return
        }

        if (token) {
            localStorage.setItem('token', token)
            axios.get('/users/profile').then(res => {
                setUser(res.data.user)
                navigate('/home')
            }).catch(() => {
                navigate('/login')
            })
        }
    }, [])

    return (
        <main className='min-h-screen bg-slate-900 flex items-center justify-center'>
            <div className='text-white text-center'>
                <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-slate-400 text-sm'>Signing you in...</p>
            </div>
        </main>
    )
}

export default AuthCallback