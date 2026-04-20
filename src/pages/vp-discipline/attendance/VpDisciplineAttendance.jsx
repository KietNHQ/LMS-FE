import { useMemo, useState } from "react";
import { PageHeader } from "../../../components/common";
import DisciplineHeaderActions from "../components/DisciplineHeaderActions";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import {
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiPieChart,
  FiDownload,
  FiSearch,
  FiSend,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import "./VpDisciplineAttendance.css";

const ATTENDANCE_RECORDS = [
  {
    id: 1,
    studentName: "Nguyễn Văn A",
    className: "10A1",
    date: "2026-10-15",
    reason: "Sốt xuất huyết",
    type: "excused",
    lessonCount: 3,
    weekAbsences: 1,
    history: [
      { date: "2026-10-15", type: "excused", reason: "Sốt xuất huyết" },
      { date: "2026-09-21", type: "excused", reason: "Việc gia đình" },
    ],
  },
  {
    id: 2,
    studentName: "Trần Thị B",
    className: "11A5",
    date: "2026-10-15",
    reason: "Không rõ lý do",
    type: "unexcused",
    lessonCount: 5,
    weekAbsences: 3,
    history: [
      { date: "2026-10-15", type: "unexcused", reason: "Không rõ lý do" },
      { date: "2026-10-14", type: "unexcused", reason: "Không phản hồi" },
      { date: "2026-10-12", type: "late", reason: "Đến muộn tiết 1" },
    ],
  },
  {
    id: 3,
    studentName: "Lê C",
    className: "12A2",
    date: "2026-10-15",
    reason: "Việc gia đình",
    type: "excused",
    lessonCount: 2,
    weekAbsences: 1,
    history: [{ date: "2026-10-15", type: "excused", reason: "Việc gia đình" }],
  },
  {
    id: 4,
    studentName: "Hoàng D",
    className: "11A5",
    date: "2026-10-15",
    reason: "Ngủ quên",
    type: "unexcused",
    lessonCount: 4,
    weekAbsences: 2,
    history: [
      { date: "2026-10-15", type: "unexcused", reason: "Ngủ quên" },
      { date: "2026-10-10", type: "late", reason: "Đến muộn do kẹt xe" },
    ],
  },
  {
    id: 5,
    studentName: "Nguyễn E",
    className: "10A3",
    date: "2026-10-15",
    reason: "Nghỉ không lý do",
    type: "unexcused",
    lessonCount: 2,
    weekAbsences: 2,
    history: [
      { date: "2026-10-15", type: "unexcused", reason: "Nghỉ không lý do" },
      { date: "2026-10-11", type: "excused", reason: "Đi khám bệnh" },
    ],
  },
  {
    id: 6,
    studentName: "Phạm F",
    className: "12A1",
    date: "2026-10-15",
    reason: "Đến muộn tiết 2",
    type: "late",
    lessonCount: 1,
    weekAbsences: 0,
    history: [{ date: "2026-10-15", type: "late", reason: "Đến muộn tiết 2" }],
  },
];

const ATTENDANCE_TREND = [
  { date: "10/10", attendanceRate: 98.9, totalAbsences: 12 },
  { date: "11/10", attendanceRate: 98.7, totalAbsences: 15 },
  { date: "12/10", attendanceRate: 98.4, totalAbsences: 18 },
  { date: "13/10", attendanceRate: 98.8, totalAbsences: 11 },
  { date: "14/10", attendanceRate: 98.1, totalAbsences: 24 },
  { date: "15/10", attendanceRate: 98.5, totalAbsences: 16 },
];

const DEFAULT_DATE = "2026-10-15";

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "unexcused", label: "Không phép" },
  { value: "excused", label: "Có phép" },
  { value: "late", label: "Đi muộn" },
];

const typeLabelMap = {
  unexcused: "Không phép",
  excused: "Có phép",
  late: "Đi muộn",
};

const typeClassMap = {
  unexcused: "unexcused",
  excused: "excused",
  late: "late",
};

function getGradeFromClass(className) {
  if (!className) return "Không rõ";
  const grade = className.slice(0, 2);
  return `Khối ${grade}`;
}

