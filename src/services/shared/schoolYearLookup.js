import axiosClient from "./http/axiosClient";

const LOOKUP_CACHE_TTL = 5 * 60 * 1000;

const lookupCache = {
  gradeLevels: { ts: 0, rows: [] },
  schoolYears: { ts: 0, rows: [] },
  semesters: { ts: 0, rows: [] },
};

const CHANNEL_NAME = "lms-lookup-cache-sync";

let _channel = null;
const getChannel = () => {
  if (!_channel) {
    try {
      _channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      _channel = { postMessage: () => {}, addEventListener: () => {}, close: () => {} };
    }
  }
  return _channel;
};

const broadcastCacheUpdate = (cacheKey, rows) => {
  getChannel().postMessage({ type: "CACHE_UPDATE", cacheKey, rows, ts: Date.now() });
};

const onBroadcastMessage = (callback) => {
  const ch = getChannel();
  const handler = (event) => {
    if (event.data?.type === "CACHE_UPDATE") {
      callback(event.data.cacheKey, event.data.rows);
    }
  };
  ch.addEventListener("message", handler);
  return () => ch.removeEventListener("message", handler);
};

onBroadcastMessage((cacheKey, rows) => {
  const cached = lookupCache[cacheKey];
  if (!cached || cached.rows.length === 0) {
    lookupCache[cacheKey] = { ts: Date.now(), rows };
  }
});

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeText = (value) => `${value || ""}`.trim().toLowerCase();

const inFlightLoads = {};

const getCachedRows = async (cacheKey, loader) => {
  const cached = lookupCache[cacheKey];
  const now = Date.now();
  if (cached.rows.length > 0 && now - cached.ts < LOOKUP_CACHE_TTL) {
    return cached.rows;
  }
  if (!inFlightLoads[cacheKey]) {
    inFlightLoads[cacheKey] = loader().finally(() => {
      delete inFlightLoads[cacheKey];
    });
  }
  const rows = await inFlightLoads[cacheKey];
  lookupCache[cacheKey] = { ts: now, rows };
  broadcastCacheUpdate(cacheKey, rows);
  return rows;
};

export const getGradeLevelNumber = (item = {}) => {
  const level = item.levelNumber ?? item.level_number ?? item.gradeLevelNumber;
  if (level !== undefined && level !== null) {
    return `${level}`;
  }
  const matched = `${item.name || item.grade || item.label || ""}`.match(/\d+/);
  return matched ? matched[0] : "";
};

export const getSchoolYearName = (item = {}) =>
  item.name || item.school_year_name || item.schoolYearName || item.label || "";

const loadGradeLevels = async () => {
  try {
    const payload = await axiosClient.get("/grade-levels");
    return getRows(payload);
  } catch {
    return [];
  }
};

const loadSchoolYears = async () => {
  const token =
    sessionStorage.getItem("accessToken") ||
    (localStorage.getItem("isPersistent") === "true" ? localStorage.getItem("accessToken") : null);
  if (!token) return [];
  try {
    const payload = await axiosClient.get("/school-years");
    return getRows(payload);
  } catch {
    return [];
  }
};

const loadSemesters = async (schoolYearId) => {
  if (!schoolYearId) return [];
  try {
    const payload = await axiosClient.get("/semesters", {
      params: { schoolYearId },
    });
    const rows = getRows(payload);
    // Cache under the shared semesters key + also per-schoolYear sub-key
    lookupCache.semesters.rows = rows;
    lookupCache.semesters.key = schoolYearId;
    lookupCache.semesters.ts = Date.now();
    return rows;
  } catch {
    return [];
  }
};

export function clearSchoolYearCache() {
  lookupCache.schoolYears = { ts: 0, rows: [] };
}

export async function resolveSchoolYearId(schoolYearName) {
  if (!schoolYearName) return undefined;
  if (typeof schoolYearName === "number") return schoolYearName;
  const rows = await getCachedRows("schoolYears", loadSchoolYears);
  const target = normalizeText(schoolYearName);
  const currentYear = rows.find(
    (row) =>
      (row.is_current || row.isCurrent) &&
      normalizeText(getSchoolYearName(row)) === target
  );
  if (currentYear) return currentYear.id;
  const matched = rows.find(
    (row) => normalizeText(getSchoolYearName(row)) === target
  );
  return matched?.id;
}

