import "./GradeEntrySection.css";

export default function GradeEntrySection({
    classLabel,
    selectedRecord,
    draft,
    onDraftChange,
    onSave,
    onReset,
}) {
    const oralScores = draft.oralScores?.length ? draft.oralScores : [""];
    const test15Scores = draft.test15Scores?.length ? draft.test15Scores : [""];
    const oneTietScores = draft.oneTietScores?.length ? draft.oneTietScores : [""];
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
                            <span>Điểm miệng</span>
                            <button type="button" className="grade-entry-add-btn" onClick={() => addScore("oralScores", oralScores)}>+</button>
                        </div>
                        <div className="grade-entry-multi-grid">
                            {oralScores.map((value, index) => (
                                <label key={`oral-${index}`} className="grade-entry-field">
                                    <span>Miệng {index + 1}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={value}
                                        onChange={(event) => updateScoreList("oralScores", index, event.target.value, oralScores)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="grade-entry-multi-block grade-entry-field--full">
                        <div className="grade-entry-multi-head">
                            <span>Điểm 15 phút</span>
                            <button type="button" className="grade-entry-add-btn" onClick={() => addScore("test15Scores", test15Scores)}>+</button>
                        </div>
                        <div className="grade-entry-multi-grid">
                            {test15Scores.map((value, index) => (
                                <label key={`test15-${index}`} className="grade-entry-field">
                                    <span>15 phút {index + 1}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={value}
                                        onChange={(event) => updateScoreList("test15Scores", index, event.target.value, test15Scores)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="grade-entry-multi-block grade-entry-field--full">
                        <div className="grade-entry-multi-head">
                            <span>Điểm 1 tiết</span>
                            <button type="button" className="grade-entry-add-btn" onClick={() => addScore("oneTietScores", oneTietScores)}>+</button>
                        </div>
                        <div className="grade-entry-multi-grid">
                            {oneTietScores.map((value, index) => (
                                <label key={`one-tiet-${index}`} className="grade-entry-field">
                                    <span>1 tiết {index + 1}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={value}
                                        onChange={(event) => updateScoreList("oneTietScores", index, event.target.value, oneTietScores)}
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
