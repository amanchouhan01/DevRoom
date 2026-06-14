import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const OfflineBanner = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            toast.success('Back online!')
        }
        const handleOffline = () => {
            setIsOnline(false)
            toast.error('You are offline')
        }
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOnline) return null

    return (
        <div className='fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center text-sm py-2 flex items-center justify-center gap-2'>
            <i className='ri-wifi-off-line text-base'></i>
            You're offline — check your internet connection
        </div>
    )
}

export default OfflineBanner