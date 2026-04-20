import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiPieChart, FiTrendingUp, FiFileText, FiShield } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import "./FinanceReports.css";

// Components
import InvoiceCenter from "./components/InvoiceCenter";
import ComplianceBooks from "./components/ComplianceBooks";

const TABS = [
    { id: "analytics", label: "Phân tích nội bộ", icon: <FiPieChart /> },
    { id: "invoices", label: "Quản lý Hóa đơn", icon: <FiFileText /> },
    { id: "compliance", label: "Sổ sách chuẩn TT24", icon: <FiShield /> },
];

export default function FinanceReports() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "analytics";

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    return (
        <div className="fin-reports">
            <PageHeader
                title="Báo Cáo & Công Khai Tài Chính"
                eyebrow="Quản lý hóa đơn điện tử và các mẫu biểu kế toán nhà nước"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="fin-fee__tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`fin-fee__tab ${activeTab === tab.id ? "active" : ""}`}
                        onClick={() => handleTabChange(tab.id)}
                        style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>


            <div className="report-content" style={{marginTop: '1.5rem'}}>
                {activeTab === "analytics" && (
                    <div className="report-charts">
                        <div className="report-panel">
                            <h3 className="rp-header"><FiPieChart /> Cơ cấu Nguồn thu</h3>
                            <div className="doughnut-container">
                                <div className="mock-pie">
                                    <div className="mock-hole">
                                        <strong style={{fontSize: '1.25rem', color: '#0f172a'}}>12.5 Tỷ</strong>
                                        <span style={{fontSize: '0.75rem', color: '#64748b'}}>Tổng thu</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pie-legend">
                                <div className="pl-item">
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                        <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#3b82f6'}}></div>
                                        <span>Học phí chính (65%)</span>
                                    </div>
                                    <strong>8,125,000,000 ₫</strong>
                                </div>
                                <div className="pl-item">
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                        <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#10b981'}}></div>
                                        <span>Dịch vụ bán trú (20%)</span>
                                    </div>
                                    <strong>2,500,000,000 ₫</strong>
                                </div>
                                <div className="pl-item">
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                        <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#f59e0b'}}></div>
                                        <span>Các khoản thu hộ (15%)</span>
                                    </div>
                                    <strong>1,875,000,000 ₫</strong>
                                </div>
                            </div>
                        </div>

                        <div className="report-panel">
                            <h3 className="rp-header"><FiTrendingUp /> Thống kê Thu / Nợ cấp trường (Năm học này)</h3>
                            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem'}}>
                                <thead>
                                    <tr style={{borderBottom: '2px solid #e2e8f0'}}>
                                        <th style={{textAlign: 'left', padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem'}}>Khoản Phí</th>
                                        <th style={{textAlign: 'right', padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem'}}>Đã Thu</th>
                                        <th style={{textAlign: 'right', padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem'}}>Công Nợ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{borderBottom: '1px solid #e2e8f0'}}>
                                        <td style={{padding: '1rem 0.5rem', fontWeight: 500}}>Học phí chính quy</td>
                                        <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#16a34a', fontWeight: 600}}>10 tỷ ₫</td>
                                        <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#dc2626'}}>350tr ₫</td>
                                    </tr>
                                    <tr style={{borderBottom: '1px solid #e2e8f0'}}>
                                        <td style={{padding: '1rem 0.5rem', fontWeight: 500}}>Cơ sở vật chất</td>
                                        <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#16a34a', fontWeight: 600}}>1.5 tỷ ₫</td>
                                        <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#dc2626'}}>50tr ₫</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td style={{padding: '1.5rem 0.5rem', fontWeight: 700, color: '#0f172a'}}>TỔNG</td>
                                        <td style={{padding: '1.5rem 0.5rem', textAlign: 'right', color: '#16a34a', fontWeight: 700}}>12.5 Tỷ ₫</td>
                                        <td style={{padding: '1.5rem 0.5rem', textAlign: 'right', color: '#dc2626', fontWeight: 700}}>450tr ₫</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "invoices" && <InvoiceCenter />}
                {activeTab === "compliance" && <ComplianceBooks />}
            </div>
        </div>
    );
}

