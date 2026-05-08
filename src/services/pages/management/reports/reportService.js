const SCHOOL_YEAR_OPTIONS = ["2024-2025", "2025-2026"];
const TERM_OPTIONS = ["HK1", "HK2", "ALL"];

const CLASS_OPTIONS = [
  { value: "all", label: "Tất cả lớp" },
  { value: "10A1", label: "Lớp 10A1" },
  { value: "10A2", label: "Lớp 10A2" },
  { value: "11B1", label: "Lớp 11B1" },
  { value: "11B2", label: "Lớp 11B2" },
  { value: "12C1", label: "Lớp 12C1" },
  { value: "12C3", label: "Lớp 12C3" },
];

const TEACHER_OPTIONS = [
  { value: "all", label: "Tất cả giáo viên" },
  { value: "T001", label: "Nguyễn Văn An" },
  { value: "T002", label: "Trần Thị Bình" },
  { value: "T003", label: "Lê Quốc Cường" },
];

const BASE_TEACHER_ANALYSIS = [
  {
    teacherId: "T001",
    teacherName: "Nguyễn Văn An",
    subject: "Toán",
    avgAssignedClasses: 7.62,
    assignedClasses: [
      { classId: "10A1", classAverageScore: 7.8, attendance: 98, rank: 1, benchmark: 7.4 },
      { classId: "10A2", classAverageScore: 7.2, attendance: 95, rank: 3, benchmark: 7.4 },
      { classId: "11B1", classAverageScore: 7.7, attendance: 96, rank: 2, benchmark: 7.4 },
    ],
    proficiency: { lessonPlans: 95, grading: 92, feedback: 88 }
  },
  {
    teacherId: "T002",
    teacherName: "Trần Thị Bình",
    subject: "Ngữ văn",
    avgAssignedClasses: 7.25,
    assignedClasses: [
      { classId: "11B2", classAverageScore: 7.1, attendance: 92, rank: 4, benchmark: 7.2 },
      { classId: "12C1", classAverageScore: 8.3, attendance: 99, rank: 1, benchmark: 7.2 },
      { classId: "12C3", classAverageScore: 7.4, attendance: 94, rank: 2, benchmark: 7.2 },
    ],
    proficiency: { lessonPlans: 98, grading: 95, feedback: 91 }
  },
  {
    teacherId: "T003",
    teacherName: "Lê Quốc Cường",
    subject: "Tiếng Anh",
    avgAssignedClasses: 7.42,
    assignedClasses: [
      { classId: "10A1", classAverageScore: 7.4, attendance: 95, rank: 2, benchmark: 7.3 },
      { classId: "11B1", classAverageScore: 8.5, attendance: 98, rank: 1, benchmark: 7.3 },
      { classId: "12C3", classAverageScore: 7.3, attendance: 92, rank: 3, benchmark: 7.3 },
    ],
    proficiency: { lessonPlans: 92, grading: 89, feedback: 85 }
  },
];

const BASE_GRADE_OVERVIEW = [
  {
    grade: "Khối 10",
    averageScore: 7.38,
    star: 4.2,
    classes: [
      { classId: "10A1", averageScore: 7.8, star: 4.5, violations: 12, fund: 5200000 },
      { classId: "10A2", averageScore: 7.2, star: 3.9, violations: 25, fund: 3100000 },
    ],
  },
  {
    grade: "Khối 11",
    averageScore: 7.28,
    star: 4.0,
    classes: [
      { classId: "11B1", averageScore: 7.5, star: 4.2, violations: 18, fund: 4800000 },
      { classId: "11B2", averageScore: 7.1, star: 3.8, violations: 32, fund: 2500000 },
    ],
  },
  {
    grade: "Khối 12",
    averageScore: 7.33,
    star: 4.1,
    classes: [
      { classId: "12C1", averageScore: 7.3, star: 4.0, violations: 10, fund: 6000000 },
      { classId: "12C3", averageScore: 7.4, star: 4.2, violations: 15, fund: 4200000 },
    ],
  },
];

