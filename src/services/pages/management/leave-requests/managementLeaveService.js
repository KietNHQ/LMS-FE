import axiosClient from "../../../shared/http/axiosClient";

const MOCK_STORAGE_KEY = "lms_management_leave_requests";

// Helper to calculate date differences
const calculateDays = (start, end) => {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Number.isNaN(diffDays) ? 1 : diffDays;
  } catch {
    return 1;
  }
};

// Initial stateful mock data if localStorage is empty
const INITIAL_MOCK_DATA = [
  {
    id: "lr-1",
    studentId: 101,
    studentName: "Nguyễn Văn An",
    studentCode: "STU101",
    classId: 1,
    className: "10A1",
    gradeName: "Khối 10",
    guardianId: 201,
    guardianName: "Nguyễn Văn Bình",
    reason: "Cháu bị sốt xuất huyết phải nhập viện điều trị",
    startDate: "2026-05-20",
    endDate: "2026-05-22",
    totalDays: 3,
    status: "pending",
    statusLabel: "Chờ duyệt",
    note: "Gia đình sẽ nộp lại giấy xác nhận của bệnh viện sau khi cháu ra viện.",
    adminNotes: null,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
    createdAt: "2026-05-19T08:30:00Z"
  },
  {
    id: "lr-2",
    studentId: 102,
    studentName: "Trần Thị Bích",
    studentCode: "STU102",
    classId: 1,
    className: "10A1",
    gradeName: "Khối 10",
    guardianId: 202,
    guardianName: "Trần Hữu Cảnh",
    reason: "Gia đình có việc hiếu ở quê, cần cháu về cùng bố mẹ",
    startDate: "2026-05-21",
    endDate: "2026-05-22",
    totalDays: 2,
    status: "approved",
    statusLabel: "Đã duyệt",
    note: "Mong nhà trường và cô giáo tạo điều kiện hỗ trợ cháu học bù.",
    adminNotes: "Đồng ý cho học sinh nghỉ phép. Phụ huynh đôn đốc cháu tự học bài ở nhà.",
    reviewedBy: 12,
    reviewedByName: "GVCN. Lê Hoàng Yến",
    reviewedAt: "2026-05-20 14:35",
    createdAt: "2026-05-20T03:15:00Z"
  },
  {
    id: "lr-3",
    studentId: 103,
    studentName: "Phạm Minh Cường",
    studentCode: "STU103",
    classId: 2,
    className: "10A2",
    gradeName: "Khối 10",
    guardianId: 203,
    guardianName: "Phạm Hùng Dũng",
    reason: "Cháu bị đau răng cấp tính cần đi nhổ tại nha khoa",
    startDate: "2026-05-21",
    endDate: "2026-05-21",
    totalDays: 1,
    status: "pending",
    statusLabel: "Chờ duyệt",
    note: "Cháu xin nghỉ buổi sáng ngày 21.",
    adminNotes: null,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
    createdAt: "2026-05-21T02:00:00Z"
  },
  {
    id: "lr-4",
    studentId: 104,
    studentName: "Lê Hoàng Dương",
    studentCode: "STU104",
    classId: 3,
    className: "11A5",
    gradeName: "Khối 11",
    guardianId: 204,
    guardianName: "Lê Văn Đạt",
    reason: "Cháu đi du lịch cùng gia đình",
    startDate: "2026-05-18",
    endDate: "2026-05-22",
    totalDays: 5,
    status: "rejected",
    statusLabel: "Từ chối",
    note: "Chuyến đi đã lên lịch từ lâu.",
    adminNotes: "Không chấp nhận nghỉ phép đi du lịch trong kỳ thi cuối kỳ đang diễn ra.",
    reviewedBy: 9,
    reviewedByName: "BGH. Nguyễn Văn Đức",
    reviewedAt: "2026-05-17 09:12",
    createdAt: "2026-05-16T10:00:00Z"
  },
  {
    id: "lr-5",
    studentId: 105,
    studentName: "Vũ Thu Phương",
    studentCode: "STU105",
    classId: 4,
    className: "11B1",
    gradeName: "Khối 11",
    guardianId: 205,
    guardianName: "Vũ Hữu Đạt",
    reason: "Cháu bị ngộ độc thực phẩm nhẹ, bác sĩ khuyên nghỉ ngơi",
    startDate: "2026-05-21",
    endDate: "2026-05-22",
    totalDays: 2,
    status: "pending",
    statusLabel: "Chờ duyệt",
    note: "Tôi sẽ trực tiếp kèm cháu chép bài.",
    adminNotes: null,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
    createdAt: "2026-05-21T06:10:00Z"
  },
  {
    id: "lr-6",
    studentId: 106,
    studentName: "Hoàng Minh Khánh",
    studentCode: "STU106",
    classId: 5,
    className: "12A2",
    gradeName: "Khối 12",
    guardianId: 206,
    guardianName: "Hoàng Xuân Kiên",
    reason: "Cháu đi khám sức khỏe nghĩa vụ quân sự theo lệnh gọi",
    startDate: "2026-05-20",
    endDate: "2026-05-20",
    totalDays: 1,
    status: "approved",
    statusLabel: "Đã duyệt",
    note: "Có kèm theo bản quét lệnh gọi khám.",
    adminNotes: "Đơn chính đáng, đã duyệt nghỉ phép có phép.",
    reviewedBy: 2,
    reviewedByName: "Giám thị. Phạm Quốc Trung",
    reviewedAt: "2026-05-19 16:00",
    createdAt: "2026-05-19T07:00:00Z"
  },
  {
    id: "lr-7",
    studentId: 107,
    studentName: "Nguyễn Thị Thảo",
    studentCode: "STU107",
    classId: 6,
    className: "12C3",
    gradeName: "Khối 12",
    guardianId: 207,
    guardianName: "Nguyễn Văn Long",
    reason: "Cháu bị đau chân do ngã xe đạp điện",
    startDate: "2026-05-22",
    endDate: "2026-05-25",
    totalDays: 4,
    status: "pending",
    statusLabel: "Chờ duyệt",
    note: "Bác sĩ chỉ định nẹp chân tĩnh dưỡng 4 ngày.",
    adminNotes: null,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
    createdAt: "2026-05-21T09:45:00Z"
  }
];

