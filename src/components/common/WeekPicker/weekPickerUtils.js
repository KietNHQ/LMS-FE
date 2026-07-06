export const getWeekDateObjects = (weekNum) => {
  const startDate = new Date(2025, 7, 25);
  let totalDays = (weekNum - 1) * 7;

  if (weekNum > 8) totalDays += 7;
  if (weekNum > 17) totalDays += 14;
  if (weekNum > 22) totalDays += 14;
  if (weekNum > 30) totalDays += 7;

  startDate.setDate(startDate.getDate() + totalDays);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return { start: startDate, end: endDate };
};

export const getWeekDateRangeStr = (weekNum) => {
  const { start, end } = getWeekDateObjects(weekNum);
  const format = (date) =>
    `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;

  return `${format(start)} - ${format(end)}`;
};
