const vietnameseFirstNames = [
  "Minh", "Tuấn", "Hùng", "Hoa", "Dũng", "Trang", "Quốc", "Thu", "Linh", "Mai",
  "An", "Bình", "Cường", "Hải", "Kiên", "Long", "Nam", "Phong", "Sang", "Thắng",
  "Toàn", "Tú", "Vân", "Việt", "Xuân", "Yên",
];

const vietnameseLastNames = [
  "Nguyễn", "Trần", "Phạm", "Hoàng", "Lê", "Vũ", "Đặng", "Bùi", "Đinh", "Tạ",
];

const parentNames = [
  "Nguyễn Văn A", "Trần Thị B", "Phạm Văn C", "Hoàng Thị D", "Lê Văn E",
  "Vũ Thị F", "Đặng Văn G", "Bùi Thị H", "Đinh Văn I", "Tạ Thị K",
];

function generateStudent(id) {
  const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
  const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
  const name = `${lastName} ${firstName}`;

  const birthYear = 2008 + Math.floor(Math.random() * 2);
  const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const dob = `${birthYear}-${birthMonth}-${birthDay}`;

  const parentName = parentNames[Math.floor(Math.random() * parentNames.length)];
  const areaCode = ["091", "092", "093", "094", "095", "096", "097", "098", "099"];
  const randomArea = areaCode[Math.floor(Math.random() * areaCode.length)];
  const randomNumber = String(Math.floor(Math.random() * 9000000) + 1000000);
  const parentPhone = randomArea + randomNumber;

  const enrollmentDate = "2024-09-01";
  const tuitionPaid = Math.random() > 0.3;

  return {
    id,
    name,
    dob,
    parentName,
    parentPhone,
    enrollmentDate,
    tuitionPaid,
  };
}

function generateStudentsForClass(count) {
  return Array.from({ length: count }, (_, i) => generateStudent(i + 1));
}

export const teachingClassesData = [
  {
    id: 1,
    name: "10A1",
    grade: "10",
    subject: "Toán học",
    year: "2024-2025",
    term: "hk1",
    status: "Đang hoạt động",
    teacher: "Thầy Nguyễn Văn Hùng",
    paidStudents: 17,
    students: generateStudentsForClass(20),
  },
  {
    id: 2,
    name: "11A2",
    grade: "11",
    subject: "Vật lý",
    year: "2024-2025",
    term: "hk2",
    status: "Đã hoàn thành",
    teacher: "Cô Trần Thị Linh",
    paidStudents: 15,
    students: generateStudentsForClass(15),
  },
  {
    id: 3,
    name: "12A1",
    grade: "12",
    subject: "Hóa học",
    year: "2025-2026",
    term: "hk1",
    status: "Đang hoạt động",
    teacher: "Thầy Lê Minh Tuấn",
    paidStudents: 14,
    students: generateStudentsForClass(18),
  },
  {
    id: 4,
    name: "10A2",
    grade: "10",
    subject: "Ngữ văn",
    year: "2024-2025",
    term: "hk1",
    status: "Đang hoạt động",
    teacher: "Cô Hoàng Thị Hoa",
    paidStudents: 16,
    students: generateStudentsForClass(21),
  },
  {
    id: 5,
    name: "10A3",
    grade: "10",
    subject: "Tiếng Anh",
    year: "2024-2025",
    term: "hk2",
    status: "Đã hoàn thành",
    teacher: "Thầy Phạm Hùng Dũng",
    paidStudents: 19,
    students: generateStudentsForClass(22),
  },
  {
    id: 6,
    name: "11A1",
    grade: "11",
    subject: "Sinh học",
    year: "2024-2025",
    term: "hk1",
    status: "Đang hoạt động",
    teacher: "Cô Bùi Thị Hương",
    paidStudents: 20,
    students: generateStudentsForClass(23),
  },
  {
    id: 7,
    name: "11A3",
    grade: "11",
    subject: "Lịch sử",
    year: "2025-2026",
    term: "hk1",
    status: "Đang hoạt động",
    teacher: "Thầy Đặng Quốc Tiến",
    paidStudents: 12,
    students: generateStudentsForClass(17),
  },
  {
    id: 8,
    name: "12A2",
    grade: "12",
    subject: "Địa lý",
    year: "2024-2025",
    term: "hk2",
    status: "Đã hoàn thành",
    teacher: "Cô Vũ Thị Minh",
    paidStudents: 18,
    students: generateStudentsForClass(20),
  },
  {
    id: 9,
    name: "12A3",
    grade: "12",
    subject: "Giáo dục công dân",
    year: "2025-2026",
    term: "hk2",
    status: "Đang hoạt động",
    teacher: "Thầy Đinh Hải Long",
    paidStudents: 13,
    students: generateStudentsForClass(19),
  },
  {
    id: 10,
    name: "10A4",
    grade: "10",
    subject: "Tin học",
    year: "2024-2025",
    term: "hk1",
    status: "Đang hoạt động",
    teacher: "Cô Nguyễn Thị Thanh",
    paidStudents: 20,
    students: generateStudentsForClass(24),
  },
  {
    id: 11,
    name: "10A5",
    grade: "10",
    subject: "Giáo dục công dân",
    year: "2025-2026",
    term: "hk1",
    status: "Đang hoạt động",
    teacher: "Thầy Trần Văn Khắc",
    paidStudents: 15,
    students: generateStudentsForClass(20),
  },
  {
    id: 12,
    name: "11A4",
    grade: "11",
    subject: "Toán nâng cao",
    year: "2024-2025",
    term: "hk1",
    status: "Đang hoạt động",
    teacher: "Cô Phạm Thị Hà",
    paidStudents: 18,
    students: generateStudentsForClass(21),
  },
  {
    id: 13,
    name: "11A5",
    grade: "11",
    subject: "Ngữ văn",
    year: "2025-2026",
    term: "hk2",
    status: "Đã hoàn thành",
    teacher: "Thầy Hồ Văn Minh",
    paidStudents: 17,
    students: generateStudentsForClass(19),
  },
];
