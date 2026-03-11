export const classList = [
  {
    id: "math-10",
    title: "Toan hoc",
    code: "MATH101",
    teacher: "Co Nguyen Thi Lan",
    schedule: "Thu 2, Thu 5 - 07:00",
    progress: 72,
    completedLessons: 18,
    totalLessons: 25,
    assignmentsPending: 2,
    className: "Lop 10",
    room: "A-203",
    description:
      "Tap trung vao dai so, ham so va ky nang giai bai theo tung muc do.",
    nextClass: "Thu 5, 07:00 - 08:30",
    attendance: 96,
    teacherEmail: "lan.nguyen@school.edu.vn",
    assignments: [
      { id: "m1", title: "Bai tap chuong Ham so", due: "12/03/2026", status: "Dang lam" },
      { id: "m2", title: "Luyen de giua ky", due: "19/03/2026", status: "Chua bat dau" },
    ],
    lessons: [
      { id: "ml1", title: "Ham so bac nhat", time: "Thu 2 - 07:00" },
      { id: "ml2", title: "Do thi ham so", time: "Thu 5 - 07:00" },
      { id: "ml3", title: "Luyen tap tong hop", time: "Thu 2 - 07:00" },
    ],
    resources: ["Slide bai giang tuan 8", "Bo de luyen tap 01", "Tong hop cong thuc nhanh"],
  },
  {
    id: "eng-11",
    title: "Tieng Anh",
    code: "ENG201",
    teacher: "Thay Tran Minh Duc",
    schedule: "Thu 3, Thu 6 - 13:30",
    progress: 84,
    completedLessons: 21,
    totalLessons: 25,
    assignmentsPending: 1,
    className: "Lop 11",
    room: "B-105",
    description:
      "Phat trien ky nang nghe noi doc viet va tu duy ngon ngu theo chu de hoc ky.",
    nextClass: "Thu 6, 13:30 - 15:00",
    attendance: 98,
    teacherEmail: "duc.tran@school.edu.vn",
    assignments: [
      { id: "e1", title: "Quiz Unit 6", due: "14/03/2026", status: "Dang lam" },
      { id: "e2", title: "Essay: Future jobs", due: "22/03/2026", status: "Chua bat dau" },
    ],
    lessons: [
      { id: "el1", title: "Grammar: Relative clause", time: "Thu 3 - 13:30" },
      { id: "el2", title: "Speaking workshop", time: "Thu 6 - 13:30" },
      { id: "el3", title: "Reading practice", time: "Thu 3 - 13:30" },
    ],
    resources: ["Vocabulary list Unit 6", "Pronunciation practice", "Writing template"],
  },
  {
    id: "phy-12",
    title: "Vat ly",
    code: "PHY301",
    teacher: "Co Pham Thu Ha",
    schedule: "Thu 4 - 09:00",
    progress: 66,
    completedLessons: 16,
    totalLessons: 24,
    assignmentsPending: 3,
    className: "Lop 12",
    room: "Lab-01",
    description:
      "Hoc theo huong ung dung, thi nghiem va phan tich hien tuong vat ly trong thuc te.",
    nextClass: "Thu 4, 09:00 - 10:30",
    attendance: 93,
    teacherEmail: "ha.pham@school.edu.vn",
    assignments: [
      { id: "p1", title: "Bao cao thi nghiem", due: "16/03/2026", status: "Dang lam" },
      { id: "p2", title: "Bai tap dong dien", due: "20/03/2026", status: "Chua bat dau" },
      { id: "p3", title: "On tap chuong 5", due: "25/03/2026", status: "Chua bat dau" },
    ],
    lessons: [
      { id: "pl1", title: "Dong dien khong doi", time: "Thu 4 - 09:00" },
      { id: "pl2", title: "Mach dien hon hop", time: "Thu 4 - 09:00" },
      { id: "pl3", title: "Bai tap tong hop", time: "Thu 4 - 09:00" },
    ],
    resources: ["So tay thi nghiem", "Video mo phong", "Bo cau hoi trac nghiem"],
  },
];

export const upcomingTasks = [
  { id: 1, title: "Nop bai tap chuong Ham so", subject: "Toan hoc", due: "12/03/2026" },
  { id: 2, title: "Quiz Unit 6", subject: "Tieng Anh", due: "14/03/2026" },
  { id: 3, title: "Bao cao thi nghiem", subject: "Vat ly", due: "16/03/2026" },
];

