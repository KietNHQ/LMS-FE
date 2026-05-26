import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyState, LoadingSpinner, PageHeader, Pagination } from "../../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import IncidentHandleModal from "../components/IncidentHandleModal";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import { FiSearch, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { vpDisciplineService } from "../../../../services/pages/management/vp-discipline";
import "./VpDisciplineIncidents.css";

const PAGE_SIZE = 10;

function mapEscalation(e) {
    return {
        id: e.id,
        title: e.title || e.incident_title || "",
        description: e.description || e.incident_description || "",
        className: e.class_name || e.className || "",
        priority: e.priority || "medium",
        status: e.status || "open",
        dueDate: e.due_date || e.dueDate || "",
        createdAt: e.created_at || e.createdAt || "",
        studentEnrollmentId: e.student_enrollment_id || e.studentEnrollmentId,
        violationTypeId: e.violation_type_id || e.violationTypeId,
    };
}

const PRIORITY_LABELS = { high: "Khẩn cấp", medium: "Trung bình", low: "Thấp" };
const STATUS_LABELS = { open: "Mở", in_progress: "Đang xử lý", resolved: "Đã giải quyết", closed: "Đóng" };

export default function VpDisciplineIncidents() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [searchParams] = useSearchParams();
    const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") || "all");
    const [search, setSearch] = useState(() => searchParams.get("q") || "");
    const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const queryClient = useQueryClient();

    // Resolve semesterId from selectedSchoolYear and selectedTerm
    const { data: resolvedSemesterId } = useQuery({
        queryKey: ["semester-id", selectedSchoolYear, selectedTerm],
        queryFn: () => resolveSemesterId(selectedSchoolYear, selectedTerm || "hk1"),
        enabled: Boolean(selectedSchoolYear),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const { data: incidentsData, isLoading, isError, error } = useQuery({
        queryKey: ["discipline-escalations", resolvedSemesterId],
        queryFn: async () => {
            if (!resolvedSemesterId) return [];
            try {
                const res = await vpDisciplineService.callByKey("get_discipline_escalations_stats_by_semesterid", {
                    pathParams: { semesterId: resolvedSemesterId },
                });
                return res?.data || [];
            } catch {
                return [];
            }
        },
        enabled: Boolean(resolvedSemesterId),
        select: (data) => {
            if (Array.isArray(data)) return data.map(mapEscalation);
            if (data?.data) return data.data.map(mapEscalation);
            return [];
        },
        staleTime: 30_000,
    });

    const filteredRows = useMemo(() => {
        if (!incidentsData) return [];
        return incidentsData.filter((row) => {
            const matchesStatus = statusFilter === "all" || row.status === statusFilter;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                [row.id, row.title, row.className, row.description]
                    .join(" ")
                    .toLowerCase()
                    .includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [incidentsData, statusFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);

    const pagedRows = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredRows.slice(start, start + PAGE_SIZE);
    }, [filteredRows, safePage]);

    const openCount = incidentsData?.filter((r) => r.status === "open").length || 0;

    const handleResolveIncident = async (incidentId, notes) => {
        try {
            await vpDisciplineService.callByKey("put_discipline_escalations_by_id_resolve", {
                pathParams: { id: incidentId },
                body: { actionTaken: notes },
            });
            toast.success("Đã xử lý sự vụ");
            queryClient.invalidateQueries({ queryKey: ["discipline-escalations"] });
            setSelectedIncident(null);
        } catch (err) {
            toast.error("Lỗi: " + (err.message || "Không thể cập nhật sự vụ"));
        }
    };

    return (
        <div className="vpd-incidents">
            <PageHeader
                title="Theo dõi Sự vụ"
                actions={
                    <DisciplineHeaderActions
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="vpd-incidents__summary">
                <div className="vpd-incidents__metric">
                    <span>Đang mở</span>
                    <strong>{openCount}</strong>
                </div>
                <div className="vpd-incidents__metric">
                    <span>Tổng sự vụ</span>
                    <strong>{incidentsData?.length || 0}</strong>
                </div>
            </div>

            <div className="vpd-incidents__toolbar">
                <div className="vpd-incidents__search">
                    <FiSearch />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Tìm sự vụ..."
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="all">Tất cả</option>
                    <option value="open">Mở</option>
                    <option value="in_progress">Đang xử lý</option>
                    <option value="resolved">Đã giải quyết</option>
                    <option value="closed">Đóng</option>
                </select>
            </div>

            <div className="vpd-incidents__chips">
                {statusFilter !== "all" ? (
                    <button type="button" className="vpd-incidents__chip" onClick={() => setStatusFilter("all")}>
                        status: {statusFilter} <FiX />
                    </button>
                ) : null}
                {search ? (
                    <button type="button" className="vpd-incidents__chip" onClick={() => setSearch("")}>
                        q: {search} <FiX />
                    </button>
                ) : null}
            </div>

            <div className="vpd-incidents__table-wrap">
                {isLoading ? <LoadingSpinner label="Đang tải sự vụ..." /> : null}
                {isError ? (
                    <div className="vpd-incidents__state">
                        <p>{error?.message || "Không thể tải sự vụ."}</p>
                    </div>
                ) : null}
                {!isLoading && !isError && filteredRows.length === 0 ? (
                    <EmptyState title="Không có sự vụ nào" description="Thử thay đổi bộ lọc." compact />
                ) : null}
                {!isLoading && !isError && filteredRows.length > 0 ? (
                    <>
                        <table className="vpd-incidents__table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Mô tả</th>
                                    <th>Lớp</th>
                                    <th>Ưu tiên</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày đến hạn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedRows.map((row) => (
                                    <tr key={row.id} onClick={() => setSelectedIncident(row)} style={{ cursor: "pointer" }}>
                                        <td>{row.id}</td>
                                        <td>
                                            <strong>{row.title}</strong>
                                            {row.description && <p className="desc">{row.description}</p>}
                                        </td>
                                        <td>{row.className}</td>
                                        <td>
                                            <span className={`priority priority--${row.priority}`}>
                                                {PRIORITY_LABELS[row.priority] || row.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-badge--${row.status}`}>
                                                {STATUS_LABELS[row.status] || row.status}
                                            </span>
                                        </td>
                                        <td>{row.dueDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="vpd-incidents__pagination">
                            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                    </>
                ) : null}
            </div>

            <IncidentHandleModal
                isOpen={Boolean(selectedIncident)}
                onClose={() => setSelectedIncident(null)}
                incident={selectedIncident}
                onResolve={handleResolveIncident}
            />
        </div>
    );
}