export default function VpDisciplineAttendance() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const [records, setRecords] = useState(ATTENDANCE_RECORDS);
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const classOptions = useMemo(() => {
    const classes = Array.from(new Set(records.map((item) => item.className))).sort();
    return ["all", ...classes];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesDate = item.date === selectedDate;
      const matchesGrade = gradeFilter === "all" || item.className.startsWith(gradeFilter);
      const matchesClass = classFilter === "all" || item.className === classFilter;
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesSearch = [item.studentName, item.className, item.reason]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesDate && matchesGrade && matchesClass && matchesType && matchesSearch;
    });
  }, [records, selectedDate, gradeFilter, classFilter, typeFilter, searchTerm]);

  const selectedRecord = useMemo(
    () => filteredRecords.find((item) => item.id === selectedRecordId) || null,
    [filteredRecords, selectedRecordId],
  );

  const overview = useMemo(() => {
    const todayRecords = records.filter((item) => item.date === selectedDate);
    const totalStudents = 1250;
    const absentCount = todayRecords.filter((item) => item.type !== "late").length;
    const lateCount = todayRecords.filter((item) => item.type === "late").length;

    const byGrade = {
      "10": todayRecords.filter((item) => item.className.startsWith("10")).length,
      "11": todayRecords.filter((item) => item.className.startsWith("11")).length,
      "12": todayRecords.filter((item) => item.className.startsWith("12")).length,
    };

    return {
      totalPercent: Number((((totalStudents - absentCount - lateCount * 0.5) / totalStudents) * 100).toFixed(1)),
      k10Percent: Number((((420 - byGrade["10"]) / 420) * 100).toFixed(1)),
      k11Percent: Number((((415 - byGrade["11"]) / 415) * 100).toFixed(1)),
      k12Percent: Number((((415 - byGrade["12"]) / 415) * 100).toFixed(1)),
      gradeAbsence: byGrade,
    };
  }, [records, selectedDate]);

  const topAbsentClasses = useMemo(() => {
    const counter = {};
    records
      .filter((item) => item.date === selectedDate && item.type !== "late")
      .forEach((item) => {
        counter[item.className] = (counter[item.className] || 0) + 1;
      });

    return Object.entries(counter)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [records, selectedDate]);

  const topAbsentStudents = useMemo(() => {
    return [...records]
      .sort((a, b) => b.weekAbsences - a.weekAbsences)
      .slice(0, 3)
      .map((item) => ({ name: item.studentName, className: item.className, count: item.weekAbsences }));
  }, [records]);

  const handleQuickAction = (action, recordId) => {
    if (action === "mark-excused") {
      setRecords((prev) =>
        prev.map((item) => (item.id === recordId ? { ...item, type: "excused", reason: "Đã xác minh có phép" } : item)),
      );
      toast.success("Đã chuyển trạng thái sang có phép.");
      return;
    }

    if (action === "notify") {
      toast.info("Đã gửi nhắc nhở tới GVCN và phụ huynh.");
      return;
    }

    toast.warning("Đã tạo hồ sơ theo dõi nề nếp cho học sinh.");
  };

  const exportFilteredRows = () => {
    if (filteredRecords.length === 0) {
      toast.info("Không có dữ liệu để xuất theo bộ lọc hiện tại.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet([
      {
        school_year: selectedSchoolYear,
        semester: selectedTerm === "hk1" ? "Hoc ky 1" : "Hoc ky 2",
        report_date: selectedDate,
        grade: gradeFilter === "all" ? "Tat ca" : `Khoi ${gradeFilter}`,
        class_name: classFilter === "all" ? "Tat ca" : classFilter,
        status: TYPE_OPTIONS.find((option) => option.value === typeFilter)?.label,
        total_rows: filteredRecords.length,
      },
    ]);

    const detailSheet = XLSX.utils.json_to_sheet(
      filteredRecords.map((item) => ({
        record_id: item.id,
        student_name: item.studentName,
        class_name: item.className,
        grade: getGradeFromClass(item.className),
        date: item.date,
        status: typeLabelMap[item.type],
        reason: item.reason,
        affected_lessons: item.lessonCount,
        week_absences: item.weekAbsences,
      })),
    );

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Bộ lọc");
    XLSX.utils.book_append_sheet(workbook, detailSheet, "Chi tiết chuyên cần");

    XLSX.writeFile(workbook, `ChuyenCan_${selectedSchoolYear}_${selectedTerm}_${selectedDate}.xlsx`);
    toast.success("Đã xuất file Excel theo bộ lọc hiện tại.");
  };

  return (
    <div className="vp-attendance">
      <PageHeader
        title="Quản lý Chuyên cần"
        actions={
          <DisciplineHeaderActions
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="att-overview">
        <div className="att-card primary">
          <div className="att-info">
            <span className="att-label">Toàn trường (Hôm nay)</span>
            <span className="att-val">{overview.totalPercent}%</span>
          </div>
          <FiPieChart size={32} color="#93c5fd" />
        </div>
        <div className="att-card">
          <div className="att-info">
            <span className="att-label">Khối 10</span>
            <span className="att-val att-val--compact">{overview.k10Percent}%</span>
            <span className="absent-val">Vắng {overview.gradeAbsence["10"]}</span>
          </div>
        </div>
        <div className="att-card">
          <div className="att-info">
            <span className="att-label">Khối 11</span>
            <span className="att-val att-val--compact">{overview.k11Percent}%</span>
            <span className="absent-val">Vắng {overview.gradeAbsence["11"]}</span>
          </div>
        </div>
        <div className="att-card">
          <div className="att-info">
            <span className="att-label">Khối 12</span>
            <span className="att-val att-val--compact">{overview.k12Percent}%</span>
            <span className="absent-val">Vắng {overview.gradeAbsence["12"]}</span>
          </div>
        </div>
      </div>

      <div className="att-trend-panel att-panel">
        <div className="att-trend-header">
          <h3>Lịch sử chuyên cần 6 ngày gần nhất</h3>
          <span className="att-trend-note">So sánh hôm qua - hôm nay để phát hiện lệch bất thường</span>
        </div>
        <div className="att-trend-chart" role="list" aria-label="Xu hướng chuyên cần">
          {ATTENDANCE_TREND.map((point) => (
            <div className="att-trend-bar-wrap" key={point.date} role="listitem">
              <div className="att-trend-bar" style={{ height: `${Math.max(18, point.totalAbsences * 4)}px` }}>
                <span>{point.totalAbsences}</span>
              </div>
              <div className="att-trend-meta">
                <strong>{point.attendanceRate}%</strong>
                <span>{point.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="att-main">
        <div className="att-panel">
          <div className="att-panel-header">
            <h3>
              <FiClock /> Danh sách học sinh vắng mặt
            </h3>
            <button type="button" className="att-export-btn" onClick={exportFilteredRows}>
              <FiDownload /> Xuất Excel
            </button>
          </div>

          <div className="att-toolbar">
            <div className="att-search">
              <FiSearch />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm học sinh, lớp, lý do..."
              />
            </div>
            <input
              type="date"
              className="att-filter"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
            <select className="att-filter" value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)}>
              <option value="all">Tất cả khối</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
            <select className="att-filter" value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
              {classOptions.map((className) => (
                <option key={className} value={className}>
                  {className === "all" ? "Tất cả lớp" : className}
                </option>
              ))}
            </select>
            <select className="att-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="att-table-wrap">
            {filteredRecords.length === 0 ? (
              <div className="att-empty">Không có dữ liệu phù hợp với bộ lọc hiện tại.</div>
            ) : (
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Học sinh</th>
                    <th>Lớp</th>
                    <th>Ngày</th>
                    <th>Trạng thái</th>
                    <th>Lý do</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <strong>{student.studentName}</strong>
                      </td>
                      <td>{student.className}</td>
                      <td>{student.date}</td>
                      <td>
                        <span className={`status-badge ${typeClassMap[student.type]}`}>{typeLabelMap[student.type]}</span>
                      </td>
                      <td>{student.reason}</td>
                      <td>
                        <div className="att-row-actions">
                          <button type="button" className="att-btn-link" onClick={() => setSelectedRecordId(student.id)}>
                            Chi tiết
                          </button>
                          {student.type === "unexcused" ? (
                            <button
                              type="button"
                              className="att-btn-link danger"
                              onClick={() => handleQuickAction("mark-excused", student.id)}
                            >
                              Xác minh phép
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {selectedRecord ? (
            <div className="att-drilldown" aria-live="polite">
              <div className="att-drilldown__head">
                <h4>Drill-down: {selectedRecord.studentName}</h4>
                <span>
                  {selectedRecord.className} · {getGradeFromClass(selectedRecord.className)} · {selectedRecord.weekAbsences} lần/tuần
                </span>
              </div>

              <div className="att-drilldown__actions">
                <button type="button" className="att-action-btn" onClick={() => handleQuickAction("notify", selectedRecord.id)}>
                  <FiSend /> Gửi nhắc GVCN/PH
                </button>
                <button type="button" className="att-action-btn" onClick={() => handleQuickAction("incident", selectedRecord.id)}>
                  <FiFileText /> Tạo hồ sơ theo dõi
                </button>
                <button
                  type="button"
                  className="att-action-btn success"
                  onClick={() => handleQuickAction("mark-excused", selectedRecord.id)}
                >
                  <FiCheckCircle /> Đánh dấu đã xử lý
                </button>
              </div>

              <div className="att-history-wrap">
                <table className="att-history-table">
                  <thead>
                    <tr>
                      <th>Ngày</th>
                      <th>Trạng thái</th>
                      <th>Lý do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.history.map((entry) => (
                      <tr key={`${selectedRecord.id}-${entry.date}-${entry.type}`}>
                        <td>{entry.date}</td>
                        <td>
                          <span className={`status-badge ${typeClassMap[entry.type]}`}>{typeLabelMap[entry.type]}</span>
                        </td>
                        <td>{entry.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <div className="att-side-panels">
          <div className="att-panel">
            <h3 className="att-side-title">
              <FiAlertCircle color="#dc2626" /> Lớp vắng nhiều nhất
            </h3>
            <div className="stat-list">
              {topAbsentClasses.map((item) => (
                <div className="stat-item" key={item.name}>
                  <div className="stat-info">
                    <strong>Lớp {item.name}</strong>
                  </div>
                  <div className="stat-count">{item.count} lượt vắng</div>
                </div>
              ))}
            </div>
          </div>

          <div className="att-panel">
            <h3 className="att-side-title">
              <FiXCircle color="#dc2626" /> Cá biệt (vắng nhiều tuần này)
            </h3>
            <div className="stat-list">
              {topAbsentStudents.map((item) => (
                <div className="stat-item" key={item.name}>
                  <div className="stat-info">
                    <strong>{item.name}</strong>
                    <span>{item.className}</span>
                  </div>
                  <div className="stat-count">{item.count} ngày vắng</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
