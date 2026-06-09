import React, { Suspense } from 'react'
import { Route, BrowserRouter, Routes, useLocation } from 'react-router-dom'

const Login = React.lazy(() => import('../screens/Login'));
const Register = React.lazy(() => import('../screens/Register'));
const Home = React.lazy(() => import('../screens/Home'));
const Project = React.lazy(() => import('../screens/Project'));

import UserAuth from '../auth/UserAuth'
import Navbar from '../components/Navbar'

const AppLayout = () => {
    const location = useLocation()
    const hideNavbar = ['/login', '/register'].includes(location.pathname)
    return (

         <>
            {!hideNavbar && <Navbar />}

            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path='/' element={<UserAuth><Home /></UserAuth>} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/project' element={<UserAuth><Project /></UserAuth>} />
                </Routes>
            </Suspense>
        </>
    );
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
};

export default AppRoutes
