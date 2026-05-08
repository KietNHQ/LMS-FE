export const getCurrentSchoolYear = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  if (currentMonth < 8) {
    return `${currentYear - 1}-${currentYear}`;
  }

  return `${currentYear}-${currentYear + 1}`;
};

export const getCurrentTerm = () => {
  const currentMonth = new Date().getMonth() + 1;

  // HK1 thường kéo dài từ tháng 8 đến tháng 12, HK2 từ tháng 1 đến tháng 5.
  // Tháng 6-7 là giai đoạn cuối năm học nên mặc định vẫn giữ HK2.
  if (currentMonth >= 8 && currentMonth <= 12) {
    return "hk1";
  }

  return "hk2";
};

export const shiftSchoolYear = (yearRange, direction) => {
  const [startRaw, endRaw] = yearRange.split("-");
  const start = Number(startRaw);
  const end = Number(endRaw);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return yearRange;
  }

  const delta = direction === "next" ? 1 : -1;
  return `${start + delta}-${end + delta}`;
};

