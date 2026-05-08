import axiosClient from "../../../shared/http/axiosClient";

export const DEFAULT_COMPETITION_RULES = {
  standardPoint: 100,
  attendance_violation: { unexcused: -15, late: -5, skip_class: -50, skip_period: -10 },
  discipline_violation: { uniform: -10, disorder: -20, swearing: -15, phone: -5, eating: -3, fighting: -25, bullying: -30 },
  property_violation: { damage: -20, vandalism: -10, littering: -3, no_electricity: -2 },
  academic_violation: { no_homework: -2, no_materials: -2, cheating: -50, no_extracurricular: -5 },
  attendance_reward: { month: 20, semester: 50, no_late_semester: 10 },
  academic_reward: { school: 30, province: 50, national: 100, improvement: 20, high_avg: 15 },
  activity_reward: { first_school: 20, second_school: 15, first_province: 50, national: 100, volunteer: 15, club: 10 },
  positive_reward: { found_lost: 20, report_risk: 5, role_model: 20, help_peers: 10, report_violation: 15 },
};

const FIELD_SPECS = [
  { group: "attendance_violation", key: "unexcused", type: "violation", category: "attendance", keywords: ["unexcused", "khong phep", "nghi hoc"] },
  { group: "attendance_violation", key: "late", type: "violation", category: "attendance", keywords: ["late", "muon"] },
  { group: "attendance_violation", key: "skip_class", type: "violation", category: "attendance", keywords: ["skip_class", "tron hoc", "bo tiet"] },
  { group: "attendance_violation", key: "skip_period", type: "violation", category: "attendance", keywords: ["skip_period", "bo gio"] },
  { group: "discipline_violation", key: "uniform", type: "violation", category: "discipline", keywords: ["uniform", "dong phuc", "tac phong"] },
  { group: "discipline_violation", key: "disorder", type: "violation", category: "discipline", keywords: ["disorder", "trat tu"] },
  { group: "discipline_violation", key: "swearing", type: "violation", category: "discipline", keywords: ["swearing", "noi tuc", "chui"] },
  { group: "discipline_violation", key: "phone", type: "violation", category: "discipline", keywords: ["phone", "dien thoai"] },
  { group: "discipline_violation", key: "eating", type: "violation", category: "discipline", keywords: ["eating", "an uong"] },
  { group: "discipline_violation", key: "fighting", type: "violation", category: "discipline", keywords: ["fighting", "gay go", "xo day"] },
  { group: "discipline_violation", key: "bullying", type: "violation", category: "discipline", keywords: ["bullying", "bat nat", "xuc pham"] },
  { group: "property_violation", key: "damage", type: "violation", category: "property", keywords: ["damage", "hu hong"] },
  { group: "property_violation", key: "vandalism", type: "violation", category: "property", keywords: ["vandal", "ve bay", "boi ban"] },
  { group: "property_violation", key: "littering", type: "violation", category: "property", keywords: ["litter", "rac"] },
  { group: "property_violation", key: "no_electricity", type: "violation", category: "property", keywords: ["electric", "dien", "quat"] },
  { group: "academic_violation", key: "no_homework", type: "violation", category: "learning", keywords: ["homework", "bai tap"] },
  { group: "academic_violation", key: "no_materials", type: "violation", category: "learning", keywords: ["materials", "sach", "vo"] },
  { group: "academic_violation", key: "cheating", type: "violation", category: "learning", keywords: ["cheat", "gian lan"] },
  { group: "academic_violation", key: "no_extracurricular", type: "violation", category: "learning", keywords: ["ngoai khoa", "extracurricular"] },

  { group: "attendance_reward", key: "month", type: "reward", category: "attendance", keywords: ["month", "thang", "chuyen can"] },
  { group: "attendance_reward", key: "semester", type: "reward", category: "attendance", keywords: ["semester", "hoc ky", "100%"] },
  { group: "attendance_reward", key: "no_late_semester", type: "reward", category: "attendance", keywords: ["no_late", "khong muon"] },
  { group: "academic_reward", key: "school", type: "reward", category: "academic", keywords: ["school", "cap truong"] },
  { group: "academic_reward", key: "province", type: "reward", category: "academic", keywords: ["province", "tinh", "tp"] },
  { group: "academic_reward", key: "national", type: "reward", category: "academic", keywords: ["national", "quoc gia", "quoc te"] },
  { group: "academic_reward", key: "improvement", type: "reward", category: "academic", keywords: ["improvement", "tien bo"] },
  { group: "academic_reward", key: "high_avg", type: "reward", category: "academic", keywords: ["high_avg", "diem tb", "8.0"] },
  { group: "activity_reward", key: "first_school", type: "reward", category: "activity", keywords: ["first_school", "nhat truong"] },
  { group: "activity_reward", key: "second_school", type: "reward", category: "activity", keywords: ["second_school", "nhi", "ba"] },
  { group: "activity_reward", key: "first_province", type: "reward", category: "activity", keywords: ["first_province", "nhat tinh"] },
  { group: "activity_reward", key: "national", type: "reward", category: "activity", keywords: ["national", "quoc gia", "quoc te"] },
  { group: "activity_reward", key: "volunteer", type: "reward", category: "activity", keywords: ["volunteer", "tinh nguyen"] },
  { group: "activity_reward", key: "club", type: "reward", category: "activity", keywords: ["club", "clb"] },
  { group: "positive_reward", key: "found_lost", type: "reward", category: "positive", keywords: ["found", "cua roi"] },
  { group: "positive_reward", key: "report_risk", type: "reward", category: "positive", keywords: ["report_risk", "bao", "nguy co"] },
  { group: "positive_reward", key: "role_model", type: "reward", category: "positive", keywords: ["role_model", "guong mau"] },
  { group: "positive_reward", key: "help_peers", type: "reward", category: "positive", keywords: ["help", "giup do"] },
  { group: "positive_reward", key: "report_violation", type: "reward", category: "positive", keywords: ["report_violation", "phat hien", "sai pham"] },
];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getPayload = (response) => response?.data ?? response ?? {};

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rankings)) return payload.rankings;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const cloneRules = (rules) => JSON.parse(JSON.stringify(rules));

