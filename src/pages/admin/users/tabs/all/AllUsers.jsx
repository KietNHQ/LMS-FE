import { useCallback, useEffect, useMemo, useState } from "react";
import { FiPlus, FiUsers, FiUserCheck, FiLock } from "react-icons/fi";
import { PERMISSIONS } from "../../../../../config/permissions";
import "./AllUsers.css";

import UsersSearchFilterSort from "./components/usersSearchFilterSort/UsersSearchFilterSort";
import UserDetailSection from "./components/userDetailSection/userDetailSection";
import { CreateUserDialog, Pagination, LoadingSpinner, ConfirmationModal } from "../../../../../components/common";
import { useCheckPermission } from "../../../../../hooks/useAuth";
import { userService, studentsService, permissionService } from "../../../../../services/pages/admin/users";

// Detail Section Imports
import TeacherInformationSection from "../teachers/components/teacherInformationSection/teacherInformationSection";
import StudentInformationSection from "../students/components/studentInformationSection/studentInformationSection";
import ParentInformationSection from "../parents/components/parentInformationSection/parentInformationSection";
import ManagerInformationSection from "../managers/components/managerInformationSection/managerInformationSection";

const ITEMS_PER_PAGE = 7;

const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (!data) return fallback;

    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
    if (data.error && typeof data.error === "object" && typeof data.error.message === "string") {
        return data.error.message;
    }
    if (typeof data === "object" && typeof data.message === "string") return data.message;

    return fallback;
};

const buildDownloadFilename = (headers = {}) => {
    const contentDisposition = headers?.["content-disposition"] || headers?.["Content-Disposition"];
    if (!contentDisposition) {
        return "mau-import-nguoi-dung.xlsx";
    }

    const matched = `${contentDisposition}`.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    if (!matched?.[1]) {
        return "mau-import-nguoi-dung.xlsx";
    }

    try {
        return decodeURIComponent(matched[1]);
    } catch {
        return matched[1];
    }
};

