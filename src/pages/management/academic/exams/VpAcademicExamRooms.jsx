import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiGrid, FiUsers, FiHome, FiEdit3, FiPlus } from "react-icons/fi";
import { Pagination } from "../../../../components/common";
import { Button, Input, Modal } from "../../../../components/ui";
import LoadingSpinner from "../../../../components/common/LoadingSpinner/LoadingSpinner";
import { toast } from "react-toastify";
import examService from "../../../../services/pages/management/exam/examService";
import "./VpAcademicExamRooms.css";

const ITEMS_PER_PAGE = 8;

const getExamContext = (locationState) => {
    const stored = sessionStorage.getItem("selected_exam_context");
    const parsedStored = stored ? JSON.parse(stored) : {};
    const context = {
        examId: locationState?.examId || parsedStored.examId || null,
        examName: locationState?.examName || parsedStored.examName || "",
    };
    if (context.examId) {
        sessionStorage.setItem("selected_exam_context", JSON.stringify(context));
    }
    return context;
};

const normalizeRoom = (room) => {
    const supervisors = room.supervisors || [];
    const supervisorNames = supervisors
        .map((item) => item.teacher?.fullName || item.teacherName || item.fullName)
        .filter(Boolean);
    const studentCount = Number(room.studentCount ?? room.student_count ?? room.students ?? 0);
    const capacity = Number(room.capacity ?? 0);
    return {
        id: room.id,
        name: room.roomName || room.room_name || room.name || "Phòng thi",
        students: studentCount,
        capacity,
        supervisors: supervisorNames,
        status: capacity > 0 && studentCount >= capacity ? "Đã xếp" : "Chưa đủ",
    };
};

export default function VpAcademicExamRooms() {
    const navigate = useNavigate();
    const location = useLocation();
    const { examId, examName } = useMemo(() => getExamContext(location.state), [location.state]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [roomForm, setRoomForm] = useState({ roomName: "", capacity: 30, examDate: "", startTime: "", endTime: "", subjectId: "" });

    const { data: rooms = [], isLoading, error, refetch } = useQuery({
        queryKey: ["exam-rooms", examId],
        queryFn: () => examService.listRooms(examId),
        enabled: Boolean(examId),
        staleTime: 60_000,
    });

    const normalizedRooms = useMemo(() => rooms.map(normalizeRoom), [rooms]);
    const totalPages = Math.ceil(normalizedRooms.length / ITEMS_PER_PAGE) || 1;
    const paginatedRooms = normalizedRooms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalStudents = normalizedRooms.reduce((sum, room) => sum + room.students, 0);
    const totalSupervisors = normalizedRooms.reduce((sum, room) => sum + room.supervisors.length, 0);

    const stats = [
        { label: "Tổng số phòng", value: normalizedRooms.length, icon: <FiHome />, color: "#34d399" },
        { label: "Cán bộ coi thi", value: totalSupervisors, icon: <FiUsers />, color: "#3b82f6" },
        { label: "Tổng thí sinh", value: totalStudents, icon: <FiUsers />, color: "#8b5cf6" },
    ];

    const openRoom = (roomId) => {
        navigate(`/management/exams/rooms/${roomId}`, { state: { examId, examName } });
    };

    const handleSaveRoom = async () => {
        if (!examId) {
            toast.error("Vui lòng chọn kỳ thi trước khi tạo phòng.");
            return;
        }
        if (!roomForm.roomName.trim() || !roomForm.examDate || !roomForm.startTime || !roomForm.endTime || !roomForm.subjectId) {
            toast.warning("Vui lòng nhập đủ tên phòng, ngày thi, giờ thi và mã môn thi.");
            return;
        }
        try {
            await examService.createRoom(examId, {
                ...roomForm,
                capacity: Number(roomForm.capacity) || 0,
                subjectId: Number(roomForm.subjectId),
            });
            toast.success("Đã tạo phòng thi.");
            setIsRoomModalOpen(false);
            setRoomForm({ roomName: "", capacity: 30, examDate: "", startTime: "", endTime: "", subjectId: "" });
            refetch();
        } catch (createError) {
            toast.error(createError?.response?.data?.message || createError?.message || "Không thể tạo phòng thi.");
        }
    };

    const handleSendNotifications = () => {
        toast.info("Chưa có API gửi thông báo phân phòng thi cho kỳ thi này.");
    };

    return (
        <div className="vpa-exam-rooms">
            <div className="vpa-rooms-header">
                <button className="back-btn" onClick={() => navigate("/management/exams")}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-info">
                    <h1>Phân phòng & Lịch thi</h1>
                    <span className="exam-name">{examName || "Chưa chọn kỳ thi"}</span>
                </div>
            </div>

            {!examId ? (
                <div className="vpa-empty-state">
                    <FiGrid />
                    <h3>Chưa có kỳ thi được chọn</h3>
                    <p>Vui lòng mở từ trang danh sách kỳ thi để xem phòng thi thực tế.</p>
                </div>
            ) : (
                <>
                    <div className="vpa-rooms-stats">
                        {stats.map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className="stat-details">
                                    <span className="label">{stat.label}</span>
                                    <span className="value">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="vpa-rooms-tabs" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <FiGrid style={{ color: "var(--admin-primary)", fontSize: "1.25rem" }} />
                            <span style={{ fontWeight: 800, color: "var(--admin-navy)", fontSize: "1.1rem" }}>Danh sách phòng thi</span>
                        </div>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <Button variant="outline" onClick={handleSendNotifications}>
                                <FiPlus /> Gửi thông báo
                            </Button>
                            <Button className="vpa-btn-glow" onClick={() => setIsRoomModalOpen(true)}>
                                <FiPlus /> Tạo phòng thi
                            </Button>
                        </div>
                    </div>

                    <div className="vpa-rooms-content">
                        {isLoading ? (
                            <div className="vpa-empty-state">
                                <LoadingSpinner size="lg" label="Đang tải phòng thi..." />
                            </div>
                        ) : error ? (
                            <div className="vpa-empty-state">
                                <h3>Không thể tải phòng thi</h3>
                                <p>{error.message || "Vui lòng thử lại sau."}</p>
                            </div>
                        ) : paginatedRooms.length === 0 ? (
                            <div className="vpa-empty-state">
                                <FiGrid />
                                <h3>Chưa có phòng thi</h3>
                                <p>Kỳ thi này chưa có phòng thi nào trong cơ sở dữ liệu.</p>
                            </div>
                        ) : (
                            <div className="rooms-grid">
                                {paginatedRooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="room-card"
                                        onClick={() => openRoom(room.id)}
                                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        <div className="room-header">
                                            <h3>{room.name}</h3>
                                            <span className={`status-pill ${room.status === "Đã xếp" ? "ok" : "warn"}`}>{room.status}</span>
                                        </div>
                                        <div className="room-body">
                                            <div className="body-row">
                                                <FiUsers /> <span>Sĩ số: <strong>{room.students}/{room.capacity || "—"} thí sinh</strong></span>
                                            </div>
                                            <div className="body-row proctors">
                                                <FiEdit3 />
                                                <div className="proctor-list">
                                                    <span>Giám thị:</span>
                                                    {room.supervisors.length > 0
                                                        ? room.supervisors.map((name) => <strong key={name}>{name}</strong>)
                                                        : <strong>Chưa phân công</strong>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="room-footer">
                                            <button className="btn-action-small" type="button">Xem chi tiết</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {totalPages > 1 && (
                            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        )}
                    </div>
                </>
            )}

            <Modal open={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)} title="Tạo phòng thi mới" className="vpa-exam-room-modal">
                <div className="vpa-room-modal-form">
                    <Input label="Tên phòng" value={roomForm.roomName} onChange={(e) => setRoomForm({ ...roomForm, roomName: e.target.value })} placeholder="VD: Phòng 101" />
                    <div className="form-row-vpa grid-2">
                        <Input label="Sức chứa" type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} />
                        <Input label="Mã môn thi" type="number" value={roomForm.subjectId} onChange={(e) => setRoomForm({ ...roomForm, subjectId: e.target.value })} />
                    </div>
                    <div className="form-row-vpa grid-2">
                        <Input label="Ngày thi" type="date" value={roomForm.examDate} onChange={(e) => setRoomForm({ ...roomForm, examDate: e.target.value })} />
                        <Input label="Giờ bắt đầu" type="time" value={roomForm.startTime} onChange={(e) => setRoomForm({ ...roomForm, startTime: e.target.value })} />
                    </div>
                    <Input label="Giờ kết thúc" type="time" value={roomForm.endTime} onChange={(e) => setRoomForm({ ...roomForm, endTime: e.target.value })} />
                    <div className="modal-footer-vpa">
                        <Button variant="outline" onClick={() => setIsRoomModalOpen(false)}>Hủy</Button>
                        <Button primary className="vpa-btn-glow" onClick={handleSaveRoom}>Lưu thông tin</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
