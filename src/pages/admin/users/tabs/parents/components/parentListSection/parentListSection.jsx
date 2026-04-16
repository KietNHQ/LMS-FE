import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./parentListSection.css";

export default function ParentListSection({
    parents,
    emptyMessage = "Không tìm thấy tài khoản phụ huynh nào.",
    onView,
    onEdit,
    onDelete,
}) {
    return (
        <section className="parent-list-card">
            <div className="parent-list-table-wrap">
                <table className="parent-list-table">
                    <thead>
                        <tr>
                            <th>PHỤ HUYNH</th>
                            <th>SĐT</th>
                            <th>GIÁM HỘ HỌC SINH</th>
                            <th className="parent-actions-col">THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!parents || parents.length === 0) ? (
                            <tr>
                                <td colSpan="4" className="parent-empty-row">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            parents.map((parent) => (
                                (() => {
                                    const displayName = String(parent?.name || parent?.email || "Phụ huynh").trim();
                                    const avatarLetter = displayName.charAt(0).toUpperCase() || "P";
                                    return (
                                <tr
                                    key={parent.id}
                                    onClick={() => onView(parent)}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            onView(parent);
                                        }
                                    }}
                                >
                                    <td>
                                        <div className="parent-main-info">
                                            <div className="parent-avatar">
                                                {avatarLetter}
                                            </div>
                                            <div className="parent-name-wrap">
                                                <h4>{displayName}</h4>
                                                <p>{parent.email || "—"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{parent.phone}</td>
                                    <td>
                                        <div className="parent-children-badges">
                                            {(parent.displayChildren || parent.profile?.children || []).map((child, idx) => {
                                                const isGraduated = child.childClass === "Đã tốt nghiệp";
                                                return (
                                                    <span key={idx} className={`child-badge ${isGraduated ? 'graduated' : ''}`}>
                                                        {child.childName} ({child.childClass})
                                                    </span>
                                                );
                                            })}
                                            {!(parent.displayChildren?.length || parent.profile?.children?.length) && (
                                                <span className="text-gray-400 italic">Chưa có thông tin</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="parent-row-actions" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => onEdit(parent)} title="Chỉnh sửa" className="parent-icon-btn edit">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => onDelete(parent.id)} title="Xóa" className="parent-icon-btn delete">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                    );
                                })()
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
