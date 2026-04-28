import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiInfo, FiTag, FiCalendar } from "react-icons/fi";

const MOCK_CATALOG = [
    { id: 1, code: "HP_CHINH", name: "Học phí chính quy", category: "Tuition", amount: 1200000, nature: "School Revenue", mandatory: true },
    { id: 2, code: "AN_TRUA", name: "Tiền ăn bán trú", category: "Service", amount: 35000, nature: "Service Revenue", mandatory: false },
    { id: 3, code: "BHYT", name: "Bảo hiểm y tế", category: "Others", amount: 804600, nature: "Collect on behalf", mandatory: true },
    { id: 4, code: "DONG_PHUC", name: "Đồng phục học sinh", category: "Others", amount: 650000, nature: "Collect on behalf", mandatory: false },
];

export default function FeeCatalogTab() {
    const [catalog, setCatalog] = useState(MOCK_CATALOG);

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <div className="fee-header-text">
                    <h3>Danh mục & Biểu phí</h3>
                    <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem'}}>
                        Định nghĩa các khoản thu và mức giá áp dụng cho năm học hiện tại.
                    </p>
                </div>
                <button className="btn-primary">
                    <FiPlus /> Thêm khoản thu mới
                </button>
            </div>

            <div className="fee-table-wrap">
                <table className="fee-table">
                    <thead>
                        <tr>
                            <th>Mã/Tên khoản thu</th>
                            <th>Phân loại</th>
                            <th>Tính chất (TT24)</th>
                            <th>Định mức (VNĐ)</th>
                            <th>Bắt buộc</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {catalog.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <span style={{fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6'}}>{item.code}</span>
                                        <strong>{item.name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <span className="fee-tag">{item.category}</span>
                                </td>
                                <td>
                                    <span style={{fontSize: '0.85rem', color: '#475569'}}>{item.nature}</span>
                                </td>
                                <td className="td-money">
                                    {item.amount.toLocaleString()} ₫
                                    {item.category === 'Service' && <span style={{fontSize: '0.7rem', color: '#94a3b8', display: 'block'}}>/ngày</span>}
                                </td>
                                <td>
                                    <span className={`status-badge ${item.mandatory ? 'paid' : 'unpaid'}`} style={{fontSize: '0.7rem'}}>
                                        {item.mandatory ? 'Bắt buộc' : 'Tự nguyện'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', gap: '0.5rem'}}>
                                        <button className="btn-icon" title="Chỉnh sửa"><FiEdit2 /></button>
                                        <button className="btn-icon danger" title="Xóa"><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="fee-info-box" style={{marginTop: '1.5rem', background: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bae6fd'}}>
                <div style={{display: 'flex', gap: '0.75rem', color: '#0369a1'}}>
                    <FiInfo style={{fontSize: '1.25rem', flexShrink: 0}} />
                    <div style={{fontSize: '0.85rem'}}>
                        <strong>Hướng dẫn nghiệp vụ:</strong> Theo Thông tư 24/2024/TT-BTC, các khoản "Thu hộ chi hộ" (Collect on behalf) cần được hạch toán vào các tài khoản riêng biệt để phục vụ báo cáo đối soát với bên thứ ba (Bảo hiểm, Nhà cung cấp đồng phục). Tránh gộp chung vào Doanh thu sự nghiệp của nhà trường.
                    </div>
                </div>
            </div>
        </div>
    );
}
