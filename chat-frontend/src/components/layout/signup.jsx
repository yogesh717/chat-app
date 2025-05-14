import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import { signupApi } from "../Utils/api";
import constant from "../Utils/constant";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice";
// import { useAuth } from "../../context/AuthContext"; 
// import signupImage from "../../assets/signupImage.png";
import "./signup.css";
import { Container, Row, Col, Form, Button } from "react-bootstrap";


const Signup = () => {
  const navigate = useNavigate();
  // const { token, login } = useAuth();
  // const isAuthenticated = !!localStorage.getItem('token');
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "male",
    profileImage: "",
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);


  const validateForm = useCallback(() => {
    let newErrors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
      isValid = false;
    }
    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
      isValid = false;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);



  // Dynamically generate the avatar URL based on gender
  const generateAvatarUrl = (gender, email) => {
    let avatarUrl;
    if (gender === "male") {
      avatarUrl = `https://avatar.iran.liara.run/public/boy?username=${email}`;
    } else if (gender === "female") {
      avatarUrl = `https://avatar.iran.liara.run/public/girl?username=${email}`;
    } else {
      avatarUrl = `https://avatar.iran.liara.run/public/random?username=${email}`;
    }
    return avatarUrl;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "gender") {
      setFormData({
        ...formData,
        [name]: value,
        profileImage: generateAvatarUrl(value, formData.email) // Set profile image based on gender
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      profileImage: generateAvatarUrl(prev.gender, prev.email)
    }));
  }, [formData.email, formData.gender]);



  if (token) {
    return <Navigate to="/dashboard" />;
  }




  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    // setIsLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("userName", formData.userName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("confirmPassword", formData.confirmPassword);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("profileImage", generateAvatarUrl(formData.gender, formData.email)); // Use the generated avatar URL

    try {
      const response = await signupApi(constant.signupApiUrl, formDataToSend);

      if (response.success) {
        alert("Registered successfully!");

        // Auto login if token & user returned
        if (response.token && response.user) {
          // login(response.token, response.user);
          dispatch(login({ token: response.token, user: response.user }));
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } else {
        alert(response.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again.");
    }
  };


return (
  <Container fluid className="d-flex align-items-center justify-content-center" style={{ background: "linear-gradient(to right, #043A7A, #021B4A)" }}>
    <Row className="w-75 shadow-lg rounded overflow-hidden" style={{ marginTop: "53px", marginBottom: "50px" }}>
      {/* Left Section */}
      <Col md={5} className="text-white d-flex flex-column align-items-center justify-content-center p-4" style={{ background: "linear-gradient(to bottom, #043A7A, #021B4A)" }}>
        <h2 className="fw-bold">GENESIS</h2>
        <p className="mt-3">New User Registration.</p>
        <p>
          <span className="text-secondary">LOG IN</span> &nbsp;
          <span className="fw-bold text-white border-bottom">SIGN UP</span>
        </p>
        <Link to="/" className=" btn-secondary ">
          ←
        </Link>
      </Col>

      {/* Right Section */}
      <Col md={7} className="bg-light p-5">
        <h3 className="fw-bold text-center mb-4">SIGN UP</h3>
        <div className="w-100 text-center">
          <img
            src={formData.profileImage || "https://avatar.iran.liara.run/public/random"}
            alt="Avatar"
            className="avatar-preview mb-2"
            style={{ width: "100px", height: "100px", borderRadius: "50%" }}
          />
          <div className="mb-2">
            <label className="form-label">Username</label>
            <input type="text" className="form-control text-center" name="userName" value={formData.userName} onChange={handleChange} required />
          </div>
          <p className="mb-3">Select your gender:</p>
          <div className="d-flex justify-content-center">
            <div className="form-check me-3">
              <input className="form-check-input" type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} />
              <label className="form-check-label">Male</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} />
              <label className="form-check-label">Female</label>
            </div>
          </div>
        </div>
        <Form onSubmit={handleSubmit}>
          {/* <Row>
              <Col md={6}> */}
          <Form.Group className="mb-3">
            <Form.Control type="text" placeholder="Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </Form.Group>
          {/* </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Last Name" name="lastName" value={formData.userName} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row> */}

          <Form.Group className="mb-3">
            <Form.Control type="email" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control type="password" placeholder="Password" name="password" value={formData.password} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Control type="password" placeholder="Repeat" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-center">
            <Button type="submit" className="btn btn-dark rounded-circle px-3 py-2 shadow">
              <span>&raquo;</span>
            </Button>
          </div>
        </Form>
      </Col>
    </Row>
  </Container>
);
};
export default Signup;