const REPORT_SOURCE = {
  "2024-2025": {
    HK1: {
      summary: {
        totalStudents: 1160,
        schoolAverageScore: 7.05,
        attendanceRate: 94.6,
        totalRevenue: 1760000000,
      },
      academic: [
        { name: "Tốt", value: 310 },
        { name: "Khá", value: 470 },
        { name: "Trung bình", value: 290 },
        { name: "Yếu", value: 90 },
      ],
      honorRoll: [
        { name: "Nguyễn Hoàng Nam", class: "12C1", gpa: 9.6, avatar: "N" },
        { name: "Lê Minh Anh", class: "11B1", gpa: 9.4, avatar: "L" },
        { name: "Trần Đức Tâm", class: "10A1", gpa: 9.3, avatar: "T" },
        { name: "Phạm Thảo Vy", class: "12C1", gpa: 9.2, avatar: "P" },
        { name: "Đặng Gia Bảo", class: "11B1", gpa: 9.1, avatar: "Đ" },
      ],
      subjectDist: [
        { subject: "Toán", tot: 35, kha: 45, tb: 15, yeu: 5 },
        { subject: "Ngữ văn", tot: 30, kha: 50, tb: 15, yeu: 5 },
        { subject: "Tiếng Anh", tot: 25, kha: 45, tb: 20, yeu: 10 },
        { subject: "Vật lý", tot: 28, kha: 42, tb: 20, yeu: 10 },
        { subject: "Hóa học", tot: 32, kha: 40, tb: 20, yeu: 8 },
      ],
      attendance: [
        { period: "Tháng 9", onTime: 92.1, late: 2.5, absent: 5.4 },
        { period: "Tháng 10", onTime: 91.7, late: 3.0, absent: 5.3 },
        { period: "Tháng 11", onTime: 90.2, late: 4.1, absent: 5.7 },
        { period: "Tháng 12", onTime: 91.4, late: 3.2, absent: 5.4 },
      ],
      attendanceByDay: [
        { day: "Thứ 2", rate: 96.5 },
        { day: "Thứ 3", rate: 95.8 },
        { day: "Thứ 4", rate: 95.2 },
        { day: "Thứ 5", rate: 94.7 },
        { day: "Thứ 6", rate: 93.1 },
      ],
      attendanceAlerts: [
        { name: "Bùi Tiến Dũng", class: "11B2", absences: 8, lates: 5 },
        { name: "Vũ Phương Thảo", class: "10A2", absences: 6, lates: 12 },
        { name: "Nguyễn Mai Linh", class: "12C3", absences: 5, lates: 3 },
      ],
      classDeepDive: {
        violations: [
          { type: "Đồng phục", value: 35 },
          { type: "Điện thoại", value: 25 },
          { type: "Mất trật tự", value: 20 },
          { type: "Đi muộn", value: 15 },
          { type: "Khác", value: 5 },
        ],
        fundLedger: [
          { date: "15/09", content: "Thu quỹ học kỳ 1", amount: 15000000, type: "revenue" },
          { date: "20/09", content: "Mua dụng cụ vệ sinh", amount: 1200000, type: "expense" },
          { date: "05/10", content: "Chi trung thu cho lớp", amount: 3500000, type: "expense" },
          { date: "20/10", content: "Khen thưởng thi đua tuần", amount: 500000, type: "revenue" },
          { date: "20/11", content: "Quà tặng 20/11 thầy cô", amount: 4500000, type: "expense" },
        ]
      },
      subjects: [
        { subject: "Toán", averageScore: 7.4 },
        { subject: "Ngữ văn", averageScore: 7.1 },
        { subject: "Tiếng Anh", averageScore: 6.8 },
        { subject: "Vật lý", averageScore: 7.0 },
        { subject: "Hóa học", averageScore: 6.9 },
      ],
      finance: [
        { period: "Tháng 9", amount: 320000000, expense: 180000000 },
        { period: "Tháng 10", amount: 360000000, expense: 195000000 },
        { period: "Tháng 11", amount: 340000000, expense: 190000000 },
        { period: "Tháng 12", amount: 370000000, expense: 210000000 },
      ],
      financeDetails: {
        revenue: [
          { category: "Học phí chính khóa", amount: 1250000000 },
          { category: "Phí cơ sở vật chất", amount: 250000000 },
          { category: "Dịch vụ bán trú", amount: 180000000 },
          { category: "Dịch vụ xe đưa đón", amount: 80000000 },
        ],
        expense: [
          { category: "Lương & Thưởng GV", amount: 1150000000 },
          { category: "Vận hành & Điện nước", amount: 220000000 },
          { category: "Bảo trì thiết bị", amount: 180000000 },
          { category: "Sự kiện & Phong trào", amount: 141200000 },
        ]
      },
      teacherPerformance: [
        { teacher: "Nguyễn Văn An", score: 84 },
        { teacher: "Trần Thị Bình", score: 79 },
        { teacher: "Lê Quốc Cường", score: 81 },
      ],
    },
    HK2: {
        summary: {
            totalStudents: 1168,
            schoolAverageScore: 7.24,
            attendanceRate: 95.1,
            totalRevenue: 1890000000,
          },
          academic: [
            { name: "Tốt", value: 345 },
            { name: "Khá", value: 485 },
            { name: "Trung bình", value: 260 },
            { name: "Yếu", value: 78 },
          ],
          honorRoll: [
            { name: "Nguyễn Hoàng Nam", class: "12C1", gpa: 9.8, avatar: "N" },
            { name: "Lê Minh Anh", class: "11B1", gpa: 9.7, avatar: "L" },
            { name: "Trần Đức Tâm", class: "10A1", gpa: 9.5, avatar: "T" },
            { name: "Phạm Thảo Vy", class: "12C1", gpa: 9.4, avatar: "P" },
            { name: "Đặng Gia Bảo", class: "11B1", gpa: 9.3, avatar: "Đ" },
          ],
          subjectDist: [
            { subject: "Toán", tot: 42, kha: 40, tb: 13, yeu: 5 },
            { subject: "Ngữ văn", tot: 35, kha: 45, tb: 15, yeu: 5 },
            { subject: "Tiếng Anh", tot: 30, kha: 45, tb: 20, yeu: 5 },
            { subject: "Vật lý", tot: 31, kha: 44, tb: 20, yeu: 5 },
            { subject: "Hóa học", tot: 35, kha: 40, tb: 20, yeu: 5 },
          ],
          attendance: [
            { period: "Tháng 2", onTime: 93.9, late: 2.1, absent: 4.0 },
            { period: "Tháng 3", onTime: 94.0, late: 1.8, absent: 4.2 },
            { period: "Tháng 4", onTime: 94.2, late: 1.6, absent: 4.2 },
            { period: "Tháng 5", onTime: 94.4, late: 1.5, absent: 4.1 },
          ],
          attendanceByDay: [
            { day: "Thứ 2", rate: 97.1 },
            { day: "Thứ 3", rate: 96.5 },
            { day: "Thứ 4", rate: 95.8 },
            { day: "Thứ 5", rate: 95.2 },
            { day: "Thứ 6", rate: 94.4 },
          ],
          attendanceAlerts: [
            { name: "Đỗ Mạnh Hùng", class: "12C3", absences: 7, lates: 4 },
            { name: "Lương Thu Trang", class: "11B2", absences: 5, lates: 8 },
          ],
          classDeepDive: {
            violations: [
              { type: "Đồng phục", value: 25 },
              { type: "Điện thoại", value: 35 },
              { type: "Mất trật tự", value: 25 },
              { type: "Đi muộn", value: 10 },
              { type: "Khác", value: 5 },
            ],
            fundLedger: [
              { date: "05/02", content: "Khen thưởng hoàn thành kế hoạch 1", amount: 1000000, type: "revenue" },
              { date: "08/03", content: "Quà tặng 8/3 học sinh nữ", amount: 2500000, type: "expense" },
              { date: "26/3", content: "Tổ chức cắm trại 26/3", amount: 8000000, type: "expense" },
            ]
          },
          subjects: [
            { subject: "Toán", averageScore: 7.6 },
            { subject: "Ngữ văn", averageScore: 7.3 },
            { subject: "Tiếng Anh", averageScore: 7.1 },
            { subject: "Vật lý", averageScore: 7.2 },
            { subject: "Hóa học", averageScore: 7.0 },
          ],
          finance: [
            { period: "Tháng 2", amount: 420000000, expense: 220000000 },
            { period: "Tháng 3", amount: 470000000, expense: 240000000 },
            { period: "Tháng 4", amount: 500000000, expense: 265000000 },
            { period: "Tháng 5", amount: 500000000, expense: 266200000 },
          ],
          financeDetails: {
            revenue: [
              { category: "Học phí chính khóa", amount: 1350000000 },
              { category: "Phí cơ sở vật chất", amount: 280000000 },
              { category: "Dịch vụ bán trú", amount: 195000000 },
              { category: "Dịch vụ xe đưa đón", amount: 65000000 },
            ],
            expense: [
              { category: "Lương & Thưởng GV", amount: 1250000000 },
              { category: "Vận hành & Điện nước", amount: 240000000 },
              { category: "Bảo trì thiết bị", amount: 200000000 },
              { category: "Sự kiện & Phong trào", amount: 201200000 },
            ]
          },
          teacherPerformance: [
            { teacher: "Nguyễn Văn An", score: 86 },
            { teacher: "Trần Thị Bình", score: 82 },
            { teacher: "Lê Quốc Cường", score: 84 },
          ],
    }
  },
  "2025-2026": {
    HK1: {
      summary: {
        totalStudents: 1240,
        schoolAverageScore: 7.42,
        attendanceRate: 95.8,
        totalRevenue: 2150000000,
      },
      academic: [
        { name: "Tốt", value: 420 },
        { name: "Khá", value: 510 },
        { name: "Trung bình", value: 250 },
        { name: "Yếu", value: 60 },
      ],
      honorRoll: [
        { name: "Trịnh Gia Huy", class: "12C1", gpa: 9.8, avatar: "T" },
        { name: "Võ Minh Tú", class: "11B1", gpa: 9.6, avatar: "V" },
        { name: "Lý Hải Đăng", class: "10A1", gpa: 9.5, avatar: "L" },
        { name: "Hoàng Ngọc Mai", class: "12C1", gpa: 9.4, avatar: "H" },
      ],
      subjectDist: [
        { subject: "Toán", tot: 45, kha: 42, tb: 10, yeu: 3 },
        { subject: "Ngữ văn", tot: 38, kha: 45, tb: 15, yeu: 2 },
        { subject: "Tiếng Anh", tot: 35, kha: 45, tb: 15, yeu: 5 },
        { subject: "Vật lý", tot: 34, kha: 46, tb: 15, yeu: 5 },
        { subject: "Hóa học", tot: 36, kha: 44, tb: 15, yeu: 5 },
      ],
      attendance: [
        { period: "Tháng 9", onTime: 94.1, late: 1.5, absent: 4.4 },
        { period: "Tháng 10", onTime: 93.6, late: 1.8, absent: 4.6 },
        { period: "Tháng 11", onTime: 93.7, late: 1.6, absent: 4.7 },
        { period: "Tháng 12", onTime: 93.8, late: 1.6, absent: 4.6 },
      ],
      attendanceByDay: [
        { day: "Thứ 2", rate: 97.5 },
        { day: "Thứ 3", rate: 96.8 },
        { day: "Thứ 4", rate: 96.2 },
        { day: "Thứ 5", rate: 95.7 },
        { day: "Thứ 6", rate: 94.1 },
      ],
      attendanceAlerts: [
        { name: "Lâm Quốc Anh", class: "10A1", absences: 5, lates: 2 },
        { name: "Mai Anh Đào", class: "11B2", absences: 4, lates: 10 },
      ],
      classDeepDive: {
        violations: [
          { type: "Đồng phục", value: 15 },
          { type: "Điện thoại", value: 10 },
          { type: "Mất trật tự", value: 45 },
          { type: "Đi muộn", value: 25 },
          { type: "Khác", value: 5 },
        ],
        fundLedger: [
          { date: "10/09", content: "Thu quỹ lớp cả năm", amount: 25000000, type: "revenue" },
          { date: "20/10", content: "Hoạt động chào mừng 20/10", amount: 5000000, type: "expense" },
          { date: "20/11", content: "Tri ân thầy cô 20/11", amount: 6000000, type: "expense" },
        ]
      },
      subjects: [
        { subject: "Toán", averageScore: 7.8 },
        { subject: "Ngữ văn", averageScore: 7.2 },
        { subject: "Tiếng Anh", averageScore: 7.4 },
        { subject: "Vật lý", averageScore: 7.3 },
        { subject: "Hóa học", averageScore: 7.1 },
      ],
      finance: [
        { period: "Tháng 9", amount: 420000000, expense: 220000000 },
        { period: "Tháng 10", amount: 430000000, expense: 225000000 },
        { period: "Tháng 11", amount: 440000000, expense: 230000000 },
        { period: "Tháng 12", amount: 430000000, expense: 225000000 },
      ],
      financeDetails: {
        revenue: [
          { category: "Học phí chính khóa", amount: 1550000000 },
          { category: "Phí cơ sở vật chất", amount: 320000000 },
          { category: "Dịch vụ bán trú", amount: 210000000 },
          { category: "Dịch vụ xe đưa đón", amount: 70000000 },
        ],
        expense: [
          { category: "Lương & Thưởng GV", amount: 1450000000 },
          { category: "Vận hành & Điện nước", amount: 280000000 },
          { category: "Bảo trì thiết bị", amount: 220000000 },
          { category: "Sự kiện & Phong trào", amount: 200000000 },
        ]
      },
      teacherPerformance: [
        { teacher: "Nguyễn Văn An", score: 88 },
        { teacher: "Trần Thị Bình", score: 84 },
        { teacher: "Lê Quốc Cường", score: 86 },
      ],
    },
    HK2: {
        summary: {
            totalStudents: 1256,
            schoolAverageScore: 7.56,
            attendanceRate: 96.2,
            totalRevenue: 2230000000,
          },
          academic: [
            { name: "Tốt", value: 452 },
            { name: "Khá", value: 535 },
            { name: "Trung bình", value: 214 },
            { name: "Yếu", value: 55 },
          ],
          honorRoll: [
            { name: "Trịnh Gia Huy", class: "12C1", gpa: 9.9, avatar: "T" },
            { name: "Võ Minh Tú", class: "11B1", gpa: 9.8, avatar: "V" },
          ],
          subjectDist: [
            { subject: "Toán", tot: 51, kha: 38, tb: 10, yeu: 1 },
            { subject: "Ngữ văn", tot: 42, kha: 45, tb: 10, yeu: 3 },
            { subject: "Tiếng Anh", tot: 38, kha: 45, tb: 15, yeu: 2 },
            { subject: "Vật lý", tot: 38, kha: 46, tb: 13, yeu: 3 },
            { subject: "Hóa học", tot: 40, kha: 45, tb: 12, yeu: 3 },
          ],
          attendance: [
            { period: "Tháng 2", onTime: 95.0, late: 1.2, absent: 3.8 },
            { period: "Tháng 3", onTime: 95.2, late: 1.1, absent: 3.7 },
            { period: "Tháng 4", onTime: 95.4, late: 1.0, absent: 3.6 },
            { period: "Tháng 5", onTime: 95.1, late: 1.2, absent: 3.7 },
          ],
          attendanceByDay: [
            { day: "Thứ 2", rate: 98.1 },
            { day: "Thứ 3", rate: 97.2 },
            { day: "Thứ 4", rate: 96.8 },
            { day: "Thứ 5", rate: 96.5 },
            { day: "Thứ 6", rate: 95.4 },
          ],
          attendanceAlerts: [],
          classDeepDive: {
            violations: [
              { type: "Đồng phục", value: 10 },
              { type: "Điện thoại", value: 10 },
              { type: "Mất trật tự", value: 35 },
              { type: "Đi muộn", value: 40 },
              { type: "Khác", value: 5 },
            ],
            fundLedger: [
              { date: "15/02", content: "Khen thưởng kỳ thi HSG", amount: 2000000, type: "revenue" },
              { date: "26/03", content: "Chi phí tham gia hội trại", amount: 12000000, type: "expense" },
              { date: "15/05", content: "Liên hoan cuối năm", amount: 5000000, type: "expense" },
            ]
          },
          subjects: [
            { subject: "Toán", averageScore: 8.0 },
            { subject: "Ngữ văn", averageScore: 7.4 },
            { subject: "Tiếng Anh", averageScore: 7.6 },
            { subject: "Vật lý", averageScore: 7.5 },
            { subject: "Hóa học", averageScore: 7.3 },
          ],
          finance: [
            { period: "Tháng 2", amount: 550000000, expense: 280000000 },
            { period: "Tháng 3", amount: 560000000, expense: 285000000 },
            { period: "Tháng 4", amount: 550000000, expense: 280000000 },
            { period: "Tháng 5", amount: 570000000, expense: 291200000 },
          ],
          financeDetails: {
            revenue: [
              { category: "Học phí chính khóa", amount: 1650000000 },
              { category: "Phí cơ sở vật chất", amount: 350000000 },
              { category: "Dịch vụ bán trú", amount: 225000000 },
              { category: "Dịch vụ xe đưa đón", amount: 5000000 },
            ],
            expense: [
              { category: "Lương & Thưởng GV", amount: 1550000000 },
              { category: "Vận hành & Điện nước", amount: 300000000 },
              { category: "Bảo trì thiết bị", amount: 250000000 },
              { category: "Sự kiện & Phong trào", amount: 131200000 },
            ]
          },
          teacherPerformance: [
            { teacher: "Nguyễn Văn An", score: 89 },
            { teacher: "Trần Thị Bình", score: 86 },
            { teacher: "Lê Quốc Cường", score: 87 },
          ],
    }
  },
};

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function classToGrade(classId) {
  const match = String(classId || "").match(/\d+/);
  return match ? `Khối ${match[0]}` : "";
}

