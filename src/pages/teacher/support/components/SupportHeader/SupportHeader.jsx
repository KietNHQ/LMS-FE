import "./SupportHeader.css";

export default function SupportHeader({ chatStatus = "Sẵn sàng"}) {
  return (
    <header className="teacher-support-header">
      <div>
        <h1>Trung tâm hỗ trợ</h1>
      </div>

      <div className="teacher-support-header-meta" aria-label="Thông tin hỗ trợ phụ huynh">
        <span className="teacher-support-meta-chip teacher-support-meta-chip--accent">
          Chat: {chatStatus}
        </span>
      </div>
    </header>
  );
}

