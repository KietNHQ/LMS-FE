import { FiAward } from "react-icons/fi";
export default function ManagementGrades() {
    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <FiAward size={24} color="#6366f1" />
                <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Quản Lý Điểm Số</h2>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                <p style={{ margin: 0 }}>Chức năng đang được chuyển sang hệ thống mới.</p>
            </div>
        </div>
    );
}
