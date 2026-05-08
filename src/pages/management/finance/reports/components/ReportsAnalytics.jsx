import {
    FiAlertCircle,
    FiBarChart2,
    FiCheckCircle,
    FiClock,
    FiDollarSign,
    FiFilter,
    FiPieChart,
    FiSearch,
    FiTrendingUp,
} from "react-icons/fi";

export default function ReportsAnalytics({
    totals,
    sourceBreakdown,
    doughnutStops,
    filteredPerformance,
    categoryOptions,
    cashFlow,
    maxCashFlow,
    riskItems,
    scope,
    sortBy,
    searchQuery,
    onScopeChange,
    onSortByChange,
    onSearchChange,
    sortOptions,
    formatCurrency,
    formatCompact,
}) {
    const axisRatios = [1, 0.75, 0.5, 0.25, 0];
    const axisTicks = axisRatios.map((ratio) => Math.round(maxCashFlow * ratio));
    const formatAxisTick = (value) => `${(value / 1000000000).toFixed(1)}T`;

    return (
        <>
            <section className="reports-summary-bar">
                <article className="reports-stat stat-neutral">
                    <div className="reports-stat__icon"><FiDollarSign /></div>
                    <div className="reports-stat__content">
                        <span>Tổng doanh thu</span>
                        <strong>{formatCompact(totals.totalRevenue)}</strong>
                        <p>{formatCurrency(totals.totalRevenue)}</p>
                    </div>
                </article>

                <article className="reports-stat stat-success">
                    <div className="reports-stat__icon"><FiCheckCircle /></div>
                    <div className="reports-stat__content">
                        <span>Đã thu theo bộ lọc</span>
                        <strong>{formatCompact(totals.totalCollected)}</strong>
                        <p>Tỷ lệ trung bình {totals.avgRate}%</p>
                    </div>
                </article>

                <article className="reports-stat stat-warning">
                    <div className="reports-stat__icon"><FiClock /></div>
                    <div className="reports-stat__content">
                        <span>Đến hạn trong tháng</span>
                        <strong>{formatCompact(totals.dueSoon)}</strong>
                        <p>Cần nhắc sớm theo nhóm lớp</p>
                    </div>
                </article>

                <article className="reports-stat stat-danger">
                    <div className="reports-stat__icon"><FiAlertCircle /></div>
                    <div className="reports-stat__content">
                        <span>Công nợ đang theo dõi</span>
                        <strong>{formatCompact(totals.totalDebt)}</strong>
                        <p>Ưu tiên xử lý khoản nợ lớn</p>
                    </div>
                </article>
            </section>

            <section className="reports-filter-bar">
                <label className="reports-search">
                    <FiSearch />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Tìm theo tên khoản thu..."
                    />
                </label>

                <div className="reports-filter-group">
                    <div className="reports-filter-label"><FiFilter /> Bộ lọc</div>
                    <select value={scope} onChange={(event) => onScopeChange(event.target.value)}>
                        {categoryOptions.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                    </select>
                    <select value={sortBy} onChange={(event) => onSortByChange(event.target.value)}>
                        {sortOptions.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="reports-main-grid">
                <article className="report-panel report-panel--revenue">
                    <div className="report-panel__head">
                        <h3><FiPieChart /> Cơ cấu nguồn thu</h3>
                        <span>Tổng {formatCompact(totals.totalRevenue)}</span>
                    </div>
                    <div className="revenue-layout">
                        <div className="doughnut-container">
                            <div className="mock-pie" style={{ background: `conic-gradient(${doughnutStops})` }}>
                                <div className="mock-hole">
                                    <strong>{formatCompact(totals.totalRevenue)}</strong>
                                    <span>Doanh thu</span>
                                </div>
                            </div>
                        </div>
                        <div className="pie-legend">
                            {sourceBreakdown.map((item) => (
                                <div key={item.id} className="pl-item">
                                    <div className="pl-item__name">
                                        <i style={{ background: item.color }}></i>
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="pl-item__meta">
                                        <b className="pl-item__share">{item.percent}%</b>
                                        <strong>{formatCurrency(item.amount)}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                            <div className="report-note report-note--revenue">
                                Cơ cấu hiện tại tập trung nhiều vào học phí chính. Ưu tiên kiểm soát nhóm thu hộ để giảm biến động cuối kỳ.
                            </div>
                </article>

                <article className="report-panel report-panel--table">
                    <div className="report-panel__head">
                        <h3><FiTrendingUp /> Thu và công nợ theo khoản phí</h3>
                        <span>{filteredPerformance.length} hạng mục</span>
                    </div>
                    <div className="table-wrap">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Khoản phí</th>
                                    <th className="align-right">Đã thu</th>
                                    <th className="align-right">Công nợ</th>
                                    <th className="align-right">Đến hạn</th>
                                    <th className="align-right">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPerformance.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="fee-name-cell">
                                                <strong>{item.name}</strong>
                                                <small>{categoryOptions.find((option) => option.id === item.category)?.label}</small>
                                            </div>
                                        </td>
                                        <td className="align-right text-success">{formatCompact(item.collected)}</td>
                                        <td className="align-right text-danger">{formatCompact(item.debt)}</td>
                                        <td className="align-right text-warning">{formatCompact(item.dueSoon)}</td>
                                        <td className="align-right">
                                            <div className="rate-cell">
                                                <span className="rate-pill">{item.collectionRate}%</span>
                                                <div className="rate-track">
                                                    <div className="rate-fill" style={{ width: `${item.collectionRate}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPerformance.length === 0 && (
                                    <tr>
                                        <td className="report-empty" colSpan={5}>Không tìm thấy khoản phí phù hợp.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>

            <section className="reports-bottom-grid">
                <article className="report-panel report-panel--cashflow">
                    <div className="report-panel__head">
                        <h3><FiBarChart2 /> Dòng tiền 6 tháng gần nhất</h3>
                        <span>So sánh thu và chi</span>
                    </div>
                    <div className="cashflow-chart-v2">
                        <div className="cashflow-chart-v2__legend">
                            <span><i className="dot dot-in"></i> Dòng tiền vào</span>
                            <span><i className="dot dot-out"></i> Dòng tiền ra</span>
                            <small>Đơn vị: tỷ đồng</small>
                        </div>

                        <div className="cashflow-chart-v2__stage">
                            <div className="cashflow-chart-v2__axis" aria-hidden="true">
                                {axisTicks.map((value) => (
                                    <span key={`v2-axis-${value}`}>{formatAxisTick(value)}</span>
                                ))}
                            </div>

                            <div className="cashflow-chart-v2__plot">
                                {cashFlow.map((item) => {
                                    const inflowHeight = `${Math.max(8, Math.round((item.inflow / maxCashFlow) * 100))}%`;
                                    const outflowHeight = `${Math.max(8, Math.round((item.outflow / maxCashFlow) * 100))}%`;
                                    return (
                                        <div key={item.month} className="cashflow-chart-v2__month-col">
                                            <div className="cashflow-chart-v2__bars">
                                                <div className="bar in" style={{ height: inflowHeight }} title={`Thu: ${formatCurrency(item.inflow)}`}></div>
                                                <div className="bar out" style={{ height: outflowHeight }} title={`Chi: ${formatCurrency(item.outflow)}`}></div>
                                            </div>
                                            <strong>{item.month}</strong>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </article>

                <article className="report-panel report-panel--risks">
                    <div className="report-panel__head">
                        <h3><FiAlertCircle /> Cảnh báo cần xử lý</h3>
                        <span>{riskItems.length} mục</span>
                    </div>
                    <div className="risk-list">
                        {riskItems.map((risk) => (
                            <div key={risk.id} className={`risk-item ${risk.status}`}>
                                <div className="risk-item__top">
                                    <strong>{risk.issue}</strong>
                                    <span>{risk.impact}</span>
                                </div>
                                <p>{risk.action}</p>
                                <small>Phụ trách: {risk.owner}</small>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </>
    );
}

