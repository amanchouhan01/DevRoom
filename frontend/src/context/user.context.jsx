import { createContext, useState, useEffect, useContext} from 'react';
import axios from '../config/axios'

export const UserContext = createContext();

//Create a provider component
export const UserProvider = ({children})=> {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            axios.get('/users/profile').then(res => {
                setUser(res.data.user)
            }).catch(() => {
                localStorage.removeItem('token')
            })
        }
    }, [])

    return(
        <UserContext.Provider value = {{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};


 