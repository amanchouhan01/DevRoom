import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'

const UserAuth = ({ children }) => {

    const { user } = useContext(UserContext)
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token');
    const navigate = useNavigate();


    useEffect(() => {

        if (!token) {
            navigate('/')
            return
        }

        if (user) {
            setLoading(false)
        }


    }, [user, token, navigate])


    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
        )
    }

    return (
        <>
            {children}
        </>
    )
}

export default UserAuth