export default function AllUsers({ onCountChange, schoolYear, term, hasPermission, currentUser: propCurrentUser }) {
    const { user: adminUser } = useCheckPermission();
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [searchValue, setSearchValue] = useState("");
    const [quickRole, setQuickRole] = useState("Tất cả");
    const [statusFilter, setStatusFilter] = useState("Tất cả");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);

    const [activeModalMode, setActiveModalMode] = useState(null); // 'view' | 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [allClasses, setAllClasses] = useState([]);

    const [statusTarget, setStatusTarget] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

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

    const [allSystemPermissions, setAllSystemPermissions] = useState([]);
    const [permissionMap, setPermissionMap] = useState({}); // key -> id mapping

    const closeConfirm = () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        setAdminPasswordInput("");
        setNewPasswordInput("");
    };

    const loadUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        setLoadError("");

        try {
            const result = await userService.listUsers({ page: 1, limit: 2000 });
            setUsers(result.items || []);
            setSelectedUserIds([]); // Reset selection on reload
        } catch (error) {
            setLoadError(getErrorMessage(error, "Không thể tải danh sách người dùng."));
            setUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    const loadClasses = useCallback(async () => {
        try {
            const students = await studentsService.listStudents();
            const classes = Array.from(new Set(students.map(s => s.className).filter(Boolean)));
            setAllClasses(classes);
        } catch (err) {
            console.error("Failed to load classes for detail modals", err);
        }
    }, []);

    useEffect(() => {
        loadUsers();
        loadClasses();
    }, [loadUsers, loadClasses]);

    // Load all system permissions for mapping (same as AdminManagers)
    useEffect(() => {
        const fetchAllPermissions = async () => {
            try {
                const perms = await permissionService.getAllPermissions();
                setAllSystemPermissions(perms);
                
                const map = {};
                perms.forEach(p => {
                    const key = `${p.resource}:${p.action}`;
                    if (p.id) map[key] = p.id;
                });
                setPermissionMap(map);
            } catch (err) {
                console.error("Failed to load system permissions for AllUsers:", err);
            }
        };
        fetchAllPermissions();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchSearch =
                user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email.toLowerCase().includes(searchValue.toLowerCase());

            const matchQuickRole = quickRole === "Tất cả" 
                ? true 
                : (quickRole === "Quản lý" 
                    ? (user.role === "Quản lý" || user.role === "Quản trị viên") 
                    : user.role === quickRole);

            // Logic lọc theo Năm học / Học kỳ
            let matchYearTerm = true;
            if (schoolYear) {
                if (user.role === "Học sinh") {
                    // Nếu là học sinh, khớp năm học
                    matchYearTerm = user.academicYear === schoolYear || !user.academicYear;
                } else {
                    // Các role khác: Chỉ hiện nếu đang hoạt động
                    matchYearTerm = user.status === "Hoạt động";
                }
            }

            const matchStatus = statusFilter === "Tất cả" ? true : user.status === statusFilter;

            return matchSearch && matchQuickRole && matchYearTerm && matchStatus;
        });
    }, [users, searchValue, quickRole, schoolYear, term, statusFilter]);

    useEffect(() => {
        onCountChange?.(filteredUsers.length);
    }, [filteredUsers.length, onCountChange]);

    const stats = useMemo(() => [
        { label: "Tổng người dùng", value: users.length, iconClass: "stat-icon--navy", Icon: FiUsers },
        { label: "Đang hoạt động", value: users.filter(u => u.status === "Hoạt động").length, iconClass: "stat-icon--emerald", Icon: FiUserCheck },
        { label: "Vô hiệu hóa", value: users.filter(u => u.status !== "Hoạt động").length, iconClass: "stat-icon--rose", Icon: FiLock },
    ], [users]);

    const hasFilteredUsers = filteredUsers.length > 0;
    const shouldRenderDataSection = !isLoadingUsers && !loadError;
    const emptyMessage = users.length === 0 ? "Chưa có dữ liệu người dùng." : "Không có người dùng phù hợp.";

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedUserIds([]); // Reset selection on filter change
    }, [searchValue, quickRole]);

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const handleSelectRow = (userId) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedUserIds(paginatedUsers.map(u => u.id));
        } else {
            setSelectedUserIds([]);
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
                        const user = users.find(u => u.id === id);
                        if (!user) return Promise.resolve();
                        return userService.updateUser(id, { ...user, status: targetStatus });
                    });
                    
                    await Promise.all(promises);
                    await loadUsers();
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
                // Ta thực hiện reset password từng người một (vì BE reset-password là endpoint theo userId)
                // Hoặc admin có thể chỉ reset cho 1 người, bulk reset password này cần cân nhắc logic BE.
                // Hiện tại BE yêu cầu userId trên URL. Nên ta loop.
                try {
                    const results = [];
                    for (const id of selectedUserIds) {
                        const user = users.find(u => u.id === id);
                        if (!user) continue;
                        
                        const generatedPwd = Math.random().toString(36).slice(-10);
                        await userService.resetPassword(id, { 
                            adminPassword: adminPasswordInput, 
                            newPassword: generatedPwd 
                        });
                        results.push({ name: user.name, password: generatedPwd });
                    }
                    
                    closeConfirm();
                    await loadUsers();
                    
                    const resultMsg = results.map(r => `${r.name}: ${r.password}`).join("\n");
                    window.alert(`Đặt lại mật khẩu thành công cho ${results.length} người dùng:\n\n${resultMsg}`);
                } catch (error) {
                    window.alert(getErrorMessage(error, "Có lỗi xảy ra khi đặt lại mật khẩu hàng loạt. Kiểm tra lại mật khẩu Admin."));
                }
            }
        });
    };

    const handleResetPassword = async (user) => {
        if (!user) return;
        
        const isSelf = user.id === adminUser?.id || user.email === adminUser?.email;
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
                    await loadUsers();
                    window.alert(`Đã xóa thành công ${selectedUserIds.length} người dùng.`);
                } catch (error) {
                    window.alert(getErrorMessage(error, "Có lỗi xảy ra khi xóa hàng loạt."));
                } finally {
                    setIsBulkDeleting(false);
                }
            }
        });
    };

    const handleCreateUser = async (formData) => {
        try {
            // Map permissions to IDs if present
            const updatedFormData = { ...formData };
            if ((formData.role === "Quản lý" || formData.role === "Quản trị viên") && formData.profile?.permissions) {
                const permissionIds = formData.profile.permissions
                    .map(p => {
                        const permId = permissionMap[p];
                        return permId ? parseInt(permId) : null;
                    })
                    .filter(id => id !== null);
                
                updatedFormData.profile = {
                    ...updatedFormData.profile,
                    permission_ids: permissionIds
                };
            }

            await userService.createUser(updatedFormData);
            setIsCreateOpen(false);
            setImportFeedback(null);
            await loadUsers();
            window.alert(`Đã tạo thành công người dùng ${formData.name} (${formData.role}).`);
        } catch (error) {
            window.alert(getErrorMessage(error, "Không thể tạo người dùng."));
        }
    };

    const handleSaveEdit = async (formData) => {
        const id = editingUser?.id || selectedUser?.id;
        if (!id) {
            return;
        }

        setConfirmConfig({
            isOpen: true,
            title: "Lưu thay đổi",
            message: `Bạn có chắc chắn muốn lưu những thay đổi cho người dùng ${formData.name}?`,
            confirmLabel: "Lưu thay đổi",
            variant: "primary",
            onConfirm: async () => {
                closeConfirm();
                try {
                    // 1. Update basic user info
                    await userService.updateUser(id, formData);
                    
                    // 2. Update permissions if the user is a manager/admin
                    if ((formData.role === "Quản lý" || formData.role === "Quản trị viên") && formData.permissions) {
                        const permissionIds = formData.permissions
                            .map(p => {
                                const permId = permissionMap[p];
                                return permId ? parseInt(permId) : null;
                            })
                            .filter(id => id !== null);

                        if (permissionIds.length > 0) {
                            await permissionService.updateUserPermissions(id, {
                                mode: "replace",
                                permissionIds,
                            });
                        }
                    }

                    setEditingUser(null);
                    setSelectedUser(null);
                    setActiveModalMode(null);
                    await loadUsers();
                    window.alert(`Đã cập nhật người dùng ${formData.name} thành công.`);
                } catch (error) {
                    window.alert(getErrorMessage(error, "Không thể cập nhật người dùng."));
                }
            }
        });
    };

    const handleToggleStatus = async () => {
        if (!statusTarget) return;

        const nextStatus = statusTarget.status === "Hoạt động" ? "Vô hiệu hóa" : "Hoạt động";

        try {
            await userService.updateUser(statusTarget.id, {
                ...statusTarget,
                status: nextStatus,
            });
            setStatusTarget(null);
            await loadUsers();
        } catch (error) {
            window.alert(getErrorMessage(error, "Không thể cập nhật trạng thái người dùng."));
        }
    };

    const handleDeleteUser = async (userId) => {
        setConfirmConfig({
            isOpen: true,
            title: "Xóa người dùng",
            message: "Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Hành động này không thể hoàn tác.",
            confirmLabel: "Xóa ngay",
            variant: "danger",
            onConfirm: async () => {
                closeConfirm();
                try {
                    await userService.deleteUser(userId);
                    await loadUsers();
                    window.alert("Đã xóa người dùng thành công.");
                } catch (error) {
                    window.alert(getErrorMessage(error, "Không thể xóa người dùng."));
                }
            }
        });
    };

    const handleImportExcel = async (file) => {
        if (!file) return;

        try {
            setIsImportingExcel(true);
            setImportFeedback({
                type: "info",
                message: `Đang nạp dữ liệu từ file ${file.name}...`,
            });

            await userService.importUsers(file);
            await loadUsers();
            setImportFeedback({
                type: "success",
                message: "Đã nạp dữ liệu người dùng thành công.",
            });
        } catch (error) {
            setImportFeedback({
                type: "error",
                message: getErrorMessage(error, "Không thể nạp file Excel. Vui lòng kiểm tra endpoint import."),
            });
        } finally {
            setIsImportingExcel(false);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await userService.downloadImportTemplate();
            const blobData = response instanceof Blob ? response : response?.data;

            if (!(blobData instanceof Blob)) {
                window.alert("Không thể tải file mẫu import từ server.");
                return;
            }

            const fileName = buildDownloadFilename(response?.headers || {});
            const downloadUrl = URL.createObjectURL(blobData);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            window.alert(getErrorMessage(error, "Không thể tải file mẫu import từ server."));
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setActiveModalMode("view");
        
        // Fetch fresh permissions if manager/admin
        if (user.role === "Quản lý" || user.role === "Quản trị viên") {
            try {
                const rawPerms = await permissionService.getUserPermissions(user.id);
                const perms = Array.isArray(rawPerms) 
                    ? rawPerms.map(p => {
                        if (typeof p === 'object' && p.resource && p.action) {
                            return `${p.resource}:${p.action}`;
                        }
                        return typeof p === 'object' ? p.key || p.id : p;
                    }) 
                    : [];
                setSelectedUser(prev => prev?.id === user.id ? { ...prev, permissions: perms } : prev);
            } catch (err) {
                console.error("Failed to load user permissions in AllUsers view:", err);
            }
        }
    };

    const handleEditUser = async (user) => {
        setSelectedUser(user);
        setActiveModalMode("edit");

        // Fetch fresh permissions if manager/admin
        if (user.role === "Quản lý" || user.role === "Quản trị viên") {
            try {
                const rawPerms = await permissionService.getUserPermissions(user.id);
                const perms = Array.isArray(rawPerms) 
                    ? rawPerms.map(p => {
                        if (typeof p === 'object' && p.resource && p.action) {
                            return `${p.resource}:${p.action}`;
                        }
                        return typeof p === 'object' ? p.key || p.id : p;
                    }) 
                    : [];
                setSelectedUser(prev => prev?.id === user.id ? { ...prev, permissions: perms } : prev);
            } catch (err) {
                console.error("Failed to load user permissions in AllUsers edit:", err);
            }
        }
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setActiveModalMode(null);
        setEditingUser(null);
    };

    const renderDetailModal = () => {
        if (!selectedUser || !activeModalMode) return null;

        const role = selectedUser.role;

        if (role === "Giáo viên") {
            return (
                <TeacherInformationSection
                    mode={activeModalMode}
                    formData={selectedUser}
                    classOptions={allClasses}
                    onChange={(field, val) => setSelectedUser(prev => ({ ...prev, [field]: val }))}
                    onClose={handleCloseModal}
                    onSubmit={() => handleSaveEdit(selectedUser)}
                    onRequestEdit={() => setActiveModalMode("edit")}
                />
            );
        }

        if (role === "Học sinh") {
            return (
                <StudentInformationSection
                    mode={activeModalMode}
                    formData={selectedUser}
                    classOptions={allClasses}
                    onChange={(field, val) => setSelectedUser(prev => ({ ...prev, [field]: val }))}
                    onClose={handleCloseModal}
                    onSubmit={() => handleSaveEdit(selectedUser)}
                    onRequestEdit={() => setActiveModalMode("edit")}
                />
            );
        }

        if (role === "Phụ huynh") {
            return (
                <ParentInformationSection
                    mode={activeModalMode}
                    formData={selectedUser}
                    onChange={(field, val) => setSelectedUser(prev => ({ ...prev, [field]: val }))}
                    onClose={handleCloseModal}
                    onSubmit={() => handleSaveEdit(selectedUser)}
                    onRequestEdit={() => setActiveModalMode("edit")}
                />
            );
        }

        if (role === "Quản lý" || role === "Quản trị viên") {
            return (
                <ManagerInformationSection
                    mode={activeModalMode}
                    formData={selectedUser}
                    roleOptions={["Quản trị viên", "Quản lý", "Hiệu trưởng", "Phó HT học vụ", "Phó HT nề nếp", "Giáo vụ", "Tài chính", "Tổ trưởng bộ môn"]}
                    onChange={(field, val) => setSelectedUser(prev => ({ ...prev, [field]: val }))}
                    onClose={handleCloseModal}
                    onSubmit={() => handleSaveEdit(selectedUser)}
                    onRequestEdit={() => setActiveModalMode("edit")}
                />
            );
        }

        return null;
    };

    return (
        <div className="admin-users-page">
            <UsersSearchFilterSort
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                quickRole={quickRole}
                onQuickRoleChange={setQuickRole}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
            >
                <button
                    className="accounts-overview-add-btn"
                    onClick={() => {
                        setImportFeedback(null);
                        setIsCreateOpen(true);
                    }}
                >
                    <FiPlus />
                    <span>Thêm người dùng</span>
                </button>
            </UsersSearchFilterSort>

            {/* Stats Row */}
            <div className="admin-users-stats">
                {stats.map((s) => (
                    <div className="admin-users-stat-card" key={s.label}>
                        <div className={`admin-users-stat-icon ${s.iconClass}`}>
                            <s.Icon size={20} />
                        </div>
                        <div className="admin-users-stat-info">
                            <p>{s.label}</p>
                            <strong>{s.value}</strong>
                        </div>
                    </div>
                ))}
            </div>

            {loadError && <div className="user-detail-empty">{loadError}</div>}
            {isLoadingUsers && (
                <div className="ui-table-loading">
                    <LoadingSpinner size="lg" label="Đang tải danh sách người dùng..." role="admin" />
                </div>
            )}

            {shouldRenderDataSection && (
                <>
                    <UserDetailSection
                        users={paginatedUsers}
                        selectedUserIds={selectedUserIds}
                        onSelectAll={handleSelectAll}
                        onSelectRow={handleSelectRow}
                        emptyMessage={emptyMessage}
                        onView={handleViewUser}
                        onEdit={handleEditUser}
                        onToggleStatus={setStatusTarget}
                        onResetPassword={hasPermission(PERMISSIONS.USER_UPDATE) ? handleResetPassword : null}
                        onDelete={handleDeleteUser}
                        currentUser={adminUser}
                        hasPermission={hasPermission}
                    />

                    {hasFilteredUsers && totalPages > 1 && (
                        <div className="admin-users-pagination-row">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                ariaLabel="Phân trang người dùng"
                            />
                        </div>
                    )}
                </>
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

            {isCreateOpen && (
                <CreateUserDialog
                    mode="create"
                    title="Thêm người dùng mới"
                    submitLabel="Tạo người dùng"
                    roleOptions={["Quản trị viên", "Quản lý", "Phụ huynh", "Học sinh", "Giáo viên"]}
                    onClose={() => {
                        setIsCreateOpen(false);
                        setImportFeedback(null);
                    }}
                    onSubmit={handleCreateUser}
                    onImportExcel={handleImportExcel}
                    onDownloadTemplate={handleDownloadTemplate}
                    isImportingExcel={isImportingExcel}
                    importFeedback={importFeedback}
                />
            )}

            {editingUser && (
                <CreateUserDialog
                    mode="edit"
                    title="Chỉnh sửa người dùng"
                    submitLabel="Lưu thay đổi"
                    roleOptions={["Quản trị viên", "Quản lý", "Phụ huynh", "Học sinh", "Giáo viên"]}
                    initialData={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSubmit={handleSaveEdit}
                />
            )}

            {renderDetailModal()}

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
