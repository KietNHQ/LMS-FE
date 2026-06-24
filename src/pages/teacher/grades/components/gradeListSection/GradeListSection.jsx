import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { SearchBar } from "../../../../../components/common";
import SectionCard from "../../../../../components/common/SectionCard/SectionCard";
import "./GradeListSection.css";

function formatScore(value) {
    if (value === null || value === undefined || value === "") return "-";
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return "-";
    return numericValue.toFixed(1);
}

const RANK_LABELS = {
    excellent: "Xuất sắc",
    good: "Tốt",
    fair: "Khá",
    average: "Trung bình",
    weak: "Yếu",
    "comment-pass": "Đạt",
    "comment-fail": "Chưa đạt",
    "comment-missing": "Chưa đánh giá",
};

const ITEMS_PER_PAGE = 5;

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

export default function GradeListSection({
    records = [],
    onOpenEditDialog,
    subjectLabel,
    semesterLabel,
    isLocked = false,
    canEdit = true,
    isCommentGraded = false,
}) {
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredRecords = useMemo(() => {
        const query = normalizeText(searchValue);

        if (!query) return records;

        return records.filter((record) => {
            const searchable = normalizeText([
                record.name,
                record.code,
                record.status,
                record.evaluation,
                RANK_LABELS[record.rank] || record.rank,
                record.average,
            ].join(" "));

            return searchable.includes(query);
        });
    }, [records, searchValue]);

    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));

    const paginatedRecords = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredRecords, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, records]);

    const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    const getDisplayScore = (scores) => {
        if (!scores || !scores.length) return "-";
        const nums = scores
            .map((item) => Number(item?.score ?? item))
            .filter((value) => Number.isFinite(value));
        if (!nums.length) return "-";
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        return avg.toFixed(1);
    };

    return (
        <SectionCard
            title="Danh sách học sinh"
            subtitle={`${subjectLabel} · ${semesterLabel} · ${filteredRecords.length}/${records.length} học sinh`}
            actions={
                <div className="grade-list-search-wrap">
                    <SearchBar
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        onClear={() => setSearchValue("")}
                        placeholder="Tìm tên, mã học sinh..."
                    />
                </div>
            }
        >
            <div className="grade-list-section">
                {paginatedRecords.map((record, index) => (
                    <article key={record.id} className={`grade-list-item ${isCommentGraded ? "is-comment-graded" : ""}`}>
                        <button
                            type="button"
                            className={`grade-list-item__info ${isLocked ? 'is-locked-row' : ''}`}
                            onClick={() => !isLocked && canEdit && onOpenEditDialog?.(record)}
                            disabled={!canEdit}
                        >
                            <strong>{pageStartIndex + index + 1}. {record.name}</strong>
                            <span>{record.code}</span>
                            <small>{record.status}</small>
                        </button>

                        {isCommentGraded ? (
                            <div className="grade-list-score grade-list-comment-result">
                                <span>Kết quả</span>
                                <strong className={`grade-list-comment-chip ${record.evaluation === "Đạt" ? "is-pass" : record.evaluation === "Chưa đạt" ? "is-fail" : "is-missing"}`}>
                                    {record.evaluation || "Chưa đánh giá"}
                                </strong>
                            </div>
                        ) : (
                            <>
                                <div className="grade-list-score">
                                    <span>Thường xuyên</span>
                                    {record.regularScores?.length ? (
                                        <div className="grade-list-regular-list">
                                            {record.regularScores.map((item, itemIndex) => (
                                                <span key={`${record.id}-regular-${item.id ?? itemIndex}`} className="grade-list-regular-chip" title={item.label}>
                                                    <strong>{formatScore(item.score)}</strong>
                                                    <small>{item.label}</small>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <strong>-</strong>
                                    )}
                                </div>

                                <div className="grade-list-score">
                                    <span>Giữa kỳ</span>
                                    <strong>{formatScore(record.midtermScore)}</strong>
                                </div>

                                <div className="grade-list-score">
                                    <span>Cuối kỳ</span>
                                    <strong>{formatScore(record.finalScore)}</strong>
                                </div>
                            </>
                        )}

                        <div className="grade-list-item__summary">
                            <div className="grade-list-averages-row">
                                <div className="grade-list-score">
                                    <span>{isCommentGraded ? "Trạng thái" : record.isProvisional ? "HK tạm tính" : "Học kỳ"}</span>
                                    <strong className="score-hk">{isCommentGraded ? (record.evaluation ? "Xong" : "Thiếu") : formatScore(record.average)}</strong>
                                </div>
                            </div>
                            <span className={`grade-list-rank rank-${record.rank}`}>
                                {RANK_LABELS[record.rank] || record.rank}
                            </span>
                            {record.isProvisional && <small className="grade-list-provisional">Chưa đủ cột điểm để chốt HK</small>}
                        </div>

                        {isLocked ? (
                            <span className="grade-list-locked-indicator">
                                🔒 Đã khóa
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="grade-list-action"
                                onClick={() => onOpenEditDialog?.(record)}
                                disabled={!canEdit}
                            >
                                {canEdit && !isLocked ? "Sửa" : "Chỉ xem"}
                            </button>
                        )}
                    </article>
                ))}

                {filteredRecords.length === 0 ? (
                    <div className="grade-list-empty">
                        {searchValue.trim()
                            ? "Không tìm thấy học sinh phù hợp."
                            : "Chưa có dữ liệu học sinh."}
                    </div>
                ) : (
                    <div className="grade-list-pagination-row">
                        <div className="grade-list-pagination">
                            <button
                                type="button"
                                className="grade-list-page-btn"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage <= 1}
                            >
                                <FiChevronLeft />
                            </button>

                            <p className="grade-list-page-indicator">
                                <span>{currentPage}</span>
                                <small>/ {totalPages}</small>
                            </p>

                            <button
                                type="button"
                                className="grade-list-page-btn"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage >= totalPages}
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </SectionCard>
    );
}
