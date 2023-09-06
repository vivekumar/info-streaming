import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const Header = () => {
    const users = useSelector((state)=>state);

    return (
        <header className='header'>
            <div className="container-fluid">
                <div className="row align-items-center justify-content-between">
                    <div className="col">
                        <div className="logo">
                            <Link to="/"><img src="/assets/img/logo.png" alt="" className="img-fluid" /></Link>
                        </div>
                    </div>

                    <div className="col">
                        <div className="user">
                            <div className="user-img">
                                <img src="/assets/img/user.png" alt="" className="img-fluid" />
                            </div>
                            <h3>{users?.auth?.users?.users?.first_name}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header