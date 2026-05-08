import { Fragment } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Card, Select } from "../../../../../components/ui";
import "../attendanceReportSection/attendanceReportSection.css";
import "./teacherProgressReportSection.css";

const TeacherProgressReportSection = ({
  teacherList,
  selectedTeacherForTable,
  onTeacherChange,
  selectedTeacherClass,
  onTeacherClassChange,
  selectedTeacherData,
  teacherClassRows,
  expandedTeacherClasses,
  onToggleTeacherClass,
  scoreFormatter,
}) => {
  return (
    <Card title="Bảng giáo viên theo môn và lớp được phân công">
      {teacherList.length ? (
        <>
          <div className="admin-reports__table-filters">
            <Select
              label="Giáo viên"
              value={selectedTeacherForTable}
              onChange={onTeacherChange}
              options={teacherList.map((item) => ({
                value: item.teacherId,
                label: `${item.teacherName} - ${item.subject}`,
              }))}
              variant="custom"
              searchable
              searchPlaceholder="Tìm giáo viên..."
            />
            <Select
              label="Lớp được phân công"
              value={selectedTeacherClass}
              onChange={onTeacherClassChange}
              options={[
                { value: "all", label: "Tất cả lớp được phân công" },
                ...(selectedTeacherData?.assignedClasses || []).map((item) => ({
                  value: item.classId,
                  label: item.classId,
                })),
              ]}
              variant="custom"
            />
          </div>

          {selectedTeacherData ? (
            <div className="admin-reports__table-wrap">
              <table className="admin-reports__table">
                <thead>
                  <tr>
                    <th>Lớp</th>
                    <th>GVCN</th>
                    <th>Điểm TB lớp</th>
                    <th>TB tất cả lớp được phân công</th>
                    <th>Chênh lệch</th>
                    <th style={{ width: "60px", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {teacherClassRows.map((row) => {
                    const diff = row.classAverageScore - selectedTeacherData.avgAssignedClasses;
                    const isExpanded = expandedTeacherClasses[row.classId];
                    const hasMembers = Array.isArray(row.classMembers) && row.classMembers.length > 0;
                    const detailId = `teacher-class-detail-${row.classId}`;

                    return (
                      <Fragment key={row.classId}>
                        <tr>
                          <td>{row.classId}</td>
                          <td>{row.homeroomTeacher}</td>
                          <td>{scoreFormatter.format(row.classAverageScore)}</td>
                          <td>{scoreFormatter.format(selectedTeacherData.avgAssignedClasses)}</td>
                          <td>{`${diff >= 0 ? "+" : ""}${scoreFormatter.format(diff)}`}</td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className={`admin-reports__expand-btn ${isExpanded ? "open" : ""}`}
                              onClick={() => onToggleTeacherClass(row.classId)}
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
                          <td colSpan="6" className="admin-reports__expand-cell">
                            <div
                              id={detailId}
                              className={`admin-reports__expanded-detail ${isExpanded && hasMembers ? "is-open" : "is-closed"}`}
                            >
                              <p style={{ margin: "0 0 10px", color: "#344a7f", fontWeight: 600 }}>
                                GVCN: {row.homeroomTeacher}
                              </p>
                              <div style={{ overflowX: "auto" }}>
                                {hasMembers ? (
                                  <table className="admin-reports__grades-table">
                                    <thead>
                                      <tr>
                                        <th>Mã HS</th>
                                        <th>Tên học sinh</th>
                                        <th title="Kiểm tra miệng">Kiểm tra miệng</th>
                                        <th title="Kiểm tra 15 phút">15 phút</th>
                                        <th title="Kiểm tra 1 tiết">1 tiết</th>
                                        <th title="Kiểm tra giữa kỳ">Giữa kỳ</th>
                                        <th title="Kiểm tra cuối kỳ">Cuối kỳ</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {row.classMembers.map((member, index) => (
                                        <tr key={index}>
                                          <td>{member.studentId}</td>
                                          <td style={{ textAlign: "left", fontWeight: 600 }}>{member.name}</td>
                                          <td>{member.oralTest?.toFixed(1) || "-"}</td>
                                          <td>{member.test15min?.toFixed(1) || "-"}</td>
                                          <td>{member.test45min?.toFixed(1) || "-"}</td>
                                          <td>{member.midterm?.toFixed(1) || "-"}</td>
                                          <td>{member.final?.toFixed(1) || "-"}</td>
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
        </>
      ) : (
        <p className="admin-reports__loading">Không có dữ liệu giáo viên phù hợp bộ lọc.</p>
      )}
    </Card>
  );
};

export default TeacherProgressReportSection;
