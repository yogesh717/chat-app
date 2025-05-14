
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
// import "./profilePage.css";

// const Profile = () => {
//     const navigate = useNavigate();
//     const [userData, setUserData] = useState({
//         profileImage: null,
//         fullName: "",
//         userName: "",
//         email: "",
//         gender: "male",
//     });

//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const response = await fetch("http://localhost:4000/api/auth/user", { credentials: "include" });
//                 const userData = await response.json();
//                 if (userData && userData._id) {
//                     setUserData({
//                         profileImage: userData.profileImage || null,
//                         fullName: userData.fullName || "",
//                         userName: userData.userName || "",
//                         email: userData.email || "",
//                         gender: userData.gender || "male",
//                     });
//                 }
//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//             }
//         };

//         fetchUser();
//     }, []);

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setUserData({ ...userData, profileImage: file });
//         }
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setUserData({ ...userData, [name]: value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
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
//                 navigate("/profile-page");
//             } else {
//                 alert(response?.message || "Error updating profile");
//             }
//         } catch (error) {
//             console.error("Error submitting profile:", error);
//         }
//     };

//     return (
//         <div className="profile-page">
//             <div className="profile-container">
//                 {/* Profile Image Card */}
//                 <div className="card p-4 shadow-lg text-center" style={{ backgroundColor: "#3F5840" }}>
//                     <h3 className="mb-3">Profile Picture</h3>
//                     <img
//                         src={userData.profileImage ? URL.createObjectURL(userData.profileImage) : "/path/to/default-image.jpg"}
//                         alt="Profile"
//                         className="profile-img mb-3"
//                     />
//                     <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
//                 </div>

//                 {/* Profile Edit Form Card */}
//                 <div className="card p-4 mt-3 shadow-lg" style={{ backgroundColor: "#3F5840" }}>
//                     <h3 className="text-center mb-3">Edit Profile</h3>
//                     <form onSubmit={handleSubmit}>
//                         <div className="form-group">
//                             <label>Full Name</label>
//                             <input
//                                 type="text"
//                                 name="fullName"
//                                 value={userData.fullName}
//                                 onChange={handleChange}
//                                 className="form-control"
//                                 required
//                             />
//                         </div>

//                         <div className="form-group mt-3">
//                             <label>Username</label>
//                             <input
//                                 type="text"
//                                 name="userName"
//                                 value={userData.userName}
//                                 onChange={handleChange}
//                                 className="form-control"
//                                 required
//                             />
//                         </div>

//                         <div className="form-group mt-3">
//                             <label>Email</label>
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={userData.email}
//                                 onChange={handleChange}
//                                 className="form-control"
//                                 required
//                             />
//                         </div>

//                         <div className="form-group mt-3">
//                             <label>Gender</label>
//                             <select name="gender" value={userData.gender} onChange={handleChange} className="form-control">
//                                 <option value="male">Male</option>
//                                 <option value="female">Female</option>
//                                 <option value="other">Other</option>
//                             </select>
//                         </div>

//                         <div className="d-flex flex-column mt-4">
//                             <button type="submit" className="btn btn-primary btn-lg mb-2">Save Changes</button>
//                             <button type="button" className="btn btn-danger btn-lg" onClick={() => navigate("/change-password")}>Change Password</button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Profile;