function normalizeFinanceSummary(totalRevenue, totalExpense) {
  const normalizedRevenue = Math.max(0, Math.round(Number(totalRevenue) || 0));
  const fallbackExpense = Math.round(normalizedRevenue * 0.62);
  const normalizedExpense = Math.max(
    0,
    Math.min(
      normalizedRevenue,
      Math.round(Number.isFinite(totalExpense) ? totalExpense : fallbackExpense)
    )
  );

  return {
    totalRevenue: normalizedRevenue,
    totalExpense: normalizedExpense,
    totalAfterExpense: normalizedRevenue - normalizedExpense,
  };
}

function buildFinanceByGrade(totalRevenue, totalExpense) {
  const ratios = [
    { grade: "Khối 10", ratio: 0.34 },
    { grade: "Khối 11", ratio: 0.33 },
    { grade: "Khối 12", ratio: 0.33 },
  ];

  const totals = normalizeFinanceSummary(totalRevenue, totalExpense);

  return ratios.map((item) => ({
    grade: item.grade,
    amount: Math.round(totals.totalRevenue * item.ratio),
    expense: Math.round(totals.totalExpense * item.ratio),
    net: Math.round(totals.totalAfterExpense * item.ratio),
  }));
}

function buildTeacherSubjectAnalysis(multiplier) {
  return BASE_TEACHER_ANALYSIS.map((teacher) => ({
    ...teacher,
    avgAssignedClasses: round(teacher.avgAssignedClasses - (1 - multiplier) * 0.15),
    assignedClasses: teacher.assignedClasses.map((item) => ({
      ...item,
      classAverageScore: round(item.classAverageScore - (1 - multiplier) * 0.15),
    })),
  }));
}

