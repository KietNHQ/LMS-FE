export const PERIOD_DURATION_MINUTES = 45;
export const BREAK_AFTER_PERIOD_2_MINUTES = 15;

export const toMinutes = (hours, minutes) => hours * 60 + minutes;

export const formatTimeRange = (startMinute, endMinute) => {
  const startHour = String(Math.floor(startMinute / 60)).padStart(2, "0");
  const startMin = String(startMinute % 60).padStart(2, "0");
  const endHour = String(Math.floor(endMinute / 60)).padStart(2, "0");
  const endMin = String(endMinute % 60).padStart(2, "0");

  return `${startHour}:${startMin} - ${endHour}:${endMin}`;
};

export const buildSessionSlots = (sessionName, basePeriodNumber, firstStartMinute) => {
  const p1Start = firstStartMinute;
  const p2Start = p1Start + PERIOD_DURATION_MINUTES;
  const p3Start = p2Start + PERIOD_DURATION_MINUTES + BREAK_AFTER_PERIOD_2_MINUTES;
  const p4Start = p3Start + PERIOD_DURATION_MINUTES;
  const p5Start = p4Start + PERIOD_DURATION_MINUTES;
  const starts = [p1Start, p2Start, p3Start, p4Start, p5Start];

  return starts.map((startMinute, index) => {
    const endMinute = startMinute + PERIOD_DURATION_MINUTES;
    return {
      periodLabel: `Tiết ${basePeriodNumber + index}`,
      sessionLabel: sessionName,
      sessionName, // for ClassDetailSection compatibility
      startMinute,
      endMinute,
      timeRange: formatTimeRange(startMinute, endMinute),
    };
  });
};

export const LESSON_SLOTS = [
  ...buildSessionSlots("Buổi sáng", 1, toMinutes(7, 15)),
  ...buildSessionSlots("Buổi chiều", 1, toMinutes(13, 15)),
];

export const getCurrentLessonInfo = (date) => {
  const currentMinute = toMinutes(date.getHours(), date.getMinutes());

  const matchedSlot = LESSON_SLOTS.find(
    (slot) => currentMinute >= slot.startMinute && currentMinute < slot.endMinute
  );

  if (matchedSlot) {
    return {
      periodLabel: matchedSlot.periodLabel,
      sessionLabel: matchedSlot.sessionLabel,
      timeRange: matchedSlot.timeRange,
    };
  }

  return {
    periodLabel: "Ngoài khung tiết",
    sessionLabel: date.getHours() < 12 ? "Buổi sáng" : "Buổi chiều",
    timeRange: "",
  };
};

export const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const shiftDateKey = (baseDate, dayOffset) => {
  const shifted = new Date(baseDate);
  shifted.setDate(baseDate.getDate() + dayOffset);
  return toDateKey(shifted);
};

export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const REVIEW_CONTENT_MAPPING = {
  "Vi phạm: Chuyên cần": [
    { label: "Nghỉ học không phép (-15đ)", pts: -15 },
    { label: "Đi học muộn (-5đ)", pts: -5 },
    { label: "Trốn học, bỏ tiết (-50đ)", pts: -50 },
    { label: "Bỏ giờ trong tiết (-10đ)", pts: -10 },
  ],
  "Vi phạm: Nề nếp - Tác phong": [
    { label: "Vi phạm đồng phục/tác phong (-10đ)", pts: -10 },
    { label: "Mất trật tự trong giờ (-20đ)", pts: -20 },
    { label: "Nói tục, chửi thề (-15đ)", pts: -15 },
    { label: "Sử dụng điện thoại trái phép (-5đ)", pts: -5 },
    { label: "Ăn uống trong giờ (-3đ)", pts: -3 },
    { label: "Gây gổ, xô đẩy (-25đ)", pts: -25 },
    { label: "Bắt nạt, xúc phạm (-30đ)", pts: -30 },
  ],
  "Vi phạm: Tài sản - Môi trường": [
    { label: "Làm hư hỏng tài sản trường (-20đ)", pts: -20 },
    { label: "Vẽ bậy, bôi bẩn (-10đ)", pts: -10 },
    { label: "Vứt rác bừa bãi (-3đ)", pts: -3 },
    { label: "Không tắt điện/quạt khi ra về (-2đ)", pts: -2 },
  ],
  "Vi phạm: Học tập": [
    { label: "Không làm bài tập (-2đ)", pts: -2 },
    { label: "Không mang sách vở (-2đ)", pts: -2 },
    { label: "Gian lận thi cử (-50đ)", pts: -50 },
    { label: "Không tham gia hoạt động ngoại khóa (-5đ)", pts: -5 },
  ],
  "Khen thưởng & Tích cực": [
    { label: "Nhặt được của rơi trả lại (+20đ)", pts: 20 },
    { label: "Gương mẫu được tuyên dương (+20đ)", pts: 20 },
    { label: "Giúp đỡ bạn bè được ghi nhận (+10đ)", pts: 10 },
    { label: "Phát hiện sai phạm, báo cáo (+15đ)", pts: 15 },
    { label: "Tiến bộ rõ rệt (+20đ)", pts: 20 },
  ],
};

export const getReviewSummaryText = (review) => {
  if (!review) return "";
  if (typeof review === "string") return review;
  if (review.summary) return review.summary;
  if (!Array.isArray(review.entries) || review.entries.length === 0) return "";

  return review.entries
    .map((entry) => {
      const pointLabel = entry.pts > 0 ? `+${entry.pts}` : entry.pts;
      return [entry.category, entry.content?.label, entry.note, `Điểm: ${pointLabel}`].filter(Boolean).join(" • ");
    })
    .join(" || ");
};

export const normalizeReviewEntry = (entry) => ({
  id: entry.id ?? Date.now(),
  category: entry.category || "Vi phạm: Chuyên cần",
  content: entry.content || { label: "", pts: 0 },
  note: entry.note || "",
  pts: typeof entry.pts === "number" ? entry.pts : entry.content?.pts || 0,
});

export const normalizeStoredReview = (review) => {
  if (!review) return null;
  if (typeof review === "string") return { summary: review, entries: [] };

  return {
    summary: review.summary || getReviewSummaryText(review),
    entries: Array.isArray(review.entries) ? review.entries.map(normalizeReviewEntry) : [],
  };
};

export const getScoreGrade = (value) => {
  const normalized = (value || "").trim().toUpperCase();
  if (normalized.startsWith("A")) return "a";
  if (normalized.startsWith("B")) return "b";
  if (normalized.startsWith("C")) return "c";
  if (normalized.startsWith("D")) return "d";
  if (normalized.startsWith("F")) return "f";
  return "f";
};

export const getTermLabel = (term) => (term === "hk1" ? "Học kỳ 1" : "Học kỳ 2");

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

