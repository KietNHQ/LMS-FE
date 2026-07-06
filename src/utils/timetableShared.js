export const WEEK_DAYS = [
  { key: "Monday", label: "Thứ 2" },
  { key: "Tuesday", label: "Thứ 3" },
  { key: "Wednesday", label: "Thứ 4" },
  { key: "Thursday", label: "Thứ 5" },
  { key: "Friday", label: "Thứ 6" },
  { key: "Saturday", label: "Thứ 7" },
];

export const ISO_WEEK_DAY_KEYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_KEY_TO_JS_DAY = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const TIMETABLE_CALENDAR_COLORS = ["teal", "blue", "purple", "orange", "red"];

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
  TOAN: "teal",
  VAN: "pink",
  ANH: "blue",
  VL: "orange",
  HOA: "purple",
  SH: "emerald",
  TH: "indigo",
  LS: "amber",
  DL: "cyan",
  GDKTPL: "rose",
  GDTC: "green",
  GDQPAN: "slate",
  CN: "brown",
  HDTN: "sky",
  AN: "violet",
  MT: "fuchsia",
};

export const SUBJECT_DISPLAY = {
  TOAN: "Toán",
  VAN: "Ngữ văn",
  ANH: "Tiếng Anh",
  VL: "Vật lý",
  HOA: "Hóa học",
  SH: "Sinh học",
  TH: "Tin học",
  LS: "Lịch sử",
  DL: "Địa lý",
  GDKTPL: "Giáo dục kinh tế & pháp luật",
  GDTC: "Giáo dục thể chất",
  GDQPAN: "GDQP & AN",
  CN: "Công nghệ",
  HDTN: "HĐTN, Hướng nghiệp",
  AN: "Âm nhạc",
  MT: "Mĩ thuật",
};

/**
 * GDPT 2018 Standards for High School (THPT)
 */
export const GDPT_2018_CONFIG = {
  MAX_WEEKLY_PERIODS: 30,
  QUOTAS: {
    TOAN: 4,
    VAN: 4,
    ANH: 3,
    LS: 2,
    GDTC: 2,
    GDQPAN: 1,
    HDTN: 3,
    VL: 3,
    HOA: 3,
    SH: 3,
    TH: 3,
    DL: 3,
    GDKTPL: 3,
    CN: 3,
  },
  CONSECUTIVE_SUBJECTS: ["TOAN", "VAN", "VL", "HOA", "SH"],
};

export const STATUS_META = {
  normal: { label: "Bình thường", tone: "normal" },
  rescheduled: { label: "Đổi lịch", tone: "rescheduled" },
  cancelled: { label: "Tiết học được nghỉ", tone: "cancelled" },
  holiday: { label: "Nghỉ lễ", tone: "holiday" },
  makeup: { label: "Học bù", tone: "makeup" },
  teacher_changed: { label: "Đổi giáo viên", tone: "rescheduled" },
};

export const MODE_META = {
  offline: "Offline",
  online: "Online",
};

export const ROOM_OPTIONS = [
  "P101", "P102", "P103", "P104", "P105", 
  "P201", "P202", "P203", "P204", "P205",
  "P301", "P302", "Lab 1", "Lab 2", "Lab 3",
  "Sân thể dục", "Hội trường", "Thư viện"
];

export const CLASS_OPTIONS = ["10A1", "10A2", "10A3", "10A4", "11A1", "11A3", "12A1", "12A2", "12A3"];

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

