import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiCalendar, FiChevronDown, FiX, FiUser, FiInfo, FiClock, FiCheck, FiSave } from "react-icons/fi";
import "./AdminCompetitionDetail.css";

const CONTENT_MAPPING = {
    "Vi phạm: Chuyên cần": [
        { label: "Nghỉ học không phép (-15đ)", pts: -15 },
        { label: "Đi học muộn (-5đ)", pts: -5 },
        { label: "Trốn học, bỏ tiết (-50đ)", pts: -50 },
        { label: "Bỏ giờ trong tiết (-10đ)", pts: -10 }
    ],
    "Vi phạm: Nề nếp - Tác phong": [
        { label: "Vi phạm đồng phục/tác phong (-10đ)", pts: -10 },
        { label: "Mất trật tự trong giờ (-20đ)", pts: -20 },
        { label: "Nói tục, chửi thề (-15đ)", pts: -15 },
        { label: "Sử dụng điện thoại trái phép (-5đ)", pts: -5 },
        { label: "Ăn uống trong giờ (-3đ)", pts: -3 },
        { label: "Gây gổ, xô đẩy (-25đ)", pts: -25 },
        { label: "Bắt nạt, xúc phạm (-30đ)", pts: -30 }
    ],
    "Vi phạm: Tài sản - Môi trường": [
        { label: "Làm hư hỏng tài sản trường (-20đ)", pts: -20 },
        { label: "Vẽ bậy, bôi bẩn (-10đ)", pts: -10 },
        { label: "Vứt rác bừa bãi (-3đ)", pts: -3 },
        { label: "Không tắt điện/quạt khi ra về (-2đ)", pts: -2 }
    ],
    "Vi phạm: Học tập": [
        { label: "Không làm bài tập (-2đ)", pts: -2 },
        { label: "Không mang sách vở (-2đ)", pts: -2 },
        { label: "Gian lận thi cử (-50đ)", pts: -50 },
        { label: "Không tham gia hoạt động ngoại khóa (-5đ)", pts: -5 }
    ],
    "Thưởng: Chuyên cần": [
        { label: "Đi học đầy đủ 1 tháng (+20đ)", pts: 20 },
        { label: "Đi học đầy đủ 1 học kỳ (+50đ)", pts: 50 },
        { label: "Không đi muộn trong HK (+10đ)", pts: 10 }
    ],
    "Thưởng: Học tập": [
        { label: "Học sinh giỏi cấp trường (+30đ)", pts: 30 },
        { label: "Học sinh giỏi cấp Tỉnh/TP (+50đ)", pts: 50 },
        { label: "HSG cấp Quốc gia/Quốc tế (+100đ)", pts: 100 },
        { label: "Tiến bộ rõ rệt (+20đ)", pts: 20 },
        { label: "Điểm TB > 8.0 (+15đ)", pts: 15 }
    ],
    "Thưởng: Phong trào": [
        { label: "Giải Nhất NT/TDTT trường (+20đ)", pts: 20 },
        { label: "Giải Nhì/Ba NT/TDTT trường (+15đ)", pts: 15 },
        { label: "Giải Nhất Tỉnh (+50đ)", pts: 50 },
        { label: "Giải Quốc gia/Quốc tế (+100đ)", pts: 100 },
        { label: "Tình nguyện viên tích cực (+15đ)", pts: 15 },
        { label: "Tham gia CLB (+10đ)", pts: 10 }
    ],
    "Thưởng: Tích cực": [
        { label: "Nhặt được của rơi trả lại (+20đ)", pts: 20 },
        { label: "Báo cáo nguy cơ mất đồ (+5đ)", pts: 5 },
        { label: "Gương mẫu được tuyên dương (+20đ)", pts: 20 },
        { label: "Giúp đỡ bạn bè được ghi nhận (+10đ)", pts: 10 },
        { label: "Phát hiện sai phạm, báo cáo (+15đ)", pts: 15 }
    ],
    "Khác": []
};

