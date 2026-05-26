import "./GradeEntrySection.css";

export default function GradeEntrySection({
    classLabel,
    selectedRecord,
    draft,
    onDraftChange,
    onSave,
    onReset,
}) {
    const regularScores = draft.regularScores?.length ? draft.regularScores : [""];
    const midtermScore = draft.midterm ?? "";

    const updateScoreList = (field, index, value, values) => {
        const next = [...values];
        next[index] = value;
        onDraftChange?.(field, next);
    };

    const addScore = (field, values) => {
        onDraftChange?.(field, [...values, ""]);
    };

    return (
        <div className="grade-entry-section">
            <div className="grade-entry-overview">
                <div className="grade-entry-overview__item">
                    <span>Họ tên</span>
                    <strong>{selectedRecord?.name || "Chưa có học sinh"}</strong>
                </div>

                <div className="grade-entry-overview__item">
                    <span>Lớp</span>
                    <strong>{classLabel}</strong>
                </div>
            </div>

            <form
                className="grade-entry-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSave?.();
                }}
            >
                    <section className="grade-entry-multi-block grade-entry-field--full">
                        <div className="grade-entry-multi-head">
                            <span>Điểm thường xuyên</span>
                            <button type="button" className="grade-entry-add-btn" onClick={() => addScore("regularScores", regularScores)}>+</button>
                        </div>
                        <div className="grade-entry-multi-grid">
                            {regularScores.map((value, index) => (
                                <label key={`regular-${index}`} className="grade-entry-field">
                                    <span>Thường xuyên {index + 1}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={value}
                                        onChange={(event) => updateScoreList("regularScores", index, event.target.value, regularScores)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>

                <label className="grade-entry-field">
                    <span>Giữa kỳ</span>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={midtermScore}
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
    );
}

