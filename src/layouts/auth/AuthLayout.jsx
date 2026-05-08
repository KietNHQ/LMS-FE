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
                        <div className="auth-brand-badge">Nền tảng học tập thông minh</div>

                        <h1>Chào mừng đến với hệ thống LMS THPT</h1>

                        <p>
                            Nền tảng quản lý học tập hiện đại giúp học sinh, giáo viên,
                            phụ huynh và quản trị viên kết nối, quản lý và phát triển
                            cùng nhau.
                        </p>
                    </div>

                    <div className="auth-stats">
                        <div className="auth-stat-card auth-stat-card-admin">
              <span className="auth-stat-value auth-stat-value-admin">
                {formatStatNumber(1200000000)}
              </span>
                            <span className="auth-stat-label">Lớp học</span>
                        </div>

                        <div className="auth-stat-card auth-stat-card-parent">
              <span className="auth-stat-value auth-stat-value-parent">
                {formatStatNumber(45)}
              </span>
                            <span className="auth-stat-label">Môn học</span>
                        </div>

                        <div className="auth-stat-card auth-stat-card-teacher">
              <span className="auth-stat-value auth-stat-value-teacher">
                {formatStatNumber(80)}
              </span>
                            <span className="auth-stat-label">Giáo viên</span>
                        </div>

                        <div className="auth-stat-card auth-stat-card-student">
              <span className="auth-stat-value auth-stat-value-student">
                {formatStatNumber(1200000)}
              </span>
                            <span className="auth-stat-label">Học sinh</span>
                        </div>
                    </div>

                    <div className="auth-illustration-box">
                        <h3>Hành trình học tập tốt hơn bắt đầu từ đây</h3>
                        <p>
                            Theo dõi lớp học, quản lý bài giảng, giám sát tiến độ và tạo
                            trải nghiệm giáo dục hấp dẫn hơn trong một hệ thống thống nhất.
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
