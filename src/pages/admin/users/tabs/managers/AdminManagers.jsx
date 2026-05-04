import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiKey, FiUnlock, FiShield, FiX, FiUserX, FiUserCheck, FiMoreHorizontal } from "react-icons/fi";
import { PERMISSIONS } from "../../../../../config/permissions";
import { Pagination, CreateUserDialog, ConfirmationModal } from "../../../../../components/common";
import { userService } from "../../../../../services/pages/admin/users";
import Select from "../../../../../components/ui/Select/Select";
import ManagerInformationSection from "./components/managerInformationSection/managerInformationSection";
import "./AdminManagers.css";

const ITEMS_PER_PAGE = 8;

/* ── Mapping vai trò quản lý ── */
const MANAGEMENT_ROLES = [
    { value: "Tất cả", label: "Tất cả vai trò" },
    { value: "Quản trị viên",  label: "Quản trị hệ thống" },
    { value: "Quản lý",       label: "Cán bộ Quản lý" },
    { value: "Hiệu trưởng",  label: "Hiệu trưởng" },
    { value: "Phó HT học vụ",label: "Phó HT Học vụ" },
    { value: "Phó HT nề nếp",label: "Phó HT Nề nếp" },
    { value: "Giáo vụ",      label: "Giáo vụ" },
    { value: "Tài chính",    label: "Tài chính" },
    { value: "Tổ trưởng bộ môn", label: "Tổ trưởng bộ môn" },
];

const ROLE_META = {
    "Quản trị viên": { label: "Quản trị hệ thống", cssClass: "admin",        icon: "⚙️" },
    "Quản lý":       { label: "Cán bộ Quản lý",   cssClass: "admin",        icon: "🛡️" },
    "Hiệu trưởng":  { label: "Hiệu trưởng",        cssClass: "principal",    icon: "🏫" },
    "Phó HT học vụ":{ label: "Phó HT Học vụ",      cssClass: "vp-academic",  icon: "📚" },
    "Phó HT nề nếp":{ label: "Phó HT Nề nếp",      cssClass: "vp-discipline",icon: "⚖️" },
    "Tài chính":    { label: "Tài chính",            cssClass: "finance",     icon: "💰" },
    "Tổ trưởng bộ môn": { label: "Tổ trưởng bộ môn",  cssClass: "dept-head",   icon: "👔" },
};

const getErrorMessage = (error, fallback) => {
    const msg = error?.response?.data?.message || error?.response?.data?.error;
    return msg || fallback;
};

const getRoleMeta = (role) => ROLE_META[role] || { label: role || "Quản lý", cssClass: "default", icon: "👤" };

const getAvatarInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "A";

const formatDate = (dateString) => {
    if (!dateString) return "—";
    const cleanDate = dateString.slice(0, 10);
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return cleanDate;
};

const emptyForm = { name: "", email: "", phone: "", role: "Quản lý", status: "Hoạt động", dob: "" };

