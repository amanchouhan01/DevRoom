import { createContext, useState, useEffect, useContext } from 'react'
import axios from '../config/axios'
import { UserContext } from './user.context'

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(UserContext)
    const [pendingInvites, setPendingInvites] = useState([])

    useEffect(() => {
        if (!user) {
            setPendingInvites([])
            return
        }

        const fetchInvites = () => {
            if (!navigator.onLine) return
            axios.get('/projects/invites/pending')
                .then(res => setPendingInvites(res.data.invites))
                .catch(() => { })
        }

        fetchInvites()
        const interval = setInterval(fetchInvites, 5000)
        return () => clearInterval(interval)
    }, [user])

    const respondInvite = (projectId, action) => {
        return axios.put('/projects/invites/respond', { projectId, action })
            .then(() => {
                setPendingInvites(prev => prev.filter(inv => inv.projectId !== projectId))
            })
    }

    return (
        <NotificationContext.Provider value={{ pendingInvites, setPendingInvites, respondInvite }}>
            {children}
        </NotificationContext.Provider>
    )
}