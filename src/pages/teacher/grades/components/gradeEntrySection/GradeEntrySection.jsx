import SectionCard from "../../../../../components/common/SectionCard/SectionCard";
import "./GradeEntrySection.css";

export default function GradeEntrySection({
    classLabel,
    semesterLabel,
    subjectLabel,
    studentOptions = [],
    selectedStudentId,
    selectedRecord,
    draft,
    onSelectStudent,
    onDraftChange,
    onSave,
    onReset,
}) {
    return (
        <SectionCard
            title="Nhập & chỉnh sửa điểm"
            subtitle="Chọn học sinh, nhập điểm thành phần và lưu cập nhật ngay trên danh sách."
            actions={<span className="grade-entry-badge">{classLabel} · {semesterLabel} · {subjectLabel}</span>}
        >
            <div className="grade-entry-section">
                <div className="grade-entry-overview">
                    <div className="grade-entry-overview__item">
                        <span>Học sinh đang chọn</span>
                        <strong>{selectedRecord?.name || "Chưa có học sinh"}</strong>
                        <small>{selectedRecord?.code || "-"}</small>
                    </div>

                    <div className="grade-entry-overview__item">
                        <span>Môn học</span>
                        <strong>{subjectLabel}</strong>
                        <small>{semesterLabel}</small>
                    </div>

                    <div className="grade-entry-overview__item">
                        <span>Lớp</span>
                        <strong>{classLabel}</strong>
                        <small>{studentOptions.length} học sinh</small>
                    </div>
                </div>

                <form
                    className="grade-entry-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSave?.();
                    }}
                >
                    <label className="grade-entry-field grade-entry-field--full">
                        <span>Chọn học sinh</span>
                        <select value={selectedStudentId || ""} onChange={(event) => onSelectStudent?.(Number(event.target.value))}>
                            {studentOptions.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name} · {student.code}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="grade-entry-field">
                        <span>Điểm miệng</span>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={draft.oral}
                            onChange={(event) => onDraftChange?.("oral", event.target.value)}
                        />
                    </label>

                    <label className="grade-entry-field">
                        <span>Điểm 15 phút</span>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={draft.test15}
                            onChange={(event) => onDraftChange?.("test15", event.target.value)}
                        />
                    </label>

                    <label className="grade-entry-field">
                        <span>Giữa kỳ</span>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={draft.midterm}
                            onChange={(event) => onDraftChange?.("midterm", event.target.value)}
                        />
                    </label>

                    <label className="grade-entry-field">
                        <span>Cuối kỳ</span>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={draft.final}
                            onChange={(event) => onDraftChange?.("final", event.target.value)}
                        />
                    </label>

                    <label className="grade-entry-field grade-entry-field--full">
                        <span>Ghi chú</span>
                        <textarea
                            rows="3"
                            value={draft.note}
                            onChange={(event) => onDraftChange?.("note", event.target.value)}
                            placeholder="Nhập nhận xét ngắn cho học sinh..."
                        />
                    </label>

                    <div className="grade-entry-actions grade-entry-field--full">
                        <button type="button" className="grade-entry-btn grade-entry-btn--ghost" onClick={onReset}>
                            Hủy thay đổi
                        </button>
                        <button type="submit" className="grade-entry-btn grade-entry-btn--primary">
                            Lưu điểm
                        </button>
                    </div>
                </form>
            </div>
        </SectionCard>
    );
}

