import React, { useState, useMemo } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import PaymentActionsSection from "./components/paymentActionsSection";
import TuitionFeeSection from "./components/tuitionFeeSection";
import TransferInfoSection from "./components/transferInfoSection";
import SchoolExpenditureSection from "./components/schoolExpenditureSection";
import "./ManagementPayment.css";
import paymentService from "../../../services/pages/management/payment/paymentService";

const resolveTermKeyByLabel = (term) => {
    if (term === "Học kỳ 1" || term === "hk1") return "hk1";
    if (term === "Học kỳ 2" || term === "hk2") return "hk2";
    return term;
};

const getErrorMessage = (error, fallback) => {
    const apiError = error?.response?.data?.error;
    const apiMessage = error?.response?.data?.message;
    return apiMessage || apiError || fallback;
};

const ManagementPayment = () => {
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
    const expenditures = [];

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

    const groupedFees = useMemo(() => {
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
        <div className="management-payment-page">
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

export default ManagementPayment;

