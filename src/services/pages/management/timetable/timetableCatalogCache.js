import axiosClient from "../../../shared/http/axiosClient";
import { adminApiService } from "../../admin/generated";
import { teachersService } from "../users/teachersService";
import { getGradeLevelFilterOptions } from "../../../shared/schoolYearLookup";

const TTL_MS = 5 * 60 * 1000;

const cache = {
  subjects: { ts: 0, rows: [] },
  rooms: { ts: 0, rows: [] },
  teachers: { ts: 0, rows: [] },
  gradeOptions: { ts: 0, rows: [] },
};

const isFresh = (entry) => entry.rows.length > 0 && Date.now() - entry.ts < TTL_MS;

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export async function loadTimetableStaticCatalog() {
  const tasks = [];

  if (!isFresh(cache.subjects)) {
    tasks.push(
      adminApiService.get_subjects().then((res) => {
        cache.subjects = {
          ts: Date.now(),
          rows: (res?.data || []).map((s) => ({
            value: s.name,
            label: s.name,
            code: s.code,
          })),
        };
      }),
    );
  }

  if (!isFresh(cache.rooms)) {
    tasks.push(
      axiosClient.get("/rooms").then((res) => {
        cache.rooms = {
          ts: Date.now(),
          rows: getRows(res).map((r) => ({
            value: r.name,
            label: `${r.name} (Tòa ${r.building || "?"})`,
            id: r.id,
          })),
        };
      }),
    );
  }

  if (!isFresh(cache.teachers)) {
    tasks.push(
      teachersService.listTeachers({ limit: 500 }).then((rows) => {
        cache.teachers = {
          ts: Date.now(),
          rows: rows.map((t) => ({
            value: t.name,
            label: t.name,
            id: t.id,
          })),
        };
      }),
    );
  }

  if (!isFresh(cache.gradeOptions)) {
    tasks.push(
      getGradeLevelFilterOptions().then((rows) => {
        cache.gradeOptions = { ts: Date.now(), rows };
      }),
    );
  }

  if (tasks.length > 0) {
    await Promise.all(tasks);
  }

  return {
    subjects: cache.subjects.rows,
    rooms: cache.rooms.rows,
    teachers: cache.teachers.rows,
    gradeOptions: cache.gradeOptions.rows,
  };
}