export function formatLocalDateKey(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeTermKey(term) {
  const value = String(term || "").trim().toLowerCase();
  if (value === "1" || value === "hk1" || value === "học kỳ 1" || value === "hoc ky 1") {
    return "hk1";
  }
  if (value === "2" || value === "hk2" || value === "học kỳ 2" || value === "hoc ky 2") {
    return "hk2";
  }
  return value || "hk1";
}

export function getTermDateRange(schoolYear, term) {
  const startYear = Number.parseInt(String(schoolYear || "").split("-")[0], 10);
  const baseYear = Number.isFinite(startYear) ? startYear : new Date().getFullYear();
  const normalizedTerm = normalizeTermKey(term);

  if (normalizedTerm === "hk2") {
    return {
      startDate: new Date(baseYear + 1, 1, 1),
      endDate: new Date(baseYear + 1, 5, 30),
    };
  }

  return {
    startDate: new Date(baseYear, 8, 1),
    endDate: new Date(baseYear + 1, 0, 31),
  };
}

function resolveDayKey(value) {
  if (ISO_WEEK_DAY_KEYS.includes(value)) {
    return value;
  }

  const dayNumber = Number(value);
  if (!Number.isFinite(dayNumber)) {
    return "Monday";
  }

  if (dayNumber === 1) return "Sunday";
  if (dayNumber >= 2 && dayNumber <= 7) return ISO_WEEK_DAY_KEYS[dayNumber - 2];
  if (dayNumber === 8) return "Sunday";
  if (dayNumber === 0) return "Sunday";

  return "Monday";
}

function stableColorFromText(text) {
  const value = String(text || "");
  const hash = value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TIMETABLE_CALENDAR_COLORS[hash % TIMETABLE_CALENDAR_COLORS.length];
}

export function normalizeTimetableLesson(rawLesson = {}, index = 0) {
  const subjectKey = rawLesson.subjectKey || rawLesson.subjectCode || rawLesson.subject_code || "";
  const subjectName =
    rawLesson.subject ||
    rawLesson.subjectName ||
    rawLesson.subject_name ||
    SUBJECT_DISPLAY[subjectKey] ||
    subjectKey ||
    "Môn học";
  const periodStart = Number(
    rawLesson.periodStart ??
      rawLesson.period_number ??
      rawLesson.periodNumber ??
      rawLesson.period ??
      1,
  );
  const periodEnd = Number(
    rawLesson.periodEnd ??
      rawLesson.period_end ??
      rawLesson.periodNumberEnd ??
      rawLesson.period_number_end ??
      rawLesson.period_number ??
      rawLesson.period ??
      periodStart,
  );
  const day = resolveDayKey(rawLesson.day ?? rawLesson.dayOfWeek ?? rawLesson.day_of_week);
  const startSlot = PERIOD_BY_ID[periodStart];
  const endSlot = PERIOD_BY_ID[periodEnd] || startSlot;

  return {
    id: rawLesson.id || `lesson-${index}`,
    day,
    jsDay: DAY_KEY_TO_JS_DAY[day],
    periodStart,
    periodEnd,
    subject: subjectName,
    subjectKey,
    teacher: rawLesson.teacher || rawLesson.teacherName || rawLesson.teacher_name || "Chưa phân công",
    room: rawLesson.room || rawLesson.roomName || rawLesson.room_name || "—",
    classId: rawLesson.classId || rawLesson.class_id || null,
    className: rawLesson.className || rawLesson.class_name || "",
    status: rawLesson.status || "normal",
    mode: rawLesson.mode || "offline",
    note: rawLesson.note || rawLesson.notes || "",
    color: rawLesson.color || SUBJECT_COLOR_MAP[subjectKey] || stableColorFromText(subjectName),
    start: rawLesson.start || rawLesson.start_time || startSlot?.start || "",
    end: rawLesson.end || rawLesson.end_time || endSlot?.end || "",
  };
}

function getFirstWeekdayOnOrAfter(startDate, jsDay) {
  const date = new Date(startDate);
  const diff = (jsDay - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  return date;
}

function buildTimetableEventContent(lesson, { includeClassName = true, includeTeacher = true } = {}) {
  const parts = [];
  if (includeClassName && lesson.className) parts.push(`Lớp ${lesson.className}`);
  parts.push(`Tiết ${lesson.periodStart}${lesson.periodEnd > lesson.periodStart ? `-${lesson.periodEnd}` : ""}`);
  if (lesson.room && lesson.room !== "—") parts.push(`Phòng ${lesson.room}`);
  if (includeTeacher && lesson.teacher) parts.push(`GV ${lesson.teacher}`);
  return parts.join(" • ");
}

export function mapTimetableLessonsToCalendarEvents(lessons = [], options = {}) {
  const {
    schoolYear,
    term,
    sourceLabel = "Thời khóa biểu",
    defaultColor = "purple",
    includeClassName = true,
    includeTeacher = true,
  } = options;
  const { startDate, endDate } = getTermDateRange(schoolYear, term);

  return (Array.isArray(lessons) ? lessons : [])
    .map((lesson, index) => normalizeTimetableLesson(lesson, index))
    .flatMap((lesson) => {
      const firstDate = getFirstWeekdayOnOrAfter(startDate, lesson.jsDay);
      const events = [];
      const cursor = new Date(firstDate);

      while (cursor <= endDate) {
        const dateKey = formatLocalDateKey(cursor);
        events.push({
          id: `timetable-${lesson.id}-${dateKey}`,
          date: dateKey,
          endDate: dateKey,
          title: lesson.subject,
          content: buildTimetableEventContent(lesson, { includeClassName, includeTeacher }),
          color: defaultColor || lesson.color || "purple",
          createdBy: sourceLabel,
          createdRole: "Tự đồng bộ",
          target: lesson.classId ? String(lesson.classId) : "all",
          source: "timetable",
          lessonId: lesson.id,
          classId: lesson.classId,
        });
        cursor.setDate(cursor.getDate() + 7);
      }

      return events;
    });
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
  else if ((weekNumber + idx) % 17 === 0) status = "teacher_changed";
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
