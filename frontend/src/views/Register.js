import React from 'react'
import { Link } from 'react-router-dom'

const Register = () => {
    return (
        <div className="mainWapper layout">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="form-register">
                            <div className="title">
                                <h3>New Register</h3>
                            </div>

                            <div className="logo">
                                <Link to="/"><img src="assets/img/logo.png" alt="logo" className="img-fluid" /></Link>
                            </div>

                            <form id="form-register" action="" method="post">
                                <div className="form-box">
                                    <i className="login__icon far fa-user"></i>
                                    <input type="text" id="name-register" name="first_name" autocomplete="off" placeholder='First Name *' />
                                </div>
                                <div className="form-box">
                                    <i className="login__icon fas fa-user"></i>
                                    <input type="text" id="name-last" name="last_name" autocomplete="off" placeholder='Last Name *' />
                                </div>
                                <div className="form-box">
                                    <i className="login__icon fas fa-envelope"></i>
                                    <input type="text" id="name-email" name="email" autocomplete="off" placeholder='Email Address *' />
                                </div>
                                <div className="form-box">
                                    <i className="login__icon fas fa-unlock-alt"></i>
                                    <input type="password" id="password" name="password" autocomplete="off" placeholder='Password *' />
                                </div>
                                <div className="form-box">
                                    <i className="login__icon fas fa-lock"></i>
                                    <input type="password" id="password-register" name="password_confirmation" autocomplete="off" placeholder='Confirm Password *' />
                                </div>
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="form-box mb-5">
                                            <i className="login__icon fas fa-headset"></i>
                                            <input type="number" id="password-register" name="phone" autocomplete="off" placeholder='Contact No *' />
                                        </div>
                                    </div>
                                </div>


                                <div className="form-box">
                                    <button type="submit" className="register">Register</button>
                                </div>
                            </form>



                            <div class="screen__background register">
                                <span class="screen__background__shape screen__background__shape4"></span>
                                <span class="screen__background__shape screen__background__shape3"></span>
                                <span class="screen__background__shape screen__background__shape2"></span>
                                <span class="screen__background__shape screen__background__shape1"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register