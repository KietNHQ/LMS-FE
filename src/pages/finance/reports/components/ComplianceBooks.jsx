import React from "react";
import { FiBook, FiDownload, FiCheckCircle, FiInfo } from "react-icons/fi";

const COMPLIANCE_ITEMS = [
    { code: "S11-H", name: "Sổ chi tiết các khoản thu", regime: "Circular 24/2024/TT-BTC", desc: "Theo dõi chi tiết các nguồn thu sự nghiệp, thu hộ chi hộ theo từng đối tượng học sinh.", lastGenerated: "15/10/2026" },
    { code: "S12-H", name: "Sổ theo dõi công nợ học sinh", regime: "Circular 24/2024/TT-BTC", desc: "Tổng hợp tình hình nợ đầu kỳ, phát sinh tăng/giảm và số dư cuối kỳ của từng học sinh.", lastGenerated: "15/10/2026" },
    { code: "B01-H", name: "Báo cáo quyết toán thu chi", regime: "Circular 24/2024/TT-BTC", desc: "Báo cáo tổng hợp quyết toán phục vụ cơ quan quản lý cấp trên.", lastGenerated: "-" },
];

export default function ComplianceBooks() {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div className="report-panel" style={{background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1.25rem'}}>
                <div style={{display: 'flex', gap: '0.75rem', color: '#0369a1'}}>
                    <FiInfo style={{fontSize: '1.5rem', flexShrink: 0}} />
                    <div>
                        <strong style={{display: 'block', marginBottom: '0.25rem'}}>Chế độ kế toán Hành chính Sự nghiệp</strong>
                        <p style={{fontSize: '0.85rem', lineHeight: 1.5}}>
                            Từ 01/01/2025, các đơn vị trường học áp dụng **Thông tư 24/2024/TT-BTC**. Hệ thống đã tự động cấu hình các tham số báo cáo để khớp với hệ thống tài khoản và mẫu biểu mới nhất.
                        </p>
                    </div>
                </div>
            </div>

            <div className="compliance-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                {COMPLIANCE_ITEMS.map(item => (
                    <div key={item.code} className="report-panel compliance-card" style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                        <div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                                <span style={{background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.6rem', borderRadius: '0.35rem', fontSize: '0.75rem', fontWeight: 700}}>{item.code}</span>
                                {item.lastGenerated !== '-' && <span style={{fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem'}}><FiCheckCircle /> Đã kết xuất</span>}
                            </div>
                            <h4 style={{margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#0f172a'}}>{item.name}</h4>
                            <p style={{fontSize: '0.875rem', color: '#64748b', lineHeight: 1.4, marginBottom: '1rem'}}>{item.desc}</p>
                            <span style={{fontSize: '0.75rem', color: '#94a3b8', display: 'block'}}>Chế độ: {item.regime}</span>
                        </div>
                        
                        <div style={{marginTop: '1.5rem', display: 'flex', gap: '0.5rem'}}>
                            <button className="btn-secondary" style={{flex: 1, fontSize: '0.8rem'}}><FiBook /> Xem trực tuyến</button>
                            <button className="btn-primary" style={{flex: 1, fontSize: '0.8rem'}}><FiDownload /> Tải bản PDF</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="report-panel" style={{marginTop: '1rem'}}>
                <h4 style={{marginBottom: '1rem'}}>Công khai tài chính (Thông tư 09/2009/TT-BGDĐT)</h4>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="btn-secondary"><FiDownload /> Biểu mẫu 01: Dự toán</button>
                    <button className="btn-secondary"><FiDownload /> Biểu mẫu 02: Quyết toán</button>
                </div>
            </div>
        </div>
    );
}
