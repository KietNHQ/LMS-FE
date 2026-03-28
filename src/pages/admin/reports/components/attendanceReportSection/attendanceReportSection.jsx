import { Fragment } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Card, Select } from "../../../../../components/ui";
import "./attendanceReportSection.css";

const AttendanceReportSection = ({
  gradeAttendanceRows,
  scoreFormatter,
  percentFormatter,
  selectedGrade,
  onGradeChange,
  gradeList,
  selectedGradeData,
  gradeClassRows,
  expandedGradeClasses,
  onToggleGradeClass,
}) => {
  return (
    <Card title="Báo cáo theo khối và lớp">
      <div className="admin-reports__table-wrap">
        <table className="admin-reports__table">
          <thead>
            <tr>
              <th>Khối</th>
              <th>Điểm TB môn</th>
              <th>Tỉ lệ đi học</th>
              <th>Tỉ lệ nghỉ học</th>
              <th>Tỉ lệ đi muộn</th>
            </tr>
          </thead>
          <tbody>
            {gradeAttendanceRows.map((item) => (
              <tr key={item.grade}>
                <td>{item.grade}</td>
                <td>{scoreFormatter.format(item.averageScore)}</td>
                <td>{`${percentFormatter.format(item.attendance.presentRate)}%`}</td>
                <td>{`${percentFormatter.format(item.attendance.absentRate)}%`}</td>
                <td>{`${percentFormatter.format(item.attendance.lateRate)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-reports__table-filters admin-reports__table-filters--single">
        <Select
          label="Chọn khối để xem chi tiết lớp"
          value={selectedGrade}
          onChange={onGradeChange}
          options={gradeList.map((item) => ({ value: item.grade, label: item.grade }))}
          variant="custom"
        />
      </div>

      {selectedGradeData ? (
        <div className="admin-reports__table-wrap">
          <table className="admin-reports__table">
            <thead>
              <tr>
                <th>Lớp</th>
                <th>GVCN</th>
                <th>Điểm TB môn</th>
                <th>Tỉ lệ đi học</th>
                <th>Tỉ lệ nghỉ học</th>
                <th>Tỉ lệ đi muộn</th>
                <th style={{ width: "60px", textAlign: "center" }}></th>
              </tr>
            </thead>
            <tbody>
              {gradeClassRows.map((classItem) => {
                const isExpanded = expandedGradeClasses[classItem.classId];
                const hasMembers = Array.isArray(classItem.classMembers) && classItem.classMembers.length > 0;
                const detailId = `grade-class-detail-${classItem.classId}`;

                return (
                  <Fragment key={classItem.classId}>
                    <tr>
                      <td>{classItem.classId}</td>
                      <td>{classItem.homeroomTeacher}</td>
                      <td>{scoreFormatter.format(classItem.averageScore)}</td>
                      <td>{`${percentFormatter.format(classItem.attendance.presentRate)}%`}</td>
                      <td>{`${percentFormatter.format(classItem.attendance.absentRate)}%`}</td>
                      <td>{`${percentFormatter.format(classItem.attendance.lateRate)}%`}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className={`admin-reports__expand-btn ${isExpanded ? "open" : ""}`}
                          onClick={() => onToggleGradeClass(classItem.classId)}
                          type="button"
                          aria-label="Xem chi tiết lớp"
                          aria-expanded={isExpanded && hasMembers}
                          aria-controls={detailId}
                        >
                          <FiChevronDown />
                        </button>
                      </td>
                    </tr>

                    <tr className="admin-reports__expand-row">
                      <td colSpan="7" className="admin-reports__expand-cell">
                        <div
                          id={detailId}
                          className={`admin-reports__expanded-detail ${isExpanded && hasMembers ? "is-open" : "is-closed"}`}
                        >
                          <p style={{ margin: "0 0 10px", color: "#344a7f", fontWeight: 600 }}>
                            GVCN: {classItem.homeroomTeacher}
                          </p>
                          <div style={{ overflowX: "auto" }}>
                            {hasMembers ? (
                              <table className="admin-reports__grades-table">
                                <thead>
                                  <tr>
                                    <th>Mã HS</th>
                                    <th>Tên học sinh</th>
                                    <th>Điểm trung bình</th>
                                    <th>Số ngày đi học / Tổng ngày</th>
                                    <th>Ngày nghỉ</th>
                                    <th>Ngày đi muộn</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {classItem.classMembers.map((member, index) => (
                                    <tr key={index}>
                                      <td>{member.studentId}</td>
                                      <td style={{ textAlign: "left", fontWeight: 600 }}>{member.name}</td>
                                      <td>{scoreFormatter.format(member.averageScore)}</td>
                                      <td>{`${member.attendanceDays.presentDays}/${member.attendanceDays.requiredDays}`}</td>
                                      <td>{member.attendanceDays.absentDays}</td>
                                      <td>{member.attendanceDays.lateDays}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="admin-reports__loading" style={{ padding: "10px 0" }}>
                                Không có dữ liệu học sinh cho lớp này.
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
};

export default AttendanceReportSection;