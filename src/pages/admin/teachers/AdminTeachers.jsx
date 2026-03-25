import React, { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { read, utils, writeFile } from "xlsx";
import "./AdminTeachers.css";
import { CreateUserDialog } from "../../../components/common";
import TeacherActionsSection from "./components/teacherActionsSection/teacherActionsSection";
import TeacherListSection from "./components/teacherListSection/teacherListSection";
import TeacherInformationSection from "./components/teacherInformationSection/teacherInformationSection";
import TeacherDetailSection from "./components/TeacherDetailSection/TeacherDetailSection";

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
    {
        id: 4,
        name: "Lê Hoàng Nam",
        lastName: "Lê Hoàng",
        firstName: "Nam",
        dob: "1989-05-18",
        email: "nam.lh@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0931123456",
        subject: "Vật lý",
        homeroomClass: "10A2",
        assignedClasses: ["10A2", "10A3"],
        status: "Hoạt động",
        createdAt: "2026-01-12",
        profile: {
            subject: "Vật lý",
            phone: "0931123456",
        },
        progress: {
            completionRate: 90,
            attendanceRate: 94,
            averageScore: 8.1,
            pendingLessonPlans: 1,
        },
    },
    {
        id: 5,
        name: "Đặng Quốc Bảo",
        lastName: "Đặng Quốc",
        firstName: "Bảo",
        dob: "1991-09-07",
        email: "bao.dq@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0973344556",
        subject: "Hóa học",
        homeroomClass: "11B2",
        assignedClasses: ["11B1", "11B2"],
        status: "Hoạt động",
        createdAt: "2026-01-13",
        profile: {
            subject: "Hóa học",
            phone: "0973344556",
        },
        progress: {
            completionRate: 86,
            attendanceRate: 91,
            averageScore: 7.8,
            pendingLessonPlans: 2,
        },
    },
    {
        id: 6,
        name: "Bùi Thu Trang",
        lastName: "Bùi Thu",
        firstName: "Trang",
        dob: "1993-12-01",
        email: "trang.bt@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0918877665",
        subject: "Sinh học",
        homeroomClass: "12C1",
        assignedClasses: ["12C1", "12C2"],
        status: "Hoạt động",
        createdAt: "2026-01-14",
        profile: {
            subject: "Sinh học",
            phone: "0918877665",
        },
        progress: {
            completionRate: 89,
            attendanceRate: 92,
            averageScore: 8.0,
            pendingLessonPlans: 2,
        },
    },
    {
        id: 7,
        name: "Phan Minh Đức",
        lastName: "Phan Minh",
        firstName: "Đức",
        dob: "1988-04-10",
        email: "duc.pm@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0909123987",
        subject: "Lịch sử",
        homeroomClass: "",
        assignedClasses: ["10A1", "11B1"],
        status: "Tạm khóa",
        createdAt: "2026-01-15",
        profile: {
            subject: "Lịch sử",
            phone: "0909123987",
        },
        progress: {
            completionRate: 74,
            attendanceRate: 88,
            averageScore: 7.1,
            pendingLessonPlans: 5,
        },
    },
    {
        id: 8,
        name: "Vũ Gia Hân",
        lastName: "Vũ Gia",
        firstName: "Hân",
        dob: "1995-03-24",
        email: "han.vg@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0945566778",
        subject: "Địa lý",
        homeroomClass: "10A3",
        assignedClasses: ["10A3", "12C1"],
        status: "Hoạt động",
        createdAt: "2026-01-16",
        profile: {
            subject: "Địa lý",
            phone: "0945566778",
        },
        progress: {
            completionRate: 87,
            attendanceRate: 93,
            averageScore: 7.9,
            pendingLessonPlans: 2,
        },
    },
    {
        id: 9,
        name: "Trịnh Khánh Linh",
        lastName: "Trịnh Khánh",
        firstName: "Linh",
        dob: "1992-07-29",
        email: "linh.tk@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0922456789",
        subject: "Tin học",
        homeroomClass: "11B1",
        assignedClasses: ["11B1", "12C2"],
        status: "Hoạt động",
        createdAt: "2026-01-17",
        profile: {
            subject: "Tin học",
            phone: "0922456789",
        },
        progress: {
            completionRate: 93,
            attendanceRate: 96,
            averageScore: 8.5,
            pendingLessonPlans: 1,
        },
    },
    {
        id: 10,
        name: "Ngô Hữu Phúc",
        lastName: "Ngô Hữu",
        firstName: "Phúc",
        dob: "1990-01-15",
        email: "phuc.nh@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0967788990",
        subject: "Giáo dục công dân",
        homeroomClass: "",
        assignedClasses: ["10A2", "12C2"],
        status: "Hoạt động",
        createdAt: "2026-01-18",
        profile: {
            subject: "Giáo dục công dân",
            phone: "0967788990",
        },
        progress: {
            completionRate: 82,
            attendanceRate: 90,
            averageScore: 7.4,
            pendingLessonPlans: 3,
        },
    },
    {
        id: 11,
        name: "Hoàng Mỹ Duyên",
        lastName: "Hoàng Mỹ",
        firstName: "Duyên",
        dob: "1996-06-11",
        email: "duyen.hm@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0981122334",
        subject: "Thể dục",
        homeroomClass: "",
        assignedClasses: ["10A1", "11B2", "12C1"],
        status: "Hoạt động",
        createdAt: "2026-01-19",
        profile: {
            subject: "Thể dục",
            phone: "0981122334",
        },
        progress: {
            completionRate: 85,
            attendanceRate: 94,
            averageScore: 8.2,
            pendingLessonPlans: 2,
        },
    },
    {
        id: 12,
        name: "Lý Thành Công",
        lastName: "Lý Thành",
        firstName: "Công",
        dob: "1987-10-05",
        email: "cong.lt@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0953344221",
        subject: "Công nghệ",
        homeroomClass: "12C2",
        assignedClasses: ["11B2", "12C2"],
        status: "Tạm khóa",
        createdAt: "2026-01-20",
        profile: {
            subject: "Công nghệ",
            phone: "0953344221",
        },
        progress: {
            completionRate: 78,
            attendanceRate: 86,
            averageScore: 7.0,
            pendingLessonPlans: 6,
        },
    },
    {
        id: 13,
        name: "Tạ Ngọc Quỳnh",
        lastName: "Tạ Ngọc",
        firstName: "Quỳnh",
        dob: "1993-03-08",
        email: "quynh.tn@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0932456781",
        subject: "Toán",
        homeroomClass: "10A1",
        assignedClasses: ["10A1", "11B1"],
        status: "Hoạt động",
        createdAt: "2026-01-21",
        profile: {
            subject: "Toán",
            phone: "0932456781",
        },
        progress: {
            completionRate: 91,
            attendanceRate: 95,
            averageScore: 8.4,
            pendingLessonPlans: 1,
        },
    },
    {
        id: 14,
        name: "Mai Thanh Vũ",
        lastName: "Mai Thanh",
        firstName: "Vũ",
        dob: "1986-12-19",
        email: "vu.mt@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0913344552",
        subject: "Ngữ văn",
        homeroomClass: "11B2",
        assignedClasses: ["11B2", "12C1"],
        status: "Hoạt động",
        createdAt: "2026-01-22",
        profile: {
            subject: "Ngữ văn",
            phone: "0913344552",
        },
        progress: {
            completionRate: 87,
            attendanceRate: 92,
            averageScore: 7.8,
            pendingLessonPlans: 2,
        },
    },
    {
        id: 15,
        name: "Chu Hải Yến",
        lastName: "Chu Hải",
        firstName: "Yến",
        dob: "1991-06-25",
        email: "yen.ch@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0981765432",
        subject: "Tiếng Anh",
        homeroomClass: "",
        assignedClasses: ["10A2", "12C2"],
        status: "Hoạt động",
        createdAt: "2026-01-23",
        profile: {
            subject: "Tiếng Anh",
            phone: "0981765432",
        },
        progress: {
            completionRate: 88,
            attendanceRate: 93,
            averageScore: 8.0,
            pendingLessonPlans: 2,
        },
    },
    {
        id: 16,
        name: "Đoàn Minh Nhật",
        lastName: "Đoàn Minh",
        firstName: "Nhật",
        dob: "1990-02-14",
        email: "nhat.dm@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0901456789",
        subject: "Vật lý",
        homeroomClass: "12C1",
        assignedClasses: ["12C1", "12C2"],
        status: "Hoạt động",
        createdAt: "2026-01-24",
        profile: {
            subject: "Vật lý",
            phone: "0901456789",
        },
        progress: {
            completionRate: 89,
            attendanceRate: 94,
            averageScore: 8.1,
            pendingLessonPlans: 1,
        },
    },
    {
        id: 17,
        name: "Phùng Đức Trí",
        lastName: "Phùng Đức",
        firstName: "Trí",
        dob: "1988-09-11",
        email: "tri.pd@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0945566123",
        subject: "Hóa học",
        homeroomClass: "",
        assignedClasses: ["11B1", "12C1"],
        status: "Tạm khóa",
        createdAt: "2026-01-25",
        profile: {
            subject: "Hóa học",
            phone: "0945566123",
        },
        progress: {
            completionRate: 76,
            attendanceRate: 87,
            averageScore: 7.2,
            pendingLessonPlans: 5,
        },
    },
    {
        id: 18,
        name: "Trương Hà My",
        lastName: "Trương Hà",
        firstName: "My",
        dob: "1994-04-02",
        email: "my.th@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0971238901",
        subject: "Sinh học",
        homeroomClass: "10A2",
        assignedClasses: ["10A2", "11B2"],
        status: "Hoạt động",
        createdAt: "2026-01-26",
        profile: {
            subject: "Sinh học",
            phone: "0971238901",
        },
        progress: {
            completionRate: 86,
            attendanceRate: 91,
            averageScore: 7.7,
            pendingLessonPlans: 3,
        },
    },
    {
        id: 19,
        name: "Ninh Gia Khánh",
        lastName: "Ninh Gia",
        firstName: "Khánh",
        dob: "1989-07-17",
        email: "khanh.ng@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0923344509",
        subject: "Lịch sử",
        homeroomClass: "11B1",
        assignedClasses: ["11B1", "11B2"],
        status: "Hoạt động",
        createdAt: "2026-01-27",
        profile: {
            subject: "Lịch sử",
            phone: "0923344509",
        },
        progress: {
            completionRate: 84,
            attendanceRate: 90,
            averageScore: 7.6,
            pendingLessonPlans: 3,
        },
    },
    {
        id: 20,
        name: "Nguyễn Hữu Tài",
        lastName: "Nguyễn Hữu",
        firstName: "Tài",
        dob: "1992-01-30",
        email: "tai.nh@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0956781234",
        subject: "Địa lý",
        homeroomClass: "12C2",
        assignedClasses: ["12C2", "10A1"],
        status: "Hoạt động",
        createdAt: "2026-01-28",
        profile: {
            subject: "Địa lý",
            phone: "0956781234",
        },
        progress: {
            completionRate: 90,
            attendanceRate: 95,
            averageScore: 8.3,
            pendingLessonPlans: 1,
        },
    },
    {
        id: 21,
        name: "Võ Minh Tâm",
        lastName: "Võ Minh",
        firstName: "Tâm",
        dob: "1995-11-06",
        email: "tam.vm@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0989012345",
        subject: "Tin học",
        homeroomClass: "",
        assignedClasses: ["10A1", "12C1"],
        status: "Hoạt động",
        createdAt: "2026-01-29",
        profile: {
            subject: "Tin học",
            phone: "0989012345",
        },
        progress: {
            completionRate: 94,
            attendanceRate: 97,
            averageScore: 8.6,
            pendingLessonPlans: 1,
        },
    },
    {
        id: 22,
        name: "Lâm Quang Huy",
        lastName: "Lâm Quang",
        firstName: "Huy",
        dob: "1987-05-09",
        email: "huy.lq@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0917788456",
        subject: "Giáo dục công dân",
        homeroomClass: "10A2",
        assignedClasses: ["10A2", "11B1"],
        status: "Tạm khóa",
        createdAt: "2026-01-30",
        profile: {
            subject: "Giáo dục công dân",
            phone: "0917788456",
        },
        progress: {
            completionRate: 75,
            attendanceRate: 85,
            averageScore: 7.0,
            pendingLessonPlans: 6,
        },
    },
    {
        id: 23,
        name: "Quách Bảo Anh",
        lastName: "Quách Bảo",
        firstName: "Anh",
        dob: "1996-08-23",
        email: "anh.qb@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0961122335",
        subject: "Thể dục",
        homeroomClass: "",
        assignedClasses: ["10A1", "11B2", "12C2"],
        status: "Hoạt động",
        createdAt: "2026-01-31",
        profile: {
            subject: "Thể dục",
            phone: "0961122335",
        },
        progress: {
            completionRate: 83,
            attendanceRate: 92,
            averageScore: 8.1,
            pendingLessonPlans: 2,
        },
    },
    {
        id: 24,
        name: "Hồ Thanh Tùng",
        lastName: "Hồ Thanh",
        firstName: "Tùng",
        dob: "1991-10-12",
        email: "tung.ht@teacher.email.edu.vn",
        role: "Giáo viên",
        phone: "0905678912",
        subject: "Công nghệ",
        homeroomClass: "11B2",
        assignedClasses: ["11B2", "12C1"],
        status: "Hoạt động",
        createdAt: "2026-02-01",
        profile: {
            subject: "Công nghệ",
            phone: "0905678912",
        },
        progress: {
            completionRate: 88,
            attendanceRate: 93,
            averageScore: 7.9,
            pendingLessonPlans: 2,
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

const ITEMS_PER_PAGE = 4;

export default function AdminTeachers() {
    const [teachers, setTeachers] = useState(initialTeachers);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
    const [selectedSubject, setSelectedSubject] = useState("Tất cả môn");
    const [activeModalMode, setActiveModalMode] = useState(null);
    const [activeTeacherId, setActiveTeacherId] = useState(null);
    const [teacherForm, setTeacherForm] = useState(emptyTeacherForm);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImportingExcel, setIsImportingExcel] = useState(false);
    const [importFeedback, setImportFeedback] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const subjectOptions = useMemo(() => {
        const subjects = teachers.map((teacher) => teacher.subject).filter(Boolean);
        return ["Tất cả môn", ...new Set(subjects)];
    }, [teachers]);

    const editableSubjectOptions = useMemo(() => {
        const options = subjectOptions.filter((subject) => subject !== "Tất cả môn");
        if (teacherForm.subject && !options.includes(teacherForm.subject)) {
            return [teacherForm.subject, ...options];
        }
        return options;
    }, [subjectOptions, teacherForm.subject]);

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

    const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE));

    const paginatedTeachers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTeachers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTeachers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, selectedSubject]);

    useEffect(() => {
        setCurrentPage((prev) => Math.min(prev, totalPages));
    }, [totalPages]);



    const handleCreateTeacherUser = (formData) => {
        const createdUser = createTeacherFromPayload(formData, Date.now());

        setTeachers((prev) => [createdUser, ...prev]);
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

    const handleShowTeacherDetail = (teacher) => {
        setSelectedTeacher(teacher);
        setShowDetailModal(true);
    };

    const handleDeleteTeacher = (id) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa giáo viên này không?");
        if (!confirmed) return;

        setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));

        if (selectedTeacher?.id === id) {
            setSelectedTeacher(null);
            setShowDetailModal(false);
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

        const savedTeacherName = teacherForm.name.trim();

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

        window.alert(`Đã cập nhật giáo viên ${savedTeacherName} thành công.`);

        handleCloseModal();
    };

    const handleAssignClass = (className) => {
        const normalizedClass = String(className || "").trim().toUpperCase();
        if (!selectedTeacher || !normalizedClass) return;

        setTeachers((prev) =>
            prev.map((teacher) => {
                if (teacher.id !== selectedTeacher.id) return teacher;
                if (teacher.assignedClasses.includes(normalizedClass)) return teacher;

                const updated = {
                    ...teacher,
                    assignedClasses: [...teacher.assignedClasses, normalizedClass],
                };
                setSelectedTeacher(updated);
                return updated;
            })
        );
    };

    const handleRemoveAssignedClass = (className) => {
        if (!selectedTeacher) return;

        setTeachers((prev) =>
            prev.map((teacher) => {
                if (teacher.id !== selectedTeacher.id) return teacher;

                const updated = {
                    ...teacher,
                    assignedClasses: teacher.assignedClasses.filter((item) => item !== className),
                };
                setSelectedTeacher(updated);
                return updated;
            })
        );
    };

    const handleUpdateHomeroomClass = (className) => {
        if (!selectedTeacher) return;

        setTeachers((prev) =>
            prev.map((teacher) => {
                if (teacher.id === selectedTeacher.id) {
                    const updated = {
                        ...teacher,
                        homeroomClass: className,
                    };
                    setSelectedTeacher(updated);
                    return updated;
                }
                return teacher;
            })
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

            <TeacherListSection
                teachers={paginatedTeachers}
                onSelectTeacher={handleShowTeacherDetail}
                onView={handleViewTeacher}
                onEdit={handleEditTeacher}
                onDelete={handleDeleteTeacher}
            />

            <div className="admin-teachers-pagination-row">
                <div className="admin-teachers-pagination" aria-label="Phân trang giáo viên">
                    <button
                        type="button"
                        className="admin-teachers-page-btn"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage <= 1}
                        aria-label="Trang trước"
                    >
                        <FiChevronLeft />
                    </button>

                    <p className="admin-teachers-page-indicator" aria-live="polite">
                        <span>{currentPage}</span>
                        <small>/ {totalPages}</small>
                    </p>

                    <button
                        type="button"
                        className="admin-teachers-page-btn"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        aria-label="Trang sau"
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {activeModalMode && (
                <TeacherInformationSection
                    mode={activeModalMode}
                    formData={teacherForm}
                    classOptions={classOptions}
                    subjectOptions={editableSubjectOptions}
                    onChange={handleTeacherFormChange}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveTeacherEdit}
                />
            )}

            {showDetailModal && selectedTeacher && (
                <TeacherDetailSection
                    mode="view"
                    teacher={selectedTeacher}
                    classOptions={classOptions}
                    onAssignClass={handleAssignClass}
                    onRemoveAssignedClass={handleRemoveAssignedClass}
                    onUpdateHomeroomClass={handleUpdateHomeroomClass}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedTeacher(null);
                    }}
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
