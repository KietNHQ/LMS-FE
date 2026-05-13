import { useMemo, useState } from "react";
import HomeroomStudentDetailDialog from "./HomeroomStudentDetailDialog";
import Select from "../../../../../components/ui/Select/Select";
import { FiArrowDown, FiArrowUp, FiSearch, FiUserPlus, FiUsers, FiChevronDown } from "react-icons/fi";
import "./HomeroomStudentsSection.css";

function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getAvatarLetter(name) {
    if (!name) return "A";
    return name.trim().charAt(0).toUpperCase();
}

function getRoleClass(roleKey) {
    switch (roleKey) {
        case "monitor": return "role-monitor";
        case "viceMonitor": return "role-vice";
        case "secretary": return "role-secretary";
        default: return "role-empty";
    }
}

export default function HomeroomStudentsSection({
    students = [],
    officers = [],
    onBanCanSuLopClick,
    onViewAttendance,
}) {
    const [activeStudentId, setActiveStudentId] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [genderFilter, setGenderFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'

    const activeStudent = useMemo(
        () => students.find((student) => student.id === activeStudentId) || null,
        [students, activeStudentId]
    );

    const officerLabelByStudentId = useMemo(() => {
        return officers.reduce((acc, officer) => {
            if (officer.studentId) acc[officer.studentId] = officer.label;
            return acc;
        }, {});
    }, [officers]);

    const filteredStudents = useMemo(() => {
        let result = [...students];

        // 1. Search filter
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(lowSearch) ||
                s.email?.toLowerCase().includes(lowSearch)
            );
        }

        // 2. Gender filter
        if (genderFilter !== "all") {
            result = result.filter(s => s.gender === genderFilter);
        }

        // 3. Sorting (A-Z, Z-A)
        result.sort((a, b) => {
            const nameA = a.name.split(" ").pop().toLowerCase();
            const nameB = b.name.split(" ").pop().toLowerCase();
            if (sortOrder === "asc") return nameA.localeCompare(nameB);
            return nameB.localeCompare(nameA);
        });

        return result;
    }, [students, searchTerm, genderFilter, sortOrder]);

    const openStudentDialog = (student) => {
        setActiveStudentId(student.id);
    };

    const closeStudentDialog = () => {
        setActiveStudentId(null);
    };


    return (
        <div className="homeroom-students-section homeroom-students-list-card">
            <div className="homeroom-students-list-header">
                <div className="homeroom-students-filters">
                    <div className="homeroom-students-search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Tìm kiếm học sinh..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="homeroom-students-filter-group">
                        <Select
                            variant="custom"
                            className="homeroom-students-gender-select"
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            options={[
                                { value: "all", label: "Tất cả giới tính" },
                                { value: "Nam", label: "Nam" },
                                { value: "Nữ", label: "Nữ" },
                            ]}
                        />

                        <button
                            type="button"
                            className="homeroom-students-sort-toggle"
                            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                            title={sortOrder === "asc" ? "Sắp xếp: A - Z" : "Sắp xếp: Z - A"}
                        >
                            {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />}
                            <span>{sortOrder === "asc" ? "A - Z" : "Z - A"}</span>
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    className="homeroom-students-list-badge"
                    onClick={() => onBanCanSuLopClick?.()}
                >
                    <FiUserPlus />
                    <span>Ban cán sự lớp</span>
                </button>
            </div>

            <div className="homeroom-students-table-wrap">
                <table className="homeroom-students-table">
                    <thead>
                        <tr>
                            <th>HỌC SINH</th>
                            <th>GIỚI TÍNH</th>
                            <th>NGÀY SINH</th>
                            <th>PHỤ HUYNH</th>
                            <th>SĐT PHỤ HUYNH</th>
                            <th>VAI TRÒ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="homeroom-students-empty-row">Không tìm thấy học sinh phù hợp.</td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr
                                    key={student.id}
                                    className="homeroom-students-row"
                                    onClick={() => openStudentDialog(student)}
                                >
                                    <td>
                                        <div className="homeroom-students-main-info">
                                            <div className="homeroom-students-avatar">{getAvatarLetter(student.name)}</div>
                                            <div className="homeroom-students-name-wrap">
                                                <h4>{student.name}</h4>
                                                <p>{student.email || "—"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="homeroom-students-muted">{student.gender || "—"}</span>
                                    </td>
                                    <td>
                                        <span className="homeroom-students-muted">{formatDate(student.dob)}</span>
                                    </td>
                                    <td>
                                        <div className="homeroom-students-parent-wrap">
                                            <h5>{student.parentName || "—"}</h5>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="homeroom-students-muted">{student.parentPhone || "—"}</span>
                                    </td>
                                    <td>
                                        <span className={`homeroom-students-role-badge ${getRoleClass(student.officerRole)}`}>
                                            {officerLabelByStudentId[student.id] || "Chưa phân công"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <HomeroomStudentDetailDialog
                open={Boolean(activeStudent)}
                student={activeStudent}
                officerRows={officers}
                onClose={closeStudentDialog}
                onViewAttendance={(student) => {
                    closeStudentDialog();
                    onViewAttendance?.(student);
                }}
            />
        </div>
    );
}


