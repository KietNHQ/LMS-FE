export const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const getSemesterKey = (grade) => {
  const id = Number(grade.semester_id ?? grade.semesterId);
  const name = String(grade.semester_name || grade.semesterName || "").toLowerCase();
  if (name.includes("1") || (name.includes("i") && !name.includes("ii"))) return "hk1";
  if (name.includes("2") || name.includes("ii")) return "hk2";
  return id === 1 ? "hk1" : "hk2";
};

export const transformParentGradesData = (gradesArray) => {
  const bySemester = { hk1: {}, hk2: {}, year: {} };

  for (const grade of gradesArray || []) {
    const key = grade.subject_assignment_id || grade.subject_name || grade.subject;
    const semKey = getSemesterKey(grade);

    if (!bySemester[semKey][key]) {
      bySemester[semKey][key] = {
        subject: grade.subject_name || grade.subject || "—",
        oral: null,
        test15: null,
        midterm: null,
        final: null,
        average: null,
      };
    }

    const subject = bySemester[semKey][key];
    const category = (grade.category || grade.category_name || grade.grade_item_name || "").toLowerCase();
    const score = Number(grade.score);
    if (!Number.isFinite(score)) continue;

    if (category.includes("miệng") || category.includes("oral")) subject.oral = score;
    else if (category.includes("15") || category.includes("15phut")) subject.test15 = score;
    else if (category.includes("giữa") || category.includes("midterm") || category.includes("gk")) subject.midterm = score;
    else if (category.includes("cuối") || category.includes("final") || category.includes("ck")) subject.final = score;
    else {
      if (subject.oral == null) subject.oral = score;
      else if (subject.test15 == null) subject.test15 = score;
      else if (subject.midterm == null) subject.midterm = score;
      else if (subject.final == null) subject.final = score;
    }
  }

  const finalizeRows = (rowsBySubject) => Object.values(rowsBySubject).map((subject) => {
    const scores = [subject.oral, subject.test15, subject.midterm, subject.final].filter((value) => value != null);
    if (scores.length > 0) {
      subject.average = Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
    }
    return { ...subject };
  });

  const hk1 = finalizeRows(bySemester.hk1);
  const hk2 = finalizeRows(bySemester.hk2);
  const yearKeys = new Set([...hk1, ...hk2].map((row) => row.subject));
  const year = [...yearKeys].map((subjectName) => {
    const s1 = hk1.find((row) => row.subject === subjectName);
    const s2 = hk2.find((row) => row.subject === subjectName);
    const averageScores = [s1?.average, s2?.average].map(Number).filter(Number.isFinite);
    return {
      subject: subjectName,
      oral: s1?.oral ?? s2?.oral ?? null,
      test15: s1?.test15 ?? s2?.test15 ?? null,
      midterm: s1?.midterm ?? s2?.midterm ?? null,
      final: s1?.final ?? s2?.final ?? null,
      average: averageScores.length
        ? Math.round((averageScores.reduce((sum, score) => sum + score, 0) / averageScores.length) * 10) / 10
        : null,
    };
  });

  return { hk1, hk2, year };
};
