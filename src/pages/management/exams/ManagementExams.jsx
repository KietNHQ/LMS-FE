import { FiCalendar } from "react-icons/fi";
export default function ManagementExams() {
    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <FiCalendar size={24} color="#10b981" />
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Quản Lý Kỳ Thi</h2>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                <p style={{ margin: 0 }}>Tính năng quản lý kỳ thi và phòng thi đang được đồng bộ hóa.</p>
            </div>
        </div>
    );
}

