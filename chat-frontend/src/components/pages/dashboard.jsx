import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUsers, FaEnvelope, FaUserCheck } from "react-icons/fa";

const Dashboard = () => {
    return (
        <div className="container-fluid">
            <div className="row">

                {/* Main Content */}
                <main className="col-12 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fw-bold">📊 Dashboard</h2>
                    </div>

                    {/* Stats Cards */}
                    <div className="row">
                        {/* Total Users */}
                        <div className="col-md-4">
                            <div className="card bg-primary text-white shadow-lg border-0">
                                <div className="card-body text-center">
                                    <FaUsers size={40} className="mb-2" />
                                    <h5 className="card-title fw-bold">Total Users</h5>
                                    <p className="card-text display-6 fw-bold">1,230</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Sent */}
                        <div className="col-md-4">
                            <div className="card bg-success text-white shadow-lg border-0">
                                <div className="card-body text-center">
                                    <FaEnvelope size={40} className="mb-2" />
                                    <h5 className="card-title fw-bold">Messages Sent</h5>
                                    <p className="card-text display-6 fw-bold">5,678</p>
                                </div>
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="col-md-4">
                            <div className="card bg-warning text-dark shadow-lg border-0">
                                <div className="card-body text-center">
                                    <FaUserCheck size={40} className="mb-2" />
                                    <h5 className="card-title fw-bold">Active Users</h5>
                                    <p className="card-text display-6 fw-bold">987</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Welcome Section */}
                    <div className="mt-4 p-4 bg-light text-center rounded shadow">
                        <h4 className="fw-bold">🎉 Welcome to Your Dashboard!</h4>
                        <p className="text-muted">Monitor your chat app’s performance and user engagement.</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
