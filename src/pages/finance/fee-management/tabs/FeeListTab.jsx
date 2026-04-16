import React, { useState } from "react";
import { FiDollarSign, FiSearch, FiFileText, FiX, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";

export default function FeeListTab() {
    // Mock Data
    const [students, setStudents] = useState([
        { id: "HS001", name: "Nguyễn Văn A", class: "10A1", amount: "4,500,000", reqAmount: 4500000, status: "paid" },
        { id: "HS002", name: "Trần Thị B", class: "10A1", amount: "4,500,000", reqAmount: 4500000, status: "unpaid" },
        { id: "HS003", name: "Lê Minh C", class: "10A2", amount: "4,500,000", reqAmount: 4500000, status: "overdue" },
        { id: "HS004", name: "Hoàng H", class: "11A5", amount: "5,000,000", reqAmount: 5000000, status: "unpaid" },
    ]);

    const [modalData, setModalData] = useState(null);

    const handleOpenModal = (student) => {
        setModalData(student);
    };

    const handleConfirmPayment = () => {
        setStudents(prev => prev.map(s => s.id === modalData.id ? { ...s, status: "paid" } : s));
        toast.success(`Đã in hóa đơn và xác nhận thanh toán cho ${modalData.name}`);
        setModalData(null);
    };

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <h3>Danh Sách Nộp Học Phí</h3>
                <div className="fee-toolbar">
                    <select className="fee-select">
                        <option>Tất cả trạng thái</option>
                        <option>Chưa đóng</option>
                        <option>Đã đóng</option>
                        <option>Quá hạn</option>
                    </select>
                    <select className="fee-select">
                        <option>Toàn trường</option>
                        <option>Khối 10</option>
                        <option>Khối 11</option>
                    </select>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', top: '0.6rem', left: '0.5rem', color: '#94a3b8' }} />
                        <input type="text" className="fee-input" placeholder="Tên HS hoặc Mã số..." style={{ paddingLeft: '1.75rem' }} />
                    </div>
                </div>
            </div>

            <div className="fee-table-wrap">
                <table className="fee-table">
                    <thead>
                        <tr>
                            <th>Mã HS</th>
                            <th>Họ Tên</th>
                            <th>Lớp</th>
                            <th>Số tiền cần đóng (VNĐ)</th>
                            <th>Trạng thái</th>
                            <th>Thao tác Hành chính</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td><strong>{s.name}</strong></td>
                                <td>{s.class}</td>
                                <td className="td-money">{s.amount} ₫</td>
                                <td>
                                    <span className={`status-badge ${s.status}`}>
                                        {s.status === 'paid' ? 'Đã Thanh Toán' : (s.status === 'overdue' ? 'Quá Hạn' : 'Chưa Đóng')}
                                    </span>
                                </td>
                                <td>
                                    {s.status === 'paid' ? (
                                        <button className="btn-secondary" onClick={() => toast.info("Đang tải hóa đơn PDF...")}>
                                            <FiFileText /> Xem Hóa đơn
                                        </button>
                                    ) : (
                                        <button className="btn-primary" onClick={() => handleOpenModal(s)}>
                                            <FiDollarSign /> Thu Tiền
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Thanh Toán */}
            {modalData && (
                <div className="fee-modal-overlay">
                    <div className="fee-modal">
                        <div className="fee-modal-header">
                            <h3>Xác nhận Thanh Toán</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setModalData(null)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="fee-modal-body">
                            <div className="fm-row">
                                <span>Học sinh:</span>
                                <strong>{modalData.name} ({modalData.id})</strong>
                            </div>
                            <div className="fm-row">
                                <span>Lớp học:</span>
                                <strong>{modalData.class}</strong>
                            </div>
                            <div className="fm-row" style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginTop: '0.25rem' }}>
                                <span>Khoản thu:</span>
                                <strong>Học phí Học kỳ I (2026)</strong>
                            </div>
                            <div className="fm-row" style={{ fontSize: '1.1rem' }}>
                                <span>Số tiền phải thu:</span>
                                <strong style={{ color: '#16a34a' }}>{modalData.amount} VNĐ</strong>
                            </div>

                            <hr style={{ border: 0, borderTop: '1px solid #e2e8f0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Số tiền Khách đưa <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" className="fee-input" defaultValue={modalData.amount} style={{ fontWeight: 600, fontSize: '1.1rem' }} />
                            </div>
                        </div>
                        <div className="fee-modal-footer">
                            <button className="btn-secondary" onClick={() => setModalData(null)}>Hủy bỏ</button>
                            <button className="btn-primary" onClick={handleConfirmPayment}><FiCheckCircle /> Xác nhận & In Biên lai</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
