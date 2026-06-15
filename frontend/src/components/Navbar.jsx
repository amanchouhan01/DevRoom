import { useContext, useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import { NotificationContext } from '../context/notification.context'
import axios from '../config/axios'

const Navbar = () => {
    const { user, setUser } = useContext(UserContext)
    const navigate = useNavigate()
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileRef = useRef(null)
    const { pendingInvites, respondInvite } = useContext(NotificationContext)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const notifRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false)
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

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

    const handleRespond = (projectId, action) => {
        respondInvite(projectId, action)
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
        <nav className='sticky  top-0 z-50 grid grid-cols-2 md:grid-cols-3 items-center px-6 md:px-10 h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800'>

            {/* Logo */}
            <div className='flex items-center gap-2 cursor-pointer'
                onClick={() => {
                    const target = user ? '/home' : '/'
                    if (location.pathname !== target) {
                        navigate(target)
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }}>
                <div className='w-7 h-7 rounded-lg flex items-center justify-center'>
                    <img src="/terminal_favicon.png" alt="logo" />
                </div>
                <span className="font-bold bg-gradient-to-b from-[#ff7a00] to-[#ffd500] bg-clip-text text-transparent">DevRoom</span>
            </div>

            {/* Nav links - desktop only */}
            <div className='hidden md:flex items-center justify-center gap-1'>
                {links.map(link => (
                    <button
                        key={link.label}
                        onClick={link.action}
                        className='px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer'>
                        {link.label}
                    </button>
                ))}
            </div>

            {/* Right */}
            <div className='flex items-center justify-end gap-3'>

                {user && (
                    <div ref={notifRef} className='relative'>
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className='relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer'>
                            <i className='ri-notification-3-line text-lg'></i>
                            {pendingInvites.length > 0 && (
                                <span className='absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full'>
                                    {pendingInvites.length > 9 ? '9+' : pendingInvites.length}
                                </span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className='fixed left-2 right-2 top-15 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 w-auto max-w-none sm:max-w-none bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50'>
                                <div className='px-4 py-3 border-b border-slate-700'>
                                    <p className='text-sm font-semibold text-white'>Notifications</p>
                                </div>
                                <div className='max-h-80 overflow-y-auto custom-scroll'>
                                    {pendingInvites.length === 0 ? (
                                        <p className='text-sm text-slate-500 text-center py-6'>No new notifications</p>
                                    ) : (
                                        pendingInvites.map(inv => (
                                            <div key={inv.projectId} className='px-4 py-3 border-b border-slate-700/50 last:border-b-0'>
                                                <p className='text-sm text-slate-200'>
                                                    <span className='font-semibold'>{inv.invitedBy?.name || inv.invitedBy?.email}</span> invited you to <span className='font-semibold'>{inv.projectName}</span>
                                                </p>
                                                <p className='text-xs text-slate-500 mt-0.5'>{inv.invitedBy?.email}</p>
                                                <div className='flex items-center gap-2 mt-2'>
                                                    <button
                                                        onClick={() => handleRespond(inv.projectId, 'reject')}
                                                        className='px-3 py-1 text-xs border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition'>
                                                        Decline
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespond(inv.projectId, 'accept')}
                                                        className='px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition'>
                                                        Accept
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Desktop right content */}
                <div className='hidden md:flex items-center gap-3'>

                    {user ? (
                        <div ref={profileRef} className='relative'>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition cursor-pointer'>
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
                                        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition cursor-pointer'>
                                        <i className='ri-user-settings-line'></i> Edit Profile
                                    </button>
                                    <button
                                        onClick={logout}
                                        className='w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 transition cursor-pointer'>
                                        <i className='ri-logout-box-r-line'></i> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className='text-sm text-slate-400 hover:text-white transition px-3 py-1.5 cursor-pointer'>Sign in</button>
                            <button onClick={() => navigate('/register')} className='text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-medium transition cursor-pointer'>Get started</button>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className='md:hidden p-2 text-slate-300 hover:text-white transition'>
                    <i className={`text-xl ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
                </button>
            </div>

            {/* Mobile menu dropdown */}
            {isMobileMenuOpen && (
                <div className='col-span-2 md:hidden mt-2 -mx-6 px-6 pb-4 border-t border-slate-800 bg-slate-900'>
                    <div className='flex flex-col gap-1 pt-3'>
                        {links.map(link => (
                            <button
                                key={link.label}
                                onClick={() => { link.action(); setIsMobileMenuOpen(false) }}
                                className='text-left px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition'>
                                {link.label}
                            </button>
                        ))}
                    </div>

                    <div className='border-t border-slate-800 mt-3 pt-3'>
                        {user ? (
                            <>
                                <div className='flex items-center gap-3 px-3 py-2 mb-2'>
                                    <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden'>
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt='avatar' className='w-full h-full object-cover' />
                                        ) : (
                                            user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <p className='text-sm font-medium text-white'>{user?.name}</p>
                                        <p className='text-xs text-slate-400'>{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/profile') }}
                                    className='w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition'>
                                    <i className='ri-user-settings-line'></i> Edit Profile
                                </button>
                                <button
                                    onClick={logout}
                                    className='w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition'>
                                    <i className='ri-logout-box-r-line'></i> Logout
                                </button>
                            </>
                        ) : (
                            <div className='flex flex-col gap-2'>
                                <button onClick={() => navigate('/login')} className='w-full text-sm text-slate-300 border border-slate-700 hover:bg-slate-800 px-4 py-2.5 rounded-lg transition'>Sign in</button>
                                <button onClick={() => navigate('/register')} className='w-full text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition'>Get started</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar