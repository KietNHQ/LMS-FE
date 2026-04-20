export const WEEK_DAYS = [
  { key: "Monday", label: "Thứ 2" },
  { key: "Tuesday", label: "Thứ 3" },
  { key: "Wednesday", label: "Thứ 4" },
  { key: "Thursday", label: "Thứ 5" },
  { key: "Friday", label: "Thứ 6" },
];

export const PERIOD_SLOTS = [
  { period: 1, start: "07:00", end: "07:45" },
  { period: 2, start: "07:50", end: "08:35" },
  { period: 3, start: "08:45", end: "09:30" },
  { period: 4, start: "09:35", end: "10:20" },
  { period: 5, start: "10:30", end: "11:15" },
  { period: 6, start: "13:00", end: "13:45" },
  { period: 7, start: "13:50", end: "14:35" },
  { period: 8, start: "14:45", end: "15:30" },
  { period: 9, start: "15:35", end: "16:20" },
  { period: 10, start: "16:25", end: "17:10" },
];

const PERIOD_BY_ID = PERIOD_SLOTS.reduce((acc, item) => {
  acc[item.period] = item;
  return acc;
}, {});

export const SUBJECT_COLOR_MAP = {
  Toan: "teal",
  NguVan: "pink",
  TiengAnh: "blue",
  VatLy: "orange",
  HoaHoc: "purple",
  SinhHoc: "emerald",
  TinHoc: "indigo",
  LichSu: "amber",
  DiaLy: "cyan",
  GDCD: "rose",
};

export const SUBJECT_DISPLAY = {
  Toan: "Toan",
  NguVan: "Ngu van",
  TiengAnh: "Tieng Anh",
  VatLy: "Vat ly",
  HoaHoc: "Hoa hoc",
  SinhHoc: "Sinh hoc",
  TinHoc: "Tin hoc",
  LichSu: "Lich su",
  DiaLy: "Dia ly",
  GDCD: "GDCD",
};

export const STATUS_META = {
  normal: { label: "Binh thuong", tone: "normal" },
  rescheduled: { label: "Doi lich", tone: "rescheduled" },
  cancelled: { label: "Huy", tone: "cancelled" },
  holiday: { label: "Nghi le", tone: "holiday" },
  makeup: { label: "Hoc bu", tone: "makeup" },
};

export const MODE_META = {
  offline: "Offline",
  online: "Online",
};

export const CLASS_OPTIONS = ["10A1", "10A2", "11B1", "12A2"];

export const STUDENT_DIRECTORY = [
  {
    studentId: "STU1024",
    childId: "child1",
    name: "Nguyen Minh Tuan",
    className: "10A1",
  },
  {
    studentId: "STU0891",
    childId: "child2",
    name: "Nguyen Thi Ngoc Ha",
    className: "12A2",
  },
];

