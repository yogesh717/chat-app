import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "./profilePage.css";
import { deactivateAccountApi } from "../Utils/api";
import { logout } from "../../redux/slices/authSlice";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account? You will be logged out immediately.")) {
      return;
    }
    const response = await deactivateAccountApi();
    if (response?.success) {
      dispatch(logout());
      navigate("/login");
    } else {
      alert(response?.message || "Error deactivating account");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-img-container">
            <img
              src={user?.profileImage || "https://via.placeholder.com/120"}
              alt="Profile"
              className="profile-img"
            />
          </div>
          <h5 className="fw-bold mb-1">{user?.fullName || "Unnamed User"}</h5>
          <p className="text-muted mb-3">@{user?.userName || "unknown"}</p>
          <p className="mb-1">{user?.email}</p>
          <p className="text-muted text-capitalize mb-2">{user?.gender}</p>
          {user?.bio && <p className="text-muted mb-2">{user.bio}</p>}
          <p className="mb-3">
            <span className="badge bg-success">Online</span>
            {user?.lastSeen && (
              <small className="text-muted ms-2">
                Last active: {new Date(user.lastSeen).toLocaleString()}
              </small>
            )}
          </p>
          <div className="d-flex justify-content-center gap-3 mb-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/update-profile")}
            >
              Edit Profile
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </button>
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={handleDeactivate}>
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
