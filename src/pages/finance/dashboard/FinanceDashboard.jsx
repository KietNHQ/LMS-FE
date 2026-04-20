import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import {
    FiAlertCircle,
    FiBarChart2,
    FiCalendar,
    FiClock,
    FiDollarSign,
    FiPieChart,
    FiTarget,
    FiTrendingUp,
    FiUsers
} from "react-icons/fi";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { Link } from "react-router-dom";
import "./FinanceDashboard.css";

export default function FinanceDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    const summary = {
        actualRevenue: "12.50T",
        targetRevenue: "13.10T",
        revenueGap: "600tr",
        debt: "450tr",
        overdueDebt: "182tr",
        collectionRate: "96.5%",
        refundRate: "1.8%",
        unrecognizedRevenue: "320tr",
        pipelineRevenue: "610tr"
    };

    const monthlyRevenue = [
        { month: "08", actual: 1.45, unpaid: 55, debt: "55tr" },
        { month: "09", actual: 1.62, unpaid: 48, debt: "48tr" },
        { month: "10", actual: 1.15, unpaid: 82, debt: "82tr" },
        { month: "11", actual: 0.98, unpaid: 124, debt: "124tr" },
        { month: "12", actual: 1.08, unpaid: 141, debt: "141tr" },
        { month: "01", actual: 1.32, unpaid: 96, debt: "96tr" }
    ];
    const chartData = monthlyRevenue.map((item) => ({
        ...item,
        monthLabel: `Th${item.month}`
    }));

    const formatTrillionTick = (value) => `${Number(value).toFixed(1)}T`;
    const formatUnpaidTick = (value) => `${Math.round(Number(value))}tr`;

    const customTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) {
            return null;
        }

        const row = payload[0]?.payload;
        if (!row) {
            return null;
        }

        return (
            <div className="fin-revenue-tooltip">
                <p className="fin-revenue-tooltip__label">{label}</p>
                <p className="fin-revenue-tooltip__item">
                    <strong>Thực thu:</strong> {row.actual.toFixed(2)}T
                </p>
                <p className="fin-revenue-tooltip__item">
                    <strong>Chưa đóng học phí:</strong> {row.unpaid}tr
                </p>
            </div>
        );
    };

    const revenueImpacts = [
        { 
            label: "Học sinh tăng/giảm", 
            value: "+46 HS", 
            note: "Ảnh hưởng trực tiếp đến doanh số học phí",
            trend: "increase",
            periods: [
                { period: "Tháng 10", value: "+15 HS" },
                { period: "Tháng 11", value: "+22 HS" },
                { period: "Tháng 12", value: "+9 HS" }
            ]
        },
        { 
            label: "Chi phí hư hại", 
            value: "69tr", 
            note: "Phát sinh từ vận hành và tài sản",
            trend: "decrease",
            periods: [
                { period: "Tháng 10", value: "18tr" },
                { period: "Tháng 11", value: "25tr" },
                { period: "Tháng 12", value: "26tr" }
            ]
        },
        { 
            label: "Marketing", 
            value: "420tr", 
            note: "Kéo doanh số tuyển sinh và tái ghi danh",
            trend: "increase",
            periods: [
                { period: "Tháng 10", value: "120tr" },
                { period: "Tháng 11", value: "150tr" },
                { period: "Tháng 12", value: "150tr" }
            ]
        },
        { 
            label: "Lớp trống", 
            value: "6 lớp", 
            note: "Tác động đến công suất và doanh thu kỳ sau",
            trend: "decrease",
            periods: [
                { period: "Tháng 10", value: "8 lớp" },
                { period: "Tháng 11", value: "7 lớp" },
                { period: "Tháng 12", value: "6 lớp" }
            ]
        },
        { 
            label: "Giáo viên liên quan", 
            value: "7", 
            note: "Ảnh hưởng phân bổ chi phí và sĩ số",
            trend: "neutral",
            periods: [
                { period: "Tháng 10", value: "6" },
                { period: "Tháng 11", value: "7" },
                { period: "Tháng 12", value: "7" }
            ]
        },
        { 
            label: "Hoàn tiền", 
            value: "36tr", 
            note: "Làm giảm doanh số thực thu",
            trend: "decrease",
            periods: [
                { period: "Tháng 10", value: "12tr" },
                { period: "Tháng 11", value: "15tr" },
                { period: "Tháng 12", value: "9tr" }
            ]
        }
    ];

    const missingRevenueItems = [
        { item: "Doanh số dự kiến chưa chốt", value: "610tr", status: "Cần theo dõi", owner: "Tuyển sinh + Tài chính" },
        { item: "Doanh thu chưa ghi nhận", value: "320tr", status: "Thiếu bút toán", owner: "Kế toán tổng hợp" },
        { item: "Hụt mục tiêu doanh số", value: "600tr", status: "Rủi ro cao", owner: "Ban tài chính" },
        { item: "Hoàn/giảm học phí chưa đối soát", value: "86tr", status: "Chờ xác nhận", owner: "CSKH + Kế toán" },
        { item: "Doanh thu tái ghi danh", value: "1.02T", status: "Tiềm năng", owner: "Giáo vụ + Tuyển sinh" }
    ];

    const costDrivers = [
        { name: "Marketing tuyển sinh", cost: "420tr", revenue: "1.18T" },
        { name: "Ngoại khóa học sinh", cost: "220tr", revenue: "305tr" },
        { name: "Thi đấu trong trường", cost: "86tr", revenue: "95tr" },
        { name: "Thi đấu ngoài trường", cost: "128tr", revenue: "244tr" }
    ];

    const capacity = {
        classes: 42,
        rooms: 40,
        students: 1765,
        standardCapacity: 1680,
        occupancy: "105.1%",
        shortage: "85 HS (~2 lớp)"
    };

    const alerts = [
        { title: "Nợ > 60 ngày", desc: "16 hồ sơ cần xử lý theo hoàn cảnh", link: "/finance/payment-hub" },
        { title: "Tháng hụt doanh số", desc: "Tháng 10-12 hụt mục tiêu liên tiếp", link: "/finance/reports" },
        { title: "Áp lực sĩ số", desc: "Công suất lớp vượt chuẩn", link: "/finance/reports" }
    ];

    return (
        <div className="fin-dashboard">
            <PageHeader
                title="Bảng Điều Khiển Kế Toán"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <section className="fin-hero-grid">
                <div className="fin-hero-card fin-hero-primary">
                    <div className="fin-hero-top">
                        <h3>Tổng quan doanh số</h3>
                        <span className="fin-badge warning">Thiếu {summary.revenueGap}</span>
                    </div>
                    <div className="fin-kpi-row">
                        <div><span>Thực thu</span><strong>{summary.actualRevenue}</strong></div>
                        <div><span>Mục tiêu</span><strong>{summary.targetRevenue}</strong></div>
                        <div><span>Tỷ lệ thu</span><strong>{summary.collectionRate}</strong></div>
                        <div><span>Tổng nợ</span><strong>{summary.debt}</strong></div>
                    </div>
                    <div className="fin-progress-wrap">
                        <div className="fin-progress-label">
                            <span>Tiến độ tổng</span>
                            <b>93%</b>
                        </div>
                        <div className="fin-progress-track">
                            <div className="fin-progress-fill" style={{ width: "93%" }}></div>
                        </div>
                    </div>
                </div>

                <div className="fin-hero-card fin-hero-side">
                    <h4>Cần lưu ý ngay</h4>
                    <ul>
                        <li>Nợ quá hạn: <b>{summary.overdueDebt}</b></li>
                        <li>Doanh thu chưa ghi nhận: <b>{summary.unrecognizedRevenue}</b></li>
                        <li>Doanh thu dự kiến chưa chốt: <b>{summary.pipelineRevenue}</b></li>
                        <li>Tỷ lệ hoàn tiền: <b>{summary.refundRate}</b></li>
                    </ul>
                    <Link to="/finance/reports" className="fin-link-action">Xem báo cáo chi tiết</Link>
                </div>
            </section>

            <section className="fin-panels fin-main-grid">
                <div className="fin-panel fin-chart-panel">
                    <div className="fin-panel-header">
                        <FiBarChart2 /> Biểu đồ doanh số theo tháng
                    </div>
                    <div className="fin-chart-legend">
                        <span><i className="legend actual"></i> Thực thu</span>
                        <span><i className="legend unpaid"></i> Chưa đóng học phí</span>
                    </div>
                    <div className="fin-chart-wrapper">
                        <div className="fin-revenue-chart-wrap">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                                <BarChart className="fin-revenue-bar-chart" data={chartData} margin={{ top: 14, right: 14, left: 8, bottom: 8 }} barCategoryGap="24%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(88, 114, 158, 0.35)" vertical={true} />
                                    <XAxis
                                        dataKey="monthLabel"
                                        axisLine={{ stroke: "#8fa8d5", strokeWidth: 1.5 }}
                                        tickLine={false}
                                        tick={{ fill: "#17345f", fontSize: 12, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tickFormatter={formatTrillionTick}
                                        axisLine={{ stroke: "#8fa8d5", strokeWidth: 1.5 }}
                                        tickLine={false}
                                        tick={{ fill: "#516a8f", fontSize: 11, fontWeight: 600 }}
                                        domain={[0, 1.8]}
                                        width={44}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={formatUnpaidTick}
                                        axisLine={{ stroke: "#8fa8d5", strokeWidth: 1.5 }}
                                        tickLine={false}
                                        tick={{ fill: "#8a5a10", fontSize: 11, fontWeight: 600 }}
                                        domain={[0, 160]}
                                        width={44}
                                    />
                                    <Tooltip content={customTooltip} />
                                    <Bar yAxisId="left" dataKey="actual" fill="#2b3f6f" radius={[6, 6, 0, 0]} barSize={22} name="Thực thu" />
                                    <Bar yAxisId="right" dataKey="unpaid" fill="#f5a623" radius={[6, 6, 0, 0]} barSize={22} name="Chưa đóng học phí" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="fin-panel">
                    <div className="fin-panel-header">
                        <FiPieChart /> Yếu tố ảnh hưởng doanh số
                    </div>
                    <div className="fin-impact-list">
                        {revenueImpacts.map((item) => (
                            <div className="fin-impact-item" key={item.label} data-trend={item.trend}>
                                <div>
                                    <strong>{item.label}</strong>
                                    <span>{item.note}</span>
                                </div>
                                <b>{item.value}</b>
                                {item.periods && (
                                    <div className="fin-impact-tooltip">
                                        <div className="fin-impact-tooltip-title">Biến động theo tháng</div>
                                        <table className="fin-impact-tooltip-table">
                                            <tbody>
                                                {item.periods.map((period) => (
                                                    <tr key={period.period}>
                                                        <td>{period.period}</td>
                                                        <td className={item.trend === "increase" ? "fin-impact-tooltip-increase" : item.trend === "decrease" ? "fin-impact-tooltip-decrease" : ""}>
                                                            {period.value}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="fin-panels secondary">
                <div className="fin-panel fin-panel--cost">
                    <div className="fin-panel-header">
                        <FiTarget /> Chi phí và nguồn tạo doanh số
                    </div>
                    <div className="fin-table-wrap">
                        <table className="fin-table compact">
                            <thead>
                                <tr>
                                    <th>Hạng mục</th>
                                    <th>Chi phí</th>
                                    <th>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {costDrivers.map((row) => (
                                    <tr key={row.name}>
                                        <td>{row.name}</td>
                                        <td>{row.cost}</td>
                                        <td>{row.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="fin-panel fin-panel--capacity">
                    <div className="fin-panel-header">
                        <FiUsers /> Công suất lớp học
                    </div>
                    <div className="fin-capacity-grid">
                        <div><span>Lớp đang mở</span><b>{capacity.classes}</b></div>
                        <div><span>Phòng khả dụng</span><b>{capacity.rooms}</b></div>
                        <div><span>HS hiện tại</span><b>{capacity.students}</b></div>
                        <div><span>Công suất chuẩn</span><b>{capacity.standardCapacity}</b></div>
                        <div><span>Tỷ lệ lấp đầy</span><b>{capacity.occupancy}</b></div>
                        <div><span>Thiếu sức chứa</span><b className="fin-negative">{capacity.shortage}</b></div>
                    </div>
                </div>
            </section>

            <section className="fin-panels secondary">
                <div className="fin-panel">
                    <div className="fin-panel-header">
                        <FiCalendar /> Các mục doanh số còn thiếu
                    </div>
                    <div className="fin-missing-list compact-list">
                        {missingRevenueItems.map((row) => (
                            <div className="fin-missing-item" key={row.item}>
                                <div>
                                    <strong>{row.item}</strong>
                                    <span>{row.owner}</span>
                                </div>
                                <div className="fin-missing-right">
                                    <b>{row.value}</b>
                                    <em className={`fin-badge ${row.status === "Rủi ro cao" ? "danger" : row.status === "Tiềm năng" ? "success" : "warning"}`}>{row.status}</em>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="fin-panel urgent">
                    <div className="fin-panel-header">
                        <FiAlertCircle /> Cảnh báo cần xử lý
                    </div>
                    <div className="fin-alert-list compact-alerts">
                        {alerts.map((item) => (
                            <div className="fin-alert-item" key={item.title}>
                                <strong>{item.title}</strong>
                                <span>{item.desc}</span>
                                <Link to={item.link} className="fin-link-action">Xử lý ngay</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="fin-panel fin-summary-note">
                <div className="fin-panel-header">
                    <FiClock /> Kết luận vận hành
                </div>
                <p>
                    Doanh số hiện tại đang bị kéo xuống bởi nợ quá hạn, hoàn tiền và lớp trống. Tập trung ưu tiên thu hồi công nợ,
                    đối soát khoản chưa ghi nhận, và giữ ổn định sĩ số lớp để giảm thất thoát ở kỳ tiếp theo.
                </p>
            </div>
        </div>
    );
}
