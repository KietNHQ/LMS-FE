import { teachingClassesData } from "../../teachingClasses/data/teachingClassesData";

// Lấy 1 lớp để giả lập làm lớp chủ nhiệm
const baseClass = teachingClassesData.find((cls) => cls.id === 1) || teachingClassesData[0];

export const homeroomData = {
  ...baseClass,
  role: "Giáo viên chủ nhiệm",
  monitor: "Nguyễn Văn Hùng", // Lớp trưởng
  viceMonitor: "Trần Thị Mai", // Lớp phó học tập
  secretary: "Lê Đình Long", // Bí thư
  
  // Chi tiết học lực
  academicStats: {
    excellent: 12, // Giỏi
    good: 6, // Khá
    average: 2, // Trung bình
    weak: 0, // Yếu
  },

  // Tình trạng học phí
  tuitionStats: {
    paid: 17,
    unpaid: 3,
  },

  // Hoạt động kế tiếp
  activities: [
    { 
        title: "Họp phụ huynh đầu năm", 
        type: "meeting",
        time: "08:00 Chủ nhật, 15/09", 
        location: "Phòng học lớp 10A1",
        status: "upcoming"
    },
    { 
        title: "Sinh hoạt lớp tuần 3", 
        type: "class",
        time: "10:30 Thứ 7, 21/09", 
        location: "Phòng học lớp 10A1",
        status: "upcoming"
    },
    { 
        title: "Thi kéo co toàn trường", 
        type: "event",
        time: "15:00 Thứ 6, 27/09", 
        location: "Sân vận động trường",
        status: "upcoming"
    }
  ],

  // Thông báo lớp (Mock)
  announcements: [
    {
      id: 1,
      title: "Nhắc nhở đóng học phí tháng 9",
      date: "10/09/2024",
      content: "Các em học sinh nhắc nhở phụ huynh hoàn thành học phí tháng 9 trước ngày 15/09 nhé.",
      target: "Tất cả học sinh",
      isUrgent: true
    },
    {
      id: 2,
      title: "Kế hoạch lao động tuần tới",
      date: "08/09/2024",
      content: "Tổ 1 sẽ mang chổi và dụng cụ dọn vệ sinh sân trường vào sáng thứ 2.",
      target: "Học sinh",
      isUrgent: false
    }
  ]
};

