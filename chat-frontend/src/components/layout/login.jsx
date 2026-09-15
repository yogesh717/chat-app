import React, { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { loginApi } from "../Utils/api";
import constant from "../Utils/constant";

import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/slices/authSlice";
// import { useAuth } from "../../context/AuthContext"; 
import "./login.css";
// import backgroundImage from "../../../public/assets/backgroundImage.jpg";

const Login = () => {
    const navigate = useNavigate();
    // const { token, login } = useAuth();
    // const isAuthenticated = !!localStorage.getItem('token');
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token); // Get token from Redux
  
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);


    useEffect(() => {
        const validateForm = () => {
            let newErrors = {};
            let isValid = true;

            if (!formData.email.trim()) {
                newErrors.email = "Email is required";
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = "Enter a valid email address";
                isValid = false;
            }

            if (!formData.password.trim()) {
                newErrors.password = "Password is required";
                isValid = false;
            } else if (formData.password.length < 6) {
                newErrors.password = "Password must be at least 6 characters";
                isValid = false;
            }

            setErrors(newErrors);
            setIsFormValid(isValid);
        };

        validateForm();
    }, [formData]);
    

    if (token) {
        return <Navigate to="/dashboard" />;
      }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);
        if (!isFormValid) return;
    
        try {
            const loginApiResponse = await loginApi(constant.loginApiUrl, formData);
    
            if (loginApiResponse?.token && loginApiResponse?.user) {
                alert("You have logged in successfully.");
                // login(loginApiResponse.token, loginApiResponse.user);
                dispatch(login(loginApiResponse));
                navigate("/dashboard");
            } else {
                alert(loginApiResponse?.message || "Login failed! Please try again.");
            }
        } catch (error) {
            alert("Something went wrong. Please try again.");
        }
    };
    


  


    return (
        <div className="login-container d-flex justify-content-center align-items-center vh-100">
            <div className="card login-card shadow-lg">
                <div className="row g-0">
                    {/* Left Side - Image */}
                    <div className="col-md-7 image-side"></div>

                    {/* Right Side - Form */}
                    <div className="col-md-5 d-flex align-items-center">
                        <div className="card-body">
                            <h2 className="hello-text fw-bold ">HELLO!</h2>

                            <p className="text-muted">Welcome back! Please login to your account.</p>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={`form-control ${attemptedSubmit && errors.email ? "is-invalid" : ""}`}
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {attemptedSubmit && errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className={`form-control ${attemptedSubmit && errors.password ? "is-invalid" : ""}`}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {attemptedSubmit && errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>
                                <button type="submit" className="btn btn-primary  w-100">
                                    NEXT →
                                </button>
                            </form>
                            <div className="d-flex justify-content-between mt-3">
                                <div>
                                    {/* <input type="checkbox" id="remember" />
                                    <label htmlFor="remember" className="ms-2">Remember</label> */}
                                    {/* Back Button */}
                                    

                                    {/* Back Button */}
                                    <Link to="/" className=" btn-secondary ">
                                        ← 
                                    </Link>
                                </div>
                                <span className="text-primary" style={{ cursor: "pointer" }} onClick={() => navigate("/forgot-password")}>
                                    Forgot Password?
                                </span>
                            </div>
                            <p className="mt-3 text-center">
                                Don't have an account?{" "}
                                <span className="text-primary" style={{ cursor: "pointer" }} onClick={() => navigate("/signup")}>
                                    Sign Up
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login;
