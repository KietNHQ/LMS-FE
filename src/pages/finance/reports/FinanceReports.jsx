import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiDownload, FiFileText, FiPieChart, FiTrendingUp } from "react-icons/fi";
import { toast } from "react-toastify";
import "./FinanceReports.css";

export default function FinanceReports() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const handleExport = (type) => {
        toast.info(`Hệ thống đang trích xuất dữ liệu sang định dạng ${type.toUpperCase()}...`);
    };

    return (
        <div className="fin-reports">
            <PageHeader
                title="Báo Cáo Tài Chính"
                eyebrow="Kết xuất số liệu doanh thu và chi tiết công nợ phục vụ hạch toán"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="report-toolbar">
                <div className="report-filter">
                    <select className="rp-select">
                        <option>Báo cáo Doanh thu Tháng 10</option>
                        <option>Báo cáo Quý 3</option>
                        <option>Tổng kết Học kỳ I</option>
                    </select>
                </div>
                <div className="rp-actions">
                    <button className="btn-export excel" onClick={() => handleExport('excel')}>
                        <FiFileText /> Xuất Excel
                    </button>
                    <button className="btn-export pdf" onClick={() => handleExport('pdf')}>
                        <FiDownload /> Xuất PDF
                    </button>
                </div>
            </div>

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
                                <span>Học phí định kỳ (65%)</span>
                            </div>
                            <strong>8,125,000,000 ₫</strong>
                        </div>
                        <div className="pl-item">
                            <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#10b981'}}></div>
                                <span>Phí Bán trú / Xe buýt (20%)</span>
                            </div>
                            <strong>2,500,000,000 ₫</strong>
                        </div>
                        <div className="pl-item">
                            <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                <div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#f59e0b'}}></div>
                                <span>Phí Đồng phục / Ngoại khóa (15%)</span>
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
                                <th style={{textAlign: 'right', padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem'}}>Đã Thu Thực Tế</th>
                                <th style={{textAlign: 'right', padding: '1rem 0.5rem', color: '#475569', fontSize: '0.85rem'}}>Công Nợ Tồn</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{borderBottom: '1px solid #e2e8f0'}}>
                                <td style={{padding: '1rem 0.5rem', fontWeight: 500}}>Học phí toàn phần</td>
                                <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#16a34a', fontWeight: 600}}>10,000,000,000 ₫</td>
                                <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#dc2626'}}>350,000,000 ₫</td>
                            </tr>
                            <tr style={{borderBottom: '1px solid #e2e8f0'}}>
                                <td style={{padding: '1rem 0.5rem', fontWeight: 500}}>Quỹ cơ sở vật chất</td>
                                <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#16a34a', fontWeight: 600}}>1,500,000,000 ₫</td>
                                <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#dc2626'}}>50,000,000 ₫</td>
                            </tr>
                            <tr style={{borderBottom: '1px solid #e2e8f0'}}>
                                <td style={{padding: '1rem 0.5rem', fontWeight: 500}}>Bảo hiểm Y tế</td>
                                <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#16a34a', fontWeight: 600}}>1,000,000,000 ₫</td>
                                <td style={{padding: '1rem 0.5rem', textAlign: 'right', color: '#dc2626'}}>50,000,000 ₫</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style={{padding: '1.5rem 0.5rem', fontWeight: 700, color: '#0f172a'}}>TỔNG CỘNG</td>
                                <td style={{padding: '1.5rem 0.5rem', textAlign: 'right', color: '#16a34a', fontWeight: 700, fontSize: '1.1rem'}}>12,500,000,000 ₫</td>
                                <td style={{padding: '1.5rem 0.5rem', textAlign: 'right', color: '#dc2626', fontWeight: 700, fontSize: '1.1rem'}}>450,000,000 ₫</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
