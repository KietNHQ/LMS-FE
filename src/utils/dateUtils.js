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

const DATE_PART_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export const toDateOnlyString = (value, fallback = "") => {
  if (!value) return fallback;

  if (typeof value === "string") {
    const match = value.match(DATE_PART_PATTERN);
    if (match) return match[0];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateVi = (value, fallback = "-") => {
  if (!value) return fallback;

  if (typeof value === "string") {
    const match = value.match(DATE_PART_PATTERN);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
};

export const formatDateTimeVi = (value, fallback = "-") => {
  if (!value) return fallback;

  const normalizedValue = typeof value === "string" ? value.replace(" ", "T") : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};
