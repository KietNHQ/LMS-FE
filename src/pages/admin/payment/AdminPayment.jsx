import React, { useState, useMemo } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import PaymentActionsSection from "./components/paymentActionsSection";
import TuitionFeeSection from "./components/tuitionFeeSection";
import ClassFundSection from "./components/classFundSection";
import TransferInfoSection from "./components/transferInfoSection";
import SchoolExpenditureSection from "./components/schoolExpenditureSection";
import "./AdminPayment.css";

// --- MOCK DATA ---
const MOCK_TUITION = {
    "10": {
        total: 5500000,
        details: [
            { name: "Học phí cơ sở", amount: 3000000, note: "Bắt buộc" },
            { name: "Cơ sở vật chất", amount: 1500000, note: "Bắt buộc" },
            { name: "Đồng phục", amount: 1000000, note: "Tự chọn" }
        ]
    },
    "11": {
        total: 5200000,
        details: [
            { name: "Học phí cơ sở", amount: 3000000, note: "Bắt buộc" },
            { name: "Cơ sở vật chất", amount: 1500000, note: "Bắt buộc" },
            { name: "Quỹ hoạt động", amount: 700000, note: "Bắt buộc" }
        ]
    },
    "12": {
        total: 6000000,
        details: [
            { name: "Học phí cơ sở", amount: 3500000, note: "Bắt buộc" },
            { name: "Cơ sở vật chất", amount: 1500000, note: "Bắt buộc" },
            { name: "Lệ phí thi hộ", amount: 1000000, note: "Bắt buộc" }
        ]
    }
};

const MOCK_CLASS_FUNDS = [
    { className: "10A1", teacher: "Cô Hoa", totalCollected: 12000000, totalSpent: 4500000, studentContributions: [{ name: "Nguyễn Văn A", amount: 300000, isPaid: true }], expenditures: [{ desc: "Mua chậu hoa", amount: 500000, date: "15/09/2025" }] },
    { className: "10A2", teacher: "Thầy Bình", totalCollected: 11000000, totalSpent: 3000000, studentContributions: [], expenditures: [] },
    { className: "10A3", teacher: "Cô Cúc", totalCollected: 9000000, totalSpent: 1000000, studentContributions: [], expenditures: [] },
    { className: "11B1", teacher: "Cô Đào", totalCollected: 15000000, totalSpent: 8000000, studentContributions: [], expenditures: [] },
    { className: "11B2", teacher: "Thầy Hùng", totalCollected: 10000000, totalSpent: 2000000, studentContributions: [], expenditures: [] },
    { className: "11B3", teacher: "Cô Lan", totalCollected: 12500000, totalSpent: 5000000, studentContributions: [], expenditures: [] },
    { className: "12C1", teacher: "Thầy Minh", totalCollected: 20000000, totalSpent: 15000000, studentContributions: [], expenditures: [] },
    { className: "12C2", teacher: "Cô Nguyệt", totalCollected: 18000000, totalSpent: 6000000, studentContributions: [], expenditures: [] },
    { className: "12C3", teacher: "Thầy Phước", totalCollected: 14000000, totalSpent: 4000000, studentContributions: [], expenditures: [] }
];

const MOCK_SCHOOL_EXPENDITURE = [
    { id: "GD001", category: "Sửa chữa", description: "Bảo trì máy chiếu phòng học 201", date: "05/10/2025", personInCharge: "Nguyễn Văn Bảo Trì", amount: 1500000 },
    { id: "GD002", category: "Sự kiện", description: "Thuê MC khai giảng", date: "05/09/2025", personInCharge: "Lê Yến", amount: 3000000 },
    { id: "GD003", category: "Cơ sở vật chất", description: "Nhập 50 bộ bàn ghế mới", date: "20/08/2025", personInCharge: "Trần Mua Sắm", amount: 75000000 },
    { id: "GD004", category: "Văn phòng phẩm", description: "Mua mực in và giấy A4", date: "10/10/2025", personInCharge: "Hà Kế Toán", amount: 5000000 },
    { id: "GD005", category: "Điện nước", description: "Thanh toán tiền điện tháng 9", date: "25/09/2025", personInCharge: "Trường Admin", amount: 15000000 },
    { id: "GD006", category: "Vệ sinh", description: "Thuê dịch vụ dọn dẹp tổng thể", date: "01/10/2025", personInCharge: "Cô Tạp Vụ", amount: 2000000 },
    { id: "GD007", category: "Khen thưởng", description: "Mua quà tặng HS xuất sắc", date: "20/09/2025", personInCharge: "Thầy Hiệu Trưởng", amount: 10000000 },
    { id: "GD008", category: "Công nghệ", description: "Nâng cấp hệ thống WiFi", date: "15/10/2025", personInCharge: "Đội IT", amount: 25000000 }
];

const AdminPayment = () => {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    
    // States for filter
    const [selectedGrade, setSelectedGrade] = useState("Tất cả khối");
    const gradeOptions = ["Tất cả khối", "Khối 10", "Khối 11", "Khối 12"];

    // State for Tabs
    const [activeTab, setActiveTab] = useState("tuition");

    // Filter logic for Class Funds based on selectedGrade
    const filteredClassFunds = useMemo(() => {
        return MOCK_CLASS_FUNDS.filter(fund => {
            const matchesGrade = selectedGrade === "Tất cả khối" || fund.className.startsWith(selectedGrade.replace("Khối ", ""));
            return matchesGrade;
        });
    }, [selectedGrade]);

    // Filter logic for School Expenditure
    const filteredExpenditures = useMemo(() => {
        return MOCK_SCHOOL_EXPENDITURE;
    }, []);

    // For simplicity, tuition filtering just by grade (hiding non-selected grades)
    const filteredTuition = useMemo(() => {
        const result = {};
        for (const [grade, data] of Object.entries(MOCK_TUITION)) {
            if (selectedGrade === "Tất cả khối" || selectedGrade === `Khối ${grade}`) {
                result[grade] = data;
            }
        }
        return result;
    }, [selectedGrade]);

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
                    className={`payment-tab-btn ${activeTab === 'funds' ? 'active' : ''}`}
                    onClick={() => setActiveTab('funds')}
                >
                    Quỹ Lớp
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
                {activeTab === 'tuition' && (
                    <TuitionFeeSection tuitionData={filteredTuition} selectedGrade={selectedGrade} />
                )}
                {activeTab === 'funds' && (
                    <ClassFundSection classFundData={filteredClassFunds} />
                )}
                {activeTab === 'expenditure' && (
                    <SchoolExpenditureSection expenditureData={filteredExpenditures} />
                )}
                {activeTab === 'transfer' && (
                    <TransferInfoSection />
                )}
            </div>

        </div>
    );
};

export default AdminPayment;

