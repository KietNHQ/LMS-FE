import React, { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { read, utils, writeFile } from "xlsx";
import "./AdminParents.css";
import { CreateUserDialog } from "../../../components/common";
import ParentActionsSection from "./components/parentActionsSection/parentActionsSection";
import ParentListSection from "./components/parentListSection/parentListSection";
import ParentInformationSection from "./components/parentInformationSection/parentInformationSection";

const initialParents = [
    {
        id: 1,
        name: "Nguyễn Văn Hùng",
        lastName: "Nguyễn Văn",
        firstName: "Hùng",
        dob: "1980-05-15",
        email: "hung.nv@parent.email.edu.vn",
        role: "Phụ huynh",
        phone: "0901234567",
        profile: {
            lastName: "Nguyễn Văn",
            firstName: "Hùng",
            dob: "1980-05-15",
            phone: "0901234567",
            children: [
                { childName: "Nguyễn Văn A", childClass: "10A1" }
            ]
        },
        createdAt: "2026-03-20"
    },
    {
        id: 2,
        name: "Trần Thị Liên",
        lastName: "Trần Thị",
        firstName: "Liên",
        dob: "1982-10-22",
        email: "lien.tt@parent.email.edu.vn",
        role: "Phụ huynh",
        phone: "0987654321",
        profile: {
            lastName: "Trần Thị",
            firstName: "Liên",
            dob: "1982-10-22",
            phone: "0987654321",
            children: [
                { childName: "Trần Bảo B", childClass: "11B2" },
                { childName: "Trần Bảo C", childClass: "12C1" },
                { childName: "Trần Bảo D", childClass: "10A1" }
            ]
        },
        createdAt: "2026-03-21"
    },
    {
        id: 3,
        name: "Lê Hoàng Nam",
        lastName: "Lê Hoàng",
        firstName: "Nam",
        dob: "1978-08-10",
        email: "nam.lh@parent.email.edu.vn",
        role: "Phụ huynh",
        phone: "0923456789",
        profile: {
            lastName: "Lê Hoàng",
            firstName: "Nam",
            dob: "1978-08-10",
            phone: "0923456789",
            children: [
                { childName: "Lê Minh Phát", childClass: "12A3" },
                { childName: "Lê Minh Tuệ", childClass: "10A5" }
            ]
        },
        createdAt: "2026-03-22"
    },
    {
        id: 4,
        name: "Phạm Ngọc Ánh",
        lastName: "Phạm Ngọc",
        firstName: "Ánh",
        dob: "1985-12-05",
        email: "anh.pn@parent.email.edu.vn",
        role: "Phụ huynh",
        phone: "0934567890",
        profile: {
            lastName: "Phạm Ngọc",
            firstName: "Ánh",
            dob: "1985-12-05",
            phone: "0934567890",
            children: [
                { childName: "Bùi Ngọc Hân", childClass: "11B2" }
            ]
        },
        createdAt: "2026-03-23"
    },
    {
        id: 5,
        name: "Vũ Thị Mai",
        lastName: "Vũ Thị",
        firstName: "Mai",
        dob: "1981-03-30",
        email: "mai.vt@parent.email.edu.vn",
        role: "Phụ huynh",
        phone: "0945678901",
        profile: {
            lastName: "Vũ Thị",
            firstName: "Mai",
            dob: "1981-03-30",
            phone: "0945678901",
            children: [
                { childName: "Phan Vũ Anh Thư", childClass: "10C1" }
            ]
        },
        createdAt: "2026-03-24"
    },
    {
        id: 6,
        name: "Đặng Hoàng Việt",
        lastName: "Đặng Hoàng",
        firstName: "Việt",
        dob: "1976-11-12",
        email: "viet.dh@parent.email.edu.vn",
        role: "Phụ huynh",
        phone: "0956789012",
        profile: {
            lastName: "Đặng Hoàng",
            firstName: "Việt",
            dob: "1976-11-12",
            phone: "0956789012",
            children: [
                { childName: "Đặng Hoàng Bách", childClass: "12D1" }
            ]
        },
        createdAt: "2026-03-25"
    }
];

const emptyParentForm = {
    name: "",
    dob: "",
    email: "",
    phone: "",
    profile: { children: [] }
};

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}

function getCellValue(row, keys) {
    const entries = Object.entries(row || {});
    for (const [rawKey, rawValue] of entries) {
        if (keys.includes(normalizeText(rawKey))) {
            return String(rawValue || "").trim();
        }
    }
    return "";
}

function toToken(value) {
    return normalizeText(value).replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");
}

function toInitials(value) {
    return normalizeText(value)
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0))
        .join("")
        .replace(/[^a-z0-9]/g, "");
}

