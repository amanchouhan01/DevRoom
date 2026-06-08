
import { Route, BrowserRouter, Routes, useLocation } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Home from '../screens/Home'
import Project from '../screens/Project'
import UserAuth from '../auth/UserAuth'
import Navbar from '../components/Navbar'

const AppLayout = () => {
    const location = useLocation()
    const hideNavbar = ['/login', '/register'].includes(location.pathname)
    return (

        <>
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path='/' element={<UserAuth><Home /></UserAuth>}></Route>
                <Route path='/login' element={<Login />}></Route>
                <Route path='/register' element={<Register />}></Route>
                <Route path='/project' element={<UserAuth><Project /></UserAuth>}></Route>

            </Routes>


        </>
    )
}

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    )
}

export default AppRoutes