const normalizeText = (value = "") =>
  `${value}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const findTypeBySpec = (rows, spec) => {
  const categoryRows = rows.filter((row) => `${row?.category || ""}`.toLowerCase() === spec.category);
  if (categoryRows.length === 0) {
    return null;
  }

  const fullText = (row) => normalizeText(`${row?.code || ""} ${row?.name || ""}`);
  for (const keyword of spec.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    const matched = categoryRows.find((row) => fullText(row).includes(normalizedKeyword));
    if (matched) {
      return matched;
    }
  }

  return null;
};

const mapPointConfig = (violationRows, rewardRows) => {
  const rules = cloneRules(DEFAULT_COMPETITION_RULES);
  const mapping = {};

  FIELD_SPECS.forEach((spec) => {
    const sourceRows = spec.type === "violation" ? violationRows : rewardRows;
    const matched = findTypeBySpec(sourceRows, spec);
    if (!matched) {
      return;
    }

    const rawPoints = toNumber(matched?.points ?? matched?.point, rules[spec.group][spec.key]);
    rules[spec.group][spec.key] = spec.type === "violation" ? -Math.abs(rawPoints) : Math.abs(rawPoints);
    mapping[`${spec.group}.${spec.key}`] = {
      id: matched.id,
      type: spec.type,
    };
  });

  return { rules, mapping };
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseClassName = (item = {}) => {
  const raw = item.className ?? item.class_name ?? item.name ?? item.label ?? "";
  return `${raw}`.replace(/^Lop\s*/i, "").replace(/^Lớp\s*/i, "").trim();
};

const parseGrade = (className = "") => {
  const matched = `${className}`.match(/\d+/);
  return matched ? matched[0] : "";
};

const buildDateRange = ({ schoolYear, term, week }) => {
  const weekNumber = Number(week);
  if (!Number.isFinite(weekNumber) || weekNumber <= 0) {
    return {};
  }

  const [startRaw, endRaw] = `${schoolYear || ""}`.split("-");
  const startYear = Number(startRaw);
  const endYear = Number(endRaw);
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    return {};
  }

  // Match FE week picker ranges: HK1 (weeks 1-18), HK2 (weeks 19-35).
  let termStart;
  let weekOffset;

  if (term === "hk2") {
    termStart = new Date(endYear, 0, 5);
    weekOffset = weekNumber - 19;
  } else {
    termStart = new Date(startYear, 7, 25);
    weekOffset = weekNumber - 1;
  }

  termStart.setHours(0, 0, 0, 0);

  const startDate = new Date(termStart);
  startDate.setDate(startDate.getDate() + weekOffset * 7);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

const normalizeRankingItem = (item, index) => {
  const className = parseClassName(item);

  return {
    id: item?.classId ?? item?.class_id ?? item?.id ?? index + 1,
    className,
    teacher:
      item?.teacherName ??
      item?.homeroomTeacher ??
      item?.teacher_name ??
      item?.homeroom_teacher_name ??
      "Chua phan cong",
    totalPoints: toNumber(
      item?.totalPoints ??
        item?.score ??
        item?.avg_discipline_score ??
        item?.avgDisciplineScore ??
        item?.point
    ),
    rank: toNumber(item?.rank ?? item?.position ?? index + 1),
    trend: item?.trend ?? "stable",
    grade: parseGrade(className),
    studentCount: toNumber(item?.student_count ?? item?.studentCount),
  };
};

const requestWithEndpointFallback = async (endpoints, params) => {
  let lastError;

  for (const endpoint of endpoints) {
    try {
      return await axiosClient.get(endpoint, { params });
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status !== 404 && status !== 405) {
        throw error;
      }
    }
  }

  throw lastError;
};

export const adminCompetitionService = {
  getClassRankings: async ({ schoolYear, term, week } = {}) => {
    const params = {
      ...(week ? { week } : {}),
      ...buildDateRange({ schoolYear, term, week }),
    };

    const response = await requestWithEndpointFallback(
      ["/discipline/class/rankings", "/discipline/class-ranking"],
      Object.keys(params).length > 0 ? params : undefined
    );

    const rows = getRows(getPayload(response));
    return rows.map(normalizeRankingItem).filter((item) => item.className);
  },

  getPointConfig: async () => {
    const [violationRes, rewardRes] = await Promise.all([
      axiosClient.get("/violation-types", { params: { page: 1, limit: 500, isActive: true } }),
      axiosClient.get("/reward-types", { params: { page: 1, limit: 500, isActive: true } }),
    ]);

    const violationRows = getRows(getPayload(violationRes));
    const rewardRows = getRows(getPayload(rewardRes));
    return mapPointConfig(violationRows, rewardRows);
  },

  updatePointConfig: async (rules, mapping = {}) => {
    const tasks = Object.entries(mapping).map(([fieldPath, meta]) => {
      const [group, key] = fieldPath.split(".");
      const raw = toNumber(rules?.[group]?.[key]);
      const points = Math.abs(raw);
      const endpoint = meta.type === "violation" ? "/violation-types" : "/reward-types";
      return axiosClient.put(`${endpoint}/${meta.id}/points`, { points });
    });

    await Promise.all(tasks);
    return { success: true };
  },
};