function buildGradeOverview(multiplier) {
  return BASE_GRADE_OVERVIEW.map((grade) => ({
    ...grade,
    averageScore: round(grade.averageScore - (1 - multiplier) * 0.15),
    star: round(grade.star - (1 - multiplier) * 0.1, 1),
    classes: grade.classes.map((classItem) => ({
      ...classItem,
      averageScore: round(classItem.averageScore - (1 - multiplier) * 0.15),
      star: round(classItem.star - (1 - multiplier) * 0.1, 1),
      fund: Math.round(classItem.fund * multiplier),
    })),
  }));
}

function withScope(baseReport, filters) {
  let multiplier = 1;

  if (filters.classId && filters.classId !== "all") {
    multiplier *= 0.34;
  }

  if (filters.teacherId && filters.teacherId !== "all") {
    multiplier *= 0.55;
  }

  let teacherSubjectAnalysis = buildTeacherSubjectAnalysis(multiplier);
  let gradeOverview = buildGradeOverview(multiplier);

  if (filters.teacherId && filters.teacherId !== "all") {
    teacherSubjectAnalysis = teacherSubjectAnalysis.filter(
      (teacher) => teacher.teacherId === filters.teacherId
    );
  }

  if (filters.classId && filters.classId !== "all") {
    teacherSubjectAnalysis = teacherSubjectAnalysis
      .map((teacher) => ({
        ...teacher,
        assignedClasses: teacher.assignedClasses.filter((item) => item.classId === filters.classId),
      }))
      .filter((teacher) => teacher.assignedClasses.length)
      .map((teacher) => ({
        ...teacher,
        avgAssignedClasses: round(
          teacher.assignedClasses.reduce((sum, item) => sum + item.classAverageScore, 0) /
            teacher.assignedClasses.length
        ),
      }));

    const selectedGrade = classToGrade(filters.classId);
    gradeOverview = gradeOverview
      .map((grade) => ({
        ...grade,
        classes: grade.classes.filter((item) => item.classId === filters.classId),
      }))
      .filter((grade) => grade.classes.length && grade.grade === selectedGrade)
      .map((grade) => ({
        ...grade,
        averageScore: grade.classes[0].averageScore,
        star: grade.classes[0].star,
      }));
  }

  const baseFinance = normalizeFinanceSummary(
    baseReport.summary.totalRevenue,
    baseReport.summary.totalExpense || baseReport.finance.reduce((sum, f) => sum + (f.expense || 0), 0)
  );
  const scopedFinance = normalizeFinanceSummary(
    baseFinance.totalRevenue * multiplier,
    baseFinance.totalExpense * multiplier
  );

  return {
    ...baseReport,
    summary: {
      totalStudents: Math.max(12, Math.round(baseReport.summary.totalStudents * multiplier)),
      schoolAverageScore: round(baseReport.summary.schoolAverageScore - (1 - multiplier) * 0.2),
      attendanceRate: round(baseReport.summary.attendanceRate - (1 - multiplier) * 0.7),
      totalRevenue: scopedFinance.totalRevenue,
      totalExpense: scopedFinance.totalExpense,
      totalAfterExpense: scopedFinance.totalAfterExpense,
    },
    academic: baseReport.academic.map((item) => ({
      ...item,
      value: Math.max(1, Math.round(item.value * multiplier)),
    })),
    honorRoll: baseReport.honorRoll.map(h => ({
        ...h,
        gpa: round(h.gpa * multiplier < 5 ? h.gpa : h.gpa - (1-multiplier)*0.5)
    })),
    subjectDist: baseReport.subjectDist.map(s => ({
        ...s,
        tot: Math.round(s.tot * multiplier + (1-multiplier)*15)
    })),
    subjects: baseReport.subjects.map((item) => ({
      ...item,
      averageScore: round(item.averageScore - (1 - multiplier) * 0.15),
    })),
    attendance: baseReport.attendance.map((item) => ({
      ...item,
      onTime: round(item.onTime - (1 - multiplier) * 0.5),
      late: round(item.late + (1 - multiplier) * 0.2),
      absent: round(item.absent + (1 - multiplier) * 0.3),
    })),
    attendanceByDay: baseReport.attendanceByDay,
    attendanceAlerts: baseReport.attendanceAlerts.map(a => ({
        ...a,
        absences: Math.round(a.absences * multiplier + (1-multiplier)*2)
    })),
    classDeepDive: {
        violations: baseReport.classDeepDive.violations,
        fundLedger: baseReport.classDeepDive.fundLedger.map(l => ({ ...l, amount: Math.round(l.amount * multiplier) }))
    },
    finance: baseReport.finance.map((item) => ({
      ...item,
      amount: Math.round(item.amount * multiplier),
      expense: Math.round((item.expense || 0) * multiplier),
    })),
    financeDetails: {
      revenue: baseReport.financeDetails.revenue.map(r => ({ ...r, amount: Math.round(r.amount * multiplier) })),
      expense: baseReport.financeDetails.expense.map(e => ({ ...e, amount: Math.round(e.amount * multiplier) })),
    },
    teacherPerformance: baseReport.teacherPerformance.map((item) => ({
      ...item,
      score: round(item.score - (1 - multiplier) * 0.8, 1),
    })),
    financeByGrade: buildFinanceByGrade(scopedFinance.totalRevenue, scopedFinance.totalExpense),
    teacherSubjectAnalysis,
    gradeOverview,
  };
}

