import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import constant from "../Utils/constant";
import { checkCredentialsApi, verifyOtpApi, resetPasswordApi } from "../Utils/api";
// import { useAuth } from "../../context/AuthContext"; 


const ForgotPassword = () => {
    const navigate = useNavigate();
    // const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(""); // Fix: Define success state
    const [loading, setLoading] = useState(false); // Fix: Define loading state
    const [isFormValid, setIsFormValid] = useState(false);

    const validateEmail = useCallback(() => {
        if (!email.trim()) {
            setError("Email is required");
            setIsFormValid(false);
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Enter a valid email address");
            setIsFormValid(false);
        } else {
            setError("");
            setIsFormValid(true);
        }
    }, [email]);

    const validateOtp = useCallback(() => {
        if (otp.length !== 4) {
            setError("OTP must be 4 digits");
            setIsFormValid(false);
        } else {
            setError("");
            setIsFormValid(true);
        }
    }, [otp]);

    const validatePassword = useCallback(() => {
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            setIsFormValid(false);
        } else if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setIsFormValid(false);
        } else {
            setError("");
            setIsFormValid(true);
        }
    }, [newPassword, confirmPassword]);

    useEffect(() => {
        if (step === 1) validateEmail();
        else if (step === 2) validateOtp();
        else if (step === 3) validatePassword();
    }, [email, otp, newPassword, confirmPassword, step, validateEmail, validateOtp, validatePassword]);

    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        try {
            const response = await checkCredentialsApi(constant.checkCredentialsApiUrl, email);
            if (response.isSuccess) {
                setStep(2);
            } else {
                setError(response.message);
            }
        } catch (error) {
            console.error("Error submitting email:", error);
            setError("An error occurred. Please try again.");
        }
        setLoading(false);
    };

    const handleSubmitOtp = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        try {
            const response = await verifyOtpApi(constant.verifyOtpApiUrl, { email, otp });
            if (response.isSuccess) {
                setStep(3);
            } else {
                setError(response.message);
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setError("OTP verification failed. Please try again.");
        }
        setLoading(false);
    };

    const handleSubmitNewPassword = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        try {
            const response = await resetPasswordApi(constant.resetPasswordApiUrl, { email, otp, newPassword });

            if (response.isSuccess) {
                setSuccess("Password reset successful! Redirecting to login.");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setError(response.message);
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            setError("Password reset failed. Try again.");
        }
        setLoading(false);
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-3">
            <div className="card shadow-lg w-100" style={{ maxWidth: "800px" }}>
                <div className="row g-0">

                    {/* Left Side - Image/Text */}
                    <div className="col-md-6 d-flex align-items-center justify-content-center text-white text-center p-4" style={{
                        background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                        borderRadius: "10px 10px 0 0"
                    }}>
                        <div>
                            <h2 className="fw-bold">Reset Your Password</h2>
                            <p className="mb-0">Enter your email to receive an OTP and reset your password.</p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="col-md-6 p-4">
                        <h3 className="text-center mb-3">{step === 1 ? "Forgot Password" : step === 2 ? "Enter OTP" : "Set New Password"}</h3>

                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}

                        {step === 1 && (
                            <form onSubmit={handleSubmitEmail}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control form-control-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                                    {loading ? "Sending OTP..." : "Send OTP"}
                                </button>
                                <button type="button" className="btn btn-primary w-100 mt-2 btn-lg" onClick={() => navigate("/login")}>
                                    Back to Login
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmitOtp}>
                                <div className="mb-3">
                                    <label className="form-label">OTP</label>
                                    <input type="text" className="form-control form-control-lg text-center" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>
                                <button type="button" className="btn btn-primary w-100 mt-2 btn-lg" onClick={() => setStep(1)}>
                                    Back
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleSubmitNewPassword}>
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input type="password" className="form-control form-control-lg" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirm Password</label>
                                    <input type="password" className="form-control form-control-lg" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                                <button type="button" className="btn btn-primary w-100 mt-2 btn-lg" onClick={() => setStep(2)}>
                                    Back
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
