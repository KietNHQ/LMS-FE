const vietnameseFirstNames = [
  "Minh", "Tuấn", "Hùng", "Hoa", "Dũng", "Trang", "Quốc", "Thu", "Linh", "Mai",
  "An", "Bình", "Cường", "Hải", "Kiên", "Long", "Nam", "Phong", "Sang", "Thắng",
  "Toàn", "Tú", "Vân", "Việt", "Xuân", "Yên",
];

const vietnameseLastNames = [
  "Nguyễn", "Trần", "Phạm", "Hoàng", "Lê", "Vũ", "Đặng", "Bùi", "Đinh", "Tạ",
];

const vietnameseMiddleNames = [
  "Văn", "Thị", "Minh", "Đức", "Thanh", "Anh", "Hữu", "Quang", "Xuân", "Ngọc",
];

const parentNames = [
  "Nguyễn Văn A", "Trần Thị B", "Phạm Văn C", "Hoàng Thị D", "Lê Văn E",
  "Vũ Thị F", "Đặng Văn G", "Bùi Thị H", "Đinh Văn I", "Tạ Thị K",
];

function generateStudent(id, className, teacher) {
  const firstName = vietnameseFirstNames[Math.floor(Math.random() * vietnameseFirstNames.length)];
  const lastName = vietnameseLastNames[Math.floor(Math.random() * vietnameseLastNames.length)];
  const middleName = vietnameseMiddleNames[Math.floor(Math.random() * vietnameseMiddleNames.length)];
  const name = `${lastName} ${middleName} ${firstName}`;

  const birthYear = 2008 + Math.floor(Math.random() * 2);
  const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const dob = `${birthYear}-${birthMonth}-${birthDay}`;

  const parentName = parentNames[Math.floor(Math.random() * parentNames.length)];
  const areaCode = ["091", "092", "093", "094", "095", "096", "097", "098", "099"];
  const randomArea = areaCode[Math.floor(Math.random() * areaCode.length)];
  const randomNumber = String(Math.floor(Math.random() * 9000000) + 1000000);
  const parentPhone = randomArea + randomNumber;

  // Generate email
  const firstNameInitial = firstName.charAt(0).toLowerCase();
  const lastNameInitial = lastName.charAt(0).toLowerCase();
  const email = `${firstName.toLowerCase()}.${lastNameInitial}@student.edu.vn`;

  const enrollmentDate = "2024-09-01";
  const tuitionPaid = Math.random() > 0.3;

  const genders = ["Nam", "Nữ"];
  const gender = genders[Math.floor(Math.random() * genders.length)];

  const statuses = ["Đang học", "Đình chỉ", "Bảo lưu", "Đã tốt nghiệp"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    id,
    name,
    dob,
    email,
    gender,
    className,
    teacher,
    status,
    parentName,
    parentPhone,
    enrollmentDate,
    tuitionPaid,
    violations: Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0, // Mock violations
  };
}

function generateStudentsForClass(count, className, teacher) {
  return Array.from({ length: count }, (_, i) => generateStudent(i + 1, className, teacher));
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
    students: generateStudentsForClass(20, "10A1", "Thầy Nguyễn Văn Hùng"),
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
    students: generateStudentsForClass(15, "11A2", "Cô Trần Thị Linh"),
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
    students: generateStudentsForClass(18, "12A1", "Thầy Lê Minh Tuấn"),
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
    students: generateStudentsForClass(21, "10A2", "Cô Hoàng Thị Hoa"),
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
    students: generateStudentsForClass(22, "10A3", "Thầy Phạm Hùng Dũng"),
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
    students: generateStudentsForClass(23, "11A1", "Cô Bùi Thị Hương"),
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
    students: generateStudentsForClass(17, "11A3", "Thầy Đặng Quốc Tiến"),
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
    students: generateStudentsForClass(20, "12A2", "Cô Vũ Thị Minh"),
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
    students: generateStudentsForClass(19, "12A3", "Thầy Đinh Hải Long"),
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
    students: generateStudentsForClass(24, "10A4", "Cô Nguyễn Thị Thanh"),
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
    students: generateStudentsForClass(20, "10A5", "Thầy Trần Văn Khắc"),
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
    students: generateStudentsForClass(21, "11A4", "Cô Phạm Thị Hà"),
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
    students: generateStudentsForClass(19, "11A5", "Thầy Hồ Văn Minh"),
  },
];