/** Học kỳ đang active trong DB (is_current) → hk1 | hk2 */
export async function resolveCurrentTermKey(schoolYearName) {
  const schoolYearId = await resolveSchoolYearId(schoolYearName);
  if (!schoolYearId) return "hk1";

  const semesters = await loadSemesters(schoolYearId);
  const current = semesters.find((row) => row.is_current || row.isCurrent);
  if (!current) return "hk1";

  const name = normalizeText(current.name || "");
  if (name.includes("kỳ 1") || name.includes("ky 1") || name.includes("hoc ky 1")) {
    return "hk1";
  }
  if (name.includes("kỳ 2") || name.includes("ky 2") || name.includes("hoc ky 2")) {
    return "hk2";
  }
  return "hk1";
}

export async function resolveSemesterId(schoolYearName, termKey) {
  const schoolYearId = await resolveSchoolYearId(schoolYearName);
  if (!schoolYearId || !termKey) return undefined;

  // Use shared semesters cache with schoolYearId key
  const now = Date.now();
  const cached = lookupCache.semesters;
  if (
    cached.key === schoolYearId &&
    cached.rows.length > 0 &&
    now - cached.ts < LOOKUP_CACHE_TTL
  ) {
    const termLabel = termKey === "hk1" ? "học kỳ 1" : "học kỳ 2";
    const matched = cached.rows.find((row) =>
      normalizeText(row.name || "").includes(termLabel)
    );
    return matched?.id;
  }

  // Load and cache
  const semesters = await loadSemesters(schoolYearId);
  lookupCache.semesters = { ts: now, rows: semesters, key: schoolYearId };

  const termLabel = termKey === "hk1" ? "học kỳ 1" : "học kỳ 2";
  const matched = semesters.find((row) =>
    normalizeText(row.name || "").includes(termLabel)
  );
  return matched?.id;
}

export async function resolveSemester(schoolYearName, termKey) {
  const schoolYearId = await resolveSchoolYearId(schoolYearName);
  if (!schoolYearId || !termKey) return undefined;

  const cacheKey = `semesters:${schoolYearId}`;
  let semesters = lookupCache.semesters.rows;
  if (
    lookupCache.semesters.key !== schoolYearId ||
    semesters.length === 0 ||
    Date.now() - lookupCache.semesters.ts > LOOKUP_CACHE_TTL
  ) {
    semesters = await loadSemesters(schoolYearId);
    lookupCache.semesters = { ts: Date.now(), rows: semesters, key: schoolYearId };
  }

  const termLabel = termKey === "hk1" ? "học kỳ 1" : "học kỳ 2";
  const matched = semesters.find((row) => normalizeText(row.name || "").includes(termLabel));
  return matched;
}

export async function getGradeLevelFilterOptions() {
  const rows = await getCachedRows("gradeLevels", loadGradeLevels);
  const sorted = [...rows].sort(
    (a, b) => Number(getGradeLevelNumber(a)) - Number(getGradeLevelNumber(b)),
  );

  return [
    { value: "all", label: "Tất cả", id: null },
    ...sorted.map((row) => ({
      value: getGradeLevelNumber(row),
      label: row.name || `Khối ${getGradeLevelNumber(row)}`,
      id: row.id,
    })),
  ];
}

export async function resolveGradeLevelId(gradeValue) {
  if (!gradeValue || gradeValue === "all") return undefined;
  const rows = await getCachedRows("gradeLevels", loadGradeLevels);
  const target = `${gradeValue}`.replace(/^khối\s*/i, "").trim();
  const matched = rows.find((row) => getGradeLevelNumber(row) === target);
  return matched?.id;
}

export const dayLabelToApiDayOfWeek = (dayLabel) => {
  const map = {
    "chủ nhật": 1,
    "thứ 2": 2,
    "thứ 3": 3,
    "thứ 4": 4,
    "thứ 5": 5,
    "thứ 6": 6,
    "thứ 7": 7,
  };
  return map[normalizeText(dayLabel)];
};
