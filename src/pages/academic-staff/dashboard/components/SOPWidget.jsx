import React from "react";
import { FiBook, FiCheckCircle, FiExternalLink, FiInfo } from "react-icons/fi";
import "./SOPWidget.css";

const LEGAL_DOCS = [
    { id: "TT 32/2020", name: "Điều lệ trường trung học", tag: "Cốt lõi" },
    { id: "TT 20/2023", name: "Vị trí việc làm giáo vụ", tag: "Nhân sự" },
    { id: "TT 22/2021", name: "Đánh giá học sinh THCS/THPT", tag: "Học vụ" },
    { id: "TT 30/2024", name: "Quy chế tuyển sinh mới", tag: "Tuyển sinh" },
    { id: "TT 10/2026", name: "Quy chế văn bằng, chứng chỉ", tag: "Tốt nghiệp" },
];

const SOP_CHECKLIST = [
    { task: "Rà soát hồ sơ học sinh mới", group: "Tuyển sinh" },
    { task: "Cập nhật biến động sĩ số tháng", group: "Học vụ" },
    { task: "Đối chiếu sổ đăng bộ với SQL", group: "Dữ liệu" },
    { task: "Kiểm tra chữ ký học bạ điện tử", group: "Học bạ" },
];

export default function SOPWidget() {
    return (
        <div className="sop-widget">
            <div className="sop-section">
                <div className="sop-title">
                    <FiCheckCircle /> <span>Danh mục SOP Checklist</span>
                </div>
                <div className="sop-list">
                    {SOP_CHECKLIST.map((item, index) => (
                        <div key={index} className="sop-item">
                            <input type="checkbox" id={`sop-${index}`} />
                            <label htmlFor={`sop-${index}`}>
                                <span className="sop-task-name">{item.task}</span>
                                <span className="sop-group-tag">{item.group}</span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="legal-section">
                <div className="sop-title">
                    <FiBook /> <span>Cơ sở Pháp lý & Quy định</span>
                </div>
                <div className="legal-grid">
                    {LEGAL_DOCS.map((doc, index) => (
                        <div key={index} className="legal-card">
                            <div className="legal-card-header">
                                <strong>{doc.id}</strong>
                                <span className={`legal-tag ${doc.tag === 'Cốt lõi' ? 'highlight' : ''}`}>
                                    {doc.tag}
                                </span>
                            </div>
                            <p>{doc.name}</p>
                            <button className="legal-btn">
                                Chi tiết <FiExternalLink />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="legal-footer">
                    <FiInfo /> Tài liệu cập nhật đến 17/04/2026
                </div>
            </div>
        </div>
    );
}
