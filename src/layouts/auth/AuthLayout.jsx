import React from "react";
import "./AuthLayout.css";

function formatStatNumber(value) {
    const num = Number(String(value).replace(/,/g, ""));

    if (Number.isNaN(num)) return value;

    if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(num % 1000000000 === 0 ? 0 : 1)}B`;
    }

    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
    }

    if (num >= 1000) {
        return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    }

    return `${num}`;
}

function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-brand">
                        <div className="auth-brand-badge">Smart Learning Platform</div>

                        <h1>Welcome to LMS High School System</h1>

                        <p>
                            A modern learning management platform for students, teachers,
                            parents, and administrators to connect, manage, and grow
                            together.
                        </p>
                    </div>

                    <div className="auth-stats">
                        <div className="auth-stat-card auth-stat-card-admin">
              <span className="auth-stat-value auth-stat-value-admin">
                {formatStatNumber(1200000000)}
              </span>
                            <span className="auth-stat-label">Classes</span>
                        </div>

                        <div className="auth-stat-card auth-stat-card-parent">
              <span className="auth-stat-value auth-stat-value-parent">
                {formatStatNumber(45)}
              </span>
                            <span className="auth-stat-label">Subjects</span>
                        </div>

                        <div className="auth-stat-card auth-stat-card-teacher">
              <span className="auth-stat-value auth-stat-value-teacher">
                {formatStatNumber(80)}
              </span>
                            <span className="auth-stat-label">Teachers</span>
                        </div>

                        <div className="auth-stat-card auth-stat-card-student">
              <span className="auth-stat-value auth-stat-value-student">
                {formatStatNumber(1200000)}
              </span>
                            <span className="auth-stat-label">Students</span>
                        </div>
                    </div>

                    <div className="auth-illustration-box">
                        <h3>Better learning starts here</h3>
                        <p>
                            Track classes, manage lessons, monitor progress, and create a
                            more engaging education experience in one unified system.
                        </p>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-card">
                        <div className="auth-card-header">
                            <h2>{title}</h2>
                            <p>{subtitle}</p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthLayout