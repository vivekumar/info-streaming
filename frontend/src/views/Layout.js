import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Components/Header'

const Layout = () => {
    return (
        <>
            {/* <Header /> */}
            <div className="mainWapper stream">
                <div className="mainWapper_right">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default Layout