const DetailModal = ({ record, onClose }) => {
    if (!record) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content standard-modal animate-zoom" onClick={e => e.stopPropagation()}>
                <div className="modal-header-navy">
                    <div className="header-info">
                        <FiInfo className="header-icon" />
                        <h3>Chi tiết ghi nhận</h3>
                    </div>
                    <button className="close-btn-navy" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body-standard">
                    <div className="detail-grid-modal">
                        <div className="detail-item">
                            <label><FiCalendar /> Ngày ghi nhận</label>
                            <span>{record.date} (Tuần {record.week})</span>
                        </div>
                        <div className="detail-item">
                            <label><FiInfo /> Nội dung</label>
                            <span className={`type-tag ${record.type}`}>{record.content}</span>
                        </div>
                        <div className="detail-item">
                            <label><FiUser /> Người thực hiện</label>
                            <span>{record.actor}</span>
                        </div>
                        <div className="detail-item">
                            <label><FiClock /> Thời gian hệ thống</label>
                            <span>14:30:00 - 06/04/2026</span>
                        </div>
                    </div>
                    <div className="detail-description-box">
                        <label>Ghi chú chi tiết:</label>
                        <p>{record.description || "Ghi nhận nề nếp định kỳ của lớp."}</p>
                    </div>
                </div>
                <div className="modal-footer-standard">
                    <span className={`score-badge ${record.pts >= 0 ? 'pos' : 'neg'}`}>
                        {record.pts > 0 ? `+${record.pts}` : record.pts} Điểm
                    </span>
                    <button className="btn-close-standard" onClick={onClose}>Đóng chi tiết</button>
                </div>
            </div>
        </div>
    );
};