function mergeTerms(termA, termB) {
  const mergedRevenue = termA.summary.totalRevenue + termB.summary.totalRevenue;
  const mergedExpense =
    termA.finance.reduce((sum, f) => sum + (f.expense || 0), 0) +
    termB.finance.reduce((sum, f) => sum + (f.expense || 0), 0);
  const mergedFinance = normalizeFinanceSummary(mergedRevenue, mergedExpense);

  return {
    ...termA,
    summary: {
      totalStudents: Math.round((termA.summary.totalStudents + termB.summary.totalStudents) / 2),
      schoolAverageScore: round(
        (termA.summary.schoolAverageScore + termB.summary.schoolAverageScore) / 2
      ),
      attendanceRate: round((termA.summary.attendanceRate + termB.summary.attendanceRate) / 2),
      totalRevenue: mergedFinance.totalRevenue,
      totalExpense: mergedFinance.totalExpense,
      totalAfterExpense: mergedFinance.totalAfterExpense,
    },
    honorRoll: termB.honorRoll,
    subjectDist: termB.subjectDist,
    attendanceByDay: termB.attendanceByDay,
    academic: termA.academic.map((itemA, index) => {
      const itemB = termB.academic[index];
      return {
        name: itemA.name,
        value: Math.round((itemA.value + itemB.value) / 2),
      };
    }),
    subjects: termA.subjects.map((itemA, index) => {
      const itemB = termB.subjects[index];
      return {
        subject: itemA.subject,
        averageScore: round((itemA.averageScore + itemB.averageScore) / 2),
      };
    }),
    attendance: [...termA.attendance, ...termB.attendance],
    finance: [...termA.finance, ...termB.finance],
    financeDetails: {
        revenue: termA.financeDetails.revenue.map((r, i) => ({
            category: r.category,
            amount: r.amount + termB.financeDetails.revenue[i].amount
        })),
        expense: termA.financeDetails.expense.map((e, i) => ({
            category: e.category,
            amount: e.amount + termB.financeDetails.expense[i].amount
        }))
    },
    teacherPerformance: termA.teacherPerformance.map((itemA, index) => {
      const itemB = termB.teacherPerformance[index];
      return {
        teacher: itemA.teacher,
        score: round((itemA.score + itemB.score) / 2, 1),
      };
    }),
  };
}

