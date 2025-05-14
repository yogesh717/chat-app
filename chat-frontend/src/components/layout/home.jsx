import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css"; 

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="overlay">
            <div className="home-container">
            {/* Top Right Buttons */}
            <div className="top-right">
                <button className="btn home-btn" onClick={() => navigate("/login")}>
                    Login
                </button>
                <button className="btn home-btn" onClick={() => navigate("/signup")}>
                    Signup
                </button>
            </div>
        </div>
            </div>
        </div>
    );
};

export default Home;
