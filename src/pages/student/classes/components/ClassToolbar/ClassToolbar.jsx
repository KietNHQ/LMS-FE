import { SearchBar } from "../../../../../components/common";
import "./ClassToolbar.css";

export default function ClassToolbar({
    searchValue,
    onSearchChange,
    onClearSearch,
    lastVisitedClass,
    onGoToLastVisitedClass,
}) {
    return (
        <div className="student-classes-main-head">
            <div className="student-classes-main-title">
                <h2>Danh sách lớp học</h2>
            </div>

            <div className="student-classes-main-actions">
                <div className="student-classes-search-wrap">
                    <SearchBar
                        value={searchValue}
                        onChange={onSearchChange}
                        onClear={onClearSearch}
                        placeholder="Tìm theo môn học, giáo viên, lớp, phòng..."
                    />
                </div>

                <button
                    type="button"
                    className={`student-classes-primary-btn ${
                        !lastVisitedClass ? "student-classes-primary-btn--disabled" : ""
                    }`}
                    onClick={onGoToLastVisitedClass}
                    disabled={!lastVisitedClass}
                    title={
                        lastVisitedClass
                            ? `Mở lại lớp ${lastVisitedClass.title}`
                            : "Chưa có lớp đã truy cập gần nhất"
                    }
                >
                    Vào lớp gần nhất
                </button>
            </div>
        </div>
    );
}
