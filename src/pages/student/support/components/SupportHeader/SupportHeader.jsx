import "./SupportHeader.css";

export default function SupportHeader({ faqCount = 0, chatStatus = "Sẵn sàng" }) {
    return (
        <header className="support-header">
            <div>
                <h1>Trung tâm hỗ trợ</h1>
                <p>Tìm câu trả lời nhanh, liên hệ bộ phận hỗ trợ và nhận hướng dẫn trong ngày.</p>
            </div>

            <div className="support-header-meta" aria-label="Thông tin hỗ trợ">
                <span className="support-meta-chip">FAQ: {faqCount} câu hỏi</span>
                <span className="support-meta-chip support-meta-chip--accent">Chat: {chatStatus}</span>
            </div>
        </header>
    );
}
