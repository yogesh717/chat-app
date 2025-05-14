import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { editProfileApi } from "../Utils/api";
import "bootstrap/dist/css/bootstrap.min.css";
// import { useAuth } from "../../context/AuthContext"; 
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice.js";

const UpdateProfile = () => {
    const navigate = useNavigate();
    // const { user, userId, login } = useAuth();

    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const userId = useSelector((state) => state.auth.userId);

    const [userData, setUserData] = useState({
        fullName: "",
        userName: "",
        email: "",
        gender: "",
        profileImage: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    
    useEffect(() => {
        if (user) {
            setUserData({
                fullName: user.fullName || "",
                userName: user.userName || "",
                email: user.email || "",
                gender: user.gender || "",
            });
            if (user.profileImage) {
                setPreviewImage(user.profileImage);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserData({ ...userData, profileImage: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!userId) {
            alert("User ID not found. Please login again.");
            return;
        }

        // const formData = new FormData();
        // formData.append("fullName", userData.fullName);
        // formData.append("userName", userData.userName);
        // formData.append("email", userData.email);
        // formData.append("gender", userData.gender);
        // if (userData.profileImage) {
        //     formData.append("profileImage", userData.profileImage);
        // }
    
        // const response = await editProfileApi(userId, formData);
        const response = await editProfileApi(userId, userData);
    
        if (response.success) {
            alert("Profile Updated Successfully!");
            dispatch(login({ token: localStorage.getItem("token"), user: response.user }));
            // login(localStorage.getItem("token"), response.user);
            // localStorage.setItem("user", JSON.stringify(response.user)); 
            navigate("/update-profile");
        } else {
            alert("Error updating profile");
        }
    };
    

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#043A7A" }}>
            <div className="card shadow-lg w-50 rounded-4 overflow-hidden"  style={{ marginLeft: "270px" }}>
                <div className="row g-0">
                    
                    {/* Sidebar Section */}
                    <div className="col-md-4 text-white d-flex flex-column justify-content-center align-items-center p-4" style={{ backgroundColor: "#0092F0" }}>
                        <h2 className="fw-bold">GENESIS</h2>
                        <p className="mt-2 text-center">Update your profile with ease</p>
                    </div>

                    {/* Form Section */}
                    <div className="col-md-8 p-5 bg-white">
                        <h3 className="mb-4 text-center" style={{ color: "#043A7A" }}>Update Profile</h3>

                        {/* Profile Image Upload */}
                        <div className="text-center mb-3">
                            <label htmlFor="profileImage" className="d-block position-relative">
                                <img
                                    src={previewImage || "https://via.placeholder.com/100"}
                                    alt="Profile"
                                    className="rounded-circle border border-dark"
                                    width="100"
                                    height="100"
                                />
                                <input
                                    id="profileImage"
                                    type="file"
                                    accept="image/*"
                                    className="d-none"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>

                        {/* Form Fields */}
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-3">
                                <div className="col">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Full Name"
                                        name="fullName"
                                        value={userData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="User Name"
                                        name="userName"
                                        value={userData.userName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email"
                                    name="email"
                                    value={userData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <select
                                    className="form-control"
                                    name="gender"
                                    value={userData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 rounded-pill mb-3">
                                Update Profile
                            </button>
                            <button type="button" className="btn btn-primary w-100 rounded-pill" onClick={() => navigate("/change-password")}> 
                                Change Password
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UpdateProfile;


// import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import profileImage from "../../assets/profileImage.jpg"; // Import local image

// const ProfilePage = () => {
//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: "#087A94", marginLeft: "270px" }}>
//       <div className="card text-white shadow-lg" style={{ width: "350px", borderRadius: "15px", overflow: "hidden", backgroundColor: "#1C1C28" }}>
//         <div className="position-relative">
//           <img
//             src={profileImage}
//             className="card-img-top"
//             alt="Cover"
//             style={{ height: "120px", objectFit: "cover" }}
//           />
//           <img
//             src= "https://source.unsplash.com/100x100/?face"
//             className="rounded-circle border border-3 border-dark position-absolute"
//             style={{ width: "85px", height: "85px", top: "70px", left: "50%", transform: "translateX(-50%)", objectFit: "cover" }}
//             alt="Profile"
//           />
//         </div>
//         <div className="card-body text-center mt-4">
//           <h5 className="fw-bold">Wow Rakibul</h5>
//           <p className="text-muted">Los Angeles, CA, USA</p>
//           <div className="d-flex justify-content-center gap-3">
//             <button className="btn btn-outline-light btn-sm">Edit Profile</button>
//             <button className="btn btn-outline-secondary btn-sm">Change Password</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;





























// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { editProfileApi } from "../Utils/api";
// import "bootstrap/dist/css/bootstrap.min.css";

// const ProfileEdit = () => {
//     const navigate = useNavigate();
//     const [userData, setUserData] = useState({
//         fullName: "",
//         userName: "",
//         email: "",
//         gender: "male",
//         profileImage: null,
//     });
//     const [errors, setErrors] = useState({});
//     const [isFormValid, setIsFormValid] = useState(true);

//     useEffect(() => {
//         // Assuming user data is stored in localStorage
//         const storedUser = localStorage.getItem("user");
//         if (storedUser) {
//             const parsedUser = JSON.parse(storedUser);
//             setUserData({
//                 fullName: parsedUser.fullName || "",
//                 userName: parsedUser.userName || "",
//                 email: parsedUser.email || "",
//                 gender: parsedUser.gender || "male",
//                 profileImage: parsedUser.profileImage || null,
//             });
//         }
//     }, []);

//     const validateForm = () => {
//         let newErrors = {};
//         let isValid = true;

//         if (!userData.fullName.trim()) {
//             newErrors.fullName = "Full Name is required";
//             isValid = false;
//         }
//         if (!userData.userName.trim()) {
//             newErrors.userName = "Username is required";
//             isValid = false;
//         }
//         if (!userData.email.trim()) {
//             newErrors.email = "Email is required";
//             isValid = false;
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
//             newErrors.email = "Enter a valid email address";
//             isValid = false;
//         }

//         setErrors(newErrors);
//         setIsFormValid(isValid);
//         return isValid;
//     };

//     const handleChange = (e) => {
//         setUserData({ ...userData, [e.target.name]: e.target.value });
//         setErrors({ ...errors, [e.target.name]: "" });
//     };

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setUserData({ ...userData, profileImage: file });
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         // Assuming you have an API function to update the profile
//         const formData = new FormData();
//         formData.append("fullName", userData.fullName);
//         formData.append("userName", userData.userName);
//         formData.append("email", userData.email);
//         formData.append("gender", userData.gender);
//         if (userData.profileImage) {
//             formData.append("profileImage", userData.profileImage);
//         }

//         try {
//             const response = await editProfileApi(formData);
//             if (response?.isSuccess) {
//                 alert("Profile updated successfully!");
//                 localStorage.setItem("user", JSON.stringify(response.data)); // Update the local storage
//                 navigate("/profile"); // Redirect to profile page
//             } else {
//                 alert(response?.message || "Error updating profile");
//             }
//         } catch (error) {
//             console.error("Error submitting profile:", error);
//         }
//     };

//     return (
//         <div className="profile-edit-container d-flex justify-content-center align-items-center vh-100">
//             <div className="card p-4 shadow profile-edit-card">
//                 <h2 className="text-center mb-4">Edit Profile</h2>
//                 <form onSubmit={handleSubmit}>
//                     <div className="mb-3">
//                         <label className="form-label">Full Name</label>
//                         <input
//                             type="text"
//                             name="fullName"
//                             className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
//                             value={userData.fullName}
//                             onChange={handleChange}
//                             required
//                         />
//                         {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
//                     </div>

//                     <div className="mb-3">
//                         <label className="form-label">Username</label>
//                         <input
//                             type="text"
//                             name="userName"
//                             className={`form-control ${errors.userName ? "is-invalid" : ""}`}
//                             value={userData.userName}
//                             onChange={handleChange}
//                             required
//                         />
//                         {errors.userName && <div className="invalid-feedback">{errors.userName}</div>}
//                     </div>

//                     <div className="mb-3">
//                         <label className="form-label">Email</label>
//                         <input
//                             type="email"
//                             name="email"
//                             className={`form-control ${errors.email ? "is-invalid" : ""}`}
//                             value={userData.email}
//                             onChange={handleChange}
//                             required
//                         />
//                         {errors.email && <div className="invalid-feedback">{errors.email}</div>}
//                     </div>

//                     <div className="mb-3">
//                         <label className="form-label">Gender</label>
//                         <div className="d-flex">
//                             <div className="form-check me-3">
//                                 <input
//                                     className="form-check-input"
//                                     type="radio"
//                                     name="gender"
//                                     value="male"
//                                     checked={userData.gender === "male"}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                                 <label className="form-check-label">Male</label>
//                             </div>
//                             <div className="form-check">
//                                 <input
//                                     className="form-check-input"
//                                     type="radio"
//                                     name="gender"
//                                     value="female"
//                                     checked={userData.gender === "female"}
//                                     onChange={handleChange}
//                                     required
//                                 />
//                                 <label className="form-check-label">Female</label>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="mb-3">
//                         <label className="form-label">Profile Image</label>
//                         <input
//                             type="file"
//                             className="form-control"
//                             accept="image/*"
//                             onChange={handleImageChange}
//                         />
//                     </div>

//                     <button type="submit" className="btn btn-primary w-100" disabled={!isFormValid}>
//                         Save Changes
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default ProfileEdit;
