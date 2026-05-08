import { useMemo, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import Select from "../../../../components/ui/Select/Select";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { 
  FiActivity, FiCheckSquare, FiClock, FiSearch, FiFilter, 
  FiInbox, FiAlertTriangle, FiX, FiCheck, FiChevronLeft, FiChevronRight 
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./PrincipalApprovals.css";

// ... (WORK_ITEMS stays the same)

const WORK_ITEMS = [
  {
    id: "G-101",
    section: "grades",
    sectionLabel: "Chuyên môn",
    title: "Sổ điểm HK1 - 10A1",
    reference: "#GR-101",
    requester: "PHT. Nguyễn Y",
    summary: "Đã kiểm tra 100% cột điểm, chờ phê duyệt để khóa sổ.",
    description: "Toàn bộ giáo viên bộ môn của khối 10A1 đã hoàn tất việc nhập điểm và đánh giá định kỳ. Đã có sự xác nhận chéo từ phía tổ trưởng chuyên môn. Cần ký duyệt cuối cùng để hệ thống chính thức khóa sổ điểm và xuất báo cáo học kỳ.",
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
    description: "Phát hiện 3 trường hợp học sinh vắng thi học kỳ nhưng chưa có biên bản xử lý đính kèm trong hồ sơ điện tử. Cần rà soát lại trước khi phê duyệt tổng thể.",
    time: "4 giờ trước",
    dueAt: "Ngày mai",
    priority: "Trung bình",
    status: "pending",
  },
  {
    id: "A-201",
    section: "activities",
    sectionLabel: "Kế hoạch & Ngân sách",
    title: "Ngân sách Hội trại 20/11",
    reference: "#ACT-201",
    requester: "Kế toán trưởng",
    summary: "Dự toán chi tiết đính kèm, cần quyết định cuối cùng.",
    description: "Đề xuất kinh phí tổ chức Hội trại truyền thống. Đã bao gồm chi phí thuê thiết bị âm thanh, ánh sáng, phần thưởng và công tác an ninh. Ngân sách dự kiến tăng 5% so với năm trước do chi phí vật liệu trang trí tăng.",
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
    description: "Kế hoạch tập huấn đội tuyển dự thi cấp Thành phố. Bao gồm 12 buổi học tăng cường vào chiều thứ 7 và sáng chủ nhật. Danh sách gồm 08 học sinh xuất sắc nhất khối 12.",
    time: "5 giờ trước",
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
    description: "Hoàn tất số hóa học bạ cho lớp 12A3. Tất cả dữ liệu đã được đối soát với bản giấy. Cần phê duyệt để trả hồ sơ cho học sinh nộp hồ sơ xét tuyển Đại học.",
    time: "Hôm qua",
    dueAt: "Đã xử lý",
    priority: "Thấp",
    status: "approved",
  },
  // Extra data for pagination
  {
    id: "A-203",
    section: "activities",
    sectionLabel: "Kế hoạch & Ngân sách",
    title: "Bổ sung thiết bị phòng thực hành",
    reference: "#ACT-203",
    requester: "Tổ Tin học",
    summary: "Chờ chốt hạn mức từ hiệu trưởng.",
    description: "Đề xuất mua mới 20 bộ máy tính phục vụ kỳ thi nghề. Các máy cũ hiện tại đã quá thời gian khấu hao và thường xuyên gặp lỗi phần cứng.",
    time: "Hôm qua",
    dueAt: "Đã xử lý",
    priority: "Trung bình",
    status: "rejected",
  },
  {
    id: "G-104",
    section: "grades",
    sectionLabel: "Chuyên môn",
    title: "Xác nhận kết quả khảo sát khối 11",
    reference: "#GR-104",
    requester: "PHT. Trần D",
    summary: "Kiểm tra phổ điểm kỳ thi thử năng lực.",
    description: "Dữ liệu kết quả khảo sát đầu năm của toàn khối 11. Cần xem xét để có hướng điều chỉnh kế hoạch giảng dạy phù hợp cho giai đoạn tiếp theo.",
    time: "3 ngày trước",
    dueAt: "Đã xử lý",
    priority: "Trung bình",
    status: "approved",
  },
  {
    id: "A-204",
    section: "activities",
    sectionLabel: "Kế hoạch & Ngân sách",
    title: "Phê duyệt chi phí tu bổ sân bóng",
    reference: "#ACT-204",
    requester: "Cán bộ hành chính",
    summary: "Thay cỏ nhân tạo và nâng cấp hệ thống thoát nước.",
    description: "Dự án cải tạo cơ sở vật chất sân chơi. Khu vực sân bóng hiện bị đọng nước mỗi khi mưa lớn, ảnh hưởng đến hoạt động giáo dục thể chất.",
    time: "Hôm qua",
    dueAt: "Tuần này",
    priority: "Thấp",
    status: "pending",
  },
  {
    id: "G-105",
    section: "grades",
    sectionLabel: "Chuyên môn",
    title: "Đề xuất điều chỉnh phân phối chương trình",
    reference: "#GR-105",
    requester: "Tổ Ngữ Văn",
    summary: "Thay đổi một số tiết ôn tập cho khối 12.",
    description: "Đề xuất tăng cường các tiết rèn kỹ năng viết đoạn văn nghị luận xã hội nhằm bám sát cấu trúc đề thi mới của Bộ GD&ĐT.",
    time: "2 giờ trước",
    dueAt: "Ngày mai",
    priority: "Trung bình",
    status: "pending",
  },
  {
    id: "A-205",
    section: "activities",
    sectionLabel: "Kế hoạch & Ngân sách",
    title: "Ngân sách tổ chức Lễ khai giảng",
    reference: "#ACT-205",
    requester: "Phòng Tài vụ",
    summary: "Các hạng mục âm thanh, khánh tiết và tiệc trà.",
    description: "Dự toán chi tiết cho buổi lễ quan trọng nhất đầu năm học. Đã được các phòng ban chuyên môn liên quan thẩm định kỹ lưỡng.",
    time: "Hôm qua",
    dueAt: "Tuần sau",
    priority: "Cao",
    status: "pending",
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

function ItemModal({ item, isOpen, onClose, onAction }) {
  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__info">
            <span className="modal-ref">{item.reference}</span>
            <h2>{item.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        
        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-field">
              <label>Đơn vị trình</label>
              <div className="modal-val">
                <strong>{item.requester}</strong>
                <span>{item.time}</span>
              </div>
            </div>
            <div className="modal-field">
              <label>Mức độ ưu tiên</label>
              <div className="modal-val"><PriorityBadge priority={item.priority} /></div>
            </div>
            <div className="modal-field">
              <label>Hạn xử lý</label>
              <div className="modal-val">
                <FiClock /> {item.dueAt}
              </div>
            </div>
            <div className="modal-field">
              <label>Trạng thái</label>
              <div className="modal-val"><StatusBadge status={item.status} /></div>
            </div>
          </div>

          <div className="modal-section">
            <label>Nội dung tóm tắt</label>
            <p className="modal-summary">{item.summary}</p>
          </div>

          <div className="modal-section">
            <label>Chi tiết yêu cầu</label>
            <div className="modal-description">
              {item.description || "Không có mô tả chi tiết cho yêu cầu này."}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {item.status === "pending" ? (
            <div className="modal-actions">
              <button className="btn-modal-reject" onClick={() => onAction(item.id, "rejected")}>
                <FiX /> Từ chối yêu cầu
              </button>
              <button className="btn-modal-approve" onClick={() => onAction(item.id, "approved")}>
                <FiCheck /> Phê duyệt ngay
              </button>
            </div>
          ) : (
            <button className="btn-modal-close" onClick={onClose}>Đóng chi tiết</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PrincipalApprovals() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [activeSection, setActiveSection] = useState("all");
  const [activeStatus, setActiveStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState(WORK_ITEMS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 6;
  const sectionLabel = selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2";

  const metrics = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      urgent: items.filter((item) => item.status === "pending" && item.priority === "Cao").length,
      resolved: items.filter((item) => item.status !== "pending").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
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

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const updateItemStatus = (id, status) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    setIsModalOpen(false);
    toast.success(`Đã xử lý yêu cầu ${id}`);
  };

  const openItemDetail = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const bulkApprove = () => {
    const pendingVisible = filteredItems.filter((item) => item.status === "pending");
    if (pendingVisible.length === 0) {
      toast.info("Không có yêu cầu chờ duyệt.");
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
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="approvals-hero-unified">
        <div className="approvals-hero-unified__info">
          <div className="hero-status-tag"><FiInbox /> Hàng chờ điều hành</div>
          <h2>Danh sách phê duyệt & Backlog</h2>
          <p>Xử lý tập trung các yêu cầu từ chuyên môn và kế hoạch ngân sách.</p>
        </div>

        <div className="hero-metrics-grid">
          <div className="hero-metric-card">
            <span className="label">Tổng số</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="hero-metric-card focus">
            <span className="label">Chờ duyệt</span>
            <strong>{metrics.pending}</strong>
          </div>
          <div className="hero-metric-card urgent">
            <span className="label">Ưu tiên cao</span>
            <strong>{metrics.urgent}</strong>
          </div>
          <div className="hero-metric-card">
            <span className="label">Đã xử lý</span>
            <strong>{metrics.resolved}</strong>
          </div>
        </div>
      </div>

      <div className="approvals-controls-refined">
        <div className="search-box-wrapper">
          <FiSearch />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Mã, tiêu đề, đơn vị trình..."
          />
        </div>

        <div className="filters-row">
          <Select
            variant="custom"
            options={SECTION_OPTIONS}
            value={activeSection}
            onChange={(e) => {
              setActiveSection(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-dropdown"
            placeholder="Luồng công việc"
          />
          <Select
            variant="custom"
            options={STATUS_OPTIONS}
            value={activeStatus}
            onChange={(e) => {
              setActiveStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-dropdown"
            placeholder="Trạng thái"
          />
        </div>

        <button className="bulk-approve-btn" onClick={bulkApprove}>
          <FiCheckSquare /> Phê duyệt nhanh
        </button>
      </div>

      <div className="approvals-table-container">
        <div className="table-header-context">
          <h3>
            {activeStatus === "pending"
              ? "Hàng chờ xử lý"
              : activeStatus === "approved"
              ? "Lịch sử phê duyệt"
              : activeStatus === "rejected"
              ? "Yêu cầu đã từ chối"
              : "Danh sách tổng quát"}{" "}
            ({filteredItems.length})
          </h3>
          <div className="table-legend">
             <span><span className="dot pending" /> Chờ duyệt</span>
             <span><span className="dot approved" /> Đã duyệt</span>
             <span><span className="dot rejected" /> Từ chối</span>
          </div>
        </div>

        <div className="table-wrapper">
          {visibleItems.length === 0 ? (
            <div className="empty-state">
              <FiAlertTriangle />
              <p>Không tìm thấy yêu cầu phù hợp.</p>
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Ưu tiên</th>
                  <th>Nội dung công việc</th>
                  <th>Đơn vị trình</th>
                  <th>Hạn xử lý</th>
                  <th>Tình trạng</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.id} className={item.status === "pending" ? "row-pending" : ""}>
                    <td><PriorityBadge priority={item.priority} /></td>
                    <td>
                      <div className="item-main-info" onClick={() => openItemDetail(item)}>
                        <span className="title">{item.title}</span>
                        <span className="ref">{item.reference}</span>
                      </div>
                    </td>
                    <td>
                      <div className="requester-info">
                        <strong>{item.requester}</strong>
                        <span>{item.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="deadline-box">
                        <FiClock /> {item.dueAt}
                        <span className="section-tag">{item.sectionLabel}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td className="text-right">
                      {item.status === "pending" ? (
                        <button className="btn-table-action" onClick={() => openItemDetail(item)}>
                          Xem & Duyệt
                        </button>
                      ) : (
                        <button className="btn-table-secondary" onClick={() => openItemDetail(item)}>
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

        {totalPages > 1 && (
          <div className="pagination-footer">
            <button 
              className="page-btn" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <FiChevronLeft />
            </button>
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`page-num ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              className="page-btn" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      <ItemModal 
        item={selectedItem} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAction={updateItemStatus}
      />
    </div>
  );
}

