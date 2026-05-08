import "./SupportHeader.css";

export default function SupportHeader({ chatStatus = "Sẵn sàng"}) {
  return (
    <header className="parent-support-header">
      <div>
        <h1>Trung tâm hỗ trợ</h1>
      </div>

      <div className="parent-support-header-meta" aria-label="Thông tin hỗ trợ phụ huynh">
        <span className="parent-support-meta-chip parent-support-meta-chip--accent">
          Chat: {chatStatus}
        </span>
      </div>
    </header>
  );
}


