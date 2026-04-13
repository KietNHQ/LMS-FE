import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ClassCard from "../ClassCard/ClassCard";
import "./ClassList.css";

export default function ClassList({
    classes,
    currentPage,
    totalPages,
    onPrevPage,
    onNextPage,
    onViewClassDetail,
}) {
    if (!classes.length) {
        return (
            <div className="student-classes-empty">
                <h3>Không tìm thấy lớp phù hợp</h3>
                <p>Hãy thử lại với từ khóa khác.</p>
            </div>
        );
    }

    return (
        <>
            <div className="student-classes-grid">
                {classes.map((item) => (
                    <ClassCard key={item.id} item={item} onViewClassDetail={onViewClassDetail} />
                ))}
            </div>

            <div className="student-classes-pagination">
                <button
                    type="button"
                    className="student-classes-page-btn"
                    onClick={onPrevPage}
                    disabled={currentPage === 1}
                    aria-label="Trang trước"
                >
                    <FiChevronLeft />
                </button>

                <div className="student-classes-page-indicator">
                    <span>{currentPage}</span>
                    <small>/ {totalPages}</small>
                </div>

                <button
                    type="button"
                    className="student-classes-page-btn"
                    onClick={onNextPage}
                    disabled={currentPage === totalPages}
                    aria-label="Trang sau"
                >
                    <FiChevronRight />
                </button>
            </div>
        </>
    );
}

