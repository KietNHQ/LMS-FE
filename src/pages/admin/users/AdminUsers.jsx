import React, { useMemo, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import { read, utils, writeFile } from "xlsx";
import "./AdminUsers.css";

import AccountsOverviewSection from "./components/accountsOverviewSection/AccountsOverviewSection";
import UsersSearchFilterSort from "./components/usersSearchFilterSort/UsersSearchFilterSort";
import UserDetailSection from "./components/userDetailSection/UserDetailSection";
import { CreateUserDialog, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import BlockUnblockUsersSection from "./components/blockUnblockUserSection/blockUnblockUserSection";

const initialUsers = [
    {
        id: 1,
        name: "Nguyễn Văn Admin",
        email: "admin@school.edu.vn",
        role: "Admin",
        phone: "0901234567",
        status: "Hoạt động",
        createdAt: "2024-01-01",
        dob: "1985-05-15",
        avatar: "N",
        color: "navy",
    },
    {
        id: 2,
        name: "Trần Thị Hương",
        email: "huong.tran@school.edu.vn",
        role: "Giáo viên",
        phone: "0912345678",
        status: "Hoạt động",
        createdAt: "2024-01-05",
        dob: "1990-11-20",
        avatar: "T",
        color: "teal",
    },
    {
        id: 3,
        name: "Lê Văn Minh",
        email: "minh.le@school.edu.vn",
        role: "Giáo viên",
        phone: "0923456789",
        status: "Hoạt động",
        createdAt: "2024-01-05",
        dob: "1988-03-10",
        avatar: "L",
        color: "teal",
    },
    {
        id: 4,
        name: "Phạm Thị Lan",
        email: "lan.pham@school.edu.vn",
        role: "Giáo viên",
        phone: "0934567890",
        status: "Hoạt động",
        createdAt: "2024-01-06",
        dob: "1992-07-25",
        avatar: "P",
        color: "teal",
    },
    {
        id: 5,
        name: "Hoàng Văn Đức",
        email: "duc.hoang@school.edu.vn",
        role: "Giáo viên",
        phone: "0945678901",
        status: "Vô hiệu hóa",
        createdAt: "2024-01-07",
        dob: "1987-09-12",
        avatar: "H",
        color: "teal",
    },
    {
        id: 6,
        name: "Nguyễn Minh Tuấn",
        email: "tuan.nguyen@student.edu.vn",
        role: "Học sinh",
        phone: "—",
        status: "Hoạt động",
        createdAt: "2024-08-01",
        dob: "2008-01-15",
        avatar: "N",
        color: "blue",
    },
    {
        id: 7,
        name: "Trần Bảo Châu",
        email: "chau.tran@student.edu.vn",
        role: "Học sinh",
        phone: "—",
        status: "Hoạt động",
        createdAt: "2024-08-02",
        dob: "2008-05-22",
        avatar: "C",
        color: "blue",
    },
    {
        id: 8,
        name: "Ngô Minh Khang",
        email: "khang.ngo@student.edu.vn",
        role: "Học sinh",
        phone: "—",
        status: "Hoạt động",
        createdAt: "2024-08-04",
        dob: "2008-12-30",
        avatar: "K",
        color: "blue",
    },
    {
        id: 9,
        name: "Lê Thị Hoa",
        email: "hoa.le@parent.edu.vn",
        role: "Phụ huynh",
        phone: "0976543210",
        status: "Hoạt động",
        createdAt: "2024-08-05",
        dob: "1980-06-18",
        avatar: "H",
        color: "orange",
    },
    {
        id: 10,
        name: "Phạm Văn Bình",
        email: "binh.pham@parent.edu.vn",
        role: "Phụ huynh",
        phone: "0987654321",
        status: "Vô hiệu hóa",
        createdAt: "2024-08-06",
        dob: "1978-02-14",
        avatar: "B",
        color: "orange",
    },
    {
        id: 11,
        name: "Đỗ Gia Bảo",
        email: "bao.do@school.edu.vn",
        role: "Admin",
        phone: "0908888888",
        status: "Hoạt động",
        createdAt: "2024-02-01",
        dob: "1986-10-05",
        avatar: "B",
        color: "navy",
    },
    {
        id: 12,
        name: "Trịnh Hải Nam",
        email: "nam.trinh@student.edu.vn",
        role: "Học sinh",
        phone: "—",
        status: "Hoạt động",
        createdAt: "2024-08-09",
        dob: "2009-04-12",
        avatar: "N",
        color: "blue",
    },
];

function getAvatarColor(role) {
    if (role === "Admin") return "navy";
    if (role === "Giáo viên") return "teal";
    if (role === "Học sinh") return "blue";
    return "orange";
}

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\u00a0/g, " ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}

function normalizePhoneValue(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";

    const digits = raw.replace(/\D/g, "");
    if (!digits) return raw;

    if (digits.length === 9) return `0${digits}`;

    return digits;
}

function normalizeRole(roleValue) {
    const role = normalizeText(roleValue);
    if (role === "admin") return "Admin";
    if (role.includes("giao vien") || role === "teacher") return "Giáo viên";
    if (role.includes("hoc sinh") || role === "student") return "Học sinh";
    if (role.includes("phu huynh") || role === "parent") return "Phụ huynh";
    return "Học sinh";
}

function getCellValue(row, keys) {
    const entries = Object.entries(row || {});
    for (const [rawKey, rawValue] of entries) {
        const normalizedKey = normalizeText(rawKey);
        if (keys.includes(normalizedKey)) {
            return String(rawValue || "").trim();
        }
    }
    return "";
}

const ITEMS_PER_PAGE = 4;

export default function AdminUsers() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [users, setUsers] = useState(initialUsers);

    const [searchValue, setSearchValue] = useState("");
    const [quickRole, setQuickRole] = useState("Tất cả");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);

    const [statusTarget, setStatusTarget] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchSearch =
                user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                user.email.toLowerCase().includes(searchValue.toLowerCase());

            const matchQuickRole =
                quickRole === "Tất cả" ? true : user.role === quickRole;

            return matchSearch && matchQuickRole;
        });
    }, [users, searchValue, quickRole]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, quickRole]);

    React.useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const handleCreateUser = (formData) => {
        const newUser = {
            id: Date.now(),
            ...formData,
            status: "Hoạt động",
            avatar:
                formData.firstName?.trim()?.charAt(0)?.toUpperCase() ||
                formData.name?.trim()?.charAt(0)?.toUpperCase() ||
                "U",
            color: getAvatarColor(formData.role),
            createdAt: new Date().toISOString().slice(0, 10),
        };

        setUsers((prev) => [newUser, ...prev]);
        setIsCreateOpen(false);
        window.alert(`Da tao thanh cong nguoi dung ${newUser.name} (${newUser.role}).`);
    };

    const handleSaveEdit = (formData) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === editingUser.id
                    ? {
                          ...user,
                          ...formData,
                          avatar:
                              formData.firstName?.trim()?.charAt(0)?.toUpperCase() ||
                              formData.name?.trim()?.charAt(0)?.toUpperCase() ||
                              "U",
                          color: getAvatarColor(formData.role),
                      }
                    : user
            )
        );
        window.alert(`Đã cập nhật người dùng ${formData.name.trim()} thành công.`);
        setEditingUser(null);
    };

    const handleToggleStatus = () => {
        if (!statusTarget) return;

        setUsers((prev) =>
            prev.map((user) =>
                user.id === statusTarget.id
                    ? {
                          ...user,
                          status:
                              user.status === "Hoạt động" ? "Vô hiệu hóa" : "Hoạt động",
                      }
                    : user
            )
        );

        setStatusTarget(null);
    };

    const handleDeleteUser = (id) => {
        setUsers((prev) => prev.filter((user) => user.id !== id));
    };

    const handleImportExcel = async (file) => {
        if (!file) return;

        try {
            setIsImportingExcel(true);
            setImportFeedback({
                type: "info",
                message: `Đang nạp dữ liệu từ file ${file.name}...`,
            });

            const buffer = await file.arrayBuffer();
            const workbook = read(buffer, { type: "array" });
            const firstSheetName = workbook.SheetNames?.[0];

            if (!firstSheetName) {
                setImportFeedback({
                    type: "error",
                    message: "File Excel không có dữ liệu.",
                });
                return;
            }

            const rows = utils.sheet_to_json(workbook.Sheets[firstSheetName], {
                defval: "",
                raw: false,
            });

            const existingEmails = new Set(users.map((user) => user.email.toLowerCase()));
            const seenEmails = new Set();
            let missingRequiredCount = 0;
            let duplicateCount = 0;

            const importedUsers = rows
                .map((row, index) => {
                    const name = getCellValue(row, ["name", "ho va ten", "ten"]);
                    const email = getCellValue(row, ["email", "mail"]);
                    const roleValue = getCellValue(row, ["role", "vai tro"]);
                    const phoneValueRaw = getCellValue(row, [
                        "phone",
                        "dien thoai",
                        "so dien thoai",
                        "so dt",
                        "sdt",
                        "telephone",
                        "tel",
                        "mobile",
                    ]);
                    const phoneValue = normalizePhoneValue(phoneValueRaw);

                    if (!name || !email) {
                        missingRequiredCount += 1;
                        return null;
                    }

                    const normalizedEmail = email.toLowerCase();
                    if (existingEmails.has(normalizedEmail) || seenEmails.has(normalizedEmail)) {
                        duplicateCount += 1;
                        return null;
                    }
                    seenEmails.add(normalizedEmail);

                    const role = normalizeRole(roleValue);

                    return {
                        id: Date.now() + index,
                        name,
                        email,
                        role,
                        phone: phoneValue || "—",
                        status: "Hoạt động",
                        avatar: name.charAt(0).toUpperCase() || "U",
                        color: getAvatarColor(role),
                        createdAt: new Date().toISOString().slice(0, 10),
                    };
                })
                .filter(Boolean);

            if (importedUsers.length === 0) {
                setImportFeedback({
                    type: "warning",
                    message: `Không có dữ liệu mới được nạp. Trùng email: ${duplicateCount}, thiếu tên/email: ${missingRequiredCount}.`,
                });
                return;
            }

            setUsers((prev) => [...importedUsers, ...prev]);

            const hasIssue = duplicateCount > 0 || missingRequiredCount > 0;
            setImportFeedback({
                type: hasIssue ? "warning" : "success",
                message: `Đã nạp ${importedUsers.length}/${rows.length} dòng. Trùng email: ${duplicateCount}. Thiếu tên/email: ${missingRequiredCount}.`,
            });
        } catch (error) {
            console.error(error);
            setImportFeedback({
                type: "error",
                message: "Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng.",
            });
        } finally {
            setIsImportingExcel(false);
        }
    };

    const handleDownloadTemplate = () => {
        const templateRows = [
            {
                "Họ và tên": "Nguyễn Văn A",
                Email: "a.nguyen@school.edu.vn",
                "Vai trò": "Học sinh",
                "Số điện thoại": "0901234567",
            },
            {
                "Họ và tên": "Trần Thị B",
                Email: "b.tran@school.edu.vn",
                "Vai trò": "Giáo viên",
                "Số điện thoại": "0912345678",
            },
        ];

        const worksheet = utils.json_to_sheet(templateRows);
        const workbook = utils.book_new();

        utils.book_append_sheet(workbook, worksheet, "MauImportUsers");
        writeFile(workbook, "mau-import-nguoi-dung.xlsx");
    };

    return (
        <div className="admin-users-page">
            <AccountsOverviewSection totalUsers={users.length}>
                <SchoolYearTermSelector
                    selectedSchoolYear={selectedSchoolYear}
                    selectedTerm={selectedTerm}
                    onYearChange={handleYearArrow}
                    onTermChange={handleTermChange}
                />
            </AccountsOverviewSection>

            <UsersSearchFilterSort
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                quickRole={quickRole}
                onQuickRoleChange={setQuickRole}
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

            <UserDetailSection
                users={paginatedUsers}
                onEdit={setEditingUser}
                onToggleStatus={setStatusTarget}
                onDelete={handleDeleteUser}
            />

            <div className="admin-users-pagination-row">
                <div className="admin-users-pagination" aria-label="Phân trang người dùng">
                    <button
                        type="button"
                        className="admin-users-page-btn"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage <= 1}
                        aria-label="Trang trước"
                    >
                        <FiChevronLeft />
                    </button>

                    <p className="admin-users-page-indicator" aria-live="polite">
                        <span>{currentPage}</span>
                        <small>/ {totalPages}</small>
                    </p>

                    <button
                        type="button"
                        className="admin-users-page-btn"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        aria-label="Trang sau"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {isCreateOpen && (
                <CreateUserDialog
                    mode="create"
                    title="Thêm người dùng mới"
                    submitLabel="Tạo người dùng"
                    roleOptions={["Admin", "Phụ huynh", "Học sinh", "Giáo viên"]}
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
                    roleOptions={["Admin", "Phụ huynh", "Học sinh", "Giáo viên"]}
                    initialData={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSubmit={handleSaveEdit}
                />
            )}

            {statusTarget && (
                <BlockUnblockUsersSection
                    user={statusTarget}
                    onClose={() => setStatusTarget(null)}
                    onConfirm={handleToggleStatus}
                />
            )}
        </div>
    );
}