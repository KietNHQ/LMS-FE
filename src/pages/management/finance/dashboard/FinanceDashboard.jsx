import { useEffect, useMemo, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { financeService } from "../../../../services/pages/finance";
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiBarChart2,
    FiCalendar,
    FiClock,
    FiPieChart,
    FiTarget,
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
import Modal from "../../../../components/ui/Modal/Modal";
import "./FinanceDashboard.css";

export function FinanceDashboard() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [showImpactDialog, setShowImpactDialog] = useState(false);
    const [impactFilter, setImpactFilter] = useState("all");
    const [impactQuery, setImpactQuery] = useState("");

    const [summary, setSummary] = useState({
        actualRevenue: "12.50T",
        targetRevenue: "13.10T",
        revenueGap: "600tr",
        debt: "450tr",
        overdueDebt: "182tr",
        collectionRate: "96.5%",
        refundRate: "1.8%",
        unrecognizedRevenue: "320tr",
        pipelineRevenue: "610tr"
    });

    useEffect(() => {
        let isMounted = true;

        const loadFinanceSummary = async () => {
            try {
                const data = await financeService.getDebtSummary({
                    params: {
                        schoolYearId: selectedSchoolYear,
                        semesterId: selectedTerm,
                    },
                });

                if (!isMounted || !data) return;

                const totalCollected = Number(data.totalCollected ?? data.collected ?? 0);
                const totalDebt = Number(data.totalDebt ?? data.debt ?? 0);
                const overdueDebt = Number(data.overdueDebt ?? data.overdueDebtAmount ?? 0);
                const collectionRate = data.collectionRate ?? (totalDebt > 0 ? Math.round((totalCollected / totalDebt) * 1000) / 10 : null);

                setSummary((prev) => ({
                    ...prev,
                    actualRevenue: totalCollected > 0 ? `${(totalCollected / 1000).toFixed(2)}T` : prev.actualRevenue,
                    debt: totalDebt > 0 ? `${Math.round(totalDebt / 1_000_000)}tr` : prev.debt,
                    overdueDebt: overdueDebt > 0 ? `${Math.round(overdueDebt / 1_000_000)}tr` : prev.overdueDebt,
                    collectionRate: collectionRate != null ? `${collectionRate}%` : prev.collectionRate,
                }));
            } catch (_) {}
        };

        loadFinanceSummary();
        return () => { isMounted = false; };
    }, [selectedSchoolYear, selectedTerm]);

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
            id: "student_change",
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
            id: "damage_costs",
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
            id: "marketing",
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
            id: "empty_classes",
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
            id: "teacher_related",
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
            id: "refunds",
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

    const recoverableRevenueGroups = [
        {
            key: "pending-collection",
            title: "Nhóm chờ thu",
            note: "Khoản có thể thu hồi trực tiếp từ tuyển sinh và tái ghi danh",
            items: [
                { item: "Doanh thu tái ghi danh", value: "1.02T", valueInMil: 1020, status: "Tiềm năng", owner: "Giáo vụ + Tuyển sinh" },
                { item: "Doanh số dự kiến chưa chốt", value: "610tr", valueInMil: 610, status: "Cần theo dõi", owner: "Tuyển sinh + Tài chính" }
            ]
        },
        {
            key: "system-process",
            title: "Nhóm lỗi hệ thống/nghiệp vụ",
            note: "Khoản bị treo do lỗi bút toán hoặc chưa đối soát hoàn tiền",
            items: [
                { item: "Doanh thu chưa ghi nhận", value: "320tr", valueInMil: 320, status: "Thiếu bút toán", owner: "Kế toán tổng hợp" },
                { item: "Hoàn/giảm học phí chưa đối soát", value: "86tr", valueInMil: 86, status: "Chờ xác nhận", owner: "CSKH + Kế toán" }
            ]
        }
    ];

    const getRecoveryStatusClass = (status) => {
        if (status === "Tiềm năng") return "success";
        if (status === "Cần theo dõi") return "warning";
        return "danger";
    };

    const formatMilToLabel = (valueInMil) => (valueInMil >= 1000 ? `${(valueInMil / 1000).toFixed(2)}T` : `${valueInMil}tr`);

    const costDrivers = [
        { name: "Marketing tuyển sinh", cost: "420tr", revenue: "1.18T", costInMil: 420, revenueInMil: 1180 },
        { name: "Ngoại khóa học sinh", cost: "220tr", revenue: "305tr", costInMil: 220, revenueInMil: 305 },
        { name: "Thi đấu trong trường", cost: "86tr", revenue: "95tr", costInMil: 86, revenueInMil: 95 },
        { name: "Thi đấu ngoài trường", cost: "128tr", revenue: "244tr", costInMil: 128, revenueInMil: 244 }
    ];

    const totalDriverRevenueInMil = costDrivers.reduce((sum, item) => sum + item.revenueInMil, 0);
    const costDriversWithMetrics = costDrivers.map((item) => {
        const efficiencyRatio = item.revenueInMil / item.costInMil;
        const contributionPercent = totalDriverRevenueInMil > 0 ? (item.revenueInMil / totalDriverRevenueInMil) * 100 : 0;
        const isOverspending = item.costInMil >= 200 && efficiencyRatio < 1.6;

        return {
            ...item,
            efficiencyRatio,
            contributionPercent,
            isOverspending
        };
    });

    const alerts = [
        { title: "Nợ > 60 ngày", desc: "16 hồ sơ cần xử lý theo hoàn cảnh", link: "/finance/payment-hub" },
        { title: "Tháng hụt doanh số", desc: "Tháng 10-12 hụt mục tiêu liên tiếp", link: "/finance/reports" },
        { title: "Áp lực sĩ số", desc: "Công suất lớp vượt chuẩn", link: "/finance/reports" }
    ];

    const primaryAlert = alerts[0];
    const impactDetailConfig = {
        student_change: {
            priority: "Cao",
            owner: "Tuyển sinh",
            effect: "Tăng doanh số +3.2%",
            action: "Đẩy chiến dịch tái ghi danh và giữ sĩ số lớp hiện hữu",
            shortAction: "Đẩy tái ghi danh",
            dueDate: "30/04/2026",
            status: "Đang triển khai"
        },
        damage_costs: {
            priority: "Cao",
            owner: "Hành chính - Cơ sở vật chất",
            effect: "Giảm biên lợi nhuận -1.1%",
            action: "Kiểm soát checklist bảo trì và khóa ngân sách phát sinh",
            shortAction: "Khóa chi phí phát sinh",
            dueDate: "26/04/2026",
            status: "Cần xử lý gấp"
        },
        marketing: {
            priority: "Trung bình",
            owner: "Marketing + Tuyển sinh",
            effect: "Đóng góp nguồn thu mới 1.18T",
            action: "Tối ưu kênh có CPL thấp và tăng chuyển đổi lead nóng",
            shortAction: "Tối ưu kênh CPL thấp",
            dueDate: "05/05/2026",
            status: "Đang theo dõi"
        },
        empty_classes: {
            priority: "Cao",
            owner: "Giáo vụ",
            effect: "Thất thoát công suất lớp -9%",
            action: "Gộp lớp, mở thêm suất học bù để lấp đầy công suất",
            shortAction: "Gộp lớp và lấp công suất",
            dueDate: "28/04/2026",
            status: "Cần xử lý gấp"
        },
        teacher_related: {
            priority: "Trung bình",
            owner: "Nhân sự học thuật",
            effect: "Chi phí phân bổ tăng nhẹ +0.4%",
            action: "Điều phối tải tiết dạy theo sĩ số thực tế từng lớp",
            shortAction: "Điều phối lại tải tiết",
            dueDate: "08/05/2026",
            status: "Đang theo dõi"
        },
        refunds: {
            priority: "Trung bình",
            owner: "CSKH + Kế toán",
            effect: "Giảm doanh số thực thu -0.8%",
            action: "Rà soát nguyên nhân hoàn tiền và khóa lỗi quy trình đăng ký",
            shortAction: "Rà soát hoàn tiền",
            dueDate: "03/05/2026",
            status: "Đang triển khai"
        }
    };

    const impactDetails = useMemo(
        () => revenueImpacts.map((item) => {
            const detail = impactDetailConfig[item.id] || {};
            const priorityScore = detail.priority === "Cao" ? 3 : 2;
            const urgencyScore = detail.status === "Cần xử lý gấp" ? 2 : 1;
            const trendScore = item.trend === "decrease" ? 2 : item.trend === "neutral" ? 1 : 0;

            return {
                ...item,
                ...detail,
                trendLabel: item.trend === "increase" ? "Tăng" : item.trend === "decrease" ? "Giảm" : "Ổn định",
                threeMonthSnapshot: item.periods?.map((period) => `${period.period}: ${period.value}`).join(" | ") || "-",
                impactScore: priorityScore + urgencyScore + trendScore
            };
        }),
        [revenueImpacts]
    );

    const filteredImpactDetails = useMemo(() => {
        const normalizedQuery = impactQuery.trim().toLowerCase();

        return impactDetails
            .filter((item) => {
                if (impactFilter === "urgent") return item.status === "Cần xử lý gấp";
                if (impactFilter === "high") return item.priority === "Cao";
                if (impactFilter === "decrease") return item.trend === "decrease";
                if (impactFilter === "increase") return item.trend === "increase";
                return true;
            })
            .filter((item) => {
                if (!normalizedQuery) return true;
                const searchable = [item.label, item.note, item.owner, item.action, item.effect].join(" ").toLowerCase();
                return searchable.includes(normalizedQuery);
            })
            .sort((a, b) => b.impactScore - a.impactScore);
    }, [impactDetails, impactFilter, impactQuery]);

    const urgentItems = impactDetails.filter((item) => item.status === "Cần xử lý gấp");
    const growthItems = impactDetails.filter((item) => item.trend === "increase");
    const riskItems = impactDetails.filter((item) => item.trend === "decrease");

    const highPriorityCount = impactDetails.filter((item) => item.priority === "Cao").length;
    const urgentCount = impactDetails.filter((item) => item.status === "Cần xử lý gấp").length;
    const negativeTrendCount = impactDetails.filter((item) => item.trend === "decrease").length;

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
            </section>

            <div className="fin-alert-cta-wrap fin-alert-cta-wrap--top">
                <Link to={primaryAlert.link} className="fin-alert-btn">
                    <div className="fin-alert-btn__icon">
                        <FiAlertCircle />
                    </div>
                    <div className="fin-alert-btn__content">
                        <strong>4</strong>
                        <span>{primaryAlert.title}</span>
                    </div>
                </Link>
                <button
                    type="button"
                    className="fin-impact-open-btn"
                    onClick={() => setShowImpactDialog(true)}
                >
                    <div className="fin-impact-open-btn__icon">
                        <FiPieChart />
                    </div>
                    <div className="fin-impact-open-btn__content">
                        <strong>{impactDetails.length}</strong>
                        <span>Xem chi tiết yếu tố</span>
                    </div>
                </button>
            </div>

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
                                    <th>Hiệu suất (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {costDriversWithMetrics.map((row) => (
                                    <tr key={row.name}>
                                        <td>
                                            <div className="fin-cost-name-wrap">
                                                <span>{row.name}</span>
                                                {row.isOverspending && (
                                                    <span className="fin-cost-warning" title="Chi phí cao nhưng hiệu suất thấp, cần tối ưu">
                                                        <FiAlertTriangle />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{row.cost}</td>
                                        <td>
                                            <div className="fin-cost-revenue-cell">
                                                <span className="fin-cost-revenue-value">{row.revenue}</span>
                                                <div className="fin-cost-contribution-bar" aria-hidden="true">
                                                    <div className="fin-cost-contribution-fill" style={{ width: `${row.contributionPercent.toFixed(1)}%` }}></div>
                                                </div>
                                                <span className="fin-cost-contribution-label">Đóng góp {row.contributionPercent.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                        <td>{`1 : ${row.efficiencyRatio.toFixed(1)} (${Math.round(row.efficiencyRatio * 100)}%)`}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="fin-panels secondary">
                <div className="fin-panel">
                    <div className="fin-panel-header">
                        <FiCalendar /> Các khoản có thể thu hồi
                    </div>
                    <div className="fin-recovery-groups">
                        {recoverableRevenueGroups.map((group) => {
                            const groupTotalMil = group.items.reduce((sum, item) => sum + item.valueInMil, 0);

                            return (
                                <div className="fin-recovery-group" key={group.key}>
                                    <div className="fin-recovery-group__head">
                                        <div>
                                            <strong>{group.title}</strong>
                                            <span>{group.note}</span>
                                        </div>
                                        <b>{formatMilToLabel(groupTotalMil)}</b>
                                    </div>

                                    <div className="fin-missing-list compact-list">
                                        {group.items.map((row) => (
                                            <div className="fin-missing-item" key={`${group.key}-${row.item}`}>
                                                <div>
                                                    <strong>{row.item}</strong>
                                                    <span>{row.owner}</span>
                                                </div>
                                                <div className="fin-missing-right">
                                                    <b>{row.value}</b>
                                                    <em className={`fin-badge ${getRecoveryStatusClass(row.status)}`}>{row.status}</em>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
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

            <Modal
                open={showImpactDialog}
                title="Yếu tố ảnh hưởng doanh số"
                onClose={() => {
                    setShowImpactDialog(false);
                    setImpactFilter("all");
                    setImpactQuery("");
                }}
                className="fin-impact-modal"
            >
                <div className="fin-panel fin-impact-panel">
                    <div className="fin-panel-header">
                        <FiPieChart /> Yếu tố ảnh hưởng doanh số
                    </div>
                    <div className="fin-impact-detail-kpis">
                        <div>
                            <span>Tổng hạng mục</span>
                            <strong>{impactDetails.length}</strong>
                        </div>
                        <div>
                            <span>Ưu tiên cao</span>
                            <strong>{highPriorityCount}</strong>
                        </div>
                        <div>
                            <span>Xu hướng giảm</span>
                            <strong>{negativeTrendCount}</strong>
                        </div>
                        <div>
                            <span>Cần xử lý gấp</span>
                            <strong>{urgentCount}</strong>
                        </div>
                    </div>

                    <div className="fin-impact-toolbar">
                        <div className="fin-impact-filter-group" role="tablist" aria-label="Lọc yếu tố ảnh hưởng">
                            <button type="button" className={impactFilter === "all" ? "active" : ""} onClick={() => setImpactFilter("all")}>Tất cả</button>
                            <button type="button" className={impactFilter === "urgent" ? "active" : ""} onClick={() => setImpactFilter("urgent")}>Cần xử lý gấp</button>
                            <button type="button" className={impactFilter === "high" ? "active" : ""} onClick={() => setImpactFilter("high")}>Ưu tiên cao</button>
                            <button type="button" className={impactFilter === "decrease" ? "active" : ""} onClick={() => setImpactFilter("decrease")}>Xu hướng giảm</button>
                        </div>
                        <label className="fin-impact-search" aria-label="Tìm kiếm yếu tố ảnh hưởng">
                            <input
                                type="text"
                                value={impactQuery}
                                onChange={(event) => setImpactQuery(event.target.value)}
                                placeholder="Tìm hạng mục hoặc phụ trách"
                            />
                        </label>
                    </div>

                    <div className="fin-impact-detail-table-wrap">
                        <table className="fin-impact-detail-table">
                            <thead>
                                <tr>
                                    <th>Hạng mục và biến động</th>
                                    <th>Phân tích ảnh hưởng</th>
                                    <th>Kế hoạch xử lý</th>
                                    <th>Theo dõi thực thi</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredImpactDetails.map((item) => (
                                    <tr
                                        key={`${item.label}-table`}
                                        className={`fin-impact-row ${item.status === "Cần xử lý gấp" ? "fin-impact-row--urgent" : item.priority === "Cao" ? "fin-impact-row--high" : "fin-impact-row--normal"}`}
                                    >
                                        <td>
                                            <strong>{item.label}</strong>
                                            <span className="fin-impact-cell-line">Giá trị: {item.value}</span>
                                        </td>
                                        <td>
                                            <span className="fin-impact-cell-line">{item.effect}</span>
                                            <span className="fin-impact-cell-line">
                                                Xu hướng:{" "}
                                                <span className={item.trend === "increase" ? "fin-impact-tooltip-increase" : item.trend === "decrease" ? "fin-impact-tooltip-decrease" : "fin-impact-trend-neutral"}>
                                                    {item.trendLabel}
                                                </span>
                                            </span>
                                            <span className="fin-impact-cell-line">{item.owner}</span>
                                        </td>
                                        <td className="fin-impact-cell-plan">{item.shortAction || item.action}</td>
                                        <td className="fin-impact-cell-exec">
                                            <span className="fin-impact-cell-score">
                                                Điểm ảnh hưởng: <b>{item.impactScore}</b>
                                            </span>
                                            <span className="fin-impact-cell-deadline">Hạn: {item.dueDate}</span>
                                        </td>
                                        <td className="fin-impact-cell-status">
                                            <span className={`fin-impact-status ${item.status === "Cần xử lý gấp" ? "urgent" : "active"}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredImpactDetails.length === 0 && (
                            <div className="fin-impact-empty">Không tìm thấy mục phù hợp với bộ lọc hiện tại.</div>
                        )}
                    </div>

                    <div className="fin-impact-action-board">
                        <div className="fin-impact-action-card urgent">
                            <h4>Việc cần xử lý ngay</h4>
                            {urgentItems.map((item) => (
                                <p key={`${item.label}-urgent`}>{item.label}</p>
                            ))}
                        </div>
                        <div className="fin-impact-action-card growth">
                            <h4>Cơ hội tăng doanh số</h4>
                            {growthItems.map((item) => (
                                <p key={`${item.label}-growth`}>{item.label}</p>
                            ))}
                        </div>
                        <div className="fin-impact-action-card risk">
                            <h4>Rủi ro cần kiểm soát</h4>
                            {riskItems.map((item) => (
                                <p key={`${item.label}-risk`}>{item.label}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
