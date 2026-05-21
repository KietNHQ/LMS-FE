import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiPlusCircle, FiTrash2, FiAlertTriangle, FiUserPlus, FiRefreshCw, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { classesService } from "../../../../services/pages/management/classes";
import teachingAssignmentService from "../../../../services/pages/management/vp-academic/teachingAssignmentService";
import "./VpAcademicTeachingAssignment.css";

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

export default function VpAcademicTeachingAssignment() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    // ── Data states ──
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses]         = useState([]);
    const [teachers, setTeachers]       = useState([]);

    // ── UI states ──
    const [isLoadingList, setIsLoadingList]   = useState(false);
    const [isLoadingForm, setIsLoadingForm]   = useState(false);
    const [listError, setListError]           = useState("");
    const [filterTeacher, setFilterTeacher]   = useState("");
    const [filterClass, setFilterClass]       = useState("");

    // ── Form state ──
    const [form, setForm] = useState({ teacherId: "", classId: "" });

    // ── Load teachers từ classes service (dùng cache có sẵn) ──
    const loadLookups = useCallback(async () => {
        try {
            const [classRows, teacherPayload] = await Promise.all([
                classesService.listClasses(),
                fetch(import.meta.env.VITE_API_URL + "/teachers?page=1&limit=500", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }).then(r => r.json()).catch(() => []),
            ]);
            setClasses(classRows);
            const teacherRows = getRows(teacherPayload);
            setTeachers(teacherRows.map(t => ({
                id: t.id,
                name: `${t.surname || t.lastName || ""} ${t.given_name || t.givenName || t.firstName || ""}`.trim()
                    || t.fullName || t.full_name || t.name || "Chưa rõ tên",
            })));
        } catch {
            // Lookups thất bại thì danh sách dropdown trống, không crash
        }
    }, []);

    // ── Load danh sách phân công ──
    const loadAssignments = useCallback(async () => {
        setIsLoadingList(true);
        setListError("");
        try {
            const rows = await teachingAssignmentService.listAssignments();
            setAssignments(rows);
        } catch {
            setListError("Không thể tải danh sách phân công. Vui lòng thử lại.");
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    useEffect(() => {
        loadLookups();
        loadAssignments();
    }, [loadLookups, loadAssignments]);

    // ── Filter danh sách ──
    const filteredAssignments = useMemo(() => {
        return assignments.filter(a => {
            const matchTeacher = !filterTeacher || a.teacherName.toLowerCase().includes(filterTeacher.toLowerCase());
            const matchClass   = !filterClass   || a.className === filterClass;
            return matchTeacher && matchClass;
        });
    }, [assignments, filterTeacher, filterClass]);

    // ── Submit form phân công ──
    const handleAssign = async (e) => {
        e.preventDefault();
        if (!form.teacherId || !form.classId) {
            toast.error("Vui lòng chọn Giáo viên và Lớp học.");
            return;
        }
        setIsLoadingForm(true);
        try {
            await teachingAssignmentService.createAssignment({
                teacher_id: Number(form.teacherId),
                class_id: Number(form.classId),
            });
            toast.success("Đã phân công thành công!");
            setForm({ teacherId: "", classId: "" });
            await loadAssignments();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || "Phân công thất bại.";
            toast.error(msg);
        } finally {
            setIsLoadingForm(false);
        }
    };

    // ── Xóa phân công ──
    const handleRemove = async (assignment) => {
        const confirmed = window.confirm(
            `Bạn có chắc muốn gỡ phân công "${assignment.teacherName}" – Lớp ${assignment.className}?`
        );
        if (!confirmed) return;
        try {
            await teachingAssignmentService.deleteAssignment(assignment.id);
            toast.info("Đã xóa phân công.");
            setAssignments(prev => prev.filter(a => a.id !== assignment.id));
        } catch (err) {
            const msg = err?.response?.data?.message || "Không thể xóa phân công.";
            toast.error(msg);
        }
    };

    return (
        <div className="vp-teaching-assignment">
            <PageHeader
                title="Phân Công Giảng Dạy"
                eyebrow="Tổ chức giáo viên bộ môn cho các lớp học"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="ta-layout">
                {/* ── Main List ── */}
                <div className="ta-panel">
                    <div className="ta-header">
                        <h3>Danh sách Phân Công Lớp Hiện Tại</h3>
                        <div className="ta-filter">
                            <div className="ta-search-wrap">
                                <FiSearch className="ta-search-icon" />
                                <input
                                    type="text"
                                    className="ta-select ta-search-input"
                                    placeholder="Tìm giáo viên..."
                                    value={filterTeacher}
                                    onChange={e => setFilterTeacher(e.target.value)}
                                />
                            </div>
                            <select
                                className="ta-select"
                                value={filterClass}
                                onChange={e => setFilterClass(e.target.value)}
                            >
                                <option value="">Tất cả lớp</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className="ta-refresh-btn"
                                onClick={loadAssignments}
                                title="Tải lại"
                            >
                                <FiRefreshCw />
                            </button>
                        </div>
                    </div>

                    <div className="ta-table-wrap">
                        {isLoadingList ? (
                            <div className="ta-empty-state">Đang tải dữ liệu...</div>
                        ) : listError ? (
                            <div className="ta-empty-state ta-error">{listError}</div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="ta-empty-state">
                                {assignments.length === 0
                                    ? "Chưa có phân công nào. Sử dụng form bên phải để thêm."
                                    : "Không tìm thấy phân công phù hợp với bộ lọc."}
                            </div>
                        ) : (
                            <table className="ta-table">
                                <thead>
                                    <tr>
                                        <th>Giáo Viên</th>
                                        <th>Môn Giảng Dạy</th>
                                        <th>Lớp Học Phụ Trách</th>
                                        <th style={{ textAlign: "center" }}>Gỡ bỏ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssignments.map(a => (
                                        <tr key={a.id}>
                                            <td><strong>{a.teacherName}</strong></td>
                                            <td>
                                                <span className="ta-subject-badge">{a.subjectName}</span>
                                            </td>
                                            <td><strong>{a.className}</strong></td>
                                            <td style={{ textAlign: "center" }}>
                                                <button className="btn-remove" onClick={() => handleRemove(a)}>
                                                    <FiTrash2 />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* ── Sidebar Form ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <form className="assign-form" onSubmit={handleAssign}>
                        <h4><FiUserPlus /> Gán Giáo Viên Mới</h4>

                        <div className="form-grp">
                            <label>Chọn Giáo Viên</label>
                            <select
                                className="ta-select"
                                value={form.teacherId}
                                onChange={e => setForm({ ...form, teacherId: e.target.value })}
                                disabled={teachers.length === 0}
                            >
                                <option value="">-- Chọn giáo viên --</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {teachers.length === 0 && (
                                <span className="ta-hint">Đang tải danh sách giáo viên...</span>
                            )}
                        </div>

                        <div className="form-grp">
                            <label>Chọn Lớp Học</label>
                            <select
                                className="ta-select"
                                value={form.classId}
                                onChange={e => setForm({ ...form, classId: e.target.value })}
                                disabled={classes.length === 0}
                            >
                                <option value="">-- Chọn lớp --</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn-assign"
                            disabled={isLoadingForm}
                        >
                            <FiPlusCircle />
                            {isLoadingForm ? "Đang xử lý..." : "Xác nhận Phân Công"}
                        </button>
                    </form>

                    <div className="ta-alert-box">
                        <h4><FiAlertTriangle /> Lưu ý</h4>
                        <div className="ta-alert-item">
                            <span>Môn học được xác định từ phân công thời khóa biểu.</span>
                        </div>
                        <div className="ta-alert-item">
                            <span>Kiểm tra trang Thời Khóa Biểu để xem định mức tiết.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