const EditModal = ({ record, onSave, onClose }) => {
    // Determine initial selected type and option based on record content
    const initialType = useMemo(() => {
        if (record?.content === "Ghi nhận khác") return "Khác";
        return Object.keys(CONTENT_MAPPING).find(key => 
            CONTENT_MAPPING[key].some(opt => opt.label.includes(record?.content))
        ) || "Vi phạm: Chuyên cần";
    }, [record]);

    const initialContent = useMemo(() => {
        if (initialType === "Khác") return { label: "Ghi nhận khác", pts: record?.pts || 0 };
        const options = CONTENT_MAPPING[initialType];
        return options.find(opt => opt.label.includes(record?.content)) || options[0];
    }, [initialType, record]);

    const [selectedType, setSelectedType] = useState(initialType);
    const [selectedContent, setSelectedContent] = useState(initialContent);
    const [desc, setDesc] = useState(record?.description || "");
    
    // Custom point states for "Khác"
    const [customPts, setCustomPts] = useState(Math.abs(record?.pts || 0));
    const [isPositive, setIsPositive] = useState((record?.pts || 0) >= 0);
    
    // Internal dropdown states
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isContentOpen, setIsContentOpen] = useState(false);
    const typeRef = useRef(null);
    const contentRef = useRef(null);

    const contentOptions = useMemo(() => CONTENT_MAPPING[selectedType] || [], [selectedType]);

    const handleTypeUpdate = (type) => {
        setSelectedType(type);
        if (type !== "Khác") {
            setSelectedContent(CONTENT_MAPPING[type][0]);
        } else {
            setSelectedContent({ label: "Ghi nhận khác", pts: isPositive ? customPts : -customPts });
        }
        setIsTypeOpen(false);
    };

    const handlePointChange = (val) => {
        const num = parseInt(val) || 0;
        if (num > 100) setCustomPts(100);
        else if (num < 0) setCustomPts(0);
        else setCustomPts(num);
    };

    if (!record) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content standard-modal edit-modal-content animate-zoom" onClick={e => e.stopPropagation()}>
                <div className="modal-header-navy edit-header">
                    <div className="header-info">
                        <FiEdit2 className="header-icon" />
                        <h3>Chỉnh sửa ghi nhận</h3>
                    </div>
                    <button className="close-btn-navy" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body-standard">
                    <div className="edit-form-box">
                        <div className="form-row-edit">
                            <label>Loại ghi nhận</label>
                            <div className="admin-custom-select" ref={typeRef} onClick={() => setIsTypeOpen(!isTypeOpen)}>
                                <div className={`admin-custom-select-trigger ${isTypeOpen ? "active" : ""}`}>
                                    <span>{selectedType}</span>
                                    <FiChevronDown className={`admin-select-icon ${isTypeOpen ? "open" : ""}`} />
                                </div>
                                {isTypeOpen && (
                                    <div className="admin-custom-select-options custom-scroll">
                                        {Object.keys(CONTENT_MAPPING).map(type => (
                                            <div key={type} className="admin-custom-select-option" onClick={() => handleTypeUpdate(type)}>{type}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedType !== "Khác" ? (
                            <div className="form-row-edit">
                                <label>Nội dung vi phạm/khen thưởng</label>
                                <div className="admin-custom-select" ref={contentRef} onClick={() => setIsContentOpen(!isContentOpen)}>
                                    <div className={`admin-custom-select-trigger ${isContentOpen ? "active" : ""}`}>
                                        <span>{selectedContent.label}</span>
                                        <FiChevronDown className={`admin-select-icon ${isContentOpen ? "open" : ""}`} />
                                    </div>
                                    {isContentOpen && (
                                        <div className="admin-custom-select-options custom-scroll">
                                            {contentOptions.map((opt, i) => (
                                                <div key={i} className="admin-custom-select-option" onClick={() => { setSelectedContent(opt); setIsContentOpen(false); }}>{opt.label}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="form-row-edit">
                                <label>Số điểm ghi nhận (+/- tối đa 100)</label>
                                <div className="pts-input-group">
                                    <button 
                                        className={`btn-toggle-sign ${isPositive ? 'pos' : 'neg'}`}
                                        onClick={() => setIsPositive(!isPositive)}
                                        title="Thay đổi dấu (+/-)"
                                    >
                                        {isPositive ? '+' : '-'}
                                    </button>
                                    <input 
                                        type="number" 
                                        className="admin-point-input"
                                        value={customPts === 0 ? "" : customPts}
                                        onChange={(e) => handlePointChange(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-row-edit">
                            <label>Chi tiết sự việc</label>
                            <textarea 
                                className="admin-form-textarea-edit" 
                                value={desc} 
                                onChange={e => setDesc(e.target.value)} 
                                placeholder="Nhập chi tiết chỉnh sửa..."
                            />
                        </div>
                    </div>
                </div>
                <div className="modal-footer-standard edit-footer-fixed">
                    <button className="btn-close-standard flex-shrink" onClick={onClose}>Hủy bỏ</button>
                    <button className="btn-admin-standard-primary flex-grow" onClick={() => {
                        const finalPts = selectedType === "Khác" ? (isPositive ? customPts : -customPts) : selectedContent.pts;
                        onSave({ 
                            ...record, 
                            content: selectedType === "Khác" ? "Ghi nhận khác" : selectedContent.label.split(" (")[0], 
                            pts: finalPts,
                            type: finalPts >= 0 ? "achievement" : "violation",
                            description: desc 
                        });
                    }}>
                        <FiSave /> Cập nhật ghi nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminCompetitionDetail = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { selectedTerm } = useSchoolYearTerm();

    const [selectedWeek, setSelectedWeek] = useState(selectedTerm === "hk1" ? 1 : 19);
    const [isWeekPickerOpen, setIsWeekPickerOpen] = useState(false);
    const weekPickerRef = useRef(null);

    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("Vi phạm: Chuyên cần");
    const typeRef = useRef(null);

    const [isContentOpen, setIsContentOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState(CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
    const contentRef = useRef(null);

    const [description, setDescription] = useState("");
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);

    // Custom point states for "Khác"
    const [customPts, setCustomPts] = useState(0);
    const [isPositive, setIsPositive] = useState(true);

    const [historyList, setHistoryList] = useState([
        { id: 1, date: "05/01/2026", week: 19, type: "standard", content: "Điểm chuẩn mặc định HK2", actor: "Hệ thống", pts: 100 },
        { id: 2, date: "05/01/2026", week: 19, type: "violation", content: "Đi học muộn (2 lỗi)", actor: "Sao Đỏ (Nguyễn Văn A)", pts: -20, description: "Học sinh A và B đi muộn." },
    ]);

    const handleAddRecord = () => {
        let pts = selectedContent.pts;
        let contentLabel = selectedContent.label.split(" (")[0];

        if (selectedType === "Khác") {
            pts = isPositive ? customPts : -customPts;
            contentLabel = "Ghi nhận khác";
        }

        const newRecord = {
            id: Date.now(),
            date: "06/04/2026",
            week: selectedWeek,
            type: pts >= 0 ? "achievement" : "violation",
            content: contentLabel,
            actor: "Quản trị viên (Demo)",
            pts: pts,
            description: description || ""
        };
        setHistoryList([newRecord, ...historyList]);
        setDescription("");
        setCustomPts(0);
        alert("Đã thêm thành công!");
    };

    const handleSaveEdit = (updatedRecord) => {
        setHistoryList(historyList.map(item => item.id === updatedRecord.id ? updatedRecord : item));
        setEditingRecord(null);
        alert("Đã cập nhật chỉnh sửa!");
    };

    const handleDeleteRecord = (id) => {
        if (window.confirm("Xóa ghi nhận này?")) {
            setHistoryList(historyList.filter(item => item.id !== id));
        }
    };

    const contentOptions = useMemo(() => CONTENT_MAPPING[selectedType], [selectedType]);

    const handleTypeChange = (type) => {
        setSelectedType(type);
        if (type !== "Khác") {
            setSelectedContent(CONTENT_MAPPING[type][0]);
        } else {
            setSelectedContent({ label: "Ghi nhận khác", pts: 0 });
        }
        setIsTypeOpen(false);
    };

    const handlePointChange = (val) => {
        const num = parseInt(val) || 0;
        if (num > 100) setCustomPts(100);
        else if (num < 0) setCustomPts(0);
        else setCustomPts(num);
    };

    const groupedWeeks = useMemo(() => {
        const groups = {};
        const startIdx = selectedTerm === "hk1" ? 0 : 18;
        for (let i = startIdx; i < startIdx + 18; i++) {
            const weekNum = i + 1;
            const month = `Tháng ${Math.ceil(weekNum / 4)}`;
            if (!groups[month]) groups[month] = [];
            groups[month].push({ value: weekNum, label: `Tuần ${weekNum}`, range: "06/04 - 12/04" });
        }
        return Object.entries(groups).map(([month, weeks]) => ({ month, weeks }));
    }, [selectedTerm]);

    const currentWeekData = useMemo(() => {
        for (const group of groupedWeeks) {
            const match = group.weeks.find(w => w.value === selectedWeek);
            if (match) return match;
        }
        return groupedWeeks[0]?.weeks[0];
    }, [groupedWeeks, selectedWeek]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (typeRef.current && !typeRef.current.contains(event.target)) setIsTypeOpen(false);
            if (contentRef.current && !contentRef.current.contains(event.target)) setIsContentOpen(false);
            if (weekPickerRef.current && !weekPickerRef.current.contains(event.target)) setIsWeekPickerOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const classInfo = { id: classId, className: "10A1", totalPoints: 95, rank: 1, grade: "10" };
    const filteredHistory = useMemo(() => historyList.filter(item => item.week === selectedWeek), [historyList, selectedWeek]);

    return (
        <div className="competition-detail-page">
            <PageHeader
                title={`Chi tiết Thi đua: ${classInfo.className}`}
                eyebrow="Quản lý nề nếp"
                actions={
                    <div className="header-actions-group">
                        <button className="back-btn-link" onClick={() => navigate(-1)}>
                            <FiArrowLeft /> Quay lại danh sách
                        </button>
                    </div>
                }
            />

            <div className="detail-grid">
                <div className="detail-main">
                    <div className="section-card history-card">
                        <div className="section-header">
                            <div className="title-area">
                                <h4>Lịch sử chấm điểm</h4>
                                <span className="record-count">{filteredHistory.length} bản ghi</span>
                            </div>
                            <div className="week-picker-custom-standard" ref={weekPickerRef}>
                                <div className={`admin-custom-select-trigger ${isWeekPickerOpen ? "active" : ""}`} onClick={() => setIsWeekPickerOpen(!isWeekPickerOpen)}>
                                    <div className="trigger-content-standard">
                                        <FiCalendar className="filter-icon" />
                                        <div className="trigger-text-main">
                                            <span className="w-label-standard">{currentWeekData?.label}</span>
                                            <span className="w-range-standard">{currentWeekData?.range}</span>
                                        </div>
                                    </div>
                                    <FiChevronDown className={`admin-select-icon ${isWeekPickerOpen ? "open" : ""}`} />
                                </div>
                                {isWeekPickerOpen && (
                                    <div className="week-picker-popover-calendar">
                                        <div className="popover-header">
                                            <span>Lịch học tuần ({selectedTerm === "hk1" ? "Học kỳ 1" : "Học kỳ 2"})</span>
                                        </div>
                                        <div className="calendar-scroll-area custom-scroll">
                                            {groupedWeeks.map((group, idx) => (
                                                <div key={idx} className="month-section">
                                                    <div className="month-header">{group.month}</div>
                                                    <div className="week-grid">
                                                        {group.weeks.map(opt => (
                                                            <div 
                                                                key={opt.value} 
                                                                className={`week-tile ${selectedWeek === opt.value ? 'selected' : ''}`} 
                                                                onClick={() => { setSelectedWeek(opt.value); setIsWeekPickerOpen(false); }}
                                                            >
                                                                <span className="tile-name">{opt.label}</span>
                                                                <span className="tile-range">{opt.range}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="history-table-wrapper scrollable-table">
                            <table className="history-table sticky-header">
                                <thead>
                                    <tr>
                                        <th>Ngày</th>
                                        <th>Vi phạm/Khen thưởng</th>
                                        <th>Người chấm</th>
                                        <th style={{ textAlign: 'center' }}>Điểm</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((item) => (
                                        <tr key={item.id} onClick={() => setSelectedRecord(item)} className="clickable-row">
                                            <td>{item.date}</td>
                                            <td><span className={`type-tag ${item.type}`}>{item.content}</span></td>
                                            <td className="actor-cell">
                                                {item.actor.includes(" (") ? (
                                                    <div className="actor-stack">
                                                        <span className="role">{item.actor.split(" (")[0]}</span>
                                                        <span className="name">({item.actor.split(" (")[1]}</span>
                                                    </div>
                                                ) : item.actor}
                                            </td>
                                            <td style={{ textAlign: 'center' }} className={item.pts >= 0 ? "pts-pos" : "pts-neg"}>
                                                {item.pts > 0 ? `+${item.pts}` : item.pts}
                                            </td>
                                            <td>
                                                {item.type !== "standard" && (
                                                    <div className="table-actions">
                                                        <button 
                                                            className="action-edit" 
                                                            onClick={e => { e.stopPropagation(); setEditingRecord(item); }} 
                                                            title="Sửa"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button className="action-del" onClick={e => { e.stopPropagation(); handleDeleteRecord(item.id); }} title="Xóa"><FiTrash2 /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHistory.length === 0 && (
                                        <tr><td colSpan="5" className="empty-state">Không có dữ liệu</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="summary-card-standard horizontal-summary">
                        <div className="score-main-horizontal">
                            <div className="score-box-navy">
                                <span className="score-val">{classInfo.totalPoints}</span>
                                <div className="score-desc">
                                    <span>ĐIỂM</span>
                                    <span>TUẦN {selectedWeek}</span>
                                </div>
                            </div>
                            <div className="rank-info-navy">
                                <span className="rank-title">Hạng</span>
                                <span className="rank-value">{classInfo.rank}</span>
                                <span className="rank-title" style={{ marginLeft: '4px' }}>(Khối {classInfo.grade})</span>
                            </div>
                        </div>
                    </div>

                    <div className="adjustment-form-card-standard sticky-form">
                        <div className="form-head">
                            <h4>Ghi nhận điểm</h4>
                            <p>Tạo vi phạm/khen thưởng mới</p>
                        </div>
                        <div className="standard-form">
                            <div className="form-row">
                                <label>Loại ghi nhận</label>
                                <div className="admin-custom-select" ref={typeRef} onClick={() => setIsTypeOpen(!isTypeOpen)}>
                                    <div className={`admin-custom-select-trigger ${isTypeOpen ? "active" : ""}`}>
                                        <span>{selectedType}</span>
                                        <FiChevronDown className={`admin-select-icon ${isTypeOpen ? "open" : ""}`} />
                                    </div>
                                    {isTypeOpen && (
                                        <div className="admin-custom-select-options custom-scroll">
                                            {Object.keys(CONTENT_MAPPING).map(type => (
                                                <div key={type} className="admin-custom-select-option" onClick={() => handleTypeChange(type)}>{type}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {selectedType !== "Khác" ? (
                                <div className="form-row">
                                    <label>Nội dung vi phạm</label>
                                    <div className="admin-custom-select" ref={contentRef} onClick={() => setIsContentOpen(!isContentOpen)}>
                                        <div className={`admin-custom-select-trigger ${isContentOpen ? "active" : ""}`}>
                                            <span>{selectedContent.label}</span>
                                            <FiChevronDown className={`admin-select-icon ${isContentOpen ? "open" : ""}`} />
                                        </div>
                                        {isContentOpen && (
                                            <div className="admin-custom-select-options custom-scroll">
                                                {contentOptions.map((opt, i) => (
                                                    <div key={i} className="admin-custom-select-option" onClick={() => setSelectedContent(opt)}>{opt.label}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="form-row">
                                    <label>Số điểm ghi nhận (+/- tối đa 100)</label>
                                    <div className="pts-input-group">
                                        <button 
                                            className={`btn-toggle-sign ${isPositive ? 'pos' : 'neg'}`}
                                            onClick={() => setIsPositive(!isPositive)}
                                            title="Thay đổi dấu (+/-)"
                                        >
                                            {isPositive ? '+' : '-'}
                                        </button>
                                        <input 
                                            type="number" 
                                            className="admin-point-input"
                                            value={customPts === 0 ? "" : customPts}
                                            onChange={(e) => handlePointChange(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="form-row">
                                <label>Mô tả chi tiết</label>
                                <textarea className="admin-form-textarea" placeholder="Nội dung..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <button className="btn-admin-standard-primary" onClick={handleAddRecord}>
                                <FiPlus /> Thêm ghi nhận
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedRecord && <DetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
            
            {editingRecord && (
                <EditModal 
                    record={editingRecord} 
                    onSave={handleSaveEdit} 
                    onClose={() => setEditingRecord(null)} 
                />
            )}
        </div>
    );
};

export default AdminCompetitionDetail;
