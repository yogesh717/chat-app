import React, { useState } from "react";
import { changePasswordApi } from "../Utils/api";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import { useSelector } from "react-redux";

const ChangePassword = () => {
    const navigate = useNavigate();
    // const { userId } = useAuth();
    // const dispatch = useDispatch();
      const userId = useSelector((state) => state.auth.userId);

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    const validatePassword = () => {
        let newErrors = {};
        let isValid = true;

        if (!passwordData.oldPassword.trim()) {
            newErrors.oldPassword = "Old password is required";
            isValid = false;
        }
        if (!passwordData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
            isValid = false;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "New password and confirm password must match";
            isValid = false;
        }

        setErrors(newErrors);
        setIsPasswordValid(isValid);
        return isValid;
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;
    
        // const userId = localStorage.getItem("userId"); 
    
        try {
            const response = await changePasswordApi(userId, passwordData.oldPassword, passwordData.newPassword);
            if (response?.success) {
                alert("Password updated successfully!");
                navigate("/update-profile");
            } else {
                alert(response?.message || "Error changing password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
        }
    };
    

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 p-3" style={{ backgroundColor: "var(--color-primary-dark)" }}>
            <div className="card shadow-lg rounded-4 overflow-hidden w-100" style={{ maxWidth: "600px" }}>
                <div className="row g-0">

                    {/* Sidebar Section */}
                    <div className="col-md-4 text-white d-flex flex-column justify-content-center align-items-center p-4" style={{ backgroundColor: "var(--color-primary)" }}>
                        <h2 className="fw-bold">GENESIS</h2>
                        <p className="mt-2 text-center">Update your profile with ease</p>
                    </div>

                    {/* Form Section */}
                    <div className="col-md-8 p-5 bg-white">
                        <h3 className="mb-4 text-center" style={{ color: "#043A7A" }}>Change Password</h3>

                        {/* Profile Image Upload */}
                        <div className="text-center mb-3">
                           
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Old Password</label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        className={`form-control ${errors.oldPassword ? "is-invalid" : ""}`}
                                        value={passwordData.oldPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    {errors.oldPassword && <div className="invalid-feedback">{errors.oldPassword}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                                </div>

                                <button type="submit" className="btn btn-primary w-100" disabled={!isPasswordValid}>
                                    Change Password
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
