import React, { useMemo, useState } from "react";
import { read, utils, writeFile } from "xlsx";
import "./AdminTeachers.css";
import { CreateUserDialog } from "../../../components/common";
import TeacherActionsSection from "./components/teacherActionsSection/teacherActionsSection";
import TeacherListSection from "./components/teacherListSection/teacherListSection";
import TeacherInformationSection from "./components/teacherInformationSection/teacherInformationSection";
import TeacherAssignmentSection from "./components/teacherAssignmentSection/teacherAssignmentSection";
import TeachingProgressSection from "./components/teachingProgressSection/teachingProgressSection";

const initialTeachers = [
    {
        id: 1,
        name: "Trần Thị Hương",
        lastName: "Trần Thị",
        firstName: "Hương",
        dob: "1992-02-12",
        email: "huong.tt@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0912345678",
        subject: "Toán",
        homeroomClass: "10A1",
        assignedClasses: ["10A1", "10A2"],
        status: "Hoạt động",
        createdAt: "2026-01-05",
        profile: {
            subject: "Toán",
            phone: "0912345678",
        },
        progress: {
            completionRate: 92,
            attendanceRate: 95,
            averageScore: 8.3,
            pendingLessonPlans: 1,
        },
    },
    {
        id: 2,
        name: "Phạm Văn Long",
        lastName: "Phạm Văn",
        firstName: "Long",
        dob: "1990-08-20",
        email: "long.pv@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0987654321",
        subject: "Ngữ văn",
        homeroomClass: "11B1",
        assignedClasses: ["11B1", "11B2"],
        status: "Hoạt động",
        createdAt: "2026-01-07",
        profile: {
            subject: "Ngữ văn",
            phone: "0987654321",
        },
        progress: {
            completionRate: 88,
            attendanceRate: 93,
            averageScore: 7.9,
            pendingLessonPlans: 2,
        },
    },
    {
        id: 3,
        name: "Nguyễn Thị Mai",
        lastName: "Nguyễn Thị",
        firstName: "Mai",
        dob: "1994-11-03",
        email: "mai.nt@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0904567890",
        subject: "Tiếng Anh",
        homeroomClass: "",
        assignedClasses: ["12C1"],
        status: "Tạm khóa",
        createdAt: "2026-01-10",
        profile: {
            subject: "Tiếng Anh",
            phone: "0904567890",
        },
        progress: {
            completionRate: 80,
            attendanceRate: 90,
            averageScore: 7.5,
            pendingLessonPlans: 4,
        },
    },
];

const statusOptions = ["Tất cả trạng thái", "Hoạt động", "Tạm khóa"];

const classOptions = ["10A1", "10A2", "11B1", "11B2", "12C1", "12C2"];

