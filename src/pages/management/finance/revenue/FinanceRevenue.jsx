import { useState, useEffect, useMemo, useCallback } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { financeService } from "../../../../services/pages/management/finance";
import {
    FiBarChart2,
    FiCheckCircle,
    FiDollarSign,
    FiDownload,
    FiFilter,
    FiPieChart,
    FiRefreshCw,
    FiTrendingUp,
} from "react-icons/fi";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import "./FinanceRevenue.css";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];

const formatCurrency = (v) =>
    typeof v === "number" ? v.toLocaleString("vi-VN") : parseFloat(v || 0).toLocaleString("vi-VN");

const formatCompact = (v) => {
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)} tỷ`;
    if (v >= 1_000_000) return `${Math.round(v / 1_000_000)} triệu`;
    return `${v.toLocaleString("vi-VN")} đ`;
};

const PERIOD_LABELS = {
    month_1: "Tháng 9",
    month_2: "Tháng 10",
    month_3: "Tháng 11",
    month_4: "Tháng 12",
    month_5: "Tháng 1",
    month_6: "Tháng 2",
    month_7: "Tháng 3",
    month_8: "Tháng 4",
    month_9: "Tháng 5",
    semester_1: "HK1",
    semester_2: "HK2",
    year: "Cả năm",
};

export default function FinanceRevenue() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [revenueData, setRevenueData] = useState([]);
    const [debtSummary, setDebtSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [periodView, setPeriodView] = useState("semester"); // 'semester' | 'month'
    const [selectedMonth, setSelectedMonth] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [revRes, sumRes] = await Promise.allSettled([
                financeService.getRevenueReport({
                    params: {
                        schoolYearId: selectedSchoolYear,
                        semesterId: selectedTerm,
                    },
                }),
                financeService.getDebtSummary({
                    params: {
                        schoolYearId: selectedSchoolYear,
                        semesterId: selectedTerm,
                    },
                }),
            ]);

            if (revRes.status === "fulfilled" && revRes.value?.success) {
                const rows = Array.isArray(revRes.value.data)
                    ? revRes.value.data
                    : [];
                setRevenueData(rows);
            }

            if (sumRes.status === "fulfilled" && sumRes.value?.success) {
                setDebtSummary(sumRes.value.data);
            }
        } catch (err) {
            console.error("[FinanceRevenue] loadData error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedSchoolYear, selectedTerm]);

    useEffect(() => { loadData(); }, [loadData]);

    // Overall stats — from debt summary API
    const stats = useMemo(() => {
        if (!debtSummary) return { totalCollected: 0, totalDebt: 0, total: 0, collectionRate: 0 };
        const totalAmount = parseFloat(debtSummary.totalAmount || debtSummary.totalDebt || 0);
        const totalCollected = parseFloat(debtSummary.totalCollected || 0);
        const totalDebt = totalAmount - totalCollected;
        return {
            totalCollected,
            totalDebt,
            total: totalAmount,
            collectionRate: debtSummary.collectionRate || (totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0),
        };
    }, [debtSummary]);

    // Fee breakdown from revenue report
    const feeBreakdown = useMemo(() => {
        return revenueData.map((item) => {
            const totalAmount = parseFloat(item.totalAmount || 0);
            const totalCollected = parseFloat(item.totalCollected || item.revenue || item.collected || 0);
            return {
                name: item.period || item.label || item.feeName || "Khoản thu",
                total: totalAmount,
                collected: totalCollected,
                debt: Math.max(0, totalAmount - totalCollected),
            };
        });
    }, [revenueData]);

    // Period revenue chart from revenue report
    const periodRevenue = useMemo(() => {
        return revenueData.map((item) => ({
            name: item.period || "N/A",
            revenue: parseFloat(item.totalCollected || 0),
            debt: parseFloat(item.totalAmount || 0) - parseFloat(item.totalCollected || 0),
        }));
    }, [revenueData]);

    const pieData = feeBreakdown.map((f, i) => ({
        name: f.name,
        value: f.total,
        color: COLORS[i % COLORS.length],
        collected: f.collected,
        debt: f.debt,
    }));

    const handleExport = () => {
        const headers = ["Khoản thu", "Tổng phát sinh", "Đã thu", "Còn nợ"];
        const rows = feeBreakdown.map((f) => [
            f.name,
            f.total,
            f.collected,
            f.debt,
        ]);
        rows.push(["TỔNG CỘNG", stats.total, stats.totalCollected, stats.totalDebt]);

        const csvContent = [headers, ...rows]
            .map((r) => r.map((c) => `"${c}"`).join(","))
            .join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bao-cao-doanh-thu-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fin-revenue">
            <PageHeader
                title="Báo cáo Doanh thu"
                eyebrow="Phân tích doanh thu theo khoản thu, học kỳ và xu hướng thu"
                actions={
                    <>
                        <SchoolYearTermSelector
                            selectedSchoolYear={selectedSchoolYear}
                            selectedTerm={selectedTerm}
                            onYearChange={handleYearArrow}
                            onTermChange={handleTermChange}
                        />
                        <button className="btn-secondary" onClick={loadData} disabled={isLoading}>
                            <FiRefreshCw className={isLoading ? "spin" : ""} />
                        </button>
                        <button className="btn-primary" onClick={handleExport}>
                            <FiDownload /> Xuất CSV
                        </button>
                    </>
                }
            />

            {/* Summary Cards */}
            <section className="rev-summary-bar">
                <div className="rev-stat rev-stat--primary">
                    <div className="rev-stat__icon"><FiTrendingUp /></div>
                    <div className="rev-stat__content">
                        <span>Tổng phát sinh</span>
                        <strong>{formatCompact(stats.total)}</strong>
                        <p>{formatCurrency(stats.total)} đ</p>
                    </div>
                </div>
                <div className="rev-stat stat-success">
                    <div className="rev-stat__icon"><FiCheckCircle /></div>
                    <div className="rev-stat__content">
                        <span>Đã thu</span>
                        <strong className="text-success">{formatCompact(stats.totalCollected)}</strong>
                        <p>{formatCurrency(stats.totalCollected)} đ — {stats.collectionRate}%</p>
                    </div>
                </div>
                <div className="rev-stat stat-danger">
                    <div className="rev-stat__icon"><FiDollarSign /></div>
                    <div className="rev-stat__content">
                        <span>Còn nợ</span>
                        <strong className="text-danger">{formatCompact(stats.totalDebt)}</strong>
                        <p>{formatCurrency(stats.totalDebt)} đ</p>
                    </div>
                </div>
            </section>

            {/* Charts + Table */}
            <section className="rev-main-grid">
                {/* Pie Chart */}
                <div className="rev-panel">
                    <div className="rev-panel__head">
                        <h3><FiPieChart /> Cơ cấu theo khoản thu</h3>
                        <span>Tổng {formatCompact(stats.total)}</span>
                    </div>
                    <div className="rev-pie-layout">
                        <div className="rev-pie-container">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(value) + " đ", "Tổng"]}
                                        contentStyle={{ fontSize: 12 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="rev-pie-legend">
                            {pieData.map((entry, i) => (
                                <div key={i} className="rev-legend-item">
                                    <i style={{ background: entry.color }}></i>
                                    <span>{entry.name}</span>
                                    <strong>{formatCompact(entry.value)}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                {periodRevenue.length > 0 && (
                    <div className="rev-panel">
                        <div className="rev-panel__head">
                            <h3><FiBarChart2 /> Doanh thu theo kỳ</h3>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={periodRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(88,114,158,0.35)" />
                                <XAxis dataKey="name" tick={{ fill: "#516a8f", fontSize: 12 }} />
                                <YAxis
                                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                                    tick={{ fill: "#516a8f", fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(v, name) => [formatCurrency(v) + " đ", name === "revenue" ? "Đã thu" : "Còn nợ"]}
                                    contentStyle={{ fontSize: 12 }}
                                />
                                <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} name="Đã thu" />
                                <Bar dataKey="debt" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Còn nợ" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            {/* Detail Table */}
            <section className="rev-panel rev-panel--table">
                <div className="rev-panel__head">
                    <h3><FiBarChart2 /> Chi tiết theo khoản thu</h3>
                    <span>{feeBreakdown.length} hạng mục</span>
                </div>
                <div className="rev-table-wrap">
                    <table className="rev-table">
                        <thead>
                            <tr>
                                <th>Khoản thu</th>
                                <th className="align-right">Tổng phát sinh</th>
                                <th className="align-right">Đã thu</th>
                                <th className="align-right">Còn nợ</th>
                                <th className="align-right">Tỷ lệ thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeBreakdown.map((f, i) => {
                                const rate = f.total > 0 ? Math.round((f.collected / f.total) * 100) : 0;
                                return (
                                    <tr key={i}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <i style={{
                                                    display: "inline-block",
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: 2,
                                                    background: COLORS[i % COLORS.length],
                                                }} />
                                                <strong>{f.name}</strong>
                                            </div>
                                        </td>
                                        <td className="align-right">{formatCurrency(f.total)} đ</td>
                                        <td className="align-right text-success">{formatCurrency(f.collected)} đ</td>
                                        <td className={`align-right ${f.debt > 0 ? "text-danger" : "text-success"}`}>
                                            {formatCurrency(f.debt)} đ
                                        </td>
                                        <td className="align-right">
                                            <span className="rate-pill">{rate}%</span>
                                            <div className="rate-track" style={{ display: "inline-flex", marginLeft: "0.5rem", verticalAlign: "middle" }}>
                                                <div className="rate-fill" style={{ width: `${rate}%` }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {feeBreakdown.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="empty-cell">Không có dữ liệu.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td><strong>TỔNG CỘNG</strong></td>
                                <td className="align-right"><strong>{formatCurrency(stats.total)} đ</strong></td>
                                <td className="align-right text-success"><strong>{formatCurrency(stats.totalCollected)} đ</strong></td>
                                <td className="align-right text-danger"><strong>{formatCurrency(stats.totalDebt)} đ</strong></td>
                                <td className="align-right"><strong>{stats.collectionRate}%</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </section>
        </div>
    );
}