const initializeMockIfNeeded = () => {
  if (!localStorage.getItem(MOCK_STORAGE_KEY)) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
  }
};

const getMockRequests = () => {
  initializeMockIfNeeded();
  try {
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY));
  } catch {
    return INITIAL_MOCK_DATA;
  }
};

const saveMockRequests = (data) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
};

export const managementLeaveService = {
  /**
   * Fetch all leave requests matching the given search and filter constraints.
   * Leverages real backend endpoint with a seamless local storage mock fallback.
   */
  getLeaveRequests: async (filters = {}) => {
    const {
      status = "all",
      classId = "all",
      dateFrom = "",
      dateTo = "",
      search = "",
      page = 1,
      limit = 15,
      mock = false
    } = filters;

    if (mock) {
      console.warn("Using stateful mock storage for Management Leave Requests.");
      let list = getMockRequests();

      // Search matching (student name, student code, guardian name)
      if (search) {
        const query = search.toLowerCase().trim();
        list = list.filter(
          (item) =>
            item.studentName?.toLowerCase().includes(query) ||
            item.studentCode?.toLowerCase().includes(query) ||
            item.guardianName?.toLowerCase().includes(query) ||
            item.className?.toLowerCase().includes(query)
        );
      }

      // Filter by Status
      if (status !== "all") {
        list = list.filter((item) => item.status === status);
      }

      // Filter by Class
      if (classId !== "all") {
        list = list.filter((item) => String(item.classId) === String(classId));
      }

      // Filter by Date From
      if (dateFrom) {
        list = list.filter((item) => new Date(item.startDate) >= new Date(dateFrom));
      }

      // Filter by Date To
      if (dateTo) {
        list = list.filter((item) => new Date(item.endDate) <= new Date(dateTo));
      }

      // Pagination
      const total = list.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginatedData = list.slice((page - 1) * limit, page * limit);

      return {
        success: true,
        data: paginatedData,
        isMock: true,
        pagination: {
          total,
          page,
          limit,
          total_pages: totalPages
        }
      };
    }

    try {
      const response = await axiosClient.get("/management/leave-requests", {
        params: {
          page,
          limit,
          status: status === "all" ? undefined : status,
          class_id: classId === "all" ? undefined : classId,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          search: search || undefined
        }
      });
      const data = response ?? {};
      if (data.data) {
        data.data = data.data.map(req => ({
          ...req,
          studentName: req.student?.fullName || "",
          studentCode: req.student?.studentCode || "",
          className: req.student?.className || "",
          guardianName: req.guardian?.fullName || "",
        }));
      }
      return data;
    } catch (error) {
      console.warn("API GET /management/leave-requests failed. Falling back to stateful mock.");
      return managementLeaveService.getLeaveRequests({ ...filters, mock: true });
    }
  },

  /**
   * Approve a leave request by ID.
   */
  approveLeaveRequest: async (id, adminNotes = "") => {
    // Check if the item is mock/local first
    const isMockId = `${id}`.startsWith("lr-");
    if (isMockId) {
      let list = getMockRequests();
      const index = list.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) {
        const storedUserStr = sessionStorage.getItem("user") || localStorage.getItem("user");
        let reviewerName = "Ban Giám Hiệu";
        if (storedUserStr) {
          try {
            const user = JSON.parse(storedUserStr);
            reviewerName = user.fullName || user.username || reviewerName;
          } catch (e) {
            // ignore error
          }
        }

        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        list[index] = {
          ...list[index],
          status: "approved",
          statusLabel: "Đã duyệt",
          adminNotes: adminNotes || "Đồng ý",
          reviewedBy: 99,
          reviewedByName: reviewerName,
          reviewedAt: formattedDate
        };
        saveMockRequests(list);
        return {
          success: true,
          message: "Đã phê duyệt đơn nghỉ phép thành công (Mock Storage)",
          data: list[index]
        };
      }
    }

    try {
      const response = await axiosClient.patch(`/management/leave-requests/${id}/approve`, {
        action: "approved",
        admin_notes: adminNotes
      });
      return response ?? {};
    } catch (error) {
      console.warn(`PATCH /management/leave-requests/${id}/approve failed. Trying mock fallback.`);
      // Fallback to local
      let list = getMockRequests();
      const index = list.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) {
        const storedUserStr = sessionStorage.getItem("user") || localStorage.getItem("user");
        let reviewerName = "Ban Giám Hiệu";
        if (storedUserStr) {
          try {
            const user = JSON.parse(storedUserStr);
            reviewerName = user.fullName || user.username || reviewerName;
          } catch (e) {
            // ignore error
          }
        }
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        list[index] = {
          ...list[index],
          status: "approved",
          statusLabel: "Đã duyệt",
          adminNotes: adminNotes || "Đồng ý",
          reviewedBy: 99,
          reviewedByName: reviewerName,
          reviewedAt: formattedDate
        };
        saveMockRequests(list);
        return {
          success: true,
          message: "Đã phê duyệt đơn nghỉ phép thành công (Mock Fallback)",
          data: list[index]
        };
      }
      throw error;
    }
  },

  /**
   * Reject a leave request by ID.
   */
  rejectLeaveRequest: async (id, adminNotes = "") => {
    const isMockId = `${id}`.startsWith("lr-");
    if (isMockId) {
      let list = getMockRequests();
      const index = list.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) {
        const storedUserStr = sessionStorage.getItem("user") || localStorage.getItem("user");
        let reviewerName = "Ban Giám Hiệu";
        if (storedUserStr) {
          try {
            const user = JSON.parse(storedUserStr);
            reviewerName = user.fullName || user.username || reviewerName;
          } catch (e) {
            // ignore error
          }
        }

        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        list[index] = {
          ...list[index],
          status: "rejected",
          statusLabel: "Từ chối",
          adminNotes: adminNotes,
          reviewedBy: 99,
          reviewedByName: reviewerName,
          reviewedAt: formattedDate
        };
        saveMockRequests(list);
        return {
          success: true,
          message: "Đã từ chối đơn nghỉ phép thành công (Mock Storage)",
          data: list[index]
        };
      }
    }

    try {
      const response = await axiosClient.patch(`/management/leave-requests/${id}/reject`, {
        action: "rejected",
        admin_notes: adminNotes
      });
      return response ?? {};
    } catch (error) {
      console.warn(`PATCH /management/leave-requests/${id}/reject failed. Trying mock fallback.`);
      let list = getMockRequests();
      const index = list.findIndex((item) => String(item.id) === String(id));
      if (index !== -1) {
        const storedUserStr = sessionStorage.getItem("user") || localStorage.getItem("user");
        let reviewerName = "Ban Giám Hiệu";
        if (storedUserStr) {
          try {
            const user = JSON.parse(storedUserStr);
            reviewerName = user.fullName || user.username || reviewerName;
          } catch (e) {
            // ignore error
          }
        }
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        list[index] = {
          ...list[index],
          status: "rejected",
          statusLabel: "Từ chối",
          adminNotes: adminNotes,
          reviewedBy: 99,
          reviewedByName: reviewerName,
          reviewedAt: formattedDate
        };
        saveMockRequests(list);
        return {
          success: true,
          message: "Đã từ chối đơn nghỉ phép thành công (Mock Fallback)",
          data: list[index]
        };
      }
      throw error;
    }
  }
};

export default managementLeaveService;
