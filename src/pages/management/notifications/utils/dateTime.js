export const formatNotificationDateTime = (rawDate) => {
  if (!rawDate) return "Chưa có thời gian";

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};
