export const classList = [
  {
    id: "math-10",
    title: "Toán học",
    code: "MATH101",
    teacher: "Cô Nguyễn Thị Lan",
    schedule: "Thứ 2, Thứ 5 - 07:00",
    progress: 72,
    completedLessons: 18,
    totalLessons: 25,
    assignmentsPending: 2,
    className: "Lớp 10",
    room: "A-203",
    description:
      "Tập trung vào đại số, hàm số và kỹ năng giải bài từng bước.",
    nextClass: "Thứ 5, 07:00 - 08:30",
    attendance: 96,
    teacherEmail: "lan.nguyen@school.edu.vn",
    assignments: [
      {
        id: "m1",
        title: "Phiếu bài tập chương Hàm số",
        due: "12/03/2026",
        status: "Đang làm",
      },
      {
        id: "m2",
        title: "Bộ đề ôn tập giữa kỳ",
        due: "19/03/2026",
        status: "Chưa bắt đầu",
      },
    ],
    lessons: [
      { id: "ml1", title: "Hàm số bậc nhất", time: "Thứ 2 - 07:00" },
      { id: "ml2", title: "Đồ thị hàm số", time: "Thứ 5 - 07:00" },
      { id: "ml3", title: "Luyện tập tổng hợp", time: "Thứ 2 - 07:00" },
    ],
    resources: ["Slide bài giảng tuần 8", "Bộ đề luyện tập 01", "Bảng công thức nhanh"],
  },
  {
    id: "eng-11",
    title: "Tiếng Anh",
    code: "ENG201",
    teacher: "Thầy Trần Minh Đức",
    schedule: "Thứ 3, Thứ 6 - 13:30",
    progress: 84,
    completedLessons: 21,
    totalLessons: 25,
    assignmentsPending: 1,
    className: "Lớp 11",
    room: "B-105",
    description:
      "Phát triển kỹ năng nghe, nói, đọc, viết theo chủ đề từng học kỳ.",
    nextClass: "Thứ 6, 13:30 - 15:00",
    attendance: 98,
    teacherEmail: "duc.tran@school.edu.vn",
    assignments: [
      {
        id: "e1",
        title: "Kiểm tra Unit 6",
        due: "14/03/2026",
        status: "Đang làm",
      },
      {
        id: "e2",
        title: "Bài luận: Nghề nghiệp tương lai",
        due: "22/03/2026",
        status: "Chưa bắt đầu",
      },
    ],
    lessons: [
      { id: "el1", title: "Ngữ pháp: Mệnh đề quan hệ", time: "Thứ 3 - 13:30" },
      { id: "el2", title: "Buổi luyện nói", time: "Thứ 6 - 13:30" },
      { id: "el3", title: "Luyện đọc", time: "Thứ 3 - 13:30" },
    ],
    resources: ["Danh sách từ vựng Unit 6", "Bài luyện phát âm", "Mẫu bài viết"],
  },
  {
    id: "phy-12",
    title: "Vật lý",
    code: "PHY301",
    teacher: "Cô Phạm Thu Hà",
    schedule: "Thứ 4 - 09:00",
    progress: 66,
    completedLessons: 16,
    totalLessons: 24,
    assignmentsPending: 3,
    className: "Lớp 12",
    room: "Lab-01",
    description:
      "Học qua ứng dụng, thí nghiệm và phân tích tình huống vật lý thực tế.",
    nextClass: "Thứ 4, 09:00 - 10:30",
    attendance: 93,
    teacherEmail: "ha.pham@school.edu.vn",
    assignments: [
      {
        id: "p1",
        title: "Báo cáo thí nghiệm",
        due: "16/03/2026",
        status: "Đang làm",
      },
      {
        id: "p2",
        title: "Bài tập Dòng điện",
        due: "20/03/2026",
        status: "Chưa bắt đầu",
      },
      {
        id: "p3",
        title: "Ôn tập chương 5",
        due: "25/03/2026",
        status: "Chưa bắt đầu",
      },
    ],
    lessons: [
      { id: "pl1", title: "Dòng điện một chiều", time: "Thứ 4 - 09:00" },
      { id: "pl2", title: "Mạch điện hỗn hợp", time: "Thứ 4 - 09:00" },
      { id: "pl3", title: "Bài tập tổng hợp", time: "Thứ 4 - 09:00" },
    ],
    resources: ["Sổ tay phòng thí nghiệm", "Video mô phỏng", "Ngân hàng câu hỏi trắc nghiệm"],
  },
];

export const upcomingTasks = [
  {
    id: 1,
    title: "Nộp phiếu bài tập chương Hàm số",
    subject: "Toán học",
    due: "12/03/2026",
  },
  { id: 2, title: "Kiểm tra Unit 6", subject: "Tiếng Anh", due: "14/03/2026" },
  {
    id: 3,
    title: "Nộp báo cáo thí nghiệm",
    subject: "Vật lý",
    due: "16/03/2026",
  },
];

