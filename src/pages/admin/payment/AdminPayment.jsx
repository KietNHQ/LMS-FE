import React, { useState, useMemo } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import PaymentActionsSection from "./components/paymentActionsSection";
import TuitionFeeSection from "./components/tuitionFeeSection";
import TransferInfoSection from "./components/transferInfoSection";
import SchoolExpenditureSection from "./components/schoolExpenditureSection";
import "./AdminPayment.css";
import paymentService from "../../../services/pages/management/payment/paymentService";

// --- MOCK DATA ---
const resolveTermKeyByLabel = (term) => {
    if (term === "Học kỳ 1" || term === "hk1") return "hk1";
    if (term === "Học kỳ 2" || term === "hk2") return "hk2";
    return term;
};

const MOCK_TUITION = {
    "10": {
        hk1: [
            { name: "Học phí (Tiết chuẩn)", amount: 3000000, note: "Bắt buộc" },
            { name: "Sách giáo khoa", amount: 500000, note: "Bắt buộc" },
            { name: "Bảo hiểm y tế", amount: 800000, note: "Bắt buộc" }
        ],
        hk2: [
            { name: "Học phí (Tiết chuẩn)", amount: 1500000, note: "Bắt buộc" },
            { name: "Phi kỹ năng sống", amount: 400000, note: "Tự nguyện" }
        ]
    },
    "11": {
        hk1: [
            { name: "Học phí (Tiết chuẩn)", amount: 3000000, note: "Bắt buộc" },
            { name: "Đồng phục thể dục", amount: 600000, note: "Phát sinh" }
        ],
        hk2: [
            { name: "Học phí (Tiết chuẩn)", amount: 1500000, note: "Bắt buộc" }
        ]
    },
    "12": {
        hk1: [
            { name: "Học phí (Tiết chuẩn)", amount: 3000000, note: "Bắt buộc" },
            { name: "Lệ phí thi tốt nghiệp", amount: 1000000, note: "Bắt buộc" }
        ],
        hk2: [
            { name: "Học phí (Tiết chuẩn)", amount: 1500000, note: "Bắt buộc" }
        ]
    }
};


const getErrorMessage = (error, fallback) => {
    const apiError = error?.response?.data?.error;
    const apiMessage = error?.response?.data?.message;
    return apiMessage || apiError || fallback;
};

const AdminPayment = () => {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const selectedTermKey = resolveTermKeyByLabel(selectedTerm);

    // States for filter
    const [selectedGrade, setSelectedGrade] = useState("Tất cả khối");
    const gradeOptions = ["Tất cả khối", "Khối 10", "Khối 11", "Khối 12"];

    // State for Tabs
    const [activeTab, setActiveTab] = useState("tuition");
    const [fees, setFees] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    // Mock data for expenditures as Backend doesn't have it yet
    const [expenditures] = useState([
        { id: "GD001", category: "Sửa chữa", description: "Bảo trì máy chiếu phòng học 201", date: "05/10/2025", personInCharge: "Nguyễn Văn Bảo Trì", amount: 1500000 },
        { id: "GD002", category: "Sự kiện", description: "Thuê MC khai giảng", date: "05/09/2025", personInCharge: "Lê Yến", amount: 3000000 },
    ]);

    // Fetch Fees
    React.useEffect(() => {
        const fetchFees = async () => {
            setIsLoading(true);
            setLoadError("");
            try {
                // In a real scenario, we'd map selectedSchoolYear/selectedTerm to IDs
                // For now, listing all and we'll filter client-side if needed
                const result = await paymentService.listFees();
                setFees(result.items || []);
            } catch (error) {
                setLoadError(getErrorMessage(error, "Không thể tải danh sách học phí."));
            } finally {
                setIsLoading(false);
            }
        };
        fetchFees();
    }, [selectedSchoolYear, selectedTerm]);

    // Fetch Bank Accounts
    React.useEffect(() => {
        const fetchBankAccounts = async () => {
            try {
                const accounts = await paymentService.listBankAccounts();
                setBankAccounts(accounts);
            } catch (error) {
                console.error("Error fetching bank accounts:", error);
            }
        };
        fetchBankAccounts();
    }, []);

    // Process fees to match UI structure (grouping by Grade is mock for now since DB doesn't have it)
    const groupedFees = useMemo(() => {
        // Map API items to UI structure
        const mappedFees = fees.map(f => ({
            name: f.name,
            amount: f.amount,
            note: f.is_mandatory ? "Bắt buộc" : "Tự nguyện",
            description: f.description
        }));

        // Group by Semester
        const result = {
            "Chung": {
                hk1: mappedFees.filter((_, idx) => fees[idx].semester_name?.includes("1")),
                hk2: mappedFees.filter((_, idx) => fees[idx].semester_name?.includes("2")),
            }
        };
        return result;
    }, [fees]);

    return (
        <div className="admin-payment-page">
            <PageHeader 
                title="Quản Lý Thanh Toán" 
                eyebrow="Tài chính trường học"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <PaymentActionsSection
                selectedGrade={selectedGrade}
                gradeOptions={gradeOptions}
                onGradeChange={setSelectedGrade}
            />

            {/* TABS HEADER */}
            <div className="payment-tabs-container">
                <button 
                    className={`payment-tab-btn ${activeTab === 'tuition' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tuition')}
                >
                    Học Phí Các Khối
                </button>
                <button 
                    className={`payment-tab-btn ${activeTab === 'expenditure' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expenditure')}
                >
                    Chi Tiêu Trường
                </button>
                <button 
                    className={`payment-tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transfer')}
                >
                    Thông Tin Chuyển Khoản
                </button>
            </div>

            {/* TABS CONTENT */}
            <div className="payment-tab-content">
                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>Đang tải dữ liệu...</div>
                ) : loadError ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>{loadError}</div>
                ) : (
                    <>
                        {activeTab === 'tuition' && (
                            <TuitionFeeSection 
                                key={`${selectedSchoolYear}-${selectedTerm}-${selectedGrade}`}
                                tuitionData={groupedFees}
                                selectedGrade={selectedGrade} 
                                selectedTerm={selectedTerm}
                                selectedTermKey={selectedTermKey}
                                selectedSchoolYear={selectedSchoolYear}
                            />
                        )}
                        {activeTab === 'expenditure' && (
                            <SchoolExpenditureSection expenditureData={expenditures} />
                        )}
                        {activeTab === 'transfer' && (
                            <TransferInfoSection accounts={bankAccounts} />
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default AdminPayment;


