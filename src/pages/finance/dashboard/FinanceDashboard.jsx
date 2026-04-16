import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiDollarSign, FiAlertCircle, FiTrendingUp, FiUsers, FiBarChart2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./FinanceDashboard.css";

export default function FinanceDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const stats = {
        totalRevenue: "12,500,000,000",
        totalDebt: "450,000,000",
        collectionRate: 96.5,
        unpaidStudents: 52
    };

    const alerts = [
        { id: 1, title: "Cảnh báo Thu phí", desc: "Hơn 50 học sinh chưa hoàn tất học phí kỳ 1.", link: "/finance/payment-hub" },
        { id: 2, title: "Nợ quá hạn nghiêm trọng", desc: "Có 20 khoản nợ đã vượt quá 30 ngày quy định.", link: "/finance/payment-hub" },
        { id: 3, title: "Dòng tiền chậm lại", desc: "Tốc độ thu học phí tháng 10 giảm 15% so với tháng 9.", link: "/finance/reports" }
    ];

    const chartData = [
        { month: 'Khối 10', thu: 85, no: 15, thuStr: '3.5T', noStr: '150tr' },
        { month: 'Khối 11', thu: 92, no: 8, thuStr: '4.2T', noStr: '80tr' },
        { month: 'Khối 12', thu: 95, no: 5, thuStr: '4.8T', noStr: '50tr' },
    ];

    return (
        <div className="fin-dashboard">
            <PageHeader
                title="Bảng Điều Khiển Kế Toán"
                eyebrow="Theo dõi dòng tiền, doanh thu và công nợ toàn mạng lưới"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="fin-stats-grid">
                <div className="fin-stat-card success">
                    <div className="fin-stat-icon"><FiTrendingUp /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Tổng Doanh Thu Đã Thu</p>
                        <h3 className="fin-stat-value fin-money-val">{stats.totalRevenue} ₫</h3>
                    </div>
                </div>
                <div className="fin-stat-card warning">
                    <div className="fin-stat-icon"><FiDollarSign /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Tổng Công Nợ Tồn Đọng</p>
                        <h3 className="fin-stat-value" style={{color: '#d97706'}}>{stats.totalDebt} ₫</h3>
                    </div>
                </div>
                <div className="fin-stat-card primary">
                    <div className="fin-stat-icon"><FiUsers /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Tỷ lệ Hoàn thành Học phí</p>
                        <h3 className="fin-stat-value">{stats.collectionRate}%</h3>
                    </div>
                </div>
                <div className="fin-stat-card danger">
                    <div className="fin-stat-icon"><FiAlertCircle /></div>
                    <div className="fin-stat-body">
                        <p className="fin-stat-label">Học sinh nợ học phí</p>
                        <h3 className="fin-stat-value" style={{color: '#dc2626'}}>{stats.unpaidStudents} HS</h3>
                    </div>
                </div>
            </div>

            <div className="fin-panels">
                {/* Biểu đồ Doanh Thu / Công nợ */}
                <div className="fin-panel">
                    <div className="fin-panel-header">
                        <FiBarChart2 /> Phân Bổ Thu & Nợ theo Khối Chuyên Môn
                    </div>
                    
                    <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1rem'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem'}}>
                            <div style={{width:'15px', height:'15px', background:'#10b981', borderRadius:'3px'}}></div> Đã thu
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem'}}>
                            <div style={{width:'15px', height:'15px', background:'#ef4444', borderRadius:'3px'}}></div> Còn nợ
                        </div>
                    </div>

                    <div className="fin-chart-mock">
                        {chartData.map((d, i) => (
                            <div key={i} style={{display: 'flex', gap: '0.5rem', height:'100%', alignItems: 'flex-end', width: '25%'}}>
                                {/* Thu Bar */}
                                <div className="fc-bar" style={{height: `${d.thu}%`}}>
                                    <span>{d.thuStr}</span>
                                </div>
                                {/* Nợ Bar */}
                                <div className="fc-bar debt" style={{height: `${d.no * 2}%`}}> {/* *2 for visibility mock */}
                                    <span style={{color: '#991b1b'}}>{d.noStr}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-around', marginTop: '0.5rem', paddingLeft: '1rem'}}>
                        {chartData.map((d, i) => <div key={i} className="fc-label">{d.month}</div>)}
                    </div>
                </div>

                {/* Cảnh Báo Action */}
                <div className="fin-panel urgent">
                    <div className="fin-panel-header">
                        <FiAlertCircle /> Rủi Ro Dòng Tiền & Cảnh Báo
                    </div>
                    <div className="fin-alert-list">
                        {alerts.map(a => (
                            <div className="fin-alert-item" key={a.id}>
                                <strong>{a.title}</strong>
                                <span>{a.desc}</span>
                                <Link to={a.link} style={{fontSize:'0.8rem', color:'#1d4ed8', marginTop:'0.5rem', fontWeight:600, textDecoration:'none'}}> Xử lý ngay &rarr;</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