const CLASS_TEMPLATE = {
  "10A1": [
    { day: "Monday", periodStart: 1, periodEnd: 2, subject: "Toan", teacher: "Tran Thi Huong", room: "P201", note: "Kiểm tra 1 tiết - Chương hàm số", mode: "offline" },
    { day: "Monday", periodStart: 3, periodEnd: 3, subject: "NguVan", teacher: "Pham Van Long", room: "P105", note: "Van ban tu su", mode: "offline" },
    { day: "Tuesday", periodStart: 1, periodEnd: 1, subject: "TiengAnh", teacher: "Nguyen Thi Mai", room: "P302", note: "Unit 6 speaking", mode: "offline" },
    { day: "Tuesday", periodStart: 8, periodEnd: 8, subject: "TinHoc", teacher: "Vu Minh", room: "Lab3", note: "Luyen tap HTML", mode: "online" },
    { day: "Wednesday", periodStart: 4, periodEnd: 5, subject: "VatLy", teacher: "Do Hai Yen", room: "P205", note: "Dinh luat II Newton", mode: "offline" },
    { day: "Thursday", periodStart: 6, periodEnd: 7, subject: "HoaHoc", teacher: "Le Van Minh", room: "Lab1", note: "Phan ung oxi hoa", mode: "offline" },
    { day: "Friday", periodStart: 2, periodEnd: 2, subject: "LichSu", teacher: "Ngo Duc", room: "P104", note: "Van minh co dai", mode: "offline" },
    { day: "Friday", periodStart: 9, periodEnd: 10, subject: "SinhHoc", teacher: "Pham Thi Lan", room: "Lab2", note: "Cau truc te bao", mode: "offline" },
  ],
  "10A2": [
    { day: "Monday", periodStart: 1, periodEnd: 1, subject: "Toan", teacher: "Tran Thi Huong", room: "P202", note: "Ham so bac nhat", mode: "offline" },
    { day: "Tuesday", periodStart: 3, periodEnd: 4, subject: "VatLy", teacher: "Do Hai Yen", room: "P204", note: "Cong va cong suat", mode: "offline" },
    { day: "Wednesday", periodStart: 6, periodEnd: 6, subject: "TiengAnh", teacher: "Nguyen Thi Mai", room: "P302", note: "Listening practice", mode: "offline" },
    { day: "Thursday", periodStart: 8, periodEnd: 8, subject: "DiaLy", teacher: "Vo Van Khanh", room: "P110", note: "Ban do khi hau", mode: "offline" },
    { day: "Friday", periodStart: 2, periodEnd: 3, subject: "NguVan", teacher: "Pham Van Long", room: "P105", note: "Tac pham hien dai", mode: "offline" },
  ],
  "11B1": [
    { day: "Monday", periodStart: 1, periodEnd: 1, subject: "HoaHoc", teacher: "Le Van Minh", room: "Lab1", note: "Hoa huu co", mode: "offline" },
    { day: "Tuesday", periodStart: 7, periodEnd: 8, subject: "Toan", teacher: "Tran Thi Huong", room: "P203", note: "Luong giac", mode: "offline" },
    { day: "Thursday", periodStart: 5, periodEnd: 5, subject: "GDCD", teacher: "Huong Nguyen", room: "P115", note: "Quyen cong dan", mode: "online" },
  ],
  "12A2": [
    { day: "Monday", periodStart: 1, periodEnd: 1, subject: "Toan", teacher: "Tran Thi Huong", room: "P401", note: "Dao ham ung dung", mode: "offline" },
    { day: "Monday", periodStart: 2, periodEnd: 3, subject: "VatLy", teacher: "Do Hai Yen", room: "P301", note: "On tap dien xoay chieu", mode: "offline" },
    { day: "Tuesday", periodStart: 1, periodEnd: 1, subject: "TiengAnh", teacher: "Nguyen Thi Mai", room: "P402", note: "Mock test reading", mode: "offline" },
    { day: "Wednesday", periodStart: 6, periodEnd: 7, subject: "HoaHoc", teacher: "Le Van Minh", room: "Lab4", note: "On thi THPT", mode: "offline" },
    { day: "Thursday", periodStart: 1, periodEnd: 1, subject: "NguVan", teacher: "Pham Van Long", room: "P105", note: "Nghi luan xa hoi", mode: "offline" },
    { day: "Friday", periodStart: 1, periodEnd: 1, subject: "SinhHoc", teacher: "Pham Thi Lan", room: "Lab2", note: "Di truyen hoc", mode: "offline" },
  ],
};

export function getStartOfIsoWeek(inputDate = new Date()) {
  const date = new Date(inputDate);
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return date;
}

export function shiftWeek(weekStart, offset) {
  const result = new Date(weekStart);
  result.setDate(result.getDate() + offset * 7);
  return getStartOfIsoWeek(result);
}