/* ─────────────────────────────────────────────────── */
export default function AdminManagers({ onCountChange, hasPermission, currentUser }) {
    const [managers, setManagers]         = useState([]);
    const [isLoading, setIsLoading]       = useState(false);
    const [loadError, setLoadError]       = useState("");

    const [searchValue, setSearchValue]   = useState("");
    const [roleFilter, setRoleFilter]     = useState("Tất cả");

    const [currentPage, setCurrentPage]   = useState(1);

    // Modals
    const [createOpen, setCreateOpen]     = useState(false);
    const [formData, setFormData]         = useState(emptyForm);
    const [isSaving, setIsSaving]         = useState(false);

    const [activeModalMode, setActiveModalMode] = useState(null); // 'view' | 'edit'
    const [activeManagerId, setActiveManagerId] = useState(null);

    const [statusTarget, setStatusTarget] = useState(null);

    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkToggling, setIsBulkToggling] = useState(false);

    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        confirmLabel: "",
        onConfirm: () => {},
        variant: "primary",
        showNewPassword: false
    });

    const [adminPasswordInput, setAdminPasswordInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const closeConfirm = () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setAdminPasswordInput("");
        setNewPasswordInput("");
    };

    /* ── Load dữ liệu ── */
    const loadManagers = useCallback(async () => {
        setIsLoading(true);
        setLoadError("");
        try {
            const result = await userService.listUsers({ page: 1, limit: 500 });
            const adminRows = (result.items || []).filter(
                (u) => u.role === "Quản trị viên" || u.role === "Quản lý"
            );
            setManagers(adminRows);
        } catch (err) {
            setLoadError(getErrorMessage(err, "Không thể tải danh sách quản lý."));
            setManagers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadManagers(); }, [loadManagers]);
    useEffect(() => { onCountChange?.(managers.length); }, [managers.length, onCountChange]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (e, userId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === userId ? null : userId);
    };

    /* ── Lọc ── */
    const filtered = useMemo(() => {
        return managers.filter((m) => {
            const q = searchValue.toLowerCase();
            const matchSearch = (m.name || "").toLowerCase().includes(q)
                || (m.email || "").toLowerCase().includes(q)
                || (m.phone || "").includes(q);
            const matchRole = roleFilter === "Tất cả" || m.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [managers, searchValue, roleFilter]);

    useEffect(() => { setCurrentPage(1); }, [searchValue, roleFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    useEffect(() => {
        setCurrentPage((p) => Math.min(p, totalPages));
    }, [totalPages]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

    /* ── Detail Handlers ── */
    const handleViewManager = (manager) => {
        setActiveManagerId(manager.id);
        setFormData({ ...manager });
        setActiveModalMode("view");
    };

    const handleEditManager = (manager) => {
        setActiveManagerId(manager.id);
        setFormData({ ...manager });
        setActiveModalMode("edit");
    };

    const handleCloseDetail = () => {
        setActiveModalMode(null);
        setActiveManagerId(null);
        setFormData(emptyForm);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    /* ── Handlers ── */
    const handleCreate = async (payload) => {
        setIsSaving(true);
        try {
            await userService.createUser(payload);
            setCreateOpen(false);
            await loadManagers();
            window.alert(`Đã tạo thành công tài khoản quản lý: ${payload.name}.`);
        } catch (err) {
            window.alert(getErrorMessage(err, "Không thể tạo tài khoản quản lý."));
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkStatusChange = async (targetStatus) => {
        if (selectedUserIds.length === 0) return;
        
        const actionLabel = targetStatus === "Hoạt động" ? "KÍCH HOẠT" : "KHÓA";
        
        setConfirmConfig({
            isOpen: true,
            title: `${actionLabel} tài khoản`,
            message: `Bạn có chắc chắn muốn ${actionLabel} ${selectedUserIds.length} tài khoản đã chọn?`,
            confirmLabel: `Xác nhận ${actionLabel.toLowerCase()}`,
            variant: targetStatus === "Hoạt động" ? "primary" : "warning",
            onConfirm: async () => {
                closeConfirm();
                setIsBulkToggling(true);
                try {
                    const promises = selectedUserIds.map(id => {
                        const user = managers.find(u => u.id === id);
                        if (!user) return Promise.resolve();
                        return userService.updateUser(id, { ...user, status: targetStatus });
                    });
                    
                    await Promise.all(promises);
                    await loadManagers();
                    window.alert(`Đã ${actionLabel.toLowerCase()} thành công ${selectedUserIds.length} tài khoản.`);
                } catch (error) {
                    window.alert(getErrorMessage(error, "Có lỗi xảy ra khi xử lý hàng loạt."));
                } finally {
                    setIsBulkToggling(false);
                }
            }
        });
    };

    const handleBulkResetPassword = async () => {
        if (selectedUserIds.length === 0) return;
        
        setAdminPasswordInput("");
        setConfirmConfig({
            isOpen: true,
            title: "Xác minh quyền Admin",
            message: `Để đặt lại mật khẩu cho ${selectedUserIds.length} tài khoản, vui lòng nhập mật khẩu Admin của bạn:`,
            confirmLabel: "Đặt lại mật khẩu",
            variant: "primary",
            onConfirm: async () => {
                setIsBulkToggling(true);
                try {
                    const results = [];
                    for (const id of selectedUserIds) {
                        const user = managers.find(u => u.id === id);
                        if (!user) continue;
                        
                        const generatedPwd = Math.random().toString(36).slice(-10);
                        await userService.resetPassword(id, { 
                            adminPassword: adminPasswordInput, 
                            newPassword: generatedPwd 
                        });
                        results.push({ name: user.name, password: generatedPwd });
                    }
                    
                    closeConfirm();
                    await loadManagers();
                    
                    const resultMsg = results.map(r => `${r.name}: ${r.password}`).join("\n");
                    window.alert(`Đặt lại mật khẩu thành công cho ${results.length} người dùng:\n\n${resultMsg}`);
                } catch (error) {
                    window.alert(getErrorMessage(error, "Có lỗi xảy ra khi đặt lại mật khẩu hàng loạt. Kiểm tra lại mật khẩu Admin."));
                } finally {
                    setIsBulkToggling(false);
                }
            }
        });
    };

    const handleBulkDelete = async () => {
        if (selectedUserIds.length === 0) return;
        
        setConfirmConfig({
            isOpen: true,
            title: "Xóa tài khoản",
            message: `CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${selectedUserIds.length} người dùng đã chọn? Hành động này không thể hoàn tác.`,
            confirmLabel: "Xóa tài khoản",
            variant: "danger",
            onConfirm: async () => {
                closeConfirm();
                setIsBulkDeleting(true);
                try {
                    const promises = selectedUserIds.map(id => userService.deleteUser(id));
                    await Promise.all(promises);
                    await loadManagers();
                    window.alert(`Đã xóa thành công ${selectedUserIds.length} người dùng.`);
                } catch (error) {
                    window.alert(getErrorMessage(error, "Có lỗi xảy ra khi xóa hàng loạt."));
                } finally {
                    setIsBulkDeleting(false);
                }
            }
        });
    };

    const handleResetPassword = async (user) => {
        if (!user) return;
        
        const isSelf = user.id === currentUser?.id || user.email === currentUser?.email;
        setAdminPasswordInput("");
        setNewPasswordInput("");

        setConfirmConfig({
            isOpen: true,
            title: "Xác minh quyền Admin",
            message: isSelf 
                ? `Thiết lập mật khẩu mới cho chính bạn (${user.name}):`
                : `Xác nhận đặt lại mật khẩu cho ${user.name}. Hệ thống sẽ tự sinh mật khẩu mới.`,
            confirmLabel: "Đặt lại mật khẩu",
            variant: "primary",
            showNewPassword: isSelf,
            onConfirm: async () => {
                try {
                    let targetNewPassword = "";
                    if (isSelf) {
                        if (!newPasswordInput.trim()) {
                            window.alert("Vui lòng nhập mật khẩu mới.");
                            return;
                        }
                        targetNewPassword = newPasswordInput;
                    } else {
                        targetNewPassword = Math.random().toString(36).slice(-10);
                    }

                    await userService.resetPassword(user.id, { 
                        adminPassword: adminPasswordInput, 
                        newPassword: targetNewPassword 
                    });
                    
                    closeConfirm();
                    if (isSelf) {
                        window.alert("Đã đổi mật khẩu của bạn thành công.");
                    } else {
                        window.alert(`Đặt lại mật khẩu thành công cho ${user.name}.\nMật khẩu mới là: ${targetNewPassword}`);
                    }
                } catch (error) {
                    window.alert(getErrorMessage(error, "Xác thực Admin thất bại hoặc lỗi hệ thống."));
                }
            }
        });
    };

    const handleSelectRow = (userId) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedUserIds(paginated.map(u => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleToggleStatus = async () => {
        if (!statusTarget) return;
        
        const nextStatus = statusTarget.status === "Hoạt động" ? "Vô hiệu hóa" : "Hoạt động";
        const actionLabel = nextStatus === "Hoạt động" ? "Kích hoạt" : "Vô hiệu hóa";

        try {
            await userService.updateUser(statusTarget.id, { ...statusTarget, status: nextStatus });
            setStatusTarget(null);
            await loadManagers();
            window.alert(`${actionLabel} người dùng ${statusTarget.name} thành công.`);
        } catch (error) {
            window.alert(getErrorMessage(error, `Không thể ${actionLabel.toLowerCase()} người dùng.`));
        }
    };

    const handleDeleteUser = async (user) => {
        setConfirmConfig({
            isOpen: true,
            title: "Xóa người dùng",
            message: `Bạn có chắc chắn muốn xóa vĩnh viễn người dùng ${user.name}? Hành động này không thể hoàn tác.`,
            confirmLabel: "Xóa ngay",
            variant: "danger",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await userService.deleteUser(user.id);
                    await loadManagers();
                    window.alert("Đã xóa người dùng thành công.");
                } catch (error) {
                    window.alert(getErrorMessage(error, "Không thể xóa người dùng."));
                }
            }
        });
    };

    const handleSaveEdit = async (payload) => {
        const id = activeManagerId || payload.id;
        if (!id) return;

        setConfirmConfig({
            isOpen: true,
            title: "Lưu thay đổi",
            message: `Bạn có chắc chắn muốn lưu những thay đổi cho người dùng ${payload.name}?`,
            confirmLabel: "Lưu thay đổi",
            variant: "primary",
            onConfirm: async () => {
                closeConfirm();
                setIsSaving(true);
                try {
                    await userService.updateUser(id, payload);
                    handleCloseDetail();
                    await loadManagers();
                    window.alert("Đã cập nhật tài khoản quản lý thành công.");
                } catch (err) {
                    window.alert(getErrorMessage(err, "Không thể cập nhật tài khoản."));
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    /* ── Render ── */
    return (
        <div className="admin-managers-page">

            {/* Toolbar */}
            {/* Toolbar (Standardized) */}
            <div className="users-toolbar-card">
                <div className="users-search-box">
                    <FiSearch className="users-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên, email, điện thoại..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                <div className="users-filter-group">
                    <div className="admin-managers-filter-select-wrap">
                        <Select
                            variant="custom"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            options={MANAGEMENT_ROLES}
                        />
                    </div>
                    
                    <button className="admin-managers-add-btn" onClick={() => { setFormData(emptyForm); setCreateOpen(true); }}>
                        <FiPlus /> Thêm Cán bộ
                    </button>
                </div>
            </div>



            {/* Table (Modernized) */}
            {isLoading && <div className="admin-managers-state-msg">Đang tải danh sách Cán bộ...</div>}
            {loadError && <div className="admin-managers-state-msg">{loadError}</div>}

            {!isLoading && !loadError && (
                <div className="user-detail-section">
                    <div className="user-detail-head">
                        <div className="user-detail-checkbox-col">
                            <input 
                                type="checkbox" 
                                className="user-detail-checkbox"
                                checked={paginated.length > 0 && selectedUserIds.length === paginated.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                        </div>
                        <span>Người dùng</span>
                        <span>Vai trò</span>
                        <span>Điện thoại</span>
                        <span>Trạng thái</span>
                        <span>Ngày sinh</span>
                        <span>Thao tác</span>
                    </div>

                    {paginated.length === 0 ? (
                        <div className="admin-managers-empty">
                            <FiShield size={40} />
                            <p>{managers.length === 0 ? "Chưa có tài khoản quản lý nào." : "Không tìm thấy quản lý phù hợp."}</p>
                        </div>
                    ) : (
                        paginated.map((m, index) => {
                            const isMenuOpen = openMenuId === m.id;
                            const avatarColor = m.role?.toLowerCase().includes('quản trị') ? 'navy' : 'teal';

                            return (
                                <div 
                                    className={`user-detail-row ${m.status === "Vô hiệu hóa" ? "is-inactive" : ""} ${selectedUserIds.includes(m.id) ? "is-selected" : ""} ${isMenuOpen ? "menu-open" : ""}`} 
                                    key={m.id}
                                    onClick={() => handleViewManager(m)}
                                >
                                    <div className="user-detail-checkbox-col" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            className="user-detail-checkbox"
                                            checked={selectedUserIds.includes(m.id)}
                                            onChange={() => handleSelectRow(m.id)}
                                        />
                                    </div>
                                    <div className="user-detail-user">
                                        <div className={`user-detail-avatar ${avatarColor}`}>
                                            {m.name ? m.name.charAt(0).toUpperCase() : "U"}
                                        </div>
                                        <div className="user-detail-info">
                                            <div className="user-detail-name">{m.name || "—"}</div>
                                            <div className="user-detail-email">{m.email || "—"}</div>
                                        </div>
                                    </div>

                                    <div className="user-detail-role-group">
                                        <span className={`user-role-chip ${avatarColor === 'navy' ? 'admin' : 'teacher'}`}>
                                            {m.role || "Quản lý"}
                                        </span>
                                        {m.position && <span className="user-position-text">{m.position}</span>}
                                    </div>

                                    <div className="user-detail-phone">{m.phone !== "—" ? m.phone : <span style={{ color: "#d1d5db" }}>—</span>}</div>

                                    <div className="user-detail-status">
                                        <span className={`user-status-chip ${m.status === "Hoạt động" ? "active" : "inactive"}`}>
                                            {m.status}
                                        </span>
                                    </div>

                                    <div className="user-detail-date">{formatDate(m.dob)}</div>

                                    <div className="user-detail-actions" onClick={(e) => e.stopPropagation()}>
                                        <div className={`user-actions-dropdown ${isMenuOpen ? "is-open" : ""} ${index >= paginated.length - 2 ? "open-up" : ""}`}>
                                            <button className="user-actions-trigger" onClick={(e) => toggleMenu(e, m.id)}>
                                                <FiMoreHorizontal />
                                            </button>
                                            
                                            {isMenuOpen && (
                                                <div className="user-actions-menu">
                                                    <button className="user-menu-item" onClick={() => { handleViewManager(m); setOpenMenuId(null); }}>
                                                        <FiEye />
                                                        <span>Xem chi tiết</span>
                                                    </button>
                                                    <button className="user-menu-item" onClick={() => { handleEditManager(m); setOpenMenuId(null); }}>
                                                        <FiEdit2 />
                                                        <span>Chỉnh sửa</span>
                                                    </button>
                                                    
                                                    <button 
                                                        className="user-menu-item status" 
                                                        onClick={() => { setStatusTarget(m); setOpenMenuId(null); }}
                                                    >
                                                        {m.status === "Hoạt động" ? <FiUserX /> : <FiUserCheck />}
                                                        <span>{m.status === "Hoạt động" ? "Vô hiệu hóa" : "Kích hoạt"}</span>
                                                    </button>

                                                    <button 
                                                        className="user-menu-item delete" 
                                                        onClick={() => { handleDeleteUser(m); setOpenMenuId(null); }}
                                                    >
                                                        <FiTrash2 />
                                                        <span>Xóa tài khoản</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !loadError && filtered.length > ITEMS_PER_PAGE && (
                <div className="admin-managers-pagination-row">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        ariaLabel="Phân trang quản lý"
                    />
                </div>
            )}

            {createOpen && (
                <CreateUserDialog
                    mode="create"
                    title="Thêm Cán bộ Quản lý mới"
                    submitLabel="Tạo tài khoản"
                    fixedRole="Quản lý"
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}

            {activeModalMode && (
                <ManagerInformationSection
                    mode={activeModalMode}
                    formData={formData}
                    roleOptions={MANAGEMENT_ROLES.filter(r => r.value !== "Tất cả")}
                    onChange={handleInputChange}
                    onRequestEdit={() => setActiveModalMode("edit")}
                    onClose={handleCloseDetail}
                    onSubmit={() => handleSaveEdit(formData)}
                />
            )}

            {/* Bulk Action Bar */}
            {selectedUserIds.length > 0 && (
                <div className="admin-bulk-actions-bar">
                    <div className="bulk-info">
                        <span className="bulk-count">Đã chọn: <strong>{selectedUserIds.length}</strong></span>
                        <button className="bulk-clear-btn" onClick={() => setSelectedUserIds([])}>Bỏ chọn</button>
                    </div>
                    <div className="bulk-btns">
                        <button 
                            className="bulk-btn lock" 
                            onClick={() => handleBulkStatusChange("Vô hiệu hóa")}
                            disabled={isBulkToggling}
                        >
                            Khóa tài khoản
                        </button>
                        <button 
                            className="bulk-btn unlock" 
                            onClick={() => handleBulkStatusChange("Hoạt động")}
                            disabled={isBulkToggling}
                        >
                            Mở khóa
                        </button>
                        {hasPermission(PERMISSIONS.USER_UPDATE) && (
                            <button
                                className="bulk-btn reset"
                                onClick={handleBulkResetPassword}
                                disabled={isBulkToggling}
                            >
                                Đặt lại mật khẩu
                            </button>
                        )}
                        {hasPermission(PERMISSIONS.USER_DELETE) && (
                            <button 
                                className="bulk-btn delete" 
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                            >
                                {isBulkDeleting ? "Đang xóa..." : "Xóa tài khoản"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {statusTarget && (
                <ConfirmationModal
                    isOpen={true}
                    title={statusTarget.status === "Hoạt động" ? "Vô hiệu hóa người dùng" : "Kích hoạt người dùng"}
                    message={
                        <>Bạn có chắc muốn {statusTarget.status === "Hoạt động" ? "vô hiệu hóa" : "kích hoạt lại"} người dùng <strong>{statusTarget.name}</strong> không?</>
                    }
                    confirmLabel={statusTarget.status === "Hoạt động" ? "Xác nhận vô hiệu hóa" : "Xác nhận kích hoạt"}
                    variant={statusTarget.status === "Hoạt động" ? "warning" : "primary"}
                    onConfirm={handleToggleStatus}
                    onCancel={() => setStatusTarget(null)}
                />
            )}

            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmLabel={confirmConfig.confirmLabel}
                variant={confirmConfig.variant}
                onConfirm={confirmConfig.onConfirm}
                onCancel={closeConfirm}
            >
                {confirmConfig.title === "Xác minh quyền Admin" && (
                    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px", display: "block" }}>Mật khẩu Admin của bạn:</label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu Admin để xác thực"
                                value={adminPasswordInput}
                                onChange={(e) => setAdminPasswordInput(e.target.value)}
                                autoFocus
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    fontSize: "1rem"
                                }}
                            />
                        </div>
                        {confirmConfig.showNewPassword && (
                            <div>
                                <label style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px", display: "block" }}>Mật khẩu MỚI cho bạn:</label>
                                <input
                                    type="text"
                                    placeholder="Nhập mật khẩu mới tại đây"
                                    value={newPasswordInput}
                                    onChange={(e) => setNewPasswordInput(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid #ddd",
                                        fontSize: "1rem"
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </ConfirmationModal>
        </div>
    );
}
