import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, LoadingSpinner } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiLock, FiUnlock, FiAlertTriangle, FiCalendar, FiCheckCircle, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import Modal from "../../../../components/ui/Modal/Modal";
import { disciplinePeriodClosingService } from "../../../../services/pages/management/discipline/disciplinePeriodClosingService";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import "./VpDisciplinePeriodClosing.css";

const PERIOD_TYPES = [
  { value: "week", label: "Theo tuần" },
  { value: "month", label: "Theo tháng" },
  { value: "semester", label: "Theo học kỳ" },
];

const PERIOD_TYPE_MAP = {
  week: "Tuần",
  month: "Tháng",
  semester: "Học kỳ",
};

function getPeriodLabel(periodType, periodKey, extra = "") {
  if (periodType === "week") {
    return `Tuần ${periodKey}${extra ? ` ${extra}` : ""}`;
  }
  if (periodType === "month") {
    const [month, year] = periodKey.split("-");
    const months = ["", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    return `${months[parseInt(month)]} ${year}`;
  }
  if (periodType === "semester") {
    const [term, year] = periodKey.split("-");
    const label = term === "hk1" ? "HK1" : "HK2";
    return `${label} ${year}`;
  }
  return periodKey;
}

export default function VpDisciplinePeriodClosing() {
  const { selectedSchoolYear } = useSchoolYearTerm();
  const queryClient = useQueryClient();

  const [periodType, setPeriodType] = useState("week");
  const [weekNumber, setWeekNumber] = useState(1);
  const [monthValue, setMonthValue] = useState(1);
  const [monthYear, setMonthYear] = useState(new Date().getFullYear());
  const [semesterValue, setSemesterValue] = useState("hk1");
  const [semesterYear, setSemesterYear] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState("");
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [filterPeriodType, setFilterPeriodType] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const weekOptions = useMemo(() => {
    return Array.from({ length: 52 }, (_, i) => ({
      value: String(i + 1),
      label: `Tuần ${i + 1}`,
    }));
  }, []);

  const monthOptions = useMemo(() => {
    const months = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ];
    return months.map((label, i) => ({
      value: String(i + 1),
      label,
    }));
  }, []);

  const semesterOptions = [
    { value: "hk1", label: "Học kỳ 1" },
    { value: "hk2", label: "Học kỳ 2" },
  ];

  const schoolYearOptions = useMemo(() => {
    const year = selectedSchoolYear || currentYear;
    return [
      { value: String(year - 1), label: `${year - 1} - ${year}` },
      { value: String(year), label: `${year} - ${year + 1}` },
    ];
  }, [selectedSchoolYear]);

  const buildPeriodKey = useCallback(() => {
    if (periodType === "week") {
      return String(weekNumber);
    }
    if (periodType === "month") {
      return `${monthValue}-${monthYear}`;
    }
    if (periodType === "semester") {
      return `${semesterValue}-${semesterYear}`;
    }
    return "";
  }, [periodType, weekNumber, monthValue, monthYear, semesterValue, semesterYear]);

  const buildDisplayLabel = useCallback(() => {
    if (periodType === "week") {
      return `Tuần ${weekNumber}`;
    }
    if (periodType === "month") {
      const months = ["", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
      return `${months[monthValue]} ${monthYear}`;
    }
    if (periodType === "semester") {
      const label = semesterValue === "hk1" ? "Học kỳ 1" : "Học kỳ 2";
      return `${label} ${semesterYear}`;
    }
    return "";
  }, [periodType, weekNumber, monthValue, monthYear, semesterValue, semesterYear]);

  const { data: closedPeriods = [], isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["discipline-period-closings", filterPeriodType],
    queryFn: () => disciplinePeriodClosingService.getClosedPeriods(filterPeriodType === "all" ? undefined : filterPeriodType),
    staleTime: 60_000,
  });

  const { data: lockCheck = null } = useQuery({
    queryKey: ["period-lock-check", periodType, buildPeriodKey()],
    queryFn: () => {
      const key = buildPeriodKey();
      if (!key) return null;
      return disciplinePeriodClosingService.checkPeriodLocked(periodType, key);
    },
    enabled: Boolean(buildPeriodKey()),
    staleTime: 30_000,
  });

  const isAlreadyLocked = lockCheck?.locked === true || lockCheck?.data?.locked === true || lockCheck?.data?.isLocked === true;

  const closeMutation = useMutation({
    mutationFn: (data) => disciplinePeriodClosingService.closeDisciplinePeriod(data),
    onSuccess: (res) => {
      toast.success(res?.message || "Đã khóa sổ thi đua thành công!");
      setIsCloseModalOpen(false);
      setNotes("");
      setSuccessMessage("Đã khóa sổ thi đua thành công!");
      queryClient.invalidateQueries({ queryKey: ["discipline-period-closings"] });
      queryClient.invalidateQueries({ queryKey: ["period-lock-check"] });
      setTimeout(() => setSuccessMessage(""), 4000);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Không thể khóa sổ. Vui lòng thử lại.");
    },
  });

  const reopenMutation = useMutation({
    mutationFn: (id) => disciplinePeriodClosingService.reopenPeriod(id),
    onSuccess: (res) => {
      toast.success(res?.message || "Đã mở khóa sổ thi đua!");
      setIsUnlockModalOpen(false);
      setSelectedPeriod(null);
      queryClient.invalidateQueries({ queryKey: ["discipline-period-closings"] });
      queryClient.invalidateQueries({ queryKey: ["period-lock-check"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Không thể mở khóa. Vui lòng thử lại.");
    },
  });

  const handleOpenCloseModal = () => {
    if (isAlreadyLocked) {
      toast.warn("Kỳ này đã được khóa trước đó.");
      return;
    }
    setIsCloseModalOpen(true);
  };

  const handleConfirmClose = () => {
    const periodKey = buildPeriodKey();
    closeMutation.mutate({
      periodType,
      periodKey,
      schoolYearId: selectedSchoolYear ? parseInt(selectedSchoolYear, 10) : undefined,
      notes: notes.trim(),
    });
  };

  const handleOpenUnlockModal = (period) => {
    setSelectedPeriod(period);
    setIsUnlockModalOpen(true);
  };

  const handleConfirmUnlock = () => {
    if (!selectedPeriod) return;
    reopenMutation.mutate(selectedPeriod.id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const filterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "week", label: "Theo tuần" },
    { value: "month", label: "Theo tháng" },
    { value: "semester", label: "Theo học kỳ" },
  ];

  return (
    <div className="vp-period-closing discipline-layout-centered">
      <PageHeader
        title="Khóa sổ thi đua"
        subtitle="Quản lý khóa/mở khóa sổ thi đua theo tuần, tháng, hoặc học kỳ"
      />

      {successMessage && (
        <div className="success-banner">
          <FiCheckCircle />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <FiX style={{ color: "#15803d" }} />
          </button>
        </div>
      )}

      <div className="period-closing-layout">
        {/* ── Left: Khóa kỳ ── */}
        <div className="period-panel">
          <div className="panel-header">
            <div className="panel-header-icon"><FiLock /></div>
            <h3>Khóa kỳ</h3>
          </div>
          <div className="panel-body">
            {/* Period Type Selector */}
            <div className="form-field">
              <label>Loại kỳ</label>
              <div className="period-type-group">
                {PERIOD_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    type="button"
                    className={`period-type-btn ${periodType === pt.value ? "active" : ""}`}
                    onClick={() => setPeriodType(pt.value)}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Period-specific inputs */}
            {periodType === "week" && (
              <div className="form-row">
                <div className="form-field">
                  <label>Tuần thứ</label>
                  <select
                    className="dm-select"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                  >
                    {weekOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Năm học</label>
                  <select
                    className="dm-select"
                    value={selectedSchoolYear || currentYear}
                    onChange={(e) => {}}
                    disabled
                  >
                    {schoolYearOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {periodType === "month" && (
              <div className="form-row">
                <div className="form-field">
                  <label>Tháng</label>
                  <select
                    className="dm-select"
                    value={monthValue}
                    onChange={(e) => setMonthValue(Number(e.target.value))}
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Năm</label>
                  <select
                    className="dm-select"
                    value={monthYear}
                    onChange={(e) => setMonthYear(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {periodType === "semester" && (
              <div className="form-row">
                <div className="form-field">
                  <label>Học kỳ</label>
                  <select
                    className="dm-select"
                    value={semesterValue}
                    onChange={(e) => setSemesterValue(e.target.value)}
                  >
                    {semesterOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Năm học</label>
                  <select
                    className="dm-select"
                    value={semesterYear}
                    onChange={(e) => setSemesterYear(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y} - {y + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="form-field">
              <label>Ghi chú (tùy chọn)</label>
              <textarea
                className="dm-textarea"
                placeholder="Nhập ghi chú cho kỳ khóa này..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Already locked notice */}
            {isAlreadyLocked && (
              <div className="period-already-locked">
                <FiLock />
                <span>Kỳ này đã được khóa sổ.</span>
              </div>
            )}

            {/* Lock button */}
            <button
              type="button"
              className="btn-lock-period"
              onClick={handleOpenCloseModal}
              disabled={isAlreadyLocked || closeMutation.isPending}
            >
              <FiLock />
              {closeMutation.isPending ? "Đang xử lý..." : "Khóa sổ"}
            </button>
          </div>
        </div>

        {/* ── Right: Các kỳ đã khóa ── */}
        <div className="period-panel">
          <div className="panel-header">
            <div className="panel-header-icon"><FiCalendar /></div>
            <h3>Các kỳ đã khóa</h3>
          </div>
          <div className="panel-body">
            {/* Filter */}
            <div className="filter-bar">
              <div className="filter-group">
                <label>Loại kỳ</label>
                <select
                  className="dm-select"
                  value={filterPeriodType}
                  onChange={(e) => setFilterPeriodType(e.target.value)}
                >
                  {filterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            {isLoadingPeriods ? (
              <div className="table-loading">
                <LoadingSpinner size="md" label="Đang tải..." />
              </div>
            ) : closedPeriods.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FiLock /></div>
                <h4>Chưa có kỳ nào được khóa</h4>
                <p>Khóa một kỳ ở bên trái để bắt đầu.</p>
              </div>
            ) : (
              <table className="closed-periods-table">
                <thead>
                  <tr>
                    <th>Kỳ</th>
                    <th>Ngày khóa</th>
                    <th>Người khóa</th>
                    <th>Ghi chú</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {closedPeriods.map((period) => (
                    <tr key={period.id}>
                      <td>
                        <div className="td-period-label">
                          <FiLock className="lock-icon" />
                          <span>{getPeriodLabel(period.periodType || period.period_type, period.periodKey || period.period_key, period.schoolYear || period.school_year_name)}</span>
                        </div>
                      </td>
                      <td className="td-date">{formatDate(period.closedAt || period.closed_at)}</td>
                      <td className="td-user">{period.closedByName || period.closed_by_name || "—"}</td>
                      <td className="td-notes" title={period.notes || ""}>{period.notes || "—"}</td>
                      <td className="td-actions">
                        <button
                          type="button"
                          className="btn-unlock"
                          onClick={() => handleOpenUnlockModal(period)}
                          title="Mở khóa sổ"
                        >
                          <FiUnlock />
                          Mở khóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm Close Modal ── */}
      <Modal
        open={isCloseModalOpen}
        title="Xác nhận khóa sổ"
        onClose={() => setIsCloseModalOpen(false)}
      >
        <div className="confirm-modal-warning">
          <FiAlertTriangle className="confirm-modal-warning-icon" />
          <div className="confirm-modal-warning-text">
            Sau khi khóa, kỳ <strong>{buildDisplayLabel()}</strong> sẽ bị đóng lại. Không thể ghi nhận vi phạm/thưởng mới cho kỳ này.
          </div>
        </div>
        <div className="confirm-modal-info">
          <p>
            <strong>Kỳ:</strong> {buildDisplayLabel()}
          </p>
          {notes.trim() && (
            <p>
              <strong>Ghi chú:</strong> {notes}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
          <button
            type="button"
            className="btn-unlock"
            onClick={() => setIsCloseModalOpen(false)}
            style={{ minWidth: "100px" }}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn-lock-period"
            style={{ width: "auto", marginTop: 0 }}
            onClick={handleConfirmClose}
            disabled={closeMutation.isPending}
          >
            {closeMutation.isPending ? "Đang khóa..." : "Xác nhận khóa"}
          </button>
        </div>
      </Modal>

      {/* ── Confirm Unlock Modal ── */}
      <Modal
        open={isUnlockModalOpen}
        title="Xác nhận mở khóa sổ"
        onClose={() => { setIsUnlockModalOpen(false); setSelectedPeriod(null); }}
      >
        <div className="confirm-modal-warning">
          <FiAlertTriangle className="confirm-modal-warning-icon" />
          <div className="confirm-modal-warning-text">
            <strong>Cảnh báo:</strong> Mở khóa sẽ cho phép chỉnh sửa vi phạm/thưởng cho kỳ này trở lại. Hãy chắc chắn bạn muốn mở khóa.
          </div>
        </div>
        {selectedPeriod && (
          <div className="confirm-modal-info">
            <p>
              <strong>Kỳ:</strong> {getPeriodLabel(selectedPeriod.periodType || selectedPeriod.period_type, selectedPeriod.periodKey || selectedPeriod.period_key, selectedPeriod.schoolYear || selectedPeriod.school_year_name)}
            </p>
            <p>
              <strong>Đã khóa lúc:</strong> {formatDate(selectedPeriod.closedAt || selectedPeriod.closed_at)}
            </p>
            {selectedPeriod.notes && (
              <p>
                <strong>Ghi chú cũ:</strong> {selectedPeriod.notes}
              </p>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
          <button
            type="button"
            className="btn-unlock"
            onClick={() => { setIsUnlockModalOpen(false); setSelectedPeriod(null); }}
            style={{ minWidth: "100px" }}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn-lock-period"
            style={{ width: "auto", marginTop: 0, background: "#f97316" }}
            onClick={handleConfirmUnlock}
            disabled={reopenMutation.isPending}
          >
            {reopenMutation.isPending ? "Đang mở khóa..." : "Xác nhận mở khóa"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
