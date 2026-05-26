import React, { useState, useRef } from "react";
import { FiX, FiUpload, FiFile, FiCheck, FiAlertCircle, FiImage, FiFileText } from "react-icons/fi";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import "./ViolationEvidenceUpload.css";

const EVIDENCE_TYPES = [
    { value: "PHOTO", label: "Hình ảnh", icon: FiImage },
    { value: "VIDEO", label: "Video", icon: FiFile },
    { value: "DOCUMENT", label: "Tài liệu", icon: FiFileText },
    { value: "CLASS_LOG", label: "Nhật ký lớp", icon: FiFileText },
    { value: "OTHER", label: "Khác", icon: FiFile },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
    PHOTO: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    VIDEO: ["video/mp4", "video/webm", "video/quicktime"],
    DOCUMENT: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    CLASS_LOG: ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"],
    OTHER: ["*"],
};

export default function ViolationEvidenceUpload({
    isOpen,
    onClose,
    violationId,
    onSuccess,
    existingEvidence = null
}) {
    const [selectedType, setSelectedType] = useState("PHOTO");
    const [notes, setNotes] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const uploadMutation = useMutation({
        mutationFn: async ({ file, evidenceType, evidenceNotes }) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("evidenceType", evidenceType);
            if (evidenceNotes) {
                formData.append("notes", evidenceNotes);
            }

            return vpDisciplineService.callByKey("post_discipline_violations_by_id_evidence", {
                pathParams: { id: violationId },
                body: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onSuccess: (response) => {
            toast.success("Đã tải lên bằng chứng thành công!");
            resetForm();
            onClose();
            if (onSuccess) onSuccess(response);
        },
        onError: (error) => {
            toast.error(error?.message || "Không thể tải lên bằng chứng. Vui lòng thử lại.");
        },
    });

    const resetForm = () => {
        setSelectedType("PHOTO");
        setNotes("");
        setSelectedFile(null);
    };

    const validateFile = (file) => {
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`File quá lớn. Kích thước tối đa là ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            return false;
        }

        const allowed = ALLOWED_TYPES[selectedType] || [];
        const isAllowed = selectedType === "OTHER" || allowed.includes(file.type);

        if (!isAllowed) {
            toast.error(`Loại file không được hỗ trợ cho "${EVIDENCE_TYPES.find(t => t.value === selectedType)?.label}"`);
            return false;
        }

        return true;
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        if (validateFile(file)) {
            setSelectedFile(file);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error("Vui lòng chọn file để tải lên");
            return;
        }

        uploadMutation.mutate({
            file: selectedFile,
            evidenceType: selectedType,
            evidenceNotes: notes,
        });
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    if (!isOpen) return null;

    const TypeIcon = EVIDENCE_TYPES.find(t => t.value === selectedType)?.icon || FiFile;

    return (
        <div className="veu-overlay" onClick={onClose}>
            <div className="veu-container" onClick={e => e.stopPropagation()}>
                <div className="veu-header">
                    <div className="veu-header-icon">
                        <FiUpload />
                    </div>
                    <div className="veu-header-text">
                        <h2>Tải lên bằng chứng vi phạm</h2>
                        <p>Mã vi phạm: <strong>#{violationId}</strong></p>
                    </div>
                    <button className="veu-close" onClick={onClose}><FiX /></button>
                </div>

                <div className="veu-body custom-scrollbar">
                    {/* Existing Evidence */}
                    {existingEvidence && (
                        <div className="veu-existing">
                            <h4>Bằng chứng hiện có</h4>
                            <div className="veu-existing-item">
                                {existingEvidence.evidence_type === "PHOTO" ? (
                                    <img src={existingEvidence.evidence_url} alt="Evidence" className="veu-existing-img" />
                                ) : (
                                    <div className="veu-existing-file">
                                        <FiFileText />
                                        <span>{existingEvidence.evidence_url}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Evidence Type Selection */}
                    <div className="veu-field">
                        <label>Loại bằng chứng</label>
                        <div className="veu-type-grid">
                            {EVIDENCE_TYPES.map(type => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        className={`veu-type-btn ${selectedType === type.value ? 'active' : ''}`}
                                        onClick={() => setSelectedType(type.value)}
                                    >
                                        <Icon size={20} />
                                        <span>{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="veu-field">
                        <label>File bằng chứng</label>
                        <div
                            className={`veu-dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {selectedFile ? (
                                <div className="veu-file-preview">
                                    <TypeIcon size={32} />
                                    <div className="veu-file-info">
                                        <span className="veu-file-name">{selectedFile.name}</span>
                                        <span className="veu-file-size">{formatFileSize(selectedFile.size)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="veu-file-remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ) : (
                                <div className="veu-dropzone-content">
                                    <FiUpload size={40} />
                                    <p>Kéo thả file vào đây hoặc <span>chọn file</span></p>
                                    <span className="veu-dropzone-hint">
                                        Kích thước tối đa: {MAX_FILE_SIZE / 1024 / 1024}MB
                                    </span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="veu-file-input"
                                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                accept={
                                    selectedType === "OTHER"
                                        ? "*"
                                        : ALLOWED_TYPES[selectedType]?.join(",")
                                }
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="veu-field">
                        <label>Ghi chú (tùy chọn)</label>
                        <textarea
                            className="veu-textarea"
                            placeholder="Mô tả thêm về bằng chứng, ngày giờ, địa điểm..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="veu-footer">
                    <button
                        type="button"
                        className="veu-btn-secondary"
                        onClick={handleCancel}
                        disabled={uploadMutation.isPending}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        className="veu-btn-primary"
                        onClick={handleSubmit}
                        disabled={!selectedFile || uploadMutation.isPending}
                    >
                        {uploadMutation.isPending ? (
                            <>
                                <span className="veu-spinner" /> Đang tải lên...
                            </>
                        ) : (
                            <>
                                <FiUpload /> Tải lên
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