function buildParentEmail(firstName, lastName) {
    const localPart = [toToken(firstName), toInitials(lastName)].filter(Boolean).join(".") || "user";
    return `${localPart}@parent.email.edu.vn`;
}

const ITEMS_PER_PAGE = 4;

export default function AdminParents() {
    const [parents, setParents] = useState(initialParents);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
    const [selectedClass, setSelectedClass] = useState("Tất cả khối");

    const statusOptions = ["Tất cả trạng thái", "Hoạt động", "Khóa"];
    const classOptions = ["Tất cả khối", "Khối 10", "Khối 11", "Khối 12"];

    // Modal states
    const [activeModalMode, setActiveModalMode] = useState(null); // 'view', 'edit'
    const [activeParentId, setActiveParentId] = useState(null);
    const [parentForm, setParentForm] = useState(emptyParentForm);
    const [currentPage, setCurrentPage] = useState(1);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);

    const filteredParents = useMemo(() => {
        return parents.filter((parent) => {
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch =
                parent.name.toLowerCase().includes(searchStr) ||
                parent.email.toLowerCase().includes(searchStr) ||
                (parent.phone && parent.phone.includes(searchTerm));

            const matchesStatus =
                selectedStatus === "Tất cả trạng thái" || parent.status === selectedStatus;

            let matchesClass = true;
            if (selectedClass !== "Tất cả khối") {
                const gradePrefix = selectedClass.replace("Khối ", "");
                matchesClass = parent.profile?.children?.some(c => c.childClass?.startsWith(gradePrefix));
            }

            return matchesSearch && matchesStatus && matchesClass;
        });
    }, [parents, searchTerm, selectedStatus, selectedClass]);

    const totalPages = Math.max(1, Math.ceil(filteredParents.length / ITEMS_PER_PAGE));

    const paginatedParents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredParents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredParents, currentPage]);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, selectedClass]);

    React.useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);

    const handleCreateParentUser = (formData) => {
        const createdUser = {
            id: Date.now(),
            ...formData,
            createdAt: new Date().toISOString().slice(0, 10),
        };

        setParents((prev) => [createdUser, ...prev]);
        setIsDialogOpen(false);
    };

    const handleImportExcel = async (file) => {
        if (!file) return;

        try {
            setIsImportingExcel(true);
            setImportFeedback({
                type: "info",
                message: `Dang nap du lieu tu file ${file.name}...`,
            });

            const buffer = await file.arrayBuffer();
            const workbook = read(buffer, { type: "array" });
            const firstSheetName = workbook.SheetNames?.[0];

            if (!firstSheetName) {
                setImportFeedback({
                    type: "error",
                    message: "File Excel khong co du lieu.",
                });
                return;
            }

            const rows = utils.sheet_to_json(workbook.Sheets[firstSheetName], {
                defval: "",
                raw: false,
            });

            const importedUsers = rows
                .map((row, index) => {
                    const lastName = getCellValue(row, ["ho va ten lot", "ho", "last name"]);
                    const firstName = getCellValue(row, ["ten", "first name"]);
                    const dob = getCellValue(row, ["ngay sinh", "ngay thang nam sinh", "dob"]);
                    const child1Name = getCellValue(row, [
                        "ten con dang hoc",
                        "ten con",
                        "child name",
                        "ten con 1",
                        "child 1 name",
                    ]);
                    const child1Class = getCellValue(row, ["lop", "class", "lop 1", "child 1 class"]);
                    const child2Name = getCellValue(row, ["ten con 2", "child 2 name"]);
                    const child2Class = getCellValue(row, ["lop 2", "child 2 class"]);
                    const phone = getCellValue(row, ["so dien thoai", "sdt", "phone"])
                        .replace(/\D/g, "")
                        .slice(0, 10);

                    const children = [
                        { childName: child1Name, childClass: child1Class },
                        { childName: child2Name, childClass: child2Class },
                    ].filter((child) => child.childName && child.childClass);

                    if (!lastName || !firstName || !dob || children.length === 0 || phone.length !== 10) {
                        return null;
                    }

                    return {
                        id: Date.now() + index,
                        name: `${lastName} ${firstName}`.trim(),
                        lastName,
                        firstName,
                        dob,
                        email: buildParentEmail(firstName, lastName),
                        role: "Phụ huynh",
                        phone,
                        profile: {
                            lastName,
                            firstName,
                            dob,
                            children,
                            phone,
                        },
                        createdAt: new Date().toISOString().slice(0, 10),
                    };
                })
                .filter(Boolean);

            if (importedUsers.length === 0) {
                setImportFeedback({
                    type: "warning",
                    message: "Khong co du lieu hop le de them.",
                });
                return;
            }

            setParents((prev) => [...importedUsers, ...prev]);
            setImportFeedback({
                type: "success",
                message: `Da nap ${importedUsers.length} tai khoan phu huynh.`,
            });
        } catch (error) {
            console.error(error);
            setImportFeedback({
                type: "error",
                message: "Khong the doc file Excel.",
            });
        } finally {
            setIsImportingExcel(false);
        }
    };

    const handleDownloadTemplate = () => {
        const templateRows = [
            {
                "Ho va ten lot": "Nguyen Hoang Quoc",
                Ten: "Kiet",
                "Ngay sinh": "2008-10-21",
                "Ten con 1": "Nguyen Van C",
                "Lop 1": "10A1",
                "Ten con 2": "Nguyen Van D",
                "Lop 2": "8A2",
                "So dien thoai": "0901234567",
            },
        ];

        const worksheet = utils.json_to_sheet(templateRows);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "MauPhuHuynh");
        writeFile(workbook, "mau-import-phu-huynh.xlsx");
    };

    const handleViewParent = (parent) => {
        setActiveModalMode("view");
        setActiveParentId(parent.id);
        setParentForm({ ...parent });
    };

    const handleEditParent = (parent) => {
        setActiveModalMode("edit");
        setActiveParentId(parent.id);
        setParentForm({ ...parent });
    };

    const handleDeleteParent = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa phụ huynh này không?")) {
            setParents((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const handleCloseModal = () => {
        setActiveModalMode(null);
        setActiveParentId(null);
        setParentForm(emptyParentForm);
    };

    const handleParentFormChange = (field, value) => {
        if (field === "children") {
            setParentForm((prev) => ({
                ...prev,
                profile: { ...prev.profile, children: value }
            }));
            return;
        }

        setParentForm((prev) => ({
            ...prev,
            [field]: field === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
        }));
    };

    const handleSaveParentEdit = () => {
        if (!activeParentId) return;

        if (!parentForm.name.trim() || !parentForm.dob) {
            window.alert("Vui lòng nhập đầy đủ họ tên và ngày sinh.");
            return;
        }

        if (parentForm.phone && parentForm.phone.length !== 10) {
            window.alert("Số điện thoại phải đủ 10 chữ số.");
            return;
        }

        setParents((prev) =>
            prev.map((p) => {
                if (p.id !== activeParentId) return p;

                return {
                    ...p,
                    name: parentForm.name.trim(),
                    dob: parentForm.dob,
                    email: parentForm.email.trim(),
                    phone: parentForm.phone || "—",
                    profile: {
                        ...p.profile,
                        phone: parentForm.phone || "—",
                        children: parentForm.profile?.children || []
                    },
                };
            })
        );

        window.alert(`Đã cập nhật phụ huynh ${parentForm.name.trim()} thành công.`);

        handleCloseModal();
    };

    return (
        <div className="admin-parents-page">
            <ParentActionsSection
                totalParents={parents.length}
                searchTerm={searchTerm}
                selectedStatus={selectedStatus}
                selectedClass={selectedClass}
                statusOptions={statusOptions}
                classOptions={classOptions}
                onSearchChange={setSearchTerm}
                onStatusChange={setSelectedStatus}
                onClassChange={setSelectedClass}
                onCreateParentAccount={() => setIsDialogOpen(true)}
            />

            <ParentListSection
                parents={paginatedParents}
                onView={handleViewParent}
                onEdit={handleEditParent}
                onDelete={handleDeleteParent}
            />

            <div className="admin-parents-pagination-row">
                <div className="admin-parents-pagination" aria-label="Phân trang phụ huynh">
                    <button
                        type="button"
                        className="admin-parents-page-btn"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage <= 1}
                        aria-label="Trang trước"
                    >
                        <FiChevronLeft />
                    </button>

                    <p className="admin-parents-page-indicator" aria-live="polite">
                        <span>{currentPage}</span>
                        <small>/ {totalPages}</small>
                    </p>

                    <button
                        type="button"
                        className="admin-parents-page-btn"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        aria-label="Trang sau"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {activeModalMode && (
                <ParentInformationSection
                    mode={activeModalMode}
                    formData={parentForm}
                    onChange={handleParentFormChange}
                    onRequestEdit={() => setActiveModalMode("edit")}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveParentEdit}
                />
            )}

            {isDialogOpen && (
                <CreateUserDialog
                    mode="create"
                    title="Tạo tài khoản phụ huynh"
                    submitLabel="Tạo tài khoản"
                    fixedRole="Phụ huynh"
                    onClose={() => {
                        setIsDialogOpen(false);
                        setImportFeedback(null);
                    }}
                    onSubmit={handleCreateParentUser}
                    onImportExcel={handleImportExcel}
                    onDownloadTemplate={handleDownloadTemplate}
                    isImportingExcel={isImportingExcel}
                    importFeedback={importFeedback}
                />
            )}
        </div>
    );
}
