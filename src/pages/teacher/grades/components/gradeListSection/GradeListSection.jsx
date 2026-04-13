import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { SearchBar } from "../../../../../components/common";
import SectionCard from "../../../../../components/common/SectionCard/SectionCard";
import "./GradeListSection.css";

function formatScore(value) {
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
    selectedStudentId,
    onSelectStudent,
    onOpenEditDialog,
    onOpenEntryDialog,
    subjectLabel,
    semesterLabel,
}) {
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredRecords = useMemo(() => {
        const query = normalizeText(searchValue);

        if (!query) {
            return records;
        }

        return records.filter((record) => {
            const searchable = normalizeText([
                record.name,
                record.code,
                record.status,
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

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;

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
                        placeholder="Tìm theo tên, mã học sinh hoặc trạng thái..."
                    />
                </div>
            }
        >
            <div className="grade-list-section">
                {paginatedRecords.map((record, index) => (
                    <article
                        key={record.recordKey}
                        className={`grade-list-item ${selectedStudentId === record.id ? "is-selected" : ""}`}
                    >
                        <button
                            type="button"
                            className="grade-list-item__info grade-list-item__info--action"
                            onClick={() => onOpenEditDialog?.(record)}
                        >
                            <strong>{pageStartIndex + index + 1}. {record.name}</strong>
                            <span>{record.code}</span>
                            <small>{record.status}</small>
                        </button>

                        <div className="grade-list-score">
                            <span>Miệng</span>
                            <strong>{formatScore(record.oral)}</strong>
                        </div>

                        <div className="grade-list-score">
                            <span>15 phút</span>
                            <strong>{formatScore(record.test15)}</strong>
                        </div>

                        <div className="grade-list-score">
                            <span>Giữa kỳ</span>
                            <strong>{formatScore(record.midterm)}</strong>
                        </div>

                        <div className="grade-list-score">
                            <span>Cuối kỳ</span>
                            <strong>{formatScore(record.final)}</strong>
                        </div>

                        <div className="grade-list-item__summary">
                            <span className="grade-list-average">{formatScore(record.average)}</span>
                            <span className={`grade-list-rank rank-${record.rank}`}>
                                {RANK_LABELS[record.rank] || record.rank}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="grade-list-action"
                            onClick={() => {
                                onSelectStudent?.(record.id);
                                onOpenEntryDialog?.();
                            }}
                        >
                            Chọn
                        </button>
                    </article>
                ))}

                {filteredRecords.length === 0 ? (
                    <div className="grade-list-empty">
                        {searchValue.trim()
                            ? "Không tìm thấy học sinh phù hợp với từ khoá đã nhập."
                            : "Chưa có dữ liệu học sinh cho lớp/môn/học kỳ này."}
                    </div>
                ) : (
                    <div className="grade-list-pagination-row">
                        <div className="grade-list-pagination" aria-label="Phân trang danh sách học sinh">
                            <button
                                type="button"
                                className="grade-list-page-btn"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage <= 1}
                                aria-label="Trang trước"
                            >
                                <FiChevronLeft />
                            </button>

                            <p className="grade-list-page-indicator" aria-live="polite">
                                <span>{currentPage}</span>
                                <small>/ {totalPages}</small>
                            </p>

                            <button
                                type="button"
                                className="grade-list-page-btn"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage >= totalPages}
                                aria-label="Trang sau"
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



