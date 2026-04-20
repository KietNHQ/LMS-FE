import React from "react";
import { FiBook, FiDownload, FiCheckCircle, FiInfo } from "react-icons/fi";

const COMPLIANCE_ITEMS = [
    { code: "S11-H", name: "Sổ chi tiết các khoản thu", regime: "Circular 24/2024/TT-BTC", desc: "Theo dõi chi tiết các nguồn thu sự nghiệp, thu hộ chi hộ theo từng đối tượng học sinh.", lastGenerated: "15/10/2026" },
    { code: "S12-H", name: "Sổ theo dõi công nợ học sinh", regime: "Circular 24/2024/TT-BTC", desc: "Tổng hợp tình hình nợ đầu kỳ, phát sinh tăng/giảm và số dư cuối kỳ của từng học sinh.", lastGenerated: "15/10/2026" },
    { code: "B01-H", name: "Báo cáo quyết toán thu chi", regime: "Circular 24/2024/TT-BTC", desc: "Báo cáo tổng hợp quyết toán phục vụ cơ quan quản lý cấp trên.", lastGenerated: "-" },
];

export default function ComplianceBooks() {
    return (
        <div className="compliance-books">
            <div className="report-panel compliance-notice">
                <div className="compliance-notice__inner">
                    <FiInfo className="compliance-notice__icon" />
                    <div>
                        <strong className="compliance-notice__title">Chế độ kế toán Hành chính Sự nghiệp</strong>
                        <p className="compliance-notice__text">
                            Từ 01/01/2025, các đơn vị trường học áp dụng Thông tư 24/2024/TT-BTC. Hệ thống đã tự động cấu hình các tham số báo cáo để khớp với hệ thống tài khoản và mẫu biểu mới nhất.
                        </p>
                    </div>
                </div>
            </div>

            <div className="compliance-grid">
                {COMPLIANCE_ITEMS.map(item => (
                    <div key={item.code} className="report-panel compliance-card">
                        <div>
                            <div className="compliance-card__head">
                                <span className="compliance-card__code">{item.code}</span>
                                {item.lastGenerated !== '-' && <span className="compliance-card__done"><FiCheckCircle /> Đã kết xuất</span>}
                            </div>
                            <h4 className="compliance-card__title">{item.name}</h4>
                            <p className="compliance-card__desc">{item.desc}</p>
                            <span className="compliance-card__regime">Chế độ: {item.regime}</span>
                        </div>

                        <div className="compliance-card__actions">
                            <button className="btn-secondary compliance-btn"><FiBook /> Xem trực tuyến</button>
                            <button className="btn-primary compliance-btn"><FiDownload /> Tải bản PDF</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="report-panel compliance-public">
                <h4 className="compliance-public__title">Công khai tài chính (Thông tư 09/2009/TT-BGDĐT)</h4>
                <div className="compliance-public__actions">
                    <button className="btn-secondary compliance-public__btn"><FiDownload /> Biểu mẫu 01: Dự toán</button>
                    <button className="btn-secondary compliance-public__btn"><FiDownload /> Biểu mẫu 02: Quyết toán</button>
                </div>
            </div>
        </div>
    );
}
