import React, { useState, useMemo, useEffect } from "react";
import { FiDollarSign, FiSearch, FiFileText, FiX, FiCheckCircle, FiSend, FiPrinter } from "react-icons/fi";
import { toast } from "react-toastify";
import { Pagination } from "../../../../../components/common";
import Select from "../../../../../components/ui/Select/Select";
import { financeService } from "../../../../../services/pages/management/finance";
import { studentsService } from "../../../../../services/pages/management/users";
import { classesService } from "../../../../../services/pages/management/classes";

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "unpaid", label: "Chưa đóng" },
    { value: "paid", label: "Đã đóng" },
    { value: "overdue", label: "Quá hạn" }
];

const SCOPE_OPTIONS = [
    { value: "school", label: "Toàn trường" },
    { value: "grade", label: "Theo Khối" }
];

const GRADE_OPTIONS = [
    { value: "10", label: "Khối 10" },
    { value: "11", label: "Khối 11" },
    { value: "12", label: "Khối 12" }
];

export default function FeeListTab({ schoolYear, term }) {
    // API Data States
    const [debts, setDebts] = useState([]);
    const [allStudentsList, setAllStudentsList] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
    const [invoiceModal, setInvoiceModal] = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceLoading2, setInvoiceLoading2] = useState(false);

    // Load initial student profiles and class catalogs
    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [studentRes, classRes] = await Promise.all([
                studentsService.listStudents({ params: { limit: 2000 } }),
                classesService.listClasses()
            ]);
            
            const studentData = studentRes?.success ? studentRes.data : (Array.isArray(studentRes) ? studentRes : []);
            const classData = classRes?.success ? classRes.data : (Array.isArray(classRes) ? classRes : []);
            
            console.log("[FeeListTab] Students loaded:", studentData.length);
            console.log("[FeeListTab] Classes loaded:", classData.length);
            console.log("[FeeListTab] Sample student:", studentData[0]);
            console.log("[FeeListTab] Sample class:", classData[0]);
            
            setAllStudentsList(studentData);
            setClasses(classData);
        } catch (err) {
            console.error("Failed to load initial data for school fees:", err);
            setAllStudentsList([]);
            setClasses([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load debt accounts whenever context changes
    const loadDebts = async () => {
        setIsLoading(true);
        try {
            const res = await financeService.listDebts({
                params: {
                    limit: 2000
                }
            });
            console.log("[FeeListTab] Debts API response:", res);
            
            if (res?.success && res.data) {
                setDebts(res.data);
                console.log("[FeeListTab] Debts loaded:", res.data.length);
            } else if (Array.isArray(res)) {
                setDebts(res);
                console.log("[FeeListTab] Debts loaded (array):", res.length);
            } else {
                console.log("[FeeListTab] No debts data found");
                setDebts([]);
            }
        } catch (err) {
            console.error("Failed to load student debts:", err);
            setDebts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadDebts();
    }, [schoolYear, term]);

    // Build Sequential Class Options matching chosen Grade Level
    const classOptions = useMemo(() => {
        if (!selectedGrade) return [];
        return classes
            .filter(c => c.grade === `Khối ${selectedGrade}`)
            .map(c => ({ value: c.id, label: `Lớp ${c.name}` }));
    }, [classes, selectedGrade]);

    // Parse backend debt items to UI friendly formats
    const parsedStudents = useMemo(() => {
        if (!debts.length || !allStudentsList.length) {
            // If no students list, just use debt data directly
            if (!allStudentsList.length && debts.length) {
                console.log("[FeeListTab] No students list, mapping debts directly:", debts.slice(0, 3));
                return debts.map((d, idx) => ({
                    id: d.id,
                    studentCode: d.student_code || d.studentCode || `HS${d.student_id || idx + 1}`,
                    studentId: d.student_id || d.studentId || idx + 1,
                    name: d.student_name || d.studentName || d.student?.fullName || "Học sinh",
                    class: d.className || d.class?.name || "Chưa phân lớp",
                    grade: "10",
                    amount: new Intl.NumberFormat('vi-VN').format(d.amount || 0),
                    reqAmount: (d.amount || 0) - (d.paid_amount ?? d.paidAmount ?? 0),
                    originalAmount: d.amount || 0,
                    paidAmount: d.paid_amount ?? d.paidAmount ?? 0,
                    status: d.status || "unpaid"
                }));
            }
            return [];
        }

        const studentMap = {};
        allStudentsList.forEach(s => {
            const sid = s.id || s.studentId || s.student_id || s.userId;
            const tableId = s.studentTableId || s.student_table_id || s.studentTable?.id;
            
            studentMap[sid] = s;
            if (tableId) studentMap[tableId] = s;
            
            const code = s.studentCode || s.student_code || s.code;
            if (code) studentMap[code] = s;
        });

        return debts.map(d => {
            // Support multiple field name formats from debt API
            const sid = d.student_id || d.studentId || d.student?.id;
            const studentCode = d.student_code || d.studentCode || d.student?.studentCode || d.student?.code || "";
            const studentName = d.student_name || d.studentName || d.student?.fullName || d.student?.name || "Học sinh";
            const paidAmount = d.paid_amount ?? d.paidAmount ?? 0;
            const debtAmount = d.amount ?? d.totalAmount ?? 0;
            const debtStatus = d.status || "unpaid";
            
            const studentProfile = studentMap[sid] || studentMap[studentCode];
            const className = studentProfile?.className || studentProfile?.class_name || d.className || d.class?.name || "Chưa phân lớp";
            const grade = className.match(/\d+/) ? className.match(/\d+/)[0] : "10";

            return {
                id: d.id,
                studentCode: studentCode,
                studentId: sid,
                name: studentName,
                class: className,
                grade: grade,
                amount: new Intl.NumberFormat('vi-VN').format(debtAmount),
                reqAmount: debtAmount - paidAmount,
                originalAmount: debtAmount,
                paidAmount: paidAmount,
                status: debtStatus
            };
        });
    }, [debts, allStudentsList]);

    // Apply filters matching search query, scope, and status
    const filteredStudents = useMemo(() => {
        return parsedStudents.filter(s => {
            // More flexible status matching
            let matchesStatus = true;
            if (filterStatus !== "all") {
                const statusLower = (s.status || "").toLowerCase();
                if (filterStatus === "unpaid") {
                    matchesStatus = statusLower === "unpaid" || statusLower === "pending" || statusLower === "open" || !statusLower;
                } else if (filterStatus === "paid") {
                    matchesStatus = statusLower === "paid" || statusLower === "completed";
                } else if (filterStatus === "overdue") {
                    matchesStatus = statusLower === "overdue" || statusLower === "expired";
                }
            }
            
            let matchesScope = true;
            if (filterScope === "grade") {
                if (selectedGrade && s.grade !== selectedGrade) {
                    matchesScope = false;
                }
                if (selectedClass) {
                    const targetClassObj = classes.find(c => c.id === Number(selectedClass));
                    if (targetClassObj && s.class !== targetClassObj.name) {
                        matchesScope = false;
                    }
                }
            }

            const matchesSearch = searchQuery === "" ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.studentCode.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesScope && matchesSearch;
        });
    }, [parsedStudents, filterStatus, filterScope, selectedGrade, selectedClass, searchQuery, classes]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = useMemo(() => {
        return filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredStudents, currentPage]);

    // Reset quick collection overlay states when opening
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

    const handleConfirmPayment = async () => {
        const paidAmount = typeof amountPaid === 'number' ? amountPaid : parseInt(amountPaid.toString().replace(/,/g, '')) || 0;
        if (paidAmount <= 0) {
            toast.error("Số tiền thanh toán phải lớn hơn 0");
            return;
        }
        if (isUnderpaid) {
            toast.error("Số tiền thu chưa đủ, vui lòng kiểm tra lại.");
            return;
        }

        try {
            const res = await financeService.recordDebtPayment(modalData.id, {
                amount: paidAmount,
                paymentMethod,
            });
            if (res?.success) {
                toast.success(`Đã xác nhận thu học phí thành công cho ${modalData.name}`);
                setModalData(null);
                loadDebts();
            } else {
                toast.error(res?.error?.message || "Có lỗi khi ghi nhận thanh toán.");
            }
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Không rõ lỗi";
            toast.error("Không thể ghi nhận thanh toán: " + msg);
        }
    };

    const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val);

    const handleSignInvoice = async (student) => {
        setInvoiceLoading(true);
        try {
            const res = await financeService.signInvoice(student.id);
            if (res?.success) {
                toast.success(`Đã ký hóa đơn cho ${student.name}.`);
                setInvoiceModal(student);
                loadDebts();
            } else {
                toast.error(res?.error?.message || "Có lỗi khi ký hóa đơn.");
            }
        } catch (err) {
            toast.error("Có lỗi khi ký hóa đơn.");
        } finally {
            setInvoiceLoading(false);
        }
    };

    const handleSendInvoice = async (student) => {
        setInvoiceLoading2(true);
        try {
            const res = await financeService.sendInvoice(student.id, { body: {} });
            if (res?.success) {
                toast.success(`Đã gửi hóa đơn cho ${student.name}.`);
            } else {
                toast.error(res?.error?.message || "Có lỗi khi gửi hóa đơn.");
            }
        } catch (err) {
            toast.error("Có lỗi khi gửi hóa đơn.");
        } finally {
            setInvoiceLoading2(false);
        }
    };

    return (
        <div className="fee-panel">
            <div className="fee-header">
                <h3>Danh Sách Nộp Học Phí</h3>
                <div className="fee-toolbar">
                    {/* Status Filter */}
                    <Select
                        variant="custom"
                        options={STATUS_OPTIONS}
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="fee-select-custom"
                    />

                    {/* Scope Filter */}
                    <Select
                        variant="custom"
                        options={SCOPE_OPTIONS}
                        value={filterScope}
                        onChange={(e) => {
                            setFilterScope(e.target.value);
                            setCurrentPage(1);
                            if (e.target.value === 'school') {
                                setSelectedGrade("");
                                setSelectedClass("");
                            }
                        }}
                        className="fee-select-custom"
                    />

                    {/* Conditional Grade Selector */}
                    {filterScope === 'grade' && (
                        <Select
                            variant="custom"
                            options={GRADE_OPTIONS}
                            value={selectedGrade}
                            onChange={(e) => {
                                setSelectedGrade(e.target.value);
                                setSelectedClass("");
                                setCurrentPage(1);
                            }}
                            placeholder="Chọn Khối"
                            className="fee-select-custom animated-fade-in"
                        />
                    )}

                    {/* Sequential Class Selector */}
                    {filterScope === 'grade' && selectedGrade && (
                        <Select
                            variant="custom"
                            options={classOptions}
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Tất cả Lớp"
                            className="fee-select-custom animated-fade-in"
                        />
                    )}

                    {/* Search */}
                    <div className="fee-search-wrap">
                        <FiSearch className="search-icon" />
                        <input 
                            type="text" 
                            className="fee-input" 
                            placeholder="Tên HS hoặc Mã số..." 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
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
                                <td>{s.studentCode || s.id}</td>
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
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button
                                                className="fee-action-btn invoice"
                                                onClick={() => setInvoiceModal(s)}
                                                title="Xem hóa đơn"
                                                aria-label={`Xem hóa đơn của ${s.name}`}
                                            >
                                                <FiFileText />
                                            </button>
                                            <button
                                                className="fee-action-btn invoice"
                                                onClick={() => handleSignInvoice(s)}
                                                title="Ký hóa đơn"
                                                aria-label={`Ký hóa đơn của ${s.name}`}
                                            >
                                                <FiCheckCircle />
                                            </button>
                                            <button
                                                className="fee-action-btn invoice"
                                                onClick={() => handleSendInvoice(s)}
                                                title="Gửi hóa đơn"
                                                aria-label={`Gửi hóa đơn cho ${s.name}`}
                                            >
                                                <FiSend />
                                            </button>
                                        </div>
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
                                    <span>{modalData.studentCode || modalData.id} | Lớp {modalData.class}</span>
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

            {/* Invoice Modal */}
            {invoiceModal && (
                <div className="fee-modal-overlay">
                    <div className="fee-modal">
                        <div className="fee-modal-header">
                            <div>
                                <h3>Hóa đơn điện tử</h3>
                                <p className="fm-modal-subtitle">{invoiceModal.name} — {invoiceModal.studentCode || invoiceModal.id}</p>
                            </div>
                            <button className="btn-close-modal" onClick={() => setInvoiceModal(null)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="fee-modal-body">
                            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                                <FiFileText style={{ fontSize: "3rem", color: "#2563eb", marginBottom: "0.5rem" }} />
                                <h4 style={{ margin: "0.5rem 0" }}>Hóa đơn điện tử</h4>
                                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                    Học sinh: <strong>{invoiceModal.name}</strong> — Lớp {invoiceModal.class}
                                </p>
                                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                                    Số tiền đã thanh toán: <strong style={{ color: "#16a34a" }}>{formatMoney(invoiceModal.paidAmount)} đ</strong>
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1rem" }}>
                                <button className="btn-secondary" onClick={() => setInvoiceModal(null)}>Đóng</button>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        window.print();
                                    }}
                                    disabled={invoiceLoading}
                                >
                                    <FiPrinter /> In hóa đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