export function formatWeekRangeLabel(weekStart) {
  const monday = getStartOfIsoWeek(weekStart);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const f = (d) => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${f(monday)} - ${f(friday)}`;
}

function getWeekNumber(dateValue) {
  const date = getStartOfIsoWeek(dateValue);
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + 3);

  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const firstWeek = getStartOfIsoWeek(firstThursday);
  return 1 + Math.round((thursday.getTime() - firstWeek.getTime()) / 604800000);
}

function enrichLesson(baseLesson, className, weekNumber, idx) {
  const color = SUBJECT_COLOR_MAP[baseLesson.subject] || "teal";

  let status = "normal";
  if ((weekNumber + idx) % 11 === 0) status = "cancelled";
  else if ((weekNumber + idx) % 7 === 0) status = "rescheduled";
  else if ((weekNumber + idx) % 5 === 0) status = "makeup";
  else if ((weekNumber + idx) % 13 === 0) status = "holiday";

  const periodStart = PERIOD_BY_ID[baseLesson.periodStart];
  const periodEnd = PERIOD_BY_ID[baseLesson.periodEnd];

  return {
    id: `${className}-${baseLesson.day}-${baseLesson.periodStart}-${baseLesson.periodEnd}-${idx}`,
    className,
    day: baseLesson.day,
    subject: SUBJECT_DISPLAY[baseLesson.subject] || baseLesson.subject,
    subjectKey: baseLesson.subject,
    teacher: baseLesson.teacher,
    room: baseLesson.room,
    periodStart: baseLesson.periodStart,
    periodEnd: baseLesson.periodEnd,
    start: periodStart?.start || "",
    end: periodEnd?.end || "",
    timeRange: `${periodStart?.start || ""} - ${periodEnd?.end || ""}`,
    note: baseLesson.note,
    status,
    mode: baseLesson.mode || "offline",
    color,
  };
}

export function getClassWeekLessons(className, weekStart) {
  const weekNumber = getWeekNumber(weekStart);
  const template = CLASS_TEMPLATE[className] || [];
  return template.map((lesson, index) => enrichLesson(lesson, className, weekNumber, index));
}

export function getStudentById(studentId) {
  return STUDENT_DIRECTORY.find((item) => item.studentId === studentId) || null;
}

export function getStudentByChildId(childId) {
  return STUDENT_DIRECTORY.find((item) => item.childId === childId) || null;
}

export function getStudentWeekLessonsById(studentId, weekStart) {
  const student = getStudentById(studentId);
  if (!student) return [];
  return getClassWeekLessons(student.className, weekStart);
}

export function getTeacherWeekLessons(weekStart, classFilter = "Tat ca") {
  const normalizedFilter = String(classFilter || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
  const classes = normalizedFilter === "tat ca" ? CLASS_OPTIONS : [classFilter];
  return classes.flatMap((className) => getClassWeekLessons(className, weekStart));
}

export function getLessonsByDayAndPeriod(lessons) {
  const map = new Map();
  lessons.forEach((lesson) => {
    for (let period = lesson.periodStart; period <= lesson.periodEnd; period += 1) {
      const key = `${lesson.day}-${period}`;
      const current = map.get(key) || [];
      map.set(key, [...current, lesson]);
    }
  });
  return map;
}

export function buildAdminInitialSessions() {
  const weekStart = getStartOfIsoWeek(new Date());
  return CLASS_OPTIONS.flatMap((className) =>
    getClassWeekLessons(className, weekStart).map((lesson, idx) => ({
      id: Number(`${Math.abs(className.split("")[0].charCodeAt(0))}${idx}${lesson.periodStart}`),
      year: "2025-2026",
      term: "hk2",
      className,
      day: WEEK_DAYS.find((d) => d.key === lesson.day)?.label || lesson.day,
      period: lesson.periodStart,
      periodEnd: lesson.periodEnd,
      subject: lesson.subject,
      teacher: lesson.teacher,
      room: lesson.room,
      status: STATUS_META[lesson.status]?.label || STATUS_META.normal.label,
      note: lesson.note,
      mode: MODE_META[lesson.mode] || MODE_META.offline,
      color: lesson.color,
      start: lesson.start,
      end: lesson.end,
    }))
  );
}

export function getPeriodRangeLabel(periodStart, periodEnd = periodStart) {
  const startSlot = PERIOD_BY_ID[periodStart];
  const endSlot = PERIOD_BY_ID[periodEnd];
  if (!startSlot || !endSlot) return "";
  return `${startSlot.start} - ${endSlot.end}`;
}
