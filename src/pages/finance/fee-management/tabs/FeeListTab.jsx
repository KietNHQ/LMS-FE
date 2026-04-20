import React, { useState, useMemo, useEffect } from "react";
import { FiDollarSign, FiSearch, FiFileText, FiX, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { Pagination } from "../../../../components/common";

export default function FeeListTab() {
    // Extended Mock Data
    const [students, setStudents] = useState([
        { id: "HS001", name: "Nguyễn Văn A", class: "10A1", grade: "10", amount: "4,500,000", reqAmount: 4500000, status: "paid" },
        { id: "HS002", name: "Trần Thị B", class: "10A1", grade: "10", amount: "4,500,000", reqAmount: 4500000, status: "unpaid" },
        { id: "HS003", name: "Lê Minh C", class: "10A2", grade: "10", amount: "4,500,000", reqAmount: 4500000, status: "overdue" },
        { id: "HS004", name: "Hoàng H", class: "11A5", grade: "11", amount: "5,000,000", reqAmount: 5000000, status: "unpaid" },
        { id: "HS005", name: "Phạm Thu D", class: "11A5", grade: "11", amount: "5,000,000", reqAmount: 5000000, status: "paid" },
        { id: "HS006", name: "Lý Văn E", class: "12B1", grade: "12", amount: "5,500,000", reqAmount: 5500000, status: "unpaid" },
        { id: "HS007", name: "Đặng Thị F", class: "12B1", grade: "12", amount: "5,500,000", reqAmount: 5500000, status: "paid" },
        { id: "HS008", name: "Bùi Văn G", class: "10A2", grade: "10", amount: "4,500,000", reqAmount: 4500000, status: "overdue" },
        { id: "HS009", name: "Vũ Thị H", class: "10A1", grade: "10", amount: "4,500,000", reqAmount: 4500000, status: "paid" },
        { id: "HS010", name: "Trịnh Văn I", class: "11A2", grade: "11", amount: "5,000,000", reqAmount: 5000000, status: "unpaid" },
        { id: "HS011", name: "Đỗ Thị K", class: "11A2", grade: "11", amount: "5,000,000", reqAmount: 5000000, status: "paid" },
        { id: "HS012", name: "Lương Văn L", class: "12C3", grade: "12", amount: "5,500,000", reqAmount: 5500000, status: "unpaid" },
    ]);

    // States for Filters and Pagination
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterScope, setFilterScope] = useState("school"); // 'school' | 'grade'
    const [selectedGrade, setSelectedGrade] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [modalData, setModalData] = useState(null);
    const [amountPaid, setAmountPaid] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [issueEInvoice, setIssueEInvoice] = useState(true);
    const [transactionNote, setTransactionNote] = useState("");

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterScope, selectedGrade, selectedClass, searchQuery]);

    // Derived Logic: Available Classes based on Grade
    const availableClasses = useMemo(() => {
        if (!selectedGrade) return [];
        const classes = [...new Set(students.filter(s => s.grade === selectedGrade).map(s => s.class))];
        return classes.sort();
    }, [selectedGrade, students]);

    // Filtering Logic
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesStatus = filterStatus === "all" || s.status === filterStatus;
            const matchesScope = filterScope === "school" || 
                                 (filterScope === "grade" && (!selectedGrade || s.grade === selectedGrade) && (!selectedClass || s.class === selectedClass));
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesStatus && matchesScope && matchesSearch;
        });
    }, [students, filterStatus, filterScope, selectedGrade, selectedClass, searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset modal states when opening
    const handleOpenModal = (student) => {
        setModalData(student);
        setAmountPaid(student.reqAmount);
        setPaymentMethod("cash");
        setIssueEInvoice(true);
        setTransactionNote("");
    };

    const changeDue = useMemo(() => {
        const paid = typeof amountPaid === 'number' ? amountPaid : parseInt(amountPaid.toString().replace(/,/g, '')) || 0;
        return Math.max(0, paid - (modalData?.reqAmount || 0));
    }, [amountPaid, modalData]);

    const isUnderpaid = (amountPaid || 0) < (modalData?.reqAmount || 0);

    const handleAmountChange = (e) => {
        const val = e.target.value.replace(/\D/g, "");
        setAmountPaid(val ? parseInt(val) : 0);
    };

    const handleConfirmPayment = () => {
        if (isUnderpaid) {
            toast.error("Số tiền thu chưa đủ, vui lòng kiểm tra lại.");
            return;
        }

        setStudents(prev => prev.map(s => s.id === modalData.id ? { ...s, status: "paid" } : s));
        toast.success(`Đã xác nhận thu tiền cho ${modalData.name}`);
        setModalData(null);
    };

    const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val);

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <h3>Danh Sách Nộp Học Phí</h3>
                <div className="fee-toolbar">
                    {/* Status Filter */}
                    <select className="fee-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="unpaid">Chưa đóng</option>
                        <option value="paid">Đã đóng</option>
                        <option value="overdue">Quá hạn</option>
                    </select>

                    {/* Scope Filter */}
                    <select className="fee-select" value={filterScope} onChange={(e) => {
                        setFilterScope(e.target.value);
                        if (e.target.value === 'school') {
                            setSelectedGrade("");
                            setSelectedClass("");
                        }
                    }}>
                        <option value="school">Toàn trường</option>
                        <option value="grade">Theo Khối</option>
                    </select>

                    {/* Conditional Grade Selector */}
                    {filterScope === 'grade' && (
                        <select className="fee-select animated-fade-in" value={selectedGrade} onChange={(e) => {
                            setSelectedGrade(e.target.value);
                            setSelectedClass("");
                        }}>
                            <option value="">Chọn Khối</option>
                            <option value="10">Khối 10</option>
                            <option value="11">Khối 11</option>
                            <option value="12">Khối 12</option>
                        </select>
                    )}

                    {/* Sequential Class Selector */}
                    {filterScope === 'grade' && selectedGrade && (
                        <select className="fee-select animated-fade-in" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            <option value="">Tất cả Lớp</option>
                            {availableClasses.map(c => <option key={c} value={c}>Lớp {c}</option>)}
                        </select>
                    )}

                    {/* Search */}
                    <div className="fee-search-wrap">
                        <FiSearch className="search-icon" />
                        <input 
                            type="text" 
                            className="fee-input" 
                            placeholder="Tên HS hoặc Mã số..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                        {paginatedStudents.map(s => (
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
                                        <button
                                            className="fee-action-btn invoice"
                                            onClick={() => toast.info("Đang tải hóa đơn PDF...")}
                                            title="Xem hóa đơn"
                                            aria-label={`Xem hóa đơn của ${s.name}`}
                                        >
                                            <FiFileText />
                                        </button>
                                    ) : (
                                        <button
                                            className="fee-action-btn collect"
                                            onClick={() => handleOpenModal(s)}
                                            title="Thu tiền"
                                            aria-label={`Thu tiền của ${s.name}`}
                                        >
                                            <FiDollarSign />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {paginatedStudents.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
                <div className="fee-pagination-footer">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                    />
                </div>
            )}

            {/* Modal Thu Tiền Nhanh */}
            {modalData && (
                <div className="fee-modal-overlay">
                    <div className="fee-modal fee-modal-quick-pay">
                        <div className="fee-modal-header">
                            <div>
                                <h3>Thu tiền học phí</h3>
                                <p className="fm-modal-subtitle">Thao tác nhanh cho 1 học sinh</p>
                            </div>
                            <button className="btn-close-modal" onClick={() => setModalData(null)}>
                                <FiX />
                            </button>
                        </div>
                        
                        <div className="fee-modal-body">
                            <div className="fm-quick-head">
                                <div className="fm-quick-student">
                                    <strong>{modalData.name}</strong>
                                    <span>{modalData.id} | Lớp {modalData.class}</span>
                                </div>
                                <div className="fm-quick-due">
                                    <span>Cần thu</span>
                                    <strong>{modalData.amount} ₫</strong>
                                </div>
                            </div>

                            <div className="fm-form-group">
                                <label>Số tiền nhận <span className="required">*</span></label>
                                <div className="fm-input-with-label">
                                    <input
                                        type="text"
                                        className="fee-input full-width large-text"
                                        value={formatMoney(amountPaid)}
                                        onChange={handleAmountChange}
                                    />
                                    <span className="input-suffix">VNĐ</span>
                                </div>
                            </div>

                            <div className="fm-form-group">
                                <label>Phương thức thanh toán</label>
                                <div className="fm-method-grid">
                                    {[{ value: "cash", label: "Tiền mặt" }, { value: "transfer", label: "Chuyển khoản" }, { value: "pos", label: "POS" }].map((method) => (
                                        <button
                                            key={method.value}
                                            type="button"
                                            className={`fm-method-btn ${paymentMethod === method.value ? "active" : ""}`}
                                            onClick={() => setPaymentMethod(method.value)}
                                        >
                                            {method.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {paymentMethod === 'cash' && (
                                <div className="fm-change-box">
                                    <div className="change-label">Tiền thừa trả khách</div>
                                    <div className="change-value">{formatMoney(changeDue)} ₫</div>
                                </div>
                            )}

                            <label className="fm-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={issueEInvoice}
                                    onChange={(e) => setIssueEInvoice(e.target.checked)}
                                />
                                Xuất hóa đơn điện tử
                            </label>

                            <div className="fm-form-group">
                                <label>Ghi chú (tùy chọn)</label>
                                <input
                                    type="text"
                                    className="fee-input full-width"
                                    placeholder="Ví dụ: thu đủ, phụ huynh nhận biên nhận"
                                    value={transactionNote}
                                    onChange={(e) => setTransactionNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="fee-modal-footer">
                            <button className="btn-secondary" onClick={() => setModalData(null)}>Hủy bỏ</button>
                            <button className="btn-primary" onClick={handleConfirmPayment} disabled={isUnderpaid}>
                                <FiCheckCircle /> Xác nhận thu tiền
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
