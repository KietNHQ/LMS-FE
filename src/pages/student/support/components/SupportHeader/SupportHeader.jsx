import "./SupportHeader.css";

export default function SupportHeader({ chatStatus = "Sẵn sàng" }) {
    return (
        <header className="support-header">
            <div>
                <h1>Trung tâm hỗ trợ</h1>
            </div>

            <div className="support-header-meta" aria-label="Thông tin hỗ trợ">
                <span className="support-meta-chip support-meta-chip--accent">Chat: {chatStatus}</span>
            </div>
        </header>
    );
}
