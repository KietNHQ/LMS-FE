import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiLock, FiUnlock, FiShield, FiX, FiUserX, FiUserCheck, FiMoreHorizontal } from "react-icons/fi";
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
        variant: "primary"
    });

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

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
        
        setConfirmConfig({
            isOpen: true,
            title: "Đặt lại mật khẩu",
            message: `Bạn có chắc chắn muốn ĐẶT LẠI MẬT KHẨU cho ${selectedUserIds.length} tài khoản đã chọn?`,
            confirmLabel: "Đặt lại mật khẩu",
            variant: "primary",
            onConfirm: async () => {
                closeConfirm();
                setIsBulkToggling(true);
                try {
                    const results = [];
                    for (const id of selectedUserIds) {
                        const user = managers.find(u => u.id === id);
                        if (!user) continue;
                        
                        const generatedPwd = Math.random().toString(36).slice(-10);
                        await userService.updateUser(id, { ...user, password: generatedPwd });
                        results.push({ name: user.name, password: generatedPwd });
                    }
                    
                    await loadManagers();
                    
                    const resultMsg = results.map(r => `${r.name}: ${r.password}`).join("\n");
                    window.alert(`Đặt lại mật khẩu thành công cho ${results.length} người dùng:\n\n${resultMsg}`);
                } catch (error) {
                    window.alert(getErrorMessage(error, "Có lỗi xảy ra khi đặt lại mật khẩu hàng loạt."));
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
        
        setConfirmConfig({
            isOpen: true,
            title: "Đặt lại mật khẩu",
            message: `Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng ${user.name}?`,
            confirmLabel: "Đặt lại mật khẩu",
            variant: "primary",
            onConfirm: async () => {
                closeConfirm();
                try {
                    const generatedPwd = Math.random().toString(36).slice(-10);
                    await userService.updateUser(user.id, { ...user, password: generatedPwd });
                    window.alert(`Đặt lại mật khẩu thành công cho ${user.name}.\nMật khẩu mới là: ${generatedPwd}`);
                } catch (error) {
                    window.alert(getErrorMessage(error, "Không thể đặt lại mật khẩu."));
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
            <div className="admin-managers-toolbar">
                <div className="admin-managers-search-wrap">
                    <FiSearch size={16} />
                    <input
                        className="admin-managers-search"
                        placeholder="Tìm kiếm tên, email, điện thoại..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>

                <Select
                    variant="custom"
                    className="admin-managers-filter-select-wrap"
                    selectClassName="admin-managers-filter-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    options={MANAGEMENT_ROLES}
                />

                <button className="admin-managers-add-btn" onClick={() => { setFormData(emptyForm); setCreateOpen(true); }}>
                    <FiPlus size={16} />
                    <span>Thêm Cán bộ</span>
                </button>
            </div>



            {/* Table (Modernized) */}
            {isLoading && <div className="admin-managers-state-msg">Đang tải danh sách Cán bộ...</div>}
            {loadError && <div className="admin-managers-state-msg">{loadError}</div>}

            {!isLoading && !loadError && (
                <div className="admin-managers-table-section">
                    <div className="mgr-table-head">
                        <div className="mgr-checkbox-cell">
                            <input 
                                type="checkbox" 
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
                        paginated.map((m) => {
                            const roleMeta = getRoleMeta(m.role);
                            const isMenuOpen = openMenuId === m.id;
                            const isDisabled = m.id === currentUser?.id || m.role === 'Quản trị viên' || m.role === 'admin';

                            return (
                                <div 
                                    className={`mgr-table-row ${m.status === "Vô hiệu hóa" ? "is-inactive" : ""} ${selectedUserIds.includes(m.id) ? "is-selected" : ""}`} 
                                    key={m.id}
                                    onClick={() => handleViewManager(m)}
                                >
                                    <div className="mgr-checkbox-cell" onClick={(e) => e.stopPropagation()}>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedUserIds.includes(m.id)}
                                            onChange={() => handleSelectRow(m.id)}
                                        />
                                    </div>
                                    <div className="mgr-user-cell">
                                        <div className={`mgr-avatar ${m.color || ""}`}>{getAvatarInitial(m.name)}</div>
                                        <div className="mgr-user-info">
                                            <div className="mgr-user-name">{m.name || "—"}</div>
                                            <div className="mgr-user-email">{m.email || "—"}</div>
                                        </div>
                                    </div>

                                    <div className="mgr-role-cell">
                                        <div className="mgr-role-tags">

                                            <span className={`mgr-role-chip ${roleMeta.cssClass}`}>
                                                {roleMeta.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mgr-phone">{m.phone !== "—" ? m.phone : <span style={{ color: "#d1d5db" }}>—</span>}</div>

                                    <div>
                                        <span className={`mgr-status-chip ${m.status === "Hoạt động" ? "active" : "inactive"}`}>
                                            {m.status}
                                        </span>
                                    </div>

                                    <div className="mgr-date">{formatDate(m.dob)}</div>

                                    <div className="mgr-actions" onClick={(e) => e.stopPropagation()}>
                                        <div className={`mgr-actions-dropdown ${isMenuOpen ? "is-open" : ""}`} ref={isMenuOpen ? menuRef : null}>
                                            <button className="mgr-actions-trigger" onClick={(e) => toggleMenu(e, m.id)}>
                                                <FiMoreHorizontal />
                                            </button>
                                            
                                            {isMenuOpen && (
                                                <div className="mgr-actions-menu">
                                                    <button className="mgr-menu-item edit" onClick={() => { handleEditManager(m); setOpenMenuId(null); }}>
                                                        <FiEdit2 />
                                                        <span>Chỉnh sửa</span>
                                                    </button>
                                                    
                                                    <button 
                                                        className="mgr-menu-item status" 
                                                        onClick={() => { setStatusTarget(m); setOpenMenuId(null); }}
                                                        disabled={isDisabled}
                                                    >
                                                        {m.status === "Hoạt động" ? <FiUserX /> : <FiUserCheck />}
                                                        <span>{m.status === "Hoạt động" ? "Vô hiệu hóa" : "Kích hoạt"}</span>
                                                    </button>

                                                    {hasPermission(PERMISSIONS.USER_UPDATE) && (
                                                        <button className="mgr-menu-item reset" onClick={() => { handleResetPassword(m); setOpenMenuId(null); }}>
                                                            <FiLock />
                                                            <span>Đặt lại mật khẩu</span>
                                                        </button>
                                                    )}

                                                    <button 
                                                        className="mgr-menu-item delete" 
                                                        onClick={() => { handleDeleteUser(m); setOpenMenuId(null); }}
                                                        disabled={isDisabled}
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
            />
        </div>
    );
}
