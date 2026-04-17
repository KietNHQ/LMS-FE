import { useMemo, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiActivity, FiCheckSquare, FiClock, FiSearch, FiFilter, FiInbox, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";
import "./PrincipalApprovals.css";

const WORK_ITEMS = [
  {
    id: "G-101",
    section: "grades",
    sectionLabel: "Chuyên môn",
    title: "Sổ điểm HK1 - 10A1",
    reference: "#GR-101",
    requester: "PHT. Nguyễn Y",
    summary: "Đã kiểm tra 100% cột điểm, chờ phê duyệt để khóa sổ.",
    time: "2 giờ trước",
    dueAt: "Trước 17:00 hôm nay",
    priority: "Cao",
    status: "pending",
  },
  {
    id: "G-102",
    section: "grades",
    sectionLabel: "Chuyên môn",
    title: "Sổ điểm HK1 - 11A5",
    reference: "#GR-102",
    requester: "PHT. Nguyễn Y",
    summary: "Thiếu xác nhận một số đầu điểm học kỳ.",
    time: "4 giờ trước",
    dueAt: "Ngày mai",
    priority: "Trung bình",
    status: "pending",
  },
  {
    id: "G-103",
    section: "grades",
    sectionLabel: "Chuyên môn",
    title: "Học bạ định kỳ - 12A3",
    reference: "#GR-103",
    requester: "Giáo vụ Lê C",
    summary: "Đã xuất bản PDF, sẵn sàng lưu hồ sơ.",
    time: "Hôm qua",
    dueAt: "Đã xử lý",
    priority: "Thấp",
    status: "approved",
  },
  {
    id: "A-201",
    section: "activities",
    sectionLabel: "Kế hoạch & Ngân sách",
    title: "Ngân sách Hội trại 20/11",
    reference: "#ACT-201",
    requester: "Kế toán trưởng",
    summary: "Dự toán chi tiết đính kèm, cần quyết định cuối cùng.",
    time: "1 giờ trước",
    dueAt: "Trong ngày",
    priority: "Cao",
    status: "pending",
  },
  {
    id: "A-202",
    section: "activities",
    sectionLabel: "Kế hoạch & Ngân sách",
    title: "Kế hoạch Bồi dưỡng Học sinh giỏi",
    reference: "#ACT-202",
    requester: "Tổ chuyên môn Toán",
    summary: "Đề xuất lịch, kinh phí và danh sách học sinh tham gia.",
    time: "5 giờ trước",
    dueAt: "Ngày mai",
    priority: "Trung bình",
    status: "pending",
  },
  {
    id: "A-203",
    section: "activities",
    sectionLabel: "Kế hoạch & Ngân sách",
    title: "Bổ sung thiết bị phòng thực hành",
    reference: "#ACT-203",
    requester: "Tổ Tin học",
    summary: "Đã duyệt cấp dưới, chờ chốt hạn mức từ hiệu trưởng.",
    time: "Hôm qua",
    dueAt: "Đã xử lý",
    priority: "Trung bình",
    status: "rejected",
  },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const SECTION_OPTIONS = [
  { value: "all", label: "Tất cả luồng" },
  { value: "grades", label: "Chuyên môn" },
  { value: "activities", label: "Kế hoạch & ngân sách" },
];

function StatusBadge({ status }) {
  if (status === "pending") return <span className="status-badge pending">⏳ Chờ duyệt</span>;
  if (status === "approved") return <span className="status-badge approved">✅ Đã duyệt</span>;
  if (status === "rejected") return <span className="status-badge rejected">❌ Từ chối</span>;
  return <span className="status-badge">Không xác định</span>;
}

function PriorityBadge({ priority }) {
  const priorityClass =
    priority === "Cao" ? "cao" : priority === "Trung bình" ? "trung-binh" : "thap";

  return <span className={`priority-badge priority-badge--${priorityClass}`}>{priority}</span>;
}

export default function PrincipalApprovals() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [activeSection, setActiveSection] = useState("all");
  const [activeStatus, setActiveStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState(WORK_ITEMS);

  const sectionLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";

  const metrics = useMemo(() => {
    const total = items.length;
    const pending = items.filter((item) => item.status === "pending").length;
    const approved = items.filter((item) => item.status === "approved").length;
    const rejected = items.filter((item) => item.status === "rejected").length;
    const urgent = items.filter((item) => item.status === "pending" && item.priority === "Cao").length;

    return { total, pending, approved, rejected, urgent };
  }, [items]);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSection = activeSection === "all" || item.section === activeSection;
      const matchesStatus = activeStatus === "all" || item.status === activeStatus;
      const matchesSearch = [item.id, item.title, item.requester, item.summary, item.reference]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSection && matchesStatus && matchesSearch;
    });
  }, [activeSection, activeStatus, items, searchTerm]);

  const updateItemStatus = (id, status) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    toast.success(`Đã cập nhật ${id}`);
  };

  const bulkApprove = () => {
    const pendingVisible = visibleItems.filter((item) => item.status === "pending");
    if (pendingVisible.length === 0) {
      toast.info("Không có yêu cầu chờ duyệt trong bộ lọc hiện tại.");
      return;
    }

    const ids = new Set(pendingVisible.map((item) => item.id));
    setItems((prev) => prev.map((item) => (ids.has(item.id) ? { ...item, status: "approved" } : item)));
    toast.success(`Đã phê duyệt ${pendingVisible.length} yêu cầu.`);
  };

  return (
    <div className="principal-approvals">
      <PageHeader
        title="Trung tâm Phê duyệt & Backlog"
        eyebrow="Danh sách công việc khả thi cho hiệu trưởng · quyết định nhanh, có truy vết"
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="approvals-hero">
        <div className="approvals-hero__text">
          <span className="approvals-hero__eyebrow">
            <FiInbox /> Hàng chờ điều hành
          </span>
          <h2>Ưu tiên xử lý các yêu cầu cần quyết định ngay</h2>
          <p>
            Màn hình này gom các yêu cầu duyệt từ chuyên môn và kế hoạch/ngân sách thành một backlog
            chung để hiệu trưởng có thể xem, lọc và xử lý nhanh.
          </p>
        </div>

        <div className="approvals-hero__metrics">
          <div className="approvals-metric">
            <span className="approvals-metric__label">Tổng công việc</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="approvals-metric">
            <span className="approvals-metric__label">Chờ duyệt</span>
            <strong>{metrics.pending}</strong>
          </div>
          <div className="approvals-metric">
            <span className="approvals-metric__label">Ưu tiên cao</span>
            <strong>{metrics.urgent}</strong>
          </div>
          <div className="approvals-metric">
            <span className="approvals-metric__label">Đã xử lý</span>
            <strong>{metrics.approved + metrics.rejected}</strong>
          </div>
        </div>
      </div>

      <div className="approvals-controls">
        <div className="approvals-search">
          <FiSearch />
          <label htmlFor="approvals-search" className="sr-only">
            Tìm kiếm yêu cầu
          </label>
          <input
            id="approvals-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm theo mã, tiêu đề, đơn vị trình..."
          />
        </div>

        <div className="approvals-filters" aria-label="Bộ lọc backlog">
          <div className="approvals-filter-group">
            <FiFilter />
            {SECTION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`filter-chip ${activeSection === option.value ? "is-active" : ""}`}
                onClick={() => setActiveSection(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="approvals-filter-group approvals-filter-group--status">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`filter-chip ${activeStatus === option.value ? "is-active" : ""}`}
                onClick={() => setActiveStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn-approve-all" onClick={bulkApprove}>
          <FiCheckSquare /> Phê duyệt hàng loạt
        </button>
      </div>

      <div className="approvals-content">
        <div className="approvals-header">
          <div>
            <h3>Backlog công việc cần xử lý</h3>
            <p>
              Năm học {selectedSchoolYear} · {sectionLabel} · {visibleItems.length} mục phù hợp bộ lọc
            </p>
          </div>
          <div className="approvals-header__legend">
            <span><span className="legend-dot legend-dot--pending" /> Chờ duyệt</span>
            <span><span className="legend-dot legend-dot--approved" /> Đã duyệt</span>
            <span><span className="legend-dot legend-dot--rejected" /> Từ chối</span>
          </div>
        </div>

        <div className="approvals-table-wrap">
          {visibleItems.length === 0 ? (
            <div className="approvals-empty">
              <FiAlertTriangle />
              <h4>Không có yêu cầu phù hợp</h4>
              <p>Hãy thử đổi bộ lọc theo luồng, trạng thái hoặc từ khóa tìm kiếm.</p>
            </div>
          ) : (
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Ưu tiên</th>
                  <th>Công việc</th>
                  <th>Đơn vị trình</th>
                  <th>Hạn xử lý</th>
                  <th>Tình trạng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td>
                      <div className="approvals-item-title">{item.title}</div>
                      <div className="approvals-item-meta">
                        <span>{item.reference}</span>
                        <span>{item.summary}</span>
                      </div>
                    </td>
                    <td>
                      <div className="approvals-source">{item.requester}</div>
                      <div className="approvals-source-meta">{item.time}</div>
                    </td>
                    <td>
                      <div className="approvals-deadline">
                        <FiClock /> {item.dueAt}
                      </div>
                      <div className="approvals-section-tag">{item.sectionLabel}</div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      {item.status === "pending" ? (
                        <div className="action-btns">
                          <button
                            type="button"
                            className="btn-sm-approve"
                            onClick={() => updateItemStatus(item.id, "approved")}
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            className="btn-sm-reject"
                            onClick={() => updateItemStatus(item.id, "rejected")}
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-sm-secondary"
                          onClick={() => toast.info(`Đã mở chi tiết ${item.id}`)}
                        >
                          Xem chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="approvals-footer-note">
        <FiActivity />
        <span>
          Dữ liệu đang hiển thị ở chế độ backlog giả lập. Khi BE sẵn sàng, có thể đổi trực tiếp sang hàng chờ thực,
          giữ nguyên layout và trạng thái công việc.
        </span>
      </div>
    </div>
  );
}
