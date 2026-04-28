import { useMemo, useState } from "react";
import { FiEdit3, FiStar, FiUsers, FiBookOpen, FiPhone } from "react-icons/fi";
import "./StudentBanCanSuLop.css";

const officerTabs = [
  {
    key: "lop-truong",
    label: "Lớp trưởng",
    shortLabel: "LT",
    role: "Điều phối lớp",
    description:
      "Phối hợp với giáo viên chủ nhiệm, giữ nề nếp lớp học và truyền đạt thông tin quan trọng đến cả lớp.",
    responsibilities: [
      "Điểm danh, nhắc nề nếp đầu giờ và cuối buổi.",
      "Hỗ trợ giáo viên chủ nhiệm khi cần tổng hợp thông tin lớp.",
      "Đầu mối truyền đạt thông báo từ giáo viên tới tập thể lớp.",
    ],
    highlights: [
      { label: "Nhiệm vụ", value: "Quản lý nề nếp" },
      { label: "Phạm vi", value: "Toàn lớp" },
      { label: "Vai trò", value: "Điều phối" },
    ],
    members: [
      { name: "Nguyễn Hoàng Khang", duty: "Lớp trưởng", phone: "0901 234 567" },
      { name: "Trần Minh Anh", duty: "Lớp phó học tập", phone: "0912 345 678" },
    ],
  },
  {
    key: "pho-hoc-tap",
    label: "Phó học tập",
    shortLabel: "PHT",
    role: "Hỗ trợ học tập",
    description:
      "Theo dõi tình hình học tập của lớp, nhắc bài, hỗ trợ tổng hợp điểm kiểm tra và hỗ trợ bạn học yếu.",
    responsibilities: [
      "Ghi nhận tình hình làm bài, nộp bài và ôn tập của lớp.",
      "Nhắc lịch kiểm tra, bài tập và nội dung ôn tập theo tuần.",
      "Kết nối với lớp trưởng để báo cáo tình hình học tập.",
    ],
    highlights: [
      { label: "Nhiệm vụ", value: "Theo dõi học tập" },
      { label: "Phạm vi", value: "Môn học" },
      { label: "Vai trò", value: "Hỗ trợ" },
    ],
    members: [
      { name: "Lê Bảo Ngọc", duty: "Phó học tập", phone: "0934 567 890" },
      { name: "Phạm Gia Huy", duty: "Hỗ trợ học tập", phone: "0922 111 222" },
    ],
  },
  {
    key: "bi-thu",
    label: "Bí thư",
    shortLabel: "BT",
    role: "Phong trào lớp",
    description:
      "Phụ trách công tác phong trào, phối hợp hoạt động tập thể và các nội dung sinh hoạt lớp.",
    responsibilities: [
      "Tổ chức, nhắc nhở các hoạt động phong trào của lớp.",
      "Ghi nhận ý kiến đóng góp trong các buổi sinh hoạt lớp.",
      "Phối hợp lớp trưởng và giáo viên chủ nhiệm để triển khai hoạt động.",
    ],
    highlights: [
      { label: "Nhiệm vụ", value: "Phong trào lớp" },
      { label: "Phạm vi", value: "Sinh hoạt" },
      { label: "Vai trò", value: "Điều phối hoạt động" },
    ],
    members: [
      { name: "Phan Nhật Minh", duty: "Bí thư", phone: "0988 765 432" },
      { name: "Võ Khánh Vy", duty: "Hỗ trợ hoạt động", phone: "0977 888 999" },
    ],
  },
];

export default function StudentBanCanSuLop() {
  const [activeTab, setActiveTab] = useState("lop-truong");

  const activeOfficer = useMemo(
    () => officerTabs.find((item) => item.key === activeTab) ?? officerTabs[0],
    [activeTab]
  );

  return (
    <div className="student-ban-can-su-lop-page">
      <div className="student-ban-can-su-lop-header">
        <div className="student-ban-can-su-lop-header__title">
          <span className="student-ban-can-su-lop-kicker">Tiêu đề</span>
          <h1>Ban cán sự lớp</h1>
          <p>
            Chọn từng vai trò để xem thông tin riêng của lớp trưởng, phó học tập và bí thư.
          </p>
        </div>

        <div className="student-ban-can-su-lop-header__badge">
          <FiUsers />
          <span>3 trang lẻ</span>
        </div>
      </div>

      <div className="student-ban-can-su-lop-tabs" role="tablist" aria-label="Ban cán sự lớp">
        {officerTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`student-ban-can-su-lop-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="student-ban-can-su-lop-tab__icon">{tab.shortLabel}</span>
            <span className="student-ban-can-su-lop-tab__text">
              <strong>{tab.label}</strong>
              <small>{tab.role}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="student-ban-can-su-lop-content">
        <section className="student-ban-can-su-lop-overview">
          <div className="student-ban-can-su-lop-overview__top">
            <div>
              <span className="student-ban-can-su-lop-section-label">Vai trò đang xem</span>
              <h2>{activeOfficer.label}</h2>
            </div>
            <div className="student-ban-can-su-lop-overview__icon">
              {activeTab === "lop-truong" ? (
                <FiStar />
              ) : activeTab === "pho-hoc-tap" ? (
                <FiBookOpen />
              ) : (
                <FiEdit3 />
              )}
            </div>
          </div>

          <p className="student-ban-can-su-lop-description">{activeOfficer.description}</p>

          <div className="student-ban-can-su-lop-highlights">
            {activeOfficer.highlights.map((item) => (
              <div key={item.label} className="student-ban-can-su-lop-highlight-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="student-ban-can-su-lop-contact-box">
            <div>
              <span className="student-ban-can-su-lop-section-label">Kết nối nhanh</span>
              <strong>Thông tin liên hệ nội bộ</strong>
            </div>
            <div className="student-ban-can-su-lop-contact-box__phone">
              <FiPhone />
              <span>0900 000 123</span>
            </div>
          </div>
        </section>

        <section className="student-ban-can-su-lop-details">
          <div className="student-ban-can-su-lop-panel">
            <div className="student-ban-can-su-lop-panel__header">
              <h3>Nhiệm vụ chính</h3>
              <span>{activeOfficer.label}</span>
            </div>

            <ul className="student-ban-can-su-lop-list">
              {activeOfficer.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="student-ban-can-su-lop-panel">
            <div className="student-ban-can-su-lop-panel__header">
              <h3>Thành viên phụ trách</h3>
              <span>Cập nhật theo vai trò</span>
            </div>

            <div className="student-ban-can-su-lop-member-list">
              {activeOfficer.members.map((member) => (
                <article key={member.name} className="student-ban-can-su-lop-member-card">
                  <div className="student-ban-can-su-lop-member-card__avatar">
                    {member.name
                      .split(" ")
                      .slice(-2)
                      .map((part) => part[0])
                      .join("")}
                  </div>
                  <div className="student-ban-can-su-lop-member-card__info">
                    <strong>{member.name}</strong>
                    <span>{member.duty}</span>
                    <small>{member.phone}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

