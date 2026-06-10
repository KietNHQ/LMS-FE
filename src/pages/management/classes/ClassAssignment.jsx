import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiUsers, FiCheck, FiChevronRight, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { enrollmentService } from "../../../services/pages/management/classes/enrollmentService";
import { classesService } from "../../../services/pages/management/classes/classesService";
import { resolveSchoolYearId } from "../../../services/shared/schoolYearLookup";
import "./ClassAssignment.css";

export default function ClassAssignment() {
  const queryClient = useQueryClient();
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState(new Set());

  // Resolve schoolYearId
  const [schoolYearId, setSchoolYearId] = useState(null);
  useEffect(() => {
    resolveSchoolYearId(selectedSchoolYear).then(setSchoolYearId);
  }, [selectedSchoolYear]);

  // Load unassigned students
  const {
    data: unassignedStudents = [],
    isLoading: isLoadingPool,
    refetch: refetchPool,
  } = useQuery({
    queryKey: ["enrollment-pool", schoolYearId],
    queryFn: () => enrollmentService.getUnassignedPool(schoolYearId),
    enabled: !!schoolYearId,
  });

  // Load classes for the year
  const { data: allClasses = [] } = useQuery({
    queryKey: ["classes-for-assignment", selectedSchoolYear],
    queryFn: () => classesService.listClasses({ schoolYearName: selectedSchoolYear }),
    enabled: !!selectedSchoolYear,
  });

  const classesWithCapacity = useMemo(() => {
    return allClasses.map((cls) => ({
      ...cls,
      available: cls.maxStudents ? cls.maxStudents - cls.students : cls.maxStudents,
      capacity: `${cls.students}/${cls.maxStudents || 40}`,
      isFull: cls.maxStudents ? cls.students >= cls.maxStudents : false,
    }));
  }, [allClasses]);

  const selectedClass = useMemo(
    () => classesWithCapacity.find((c) => c.id === selectedClassId) || null,
    [classesWithCapacity, selectedClassId],
  );

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: ({ enrollmentIds, classId }) =>
      enrollmentService.assignClass(enrollmentIds, classId),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Xếp lớp thành công!");
      setSelectedEnrollmentIds(new Set());
      refetchPool();
      queryClient.invalidateQueries({ queryKey: ["classes-for-assignment"] });
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Không thể xếp lớp";
      toast.error(msg);
    },
  });

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return unassignedStudents;
    const kw = searchTerm.toLowerCase();
    return unassignedStudents.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(kw) ||
        s.student_code?.toLowerCase().includes(kw),
    );
  }, [unassignedStudents, searchTerm]);

  const handleToggleStudent = useCallback((enrollmentId) => {
    setSelectedEnrollmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(enrollmentId)) {
        next.delete(enrollmentId);
      } else {
        next.add(enrollmentId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedEnrollmentIds.size === filteredStudents.length) {
      setSelectedEnrollmentIds(new Set());
    } else {
      setSelectedEnrollmentIds(new Set(filteredStudents.map((s) => s.enrollment_id)));
    }
  }, [filteredStudents, selectedEnrollmentIds.size]);

  const handleAssign = useCallback(() => {
    if (!selectedClassId || selectedEnrollmentIds.size === 0) return;

    assignMutation.mutate({
      enrollmentIds: Array.from(selectedEnrollmentIds),
      classId: selectedClassId,
    });
  }, [selectedClassId, selectedEnrollmentIds, assignMutation]);

  return (
    <div className="class-assignment-page">
      <div className="ca-header">
        <div className="ca-title-row">
          <div className="ca-title">
            <FiUsers className="ca-title-icon" />
            <h1>Xếp lớp đầu năm</h1>
          </div>
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        </div>
      </div>

      <div className="ca-content">
        {/* Left: Unassigned Pool */}
        <div className="ca-pool-panel">
          <div className="ca-pool-header">
            <h2>Học sinh chưa xếp lớp</h2>
            <span className="ca-pool-count">{unassignedStudents.length} học sinh</span>
          </div>

          <div className="ca-search">
            <FiSearch />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ca-pool-actions">
            <button
              type="button"
              className="ca-btn-select-all"
              onClick={handleSelectAll}
              disabled={filteredStudents.length === 0}
            >
              {selectedEnrollmentIds.size === filteredStudents.length && filteredStudents.length > 0
                ? "Bỏ chọn tất cả"
                : "Chọn tất cả"}
            </button>
            <span className="ca-selected-count">
              Đã chọn: {selectedEnrollmentIds.size}
            </span>
          </div>

          <div className="ca-pool-list">
            {isLoadingPool ? (
              <div className="ca-empty">Đang tải...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="ca-empty">
                {unassignedStudents.length === 0
                  ? "Không có học sinh chờ xếp lớp"
                  : "Không tìm thấy học sinh"}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <label
                  key={student.enrollment_id}
                  className={`ca-student-item ${selectedEnrollmentIds.has(student.enrollment_id) ? "is-selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEnrollmentIds.has(student.enrollment_id)}
                    onChange={() => handleToggleStudent(student.enrollment_id)}
                  />
                  <div className="ca-student-info">
                    <span className="ca-student-name">{student.full_name}</span>
                    <span className="ca-student-meta">
                      {student.student_code}
                      {student.promotion_status && (
                        <span className="ca-student-badge">{student.promotion_status}</span>
                      )}
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Right: Class Selector */}
        <div className="ca-class-panel">
          <div className="ca-pool-header">
            <h2>Chọn lớp xếp vào</h2>
          </div>

          <div className="ca-class-list">
            {classesWithCapacity.map((cls) => (
              <div
                key={cls.id}
                className={`ca-class-item ${selectedClassId === cls.id ? "is-selected" : ""} ${cls.isFull ? "is-full" : ""}`}
                onClick={() => setSelectedClassId(cls.id)}
              >
                <div className="ca-class-info">
                  <span className="ca-class-name">{cls.name}</span>
                  <span className="ca-class-grade">{cls.grade}</span>
                </div>
                <div className="ca-class-capacity">
                  <div
                    className="ca-capacity-bar"
                    style={{
                      "--fill": `${Math.min(100, (cls.students / (cls.maxStudents || 40)) * 100)}%`,
                    }}
                  />
                  <span className={`ca-capacity-text ${cls.isFull ? "is-full" : ""}`}>
                    {cls.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedClass && (
            <div className="ca-assign-box">
              <div className="ca-assign-summary">
                <span>
                  Đã chọn <strong>{selectedEnrollmentIds.size}</strong> học sinh
                </span>
                <span>
                  Lớp <strong>{selectedClass.name}</strong> còn{" "}
                  <strong>{selectedClass.available}</strong> chỗ
                </span>
              </div>
              <button
                type="button"
                className="ca-btn-assign"
                onClick={handleAssign}
                disabled={
                  selectedEnrollmentIds.size === 0 ||
                  assignMutation.isPending
                }
              >
                <FiChevronRight />
                {assignMutation.isPending ? "Đang xếp..." : "Xếp vào lớp"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
