import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuth } from "../reducers/auth";

const Login = () => {
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seller, setSeller] = useState({});
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const loginSeller = (e) => {
    e.preventDefault();

    axios
      .post(
        `https://jobportal.itexpertiseindia.com/workinghongkong/public/api/streaming?email_login=${email}&password_login=${password}`
      )
      .then((data) => {
        if (data.data.message === "Login Successfully") {
            const users = data.data.data;
            dispatch(setAuth({users}));

          navigate("/stream");
        } else {
          setMessage(data.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="mainWapper layout">
      <div className="container">
        <div className="screen">
          <div className="screen__content">
            <div className="logo">
              <Link to="/">
                <img
                  src="assets/img/logo.png"
                  alt="logo"
                  className="img-fluid"
                />
              </Link>
            </div>
            <h4 className="text-danger mx-5 mt-3">{message}</h4>
            <form className="login">
              <div className="login__field">
                <i className="login__icon fas fa-user"></i>
                <input
                  type="text"
                  value={email}
                  className="login__input"
                  placeholder="User name / Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="login__field">
                <i className="login__icon fas fa-lock"></i>
                <input
                  type="password"
                  value={password}
                  className="login__input"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="button login__submit" onClick={loginSeller}>
                <span className="button__text">Log In Now</span>
                <i className="button__icon fas fa-chevron-right"></i>
              </button>
            </form>
            {/* <div className="social-login">
              <h3>log in via</h3>
              <div className="social-icons">
                <Link
                  to="/"
                  className="social-login__icon fab fa-instagram"
                ></Link>
                <Link
                  to="/"
                  className="social-login__icon fab fa-facebook"
                ></Link>
                <Link
                  to="/"
                  className="social-login__icon fab fa-twitter"
                ></Link>
              </div>

              <Link to="/register" className="register">
                New Register
              </Link>
            </div> */}
          </div>
          <div className="screen__background">
            <span className="screen__background__shape screen__background__shape4"></span>
            <span className="screen__background__shape screen__background__shape3"></span>
            <span className="screen__background__shape screen__background__shape2"></span>
            <span className="screen__background__shape screen__background__shape1"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