function getTermData(schoolYear, term) {
  const yearData = REPORT_SOURCE[schoolYear];
  if (!yearData) {
    throw new Error("Không tìm thấy dữ liệu năm học.");
  }

  if (term === "ALL") {
    return mergeTerms(yearData.HK1, yearData.HK2);
  }

  const termData = yearData[term];
  if (!termData) {
    throw new Error("Không tìm thấy dữ liệu học kỳ.");
  }

  return termData;
}

export function getReportFilterOptions() {
  return {
    schoolYears: SCHOOL_YEAR_OPTIONS,
    terms: TERM_OPTIONS,
    classes: CLASS_OPTIONS,
    teachers: TEACHER_OPTIONS,
  };
}

export async function fetchAdminReport(filters) {
  const baseReport = getTermData(filters.schoolYear, filters.term);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(withScope(baseReport, filters));
    }, 350);
  });
}

export async function fetchTermComparison(schoolYear, filters) {
  const hk1 = withScope(getTermData(schoolYear, "HK1"), { ...filters, term: "HK1" });
  const hk2 = withScope(getTermData(schoolYear, "HK2"), { ...filters, term: "HK2" });
  const metrics = [
    {
      metric: "Điểm trung bình",
      metricType: "score",
      hk1: hk1.summary.schoolAverageScore,
      hk2: hk2.summary.schoolAverageScore,
    },
    {
      metric: "Chuyên cần (%)",
      metricType: "percent",
      hk1: hk1.summary.attendanceRate,
      hk2: hk2.summary.attendanceRate,
    },
    {
      metric: "Doanh thu (tỷ)",
      metricType: "money-b",
      hk1: round(hk1.summary.totalRevenue / 1000000000),
      hk2: round(hk2.summary.totalRevenue / 1000000000),
    },
    {
      metric: "Chi tiêu (tỷ)",
      metricType: "money-b",
      hk1: round(hk1.summary.totalExpense / 1000000000),
      hk2: round(hk2.summary.totalExpense / 1000000000),
    },
    {
      metric: "Sau chi (tỷ)",
      metricType: "money-b",
      hk1: round(hk1.summary.totalAfterExpense / 1000000000),
      hk2: round(hk2.summary.totalAfterExpense / 1000000000),
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ hk1, hk2, metrics });
    }, 300);
  });
}



