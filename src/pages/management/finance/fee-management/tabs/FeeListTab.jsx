import React, { useState, useMemo, useEffect } from "react";
import { FiDollarSign, FiSearch, FiFileText, FiX, FiCheckCircle } from "react-icons/fi";
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

    // Load initial student profiles and class catalogs
    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [studentRows, classRows] = await Promise.all([
                studentsService.listStudents(),
                classesService.listClasses()
            ]);
            setAllStudentsList(studentRows);
            setClasses(classRows);
        } catch (err) {
            console.error("Failed to load initial data for school fees:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load debt accounts whenever context changes
    const loadDebts = async () => {
        if (!schoolYear) return;
        setIsLoading(true);
        try {
            const res = await financeService.listDebts({
                params: {
                    schoolYearId: schoolYear,
                    semesterId: term,
                    limit: 2000 // Get a rich collection for lightning fast client filtering
                }
            });
            if (res && res.data) {
                setDebts(res.data);
            }
        } catch (err) {
            console.error("Failed to load student debts:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        loadDebts();
    }, [schoolYear, term, filterStatus, selectedClass, filterScope]);

    // Build Sequential Class Options matching chosen Grade Level
    const classOptions = useMemo(() => {
        if (!selectedGrade) return [];
        return classes
            .filter(c => c.grade === `Khối ${selectedGrade}`)
            .map(c => ({ value: c.id, label: `Lớp ${c.name}` }));
    }, [classes, selectedGrade]);

    // Parse backend debt items to UI friendly formats
    const parsedStudents = useMemo(() => {
        const studentMap = {};
        allStudentsList.forEach(s => {
            studentMap[s.id] = s;
            if (s.studentTableId) {
                studentMap[s.studentTableId] = s;
            }
        });

        return debts.map(d => {
            const studentProfile = studentMap[d.student_id];
            const className = studentProfile?.className || "10A1";
            const grade = className.match(/\d+/) ? className.match(/\d+/)[0] : "10";

            return {
                id: d.id, // database integer ID of student debt
                studentCode: d.student_code || studentProfile?.studentCode || "",
                studentId: d.student_id,
                name: d.student_name || studentProfile?.name || "Học sinh",
                class: className,
                grade: grade,
                amount: new Intl.NumberFormat('vi-VN').format(d.amount),
                reqAmount: d.amount - d.paid_amount,
                originalAmount: d.amount,
                paidAmount: d.paid_amount,
                status: d.status
            };
        });
    }, [debts, allStudentsList]);

    // Apply filters matching search query, scope, and status
    const filteredStudents = useMemo(() => {
        return parsedStudents.filter(s => {
            const matchesStatus = filterStatus === "all" || s.status === filterStatus;
            
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
        if (isUnderpaid) {
            toast.error("Số tiền thu chưa đủ, vui lòng kiểm tra lại.");
            return;
        }

        try {
            await financeService.recordDebtPayment(modalData.id, { amount: amountPaid });
            toast.success(`Đã xác nhận thu học phí thành công cho ${modalData.name}`);
            setModalData(null);
            loadDebts();
        } catch (err) {
            toast.error("Không thể ghi nhận thanh toán: " + (err.response?.data?.error || err.message));
        }
    };

    const formatMoney = (val) => new Intl.NumberFormat('vi-VN').format(val);

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
        </div>
    );
}

