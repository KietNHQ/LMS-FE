import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiDollarSign, FiChevronLeft, FiChevronRight, FiArrowLeft, FiUsers, FiActivity } from "react-icons/fi";
import "./classFundSection.css";

const ITEMS_PER_PAGE = 5;

export default function ClassFundSection({ classFundData }) {
    const [selectedClass, setSelectedClass] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- LIST VIEW LOGIC ---
    const totalItems = classFundData?.length || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentClasses = classFundData?.slice(startIndex, startIndex + ITEMS_PER_PAGE) || [];

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (!classFundData || classFundData.length === 0) {
        return <div className="fund-empty">Chưa có dữ liệu quỹ lớp cho học kỳ này.</div>;
    }

    // --- DETAIL VIEW RENDER ---
    if (selectedClass) {
        const balance = selectedClass.totalCollected - selectedClass.totalSpent;
        return (
            <section className="fund-section detail-view-active">
                <div className="fund-detail-header">
                    <button className="back-btn" onClick={() => setSelectedClass(null)}>
                        <FiArrowLeft /> Quay lại danh sách
                    </button>
                    <div className="class-title">
                        <h3>Quỹ Lớp {selectedClass.className}</h3>
                        <span className="teacher-name">GVCN: {selectedClass.teacher}</span>
                    </div>
                    <div className="read-only-badge">Quyền: Chỉ xem</div>
                </div>

                <div className="fund-stats-cards">
                    <div className="stat-card collected">
                        <div className="stat-icon"><FiDollarSign /></div>
                        <div className="stat-info">
                            <label>Tổng thu</label>
                            <span className="amount">{formatCurrency(selectedClass.totalCollected)}</span>
                        </div>
                    </div>
                    <div className="stat-card spent">
                        <div className="stat-icon"><FiActivity /></div>
                        <div className="stat-info">
                            <label>Tổng chi</label>
                            <span className="amount">{formatCurrency(selectedClass.totalSpent)}</span>
                        </div>
                    </div>
                    <div className="stat-card balance">
                        <div className="stat-icon"><FiUsers /></div>
                        <div className="stat-info">
                            <label>Số dư hiện tại</label>
                            <span className="amount">{formatCurrency(balance)}</span>
                        </div>
                    </div>
                </div>

                <div className="fund-detail-grid">
                    <div className="fund-detail-panel scrollable-panel">
                        <div className="panel-header">
                            <h4><FiUsers /> Danh sách sinh viên đóng quỹ</h4>
                            <span className="count-badge">{selectedClass.studentContributions.length} HS</span>
                        </div>
                        <div className="subtable-container">
                            <table className="fund-subtable">
                                <thead>
                                    <tr>
                                        <th>Học sinh</th>
                                        <th>Số tiền</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedClass.studentContributions.map((student, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-500">{student.name}</td>
                                            <td className="fw-600">{formatCurrency(student.amount)}</td>
                                            <td>
                                                <span className={`status-badge ${student.isPaid ? 'paid' : 'unpaid'}`}>
                                                    {student.isPaid ? "Đã nộp" : "Chưa nộp"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {selectedClass.studentContributions.length === 0 && (
                                        <tr><td colSpan="3" className="text-center py-4">Chưa có dữ liệu học sinh.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="fund-detail-panel scrollable-panel">
                        <div className="panel-header">
                            <h4><FiActivity /> Nhật ký chi tiêu</h4>
                            <span className="count-badge">{selectedClass.expenditures.length} mục</span>
                        </div>
                        <div className="subtable-container">
                            <table className="fund-subtable">
                                <thead>
                                    <tr>
                                        <th>Khoản chi</th>
                                        <th>Số tiền</th>
                                        <th>Ngày chi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedClass.expenditures.map((expense, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-500">{expense.desc}</td>
                                            <td className="fw-600 text-danger">-{formatCurrency(expense.amount)}</td>
                                            <td className="text-gray">{expense.date}</td>
                                        </tr>
                                    ))}
                                    {selectedClass.expenditures.length === 0 && (
                                        <tr><td colSpan="3" className="text-center py-4">Chưa có phát sinh chi.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // --- LIST VIEW RENDER ---
    return (
        <section className="fund-section">
            <div className="fund-stats-header">
                <div className="header-text">
                    <h3>Thống kê Quỹ Lớp (Tổng quan)</h3>
                    <p className="subtitle">Admin chỉ có quyền theo dõi thu chi các lớp</p>
                </div>
            </div>
            
            <div className="fund-table-wrap">
                <table className="fund-table">
                    <thead>
                        <tr>
                            <th>Lớp</th>
                            <th>Giáo viên chủ nhiệm</th>
                            <th>Tổng thu</th>
                            <th>Tổng chi</th>
                            <th>Số dư</th>
                            <th className="col-actions">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentClasses.map((data) => {
                            const balance = data.totalCollected - data.totalSpent;
                            return (
                                <tr key={data.className} className="fund-main-row clickable" onClick={() => setSelectedClass(data)}>
                                    <td className="fw-700">{data.className}</td>
                                    <td>{data.teacher}</td>
                                    <td className="fw-600 text-success">{formatCurrency(data.totalCollected)}</td>
                                    <td className="fw-600 text-danger">{formatCurrency(data.totalSpent)}</td>
                                    <td className="fw-700 text-primary">{formatCurrency(balance)}</td>
                                    <td className="col-actions">
                                        <button className="view-detail-btn">
                                            Xem chi tiết <FiChevronRight />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="payment-pagination-row">
                    <div className="payment-pagination">
                        <button 
                            className="payment-page-btn" 
                            disabled={currentPage === 1}
                            onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage - 1); }}
                        >
                            <FiChevronLeft />
                        </button>
                        <div className="payment-page-indicator">
                            <span>{currentPage}</span>
                            <small>/ {totalPages}</small>
                        </div>
                        <button 
                            className="payment-page-btn" 
                            disabled={currentPage === totalPages}
                            onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage + 1); }}
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
