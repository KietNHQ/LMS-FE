import { FiAlertTriangle, FiClock, FiLayers } from "react-icons/fi";
import { LuBuilding2 } from "react-icons/lu";
import Select from "../../../../../components/ui/Select/Select";
import "./timetableFiltersSection.css";

export default function TimetableFiltersSection({
    totalSessions,
    progressLabel,
    classOptions,
    teacherOptions,
    dayOptions,
    blockOptions,
    selectedClass,
    selectedTeacher,
    selectedDay,
    selectedBlock,
    searchTerm,
    onClassChange,
    onTeacherChange,
    onDayChange,
    onBlockChange,
    onSearchChange,
    selectedBuildingName,
    children,
}) {
    return (
        <section className="tt-filters-section">
            <div className="tt-filters-header">
                <div className="tt-title-area">
                    <h1 className="tt-main-title">Quản lý thời khóa biểu</h1>
                </div>
                <div className="tt-header-actions">
                    {children}
                </div>
            </div>

            <div className="tt-stats-grid">
                <div className="tt-stat-mini-card">
                    <div className="stat-icon-box navy"><FiClock /></div>
                    <div className="stat-content">
                        <span className="stat-value">{totalSessions}</span>
                        <span className="stat-label">Tiết học / kỳ</span>
                    </div>
                </div>

                <div className="tt-stat-mini-card">
                    <div className="stat-icon-box warning"><FiLayers /></div>
                    <div className="stat-content">
                        <span className="stat-value">{progressLabel || "0/0"}</span>
                        <span className="stat-label">Tiến độ xếp lớp</span>
                    </div>
                </div>

                <div className="tt-stat-mini-card">
                    <div className="stat-icon-box info"><FiLayers /></div>
                    <div className="stat-content">
                        <span className="stat-value">{selectedClass}</span>
                        <span className="stat-label">Lớp đang xem</span>
                    </div>
                </div>
            </div>

            <div className="tt-filter-panel">
                <div className="tt-filter-group">
                    <div className="tt-input-field">
                        <label>Khối</label>
                        <Select
                            variant="custom"
                            className="tt-custom-select"
                            options={blockOptions}
                            value={selectedBlock}
                            onChange={(e) => onBlockChange(e.target.value)}
                        />
                    </div>

                    <div className="tt-input-field">
                        <label>Lớp</label>
                        <Select
                            variant="custom"
                            className="tt-custom-select"
                            options={classOptions}
                            value={selectedClass}
                            onChange={(e) => onClassChange(e.target.value)}
                        />
                    </div>

                    <div className="tt-input-field">
                        <label>Giáo viên</label>
                        <Select
                            variant="custom"
                            className="tt-custom-select"
                            options={teacherOptions}
                            value={selectedTeacher}
                            onChange={(e) => onTeacherChange(e.target.value)}
                        />
                    </div>

                    <div className="tt-input-field">
                        <label>Thứ</label>
                        <Select
                            variant="custom"
                            className="tt-custom-select"
                            options={dayOptions}
                            value={selectedDay}
                            onChange={(e) => onDayChange(e.target.value)}
                        />
                    </div>

                    {selectedBuildingName && (
                        <div className="tt-input-field tt-input-field--readonly">
                            <label>Tòa nhà</label>
                            <div className="tt-building-badge">
                                <LuBuilding2 />
                                {selectedBuildingName}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