const emptyTeacherForm = {
    name: "",
    dob: "",
    email: "",
    subject: "",
    phone: "",
    homeroomClass: "",
    status: "Hoạt động",
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

function buildTeacherEmail(firstName, lastName) {
    const localPart = [toToken(firstName), toInitials(lastName)].filter(Boolean).join(".") || "user";
    return `${localPart}@teacher.email.edu.vn`;
}

function createTeacherFromPayload(payload, id) {
    const normalizedStatus = "Hoạt động";
    const subject = payload?.profile?.subject || "";
    const phone = payload?.profile?.phone || payload?.phone || "—";

    return {
        id,
        name: payload.name,
        lastName: payload.lastName,
        firstName: payload.firstName,
        dob: payload.dob,
        email: payload.email,
        role: "Giáo viên",
        phone,
        subject,
        homeroomClass: "",
        assignedClasses: [],
        status: normalizedStatus,
        createdAt: new Date().toISOString().slice(0, 10),
        profile: {
            ...payload.profile,
            subject,
            phone,
        },
        progress: {
            completionRate: 0,
            attendanceRate: 0,
            averageScore: 0,
            pendingLessonPlans: 0,
        },
    };
}

function toTeacherForm(teacher) {
    if (!teacher) return emptyTeacherForm;

    return {
        name: teacher.name || "",
        dob: teacher.dob || "",
        email: teacher.email || "",
        subject: teacher.subject || teacher.profile?.subject || "",
        phone: teacher.phone === "—" ? "" : teacher.phone || "",
        homeroomClass: teacher.homeroomClass || "",
        status: teacher.status || "Hoạt động",
    };
}

export default function AdminTeachers() {
    const [teachers, setTeachers] = useState(initialTeachers);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
    const [selectedSubject, setSelectedSubject] = useState("Tất cả môn");
    const [selectedTeacherId, setSelectedTeacherId] = useState(initialTeachers[0]?.id || null);
    const [activeModalMode, setActiveModalMode] = useState(null);
    const [activeTeacherId, setActiveTeacherId] = useState(null);
    const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);

    const subjectOptions = useMemo(() => {
        const subjects = teachers.map((teacher) => teacher.subject).filter(Boolean);
        return ["Tất cả môn", ...new Set(subjects)];
    }, [teachers]);

    const filteredTeachers = useMemo(() => {
        return teachers.filter((teacher) => {
            const matchSearch =
                teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                teacher.phone.includes(searchTerm);

            const matchStatus =
                selectedStatus === "Tất cả trạng thái" || teacher.status === selectedStatus;

            const matchSubject = selectedSubject === "Tất cả môn" || teacher.subject === selectedSubject;

            return matchSearch && matchStatus && matchSubject;
        });
    }, [teachers, searchTerm, selectedStatus, selectedSubject]);

    const selectedTeacher = useMemo(() => {
        const inFiltered = filteredTeachers.find((teacher) => teacher.id === selectedTeacherId);
        if (inFiltered) return inFiltered;

        return filteredTeachers[0] || null;
    }, [filteredTeachers, selectedTeacherId]);

    const handleCreateTeacherUser = (formData) => {
        const createdUser = createTeacherFromPayload(formData, Date.now());

        setTeachers((prev) => [createdUser, ...prev]);
        setSelectedTeacherId(createdUser.id);
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
                    const subject = getCellValue(row, ["mon chuyen day", "mon day", "subject"]);
                    const phone = getCellValue(row, ["so dien thoai", "sdt", "phone"])
                        .replace(/\D/g, "")
                        .slice(0, 10);

                    if (!lastName || !firstName || !dob || !subject || phone.length !== 10) {
                        return null;
                    }

                    return {
                        id: Date.now() + index,
                        name: `${lastName} ${firstName}`.trim(),
                        lastName,
                        firstName,
                        dob,
                        email: buildTeacherEmail(firstName, lastName),
                        role: "Giáo viên",
                        phone,
                        subject,
                        homeroomClass: "",
                        assignedClasses: [],
                        status: "Hoạt động",
                        profile: {
                            lastName,
                            firstName,
                            dob,
                            subject,
                            phone,
                        },
                        createdAt: new Date().toISOString().slice(0, 10),
                        progress: {
                            completionRate: 0,
                            attendanceRate: 0,
                            averageScore: 0,
                            pendingLessonPlans: 0,
                        },
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

            setTeachers((prev) => [...importedUsers, ...prev]);
            setSelectedTeacherId(importedUsers[0].id);
            setImportFeedback({
                type: "success",
                message: `Da nap ${importedUsers.length} tai khoan giao vien.`,
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
                "Ngay sinh": "1996-10-21",
                "Mon chuyen day": "Toan",
                "So dien thoai": "0901234567",
            },
        ];

        const worksheet = utils.json_to_sheet(templateRows);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "MauGiaoVien");
        writeFile(workbook, "mau-import-giao-vien.xlsx");
    };

    const handleViewTeacher = (teacher) => {
        setActiveModalMode("view");
        setActiveTeacherId(teacher.id);
        setTeacherForm(toTeacherForm(teacher));
    };

    const handleEditTeacher = (teacher) => {
        setActiveModalMode("edit");
        setActiveTeacherId(teacher.id);
        setTeacherForm(toTeacherForm(teacher));
    };

    const handleDeleteTeacher = (id) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa giáo viên này không?");
        if (!confirmed) return;

        setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));

        if (selectedTeacherId === id) {
            const nextTeacher = teachers.find((teacher) => teacher.id !== id);
            setSelectedTeacherId(nextTeacher?.id || null);
        }
    };

    const handleCloseModal = () => {
        setActiveModalMode(null);
        setActiveTeacherId(null);
        setTeacherForm(emptyTeacherForm);
    };

    const handleTeacherFormChange = (field, value) => {
        setTeacherForm((prev) => ({
            ...prev,
            [field]: field === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
        }));
    };

    const handleSaveTeacherEdit = () => {
        if (!activeTeacherId) return;
        if (!teacherForm.name.trim() || !teacherForm.dob || !teacherForm.subject.trim()) {
            window.alert("Vui lòng nhập đầy đủ họ tên, ngày sinh và môn dạy.");
            return;
        }

        if (teacherForm.phone && teacherForm.phone.length !== 10) {
            window.alert("Số điện thoại giáo viên phải đủ 10 chữ số.");
            return;
        }

        setTeachers((prev) =>
            prev.map((teacher) => {
                if (teacher.id !== activeTeacherId) return teacher;

                return {
                    ...teacher,
                    name: teacherForm.name.trim(),
                    dob: teacherForm.dob,
                    email: teacherForm.email.trim(),
                    subject: teacherForm.subject.trim(),
                    phone: teacherForm.phone || "—",
                    homeroomClass: teacherForm.homeroomClass,
                    status: teacherForm.status,
                    profile: {
                        ...teacher.profile,
                        subject: teacherForm.subject.trim(),
                        phone: teacherForm.phone || "—",
                    },
                };
            })
        );

        handleCloseModal();
    };

    const handleAssignClass = (className) => {
        const normalizedClass = String(className || "").trim().toUpperCase();
        if (!selectedTeacher || !normalizedClass) return;

        setTeachers((prev) =>
            prev.map((teacher) => {
                if (teacher.id !== selectedTeacher.id) return teacher;
                if (teacher.assignedClasses.includes(normalizedClass)) return teacher;

                return {
                    ...teacher,
                    assignedClasses: [...teacher.assignedClasses, normalizedClass],
                };
            })
        );
    };

    const handleRemoveAssignedClass = (className) => {
        if (!selectedTeacher) return;

        setTeachers((prev) =>
            prev.map((teacher) => {
                if (teacher.id !== selectedTeacher.id) return teacher;

                return {
                    ...teacher,
                    assignedClasses: teacher.assignedClasses.filter((item) => item !== className),
                };
            })
        );
    };

    const handleUpdateHomeroomClass = (className) => {
        if (!selectedTeacher) return;

        setTeachers((prev) =>
            prev.map((teacher) =>
                teacher.id === selectedTeacher.id
                    ? {
                        ...teacher,
                        homeroomClass: className,
                    }
                    : teacher
            )
        );
    };

    return (
        <div className="admin-teachers-page">
            <TeacherActionsSection
                totalTeachers={teachers.length}
                searchTerm={searchTerm}
                selectedStatus={selectedStatus}
                selectedSubject={selectedSubject}
                statusOptions={statusOptions}
                subjectOptions={subjectOptions}
                onSearchChange={setSearchTerm}
                onStatusChange={setSelectedStatus}
                onSubjectChange={setSelectedSubject}
                onCreateTeacherAccount={() => setIsDialogOpen(true)}
            />

            <div className="admin-teachers-main-grid">
                <div className="admin-teachers-main-column">
                    <TeacherListSection
                        teachers={filteredTeachers}
                        selectedTeacherId={selectedTeacher?.id || null}
                        onSelectTeacher={(id) => setSelectedTeacherId(id)}
                        onView={handleViewTeacher}
                        onEdit={handleEditTeacher}
                        onDelete={handleDeleteTeacher}
                    />
                </div>

                <div className="admin-teachers-side-column">
                    <TeacherAssignmentSection
                        teacher={selectedTeacher}
                        classOptions={classOptions}
                        onAssignClass={handleAssignClass}
                        onRemoveAssignedClass={handleRemoveAssignedClass}
                        onUpdateHomeroomClass={handleUpdateHomeroomClass}
                    />
                    <TeachingProgressSection teacher={selectedTeacher} />
                </div>
            </div>

            {activeModalMode && (
                <TeacherInformationSection
                    mode={activeModalMode}
                    formData={teacherForm}
                    classOptions={classOptions}
                    onChange={handleTeacherFormChange}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveTeacherEdit}
                />
            )}

            {isDialogOpen && (
                <CreateUserDialog
                    mode="create"
                    title="Tạo tài khoản giáo viên"
                    submitLabel="Tạo tài khoản"
                    fixedRole="Giáo viên"
                    onClose={() => {
                        setIsDialogOpen(false);
                        setImportFeedback(null);
                    }}
                    onSubmit={handleCreateTeacherUser}
                    onImportExcel={handleImportExcel}
                    onDownloadTemplate={handleDownloadTemplate}
                    isImportingExcel={isImportingExcel}
                    importFeedback={importFeedback}
                />
            )}
        </div>
    );
}
