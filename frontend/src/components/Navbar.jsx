import { useContext, useRef, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import axios from '../config/axios'

const Navbar = () => {
    const { user, setUser } = useContext(UserContext)
    const navigate = useNavigate()
    const location = useLocation()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function scrollTo(ref) {
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    function handleNavClick(section) {
        if (location.pathname !== '/home') {
            navigate('/home')
            setTimeout(() => {
                const refs = window.__homeRefs
                if (refs?.[section + 'Ref']?.current) {
                    refs[section + 'Ref'].current.scrollIntoView({ behavior: 'smooth' })
                }
            }, 300)
        } else {
            const refs = window.__homeRefs
            if (refs?.[section + 'Ref']?.current) {
                refs[section + 'Ref'].current.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }

    function logout() {
        axios.get('/users/logout').then(() => {
            localStorage.removeItem('token')
            setUser(null)
            navigate('/')
        }).catch(() => {
            localStorage.removeItem('token')
            setUser(null)
            navigate('/')
        })
    }

    // Nav links for logged-in users
    const loggedInLinks = [
        {
            label: 'Home', action: () => {
                if (location.pathname === '/home') {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                    navigate('/home')
                }
            }
        },
        { label: 'Projects', action: () => handleNavClick('projects') },
        { label: 'Features', action: () => handleNavClick('features') },
        { label: 'About', action: () => handleNavClick('about') },
    ]

    // Nav links for public landing page
    const publicLinks = [
        {
            label: 'Home', action: () => {
                if (location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                    navigate('/')
                }
            }
        },
        {
            label: 'Features', action: () => {
                if (location.pathname === '/') {
                    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })
                } else {
                    navigate('/')
                }
            }
        },
        {
            label: 'About', action: () => {
                if (location.pathname === '/') {
                    document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })
                } else {
                    navigate('/')
                }
            }
        },
    ]

    const links = user ? loggedInLinks : publicLinks

    return (
        <nav className='sticky top-0 z-50 grid grid-cols-2 md:grid-cols-3 items-center px-6 md:px-10 h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800'>

            {/* Logo */}
            <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate(user ? '/home' : '/')}>
                <div className='w-7 h-7 rounded-lg flex items-center justify-center'>
                    <img src="/terminal_favicon.png" alt="logo" />
                </div>
                <span className="font-bold bg-gradient-to-b from-[#ff7a00] to-[#ffd500] bg-clip-text text-transparent">DevRoom</span>
            </div>

            {/* Nav links */}
            <div className='hidden md:flex items-center gap-1 justify-center'>
                {links.map(link => (
                    <button
                        key={link.label}
                        onClick={link.action}
                        className='px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition'>
                        {link.label}
                    </button>
                ))}
            </div>

            {/* Right */}
            <div className='flex items-center justify-end gap-3'>
                {user ? (
                    <>
                        <div ref={profileRef} className='relative'>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className='hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition'>
                                <div className='w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden'>
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt='avatar' className='w-full h-full object-cover' />
                                    ) : (
                                        user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()
                                    )}
                                </div>
                                <span className='text-sm text-slate-300'>{user?.name || user?.email}</span>
                                <i className={`ri-arrow-down-s-line text-slate-400 transition ${isProfileOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {isProfileOpen && (
                                <div className='absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50'>
                                    <div className='px-4 py-3 border-b border-slate-700'>
                                        <p className='text-sm font-medium text-white truncate'>{user?.name}</p>
                                        <p className='text-xs text-slate-400 truncate'>{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => { setIsProfileOpen(false); navigate('/profile') }}
                                        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition'>
                                        <i className='ri-user-settings-line'></i> Edit Profile
                                    </button>
                                    <button
                                        onClick={logout}
                                        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 transition'>
                                        <i className='ri-logout-box-r-line'></i> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate('/login')} className='text-sm text-slate-400 hover:text-white transition px-3 py-1.5'>Sign in</button>
                        <button onClick={() => navigate('/register')} className='text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-medium transition'>Get started</button>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar