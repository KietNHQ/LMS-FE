import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiGrid, FiClock, FiUsers, FiHome, FiEdit3, FiInfo, FiPlus } from "react-icons/fi";
import { Pagination } from "../../../../components/common";
import { Modal, Button, Input, Select } from "../../../../components/ui";
import { toast } from "react-toastify";
import "./VpAcademicExamRooms.css";

export default function VpAcademicExamRooms() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("rooms");
    const [currentPage, setCurrentPage] = useState(1);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomForm, setRoomForm] = useState({ name: '', students: 30, subject: 'all', supervisor1: '', supervisor2: '' });
    const itemsPerPage = 8;

    const SUBJECTS_LIST = [
        { value: 'all', label: 'Tất cả môn' },
        { value: 'Toán', label: 'Toán học' },
        { value: 'Vật lý', label: 'Vật lý' },
        { value: 'Hóa học', label: 'Hóa học' },
        { value: 'Ngữ văn', label: 'Ngữ văn' },
        { value: 'Lịch sử', label: 'Lịch sử' },
    ];

    const SUPERVISORS_LIST = [
        { value: 'Nguyễn Văn A', label: '[Toán] Nguyễn Văn A' },
        { value: 'Trần Thị B', label: '[Toán] Trần Thị B' },
        { value: 'Lê Văn C', label: '[Vật lý] Lê Văn C' },
        { value: 'Phạm Thị D', label: '[Vật lý] Phạm Thị D' },
        { value: 'Hoàng Văn E', label: '[Hóa học] Hoàng Văn E' },
        { value: 'Vũ Thị F', label: '[Hóa học] Vũ Thị F' },
        { value: 'Đặng Văn G', label: '[Ngữ văn] Đặng Văn G' },
        { value: 'Bùi Thị H', label: '[Ngữ văn] Bùi Thị H' },
        { value: 'Ngô Văn I', label: '[Lịch sử] Ngô Văn I' },
        { value: 'Lý Thị K', label: '[Lịch sử] Lý Thị K' },
    ].sort((a, b) => a.label.localeCompare(b.label));

    const rooms = [
        { id: "P01", name: "Phòng 101", students: 30, supervisors: ["Nguyễn Văn A", "Trần Thị B"], status: "Đã xếp" },
        { id: "P02", name: "Phòng 102", students: 30, supervisors: ["Lê Văn C", "Phạm Thị D"], status: "Đã xếp" },
        { id: "P03", name: "Phòng 103", students: 30, supervisors: ["Hoàng Văn E", "Vũ Thị F"], status: "Đã xếp" },
        { id: "P04", name: "Phòng 104", students: 25, supervisors: ["Đặng Văn G", "Bùi Thị H"], status: "Chưa đủ" },
        { id: "P05", name: "Phòng 201", students: 30, supervisors: ["Ngô Văn I", "Lý Thị K"], status: "Đã xếp" },
        { id: "P06", name: "Phòng 202", students: 30, supervisors: ["Phan Văn L", "Đỗ Thị M"], status: "Đã xếp" },
        { id: "P07", name: "Phòng 203", students: 30, supervisors: ["Trương Văn N", "Lâm Thị O"], status: "Đã xếp" },
        { id: "P08", name: "Phòng 204", students: 30, supervisors: ["Hồ Văn P", "Dương Thị Q"], status: "Đã xếp" },
        { id: "P09", name: "Phòng 301", students: 30, supervisors: ["Phí Văn R", "Mai Thị S"], status: "Đã xếp" },
        { id: "P10", name: "Phòng 302", students: 30, supervisors: ["Võ Văn T", "Đoàn Thị U"], status: "Đã xếp" },
        { id: "P11", name: "Phòng 303", students: 30, supervisors: ["Tôn Văn V", "Lý Thị X"], status: "Đã xếp" },
        { id: "P12", name: "Phòng 304", students: 30, supervisors: ["Châu Văn Y", "Trịnh Thị Z"], status: "Đã xếp" },
        { id: "P13", name: "Phòng 401", students: 30, supervisors: ["Đinh Văn Â", "Mạc Thị Ă"], status: "Đã xếp" },
        { id: "P14", name: "Phòng 402", students: 30, supervisors: ["Lư Văn Ê", "Tào Thị Ô"], status: "Đã xếp" },
        { id: "P15", name: "Phòng 403", students: 30, supervisors: ["Thạch Văn Ơ", "Lại Thị Ư"], status: "Chưa xếp" },
    ];

    const stats = [
        { label: "Tổng số phòng", value: "15", icon: <FiHome />, color: "#34d399" },
        { label: "Cán bộ coi thi", value: "30", icon: <FiUsers />, color: "#3b82f6" },
        { label: "Tổng thí sinh", value: "450", icon: <FiUsers />, color: "#8b5cf6" },
    ];

    const filteredSupervisors = (() => {
        const assignedSupervisors = new Set(rooms.flatMap(r => r.supervisors));
        const list = roomForm.subject !== 'all' 
            ? SUPERVISORS_LIST.filter(s => s.label.includes(`[${roomForm.subject}]`))
            : SUPERVISORS_LIST;
            
        return list.map(s => ({
            ...s,
            label: assignedSupervisors.has(s.value) ? `${s.label} - (Đang bận)` : s.label,
            disabled: assignedSupervisors.has(s.value) // Optional: disable if your component supports it
        }));
    })();

    const handleRandomizeSupervisors = () => {
        const assignedSupervisors = new Set(rooms.flatMap(r => r.supervisors));
        const available = filteredSupervisors.filter(s => !assignedSupervisors.has(s.value));

        if (available.length < 2) {
            toast.warn(`Không đủ giám thị rảnh của môn ${roomForm.subject === 'all' ? 'này' : roomForm.subject} để chọn ngẫu nhiên! (Cần 2 người)`);
            return;
        }

        const shuffled = [...available].sort(() => 0.5 - Math.random());
        setRoomForm(prev => ({
            ...prev,
            supervisor1: shuffled[0].value,
            supervisor2: shuffled[1].value
        }));
        toast.info("Đã chọn ngẫu nhiên 2 giám thị chưa có lịch coi thi.");
    };

    const handleOpenRoomModal = (room = null) => {
        if (room) {
            setSelectedRoom(room);
            setRoomForm({
                name: room.name,
                students: room.students,
                subject: 'all',
                supervisor1: room.supervisors[0] || '',
                supervisor2: room.supervisors[1] || ''
            });
        } else {
            setSelectedRoom(null);
            setRoomForm({ name: '', students: 30, subject: 'all', supervisor1: '', supervisor2: '' });
        }
        setIsRoomModalOpen(true);
    };

    const handleSaveRoom = () => {
        if (!roomForm.name.trim()) {
            toast.warning("Vui lòng nhập tên phòng thi!");
            return;
        }

        const isDuplicate = rooms.some(r => 
            r.name.toLowerCase() === roomForm.name.toLowerCase() && 
            r.id !== selectedRoom?.id
        );

        if (isDuplicate) {
            toast.error(`Tên "${roomForm.name}" đã tồn tại. Vui lòng chọn tên khác!`);
            return;
        }

        const action = selectedRoom ? "Cập nhật" : "Tạo mới";
        toast.success(`${action} phòng thi thành công!`);
        setIsRoomModalOpen(false);
    };

    const totalPages = Math.ceil(rooms.length / itemsPerPage);
    const paginatedRooms = rooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const schedule = [
        { time: "07:30 - 09:30", subject: "Toán học", date: "25/11/2026", type: "Tự luận", status: "Sẵn sàng" },
        { time: "14:00 - 15:30", subject: "Ngữ văn", date: "25/11/2026", type: "Tự luận", status: "Sẵn sàng" },
        { time: "08:00 - 09:00", subject: "Tiếng Anh", date: "26/11/2026", type: "Trắc nghiệm", status: "Chưa chốt" },
        { time: "14:00 - 15:30", subject: "Vật lý", date: "26/11/2026", type: "Trắc nghiệm", status: "Chưa chốt" },
    ];

    const handleSendNotifications = () => {
        const incompleteRooms = rooms.filter(r => r.status !== 'Đã xếp');
        
        if (incompleteRooms.length > 0) {
            toast.error(
                <div>
                    <strong>Cảnh báo:</strong> Có {incompleteRooms.length} phòng chưa hoàn tất (Chưa đủ sĩ số hoặc chưa có giám thị). 
                    Vui lòng hoàn thiện xếp phòng trước khi gửi thông báo!
                </div>,
                { autoClose: 5000 }
            );
            return;
        }

        const newNotif = {
            id: Date.now(),
            title: "Thông báo Lịch thi & Phân phòng thi",
            desc: "Hệ thống đã hoàn tất việc phân phòng và gán giám thị cho kỳ thi 'Thi Giữa Học Kỳ II - Môn Toán - Khối 12'. Đề nghị các giáo viên coi thi và học sinh theo dõi lịch chi tiết.",
            type: "directive",
            isRead: true,
            time: "Vừa xong",
            audience: "all_teachers"
        };

        const existing = JSON.parse(localStorage.getItem('vpa_notifications') || '[]');
        localStorage.setItem('vpa_notifications', JSON.stringify([newNotif, ...existing]));

        toast.success("Đã gửi thông báo lịch thi và phòng thi chi tiết cho toàn bộ 450 học sinh & 30 giám thị!");
    };

    return (
        <div className="vpa-exam-rooms">
            <div className="vpa-rooms-header">
                <button className="back-btn" onClick={() => navigate("/vp-academic/exams")}>
                    <FiArrowLeft /> Quay lại
                </button>
                <div className="header-info">
                    <h1>Phân phòng & Lịch thi</h1>
                    <span className="exam-name">Thi Giữa Học Kỳ II - Môn Toán - Khối 12</span>
                </div>
            </div>

            <div className="vpa-rooms-stats">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-details">
                            <span className="label">{stat.label}</span>
                            <span className="value">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="vpa-rooms-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FiGrid style={{ color: 'var(--admin-primary)', fontSize: '1.25rem' }} />
                    <span style={{ fontWeight: 800, color: 'var(--admin-navy)', fontSize: '1.1rem' }}>Danh sách phòng thi</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="outline" onClick={handleSendNotifications} style={{ borderColor: '#3b82f6', color: '#3b82f6', borderRadius: '8px' }}>
                        <FiPlus /> Gửi thông báo
                    </Button>
                    <Button className="vpa-btn-glow" onClick={() => handleOpenRoomModal()} style={{ borderRadius: '8px' }}>
                        <FiPlus /> Tạo phòng thi
                    </Button>
                </div>
            </div>

            <div className="vpa-rooms-content">
                <div className="rooms-grid">
                    {paginatedRooms.map((room, i) => (
                        <div 
                            key={i} 
                            className="room-card" 
                            onClick={() => navigate(`/vp-academic/exams/rooms/${room.name.toLowerCase().replace(/\s+/g, '-')}`)}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="room-header">
                                <h3>{room.name}</h3>
                                <span className={`status-pill ${room.status === 'Đã xếp' ? 'ok' : 'warn'}`}>
                                    {room.status}
                                </span>
                            </div>
                            <div className="room-body">
                                <div className="body-row">
                                    <FiUsers /> <span>Sĩ số: <strong>{room.students} thí sinh</strong></span>
                                </div>
                                <div className="body-row proctors">
                                    <FiEdit3 /> 
                                    <div className="proctor-list">
                                        <span>Giám thị:</span>
                                        {room.supervisors.map((s, idx) => <strong key={idx}>{s}</strong>)}
                                    </div>
                                </div>
                            </div>
                            <div className="room-footer">
                                <button 
                                    className="btn-action-small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenRoomModal(room);
                                    }}
                                >
                                    Điều chỉnh
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {totalPages > 1 && (
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
            <Modal 
                open={isRoomModalOpen} 
                onClose={() => setIsRoomModalOpen(false)}
                title={selectedRoom ? "Điều chỉnh phòng thi" : "Tạo phòng thi mới"}
                className="vpa-exam-room-modal"
            >
                <div className="vpa-room-modal-form">
                    <div className="form-group-vpa">
                        <Input 
                            label="Tên phòng" 
                            value={roomForm.name}
                            onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                            placeholder="VD: Phòng 101"
                        />
                    </div>

                    <div className="form-row-vpa filter-row">
                        <div className="filter-select-wrap">
                            <Select 
                                label="Lọc giám thị theo môn"
                                options={SUBJECTS_LIST}
                                value={roomForm.subject}
                                onChange={(e) => setRoomForm({...roomForm, subject: e.target.value, supervisor1: '', supervisor2: ''})}
                            />
                        </div>
                        <Button 
                            variant="outline" 
                            className="vpa-btn-random"
                            onClick={handleRandomizeSupervisors} 
                        >
                            <FiUsers /> <span>Chọn ngẫu nhiên</span>
                        </Button>
                    </div>

                    <div className="form-row-vpa grid-2">
                        <div className="select-col">
                            <Select 
                                label="Giám thị 1"
                                variant="custom"
                                searchable={true}
                                searchPlaceholder="Tìm tên..."
                                options={filteredSupervisors}
                                value={roomForm.supervisor1}
                                onChange={(e) => setRoomForm({...roomForm, supervisor1: e.target.value})}
                            />
                        </div>
                        <div className="select-col">
                            <Select 
                                label="Giám thị 2"
                                variant="custom"
                                searchable={true}
                                searchPlaceholder="Tìm tên..."
                                options={filteredSupervisors}
                                value={roomForm.supervisor2}
                                onChange={(e) => setRoomForm({...roomForm, supervisor2: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="form-group-vpa">
                        <Input 
                            label="Số lượng thí sinh" 
                            type="number"
                            value={roomForm.students}
                            onChange={(e) => setRoomForm({...roomForm, students: parseInt(e.target.value) || 0})}
                        />
                    </div>

                    <div className="modal-footer-vpa">
                        <Button variant="outline" onClick={() => setIsRoomModalOpen(false)}>Hủy</Button>
                        <Button primary className="vpa-btn-glow" onClick={handleSaveRoom}>Lưu thông tin</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
