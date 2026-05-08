import "./SupportHeader.css";

export default function SupportHeader({ chatStatus = "Sẵn sàng"}) {
  return (
    <header className="student-support-header">
      <div>
        <h1>Trung tâm hỗ trợ</h1>
      </div>

      <div className="student-support-header-meta" aria-label="Thông tin hỗ trợ học sinh">
        <span className="student-support-meta-chip student-support-meta-chip--accent">
          Chat: {chatStatus}
        </span>
      </div>
    </header>
  );
}


