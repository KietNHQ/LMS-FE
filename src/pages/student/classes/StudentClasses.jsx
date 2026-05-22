import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentClasses.css";
import ClassesHeader from "./components/ClassesHeader/ClassesHeader";
import ClassStats from "./components/ClassStats/ClassStats";
import ClassToolbar from "./components/ClassToolbar/ClassToolbar";
import ClassList from "./components/ClassList/ClassList";
import TodoPanel from "./components/TodoPanel/TodoPanel";
import { Card } from "../../../components/ui";
import { SchoolYearTermSelector, LoadingSpinner } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { studentService } from "../../../services/pages/student/studentService";

const ITEMS_PER_PAGE = 4;
const TOTAL_WEEKS = 15;
const LAST_VISITED_CLASS_KEY = "student_last_visited_class";

function normalizeSearchText(value) {
	return String(value ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();
}

export default function StudentClasses() {
	const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    
    const [isLoading, setIsLoading] = useState(true);
    const [classList, setClassList] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
	const [searchValue, setSearchValue] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [lastVisitedClassId, setLastVisitedClassId] = useState(() =>
		localStorage.getItem(LAST_VISITED_CLASS_KEY)
	);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
                const studentId = storedUser?.profile?.id || storedUser?.id;

                // 1. Lấy danh sách lớp học
                const classesRes = await studentService.getClasses({
                    pathParams: { id: studentId },
                    params: {
                        schoolYear: selectedSchoolYear,
                        term: selectedTerm
                    },
                    mock: false
                });
                if (classesRes.success && Array.isArray(classesRes.data)) {
                    // Chuẩn hóa dữ liệu nếu Backend trả về format khác FE mong đợi
                    const normalized = classesRes.data.map(c => ({
                        id: c.id,
                        title: c.title || c.subject || "Môn học",
                        code: c.code || "N/A",
                        teacher: c.teacher || "Chưa cập nhật",
                        schedule: c.schedule || "Chưa cập nhật",
                        progress: c.progress || 0,
                        completedLessons: c.completedLessons || 0,
                        totalLessons: c.totalLessons || 25,
                        assignmentsPending: c.assignmentsPending || 0,
                        className: c.className || c.class_name || "Lớp",
                        room: c.room || "—",
                        assignments: c.assignments || []
                    }));
                    setClassList(normalized);
                }

                // 2. Lấy dashboard để lấy upcoming tasks (hoặc API riêng nếu có)
                const dashRes = await studentService.getDashboard({ mock: false });
                if (dashRes.success && dashRes.data?.upcomingTests) {
                    setUpcomingTasks(dashRes.data.upcomingTests.map(t => ({
                        id: t.id,
                        title: t.title || t.name,
                        subject: t.subject,
                        due: t.due || t.deadline
                    })));
                }
            } catch (error) {
                console.warn("Failed to fetch classes data, using empty states.");
            } finally {
                setTimeout(() => setIsLoading(false), 500);
            }
        };

        fetchData();
    }, [selectedSchoolYear, selectedTerm]);

	const totalAssignmentsPending = useMemo(() => {
		return classList.reduce((sum, item) => sum + (item.assignmentsPending || 0), 0);
	}, [classList]);

	const totalCompletedLessons = useMemo(() => {
		return classList.reduce((sum, item) => sum + (item.completedLessons || 0), 0);
	}, [classList]);

	const totalLessons = useMemo(() => {
		return classList.reduce((sum, item) => sum + (item.totalLessons || 0), 0);
	}, [classList]);

	const currentWeek = useMemo(() => {
		if (!classList.length) return 1;
		const weekNumbers = classList.map((item) => {
			if (!item.totalLessons || !item.completedLessons) return 1;
			const ratio = item.completedLessons / item.totalLessons;
			return Math.max(1, Math.ceil(ratio * TOTAL_WEEKS));
		});
		const avgWeek = Math.round(
			weekNumbers.reduce((sum, week) => sum + week, 0) / weekNumbers.length
		);
		return Math.min(TOTAL_WEEKS, Math.max(1, avgWeek));
	}, [classList]);

	const filteredClasses = useMemo(() => {
		const keyword = normalizeSearchText(searchValue);
		if (!keyword) return classList;
		const keywordTokens = keyword.split(" ").filter(Boolean);
		return classList.filter((item) => {
			const searchableText = [item.title, item.teacher, item.className, item.room]
				.map((field) => normalizeSearchText(field))
				.join(" ");
			return keywordTokens.every((token) => searchableText.includes(token));
		});
	}, [searchValue, classList]);

	const totalPages = Math.max(1, Math.ceil(filteredClasses.length / ITEMS_PER_PAGE));

	const paginatedClasses = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredClasses.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredClasses, currentPage]);

	const lastVisitedClass = useMemo(() => {
		return classList.find((item) => String(item.id) === String(lastVisitedClassId)) || null;
	}, [lastVisitedClassId, classList]);

	const handleSearchChange = (e) => {
		setSearchValue(e.target.value);
		setCurrentPage(1);
	};

	const handleClearSearch = () => {
		setSearchValue("");
		setCurrentPage(1);
	};

	const handleViewClassDetail = (classId) => {
		localStorage.setItem(LAST_VISITED_CLASS_KEY, String(classId));
		setLastVisitedClassId(String(classId));
		navigate(`/student/classes/${classId}`);
	};

	const handleGoToLastVisitedClass = () => {
		if (!lastVisitedClass) return;
		navigate(`/student/classes/${lastVisitedClass.id}`);
	};

	const goPrevPage = () => {
		setCurrentPage((prev) => Math.max(1, prev - 1));
	};

	const goNextPage = () => {
		setCurrentPage((prev) => Math.min(totalPages, prev + 1));
	};

	return (
		<section className="student-classes-page">
			<ClassesHeader
				title="Lớp học của tôi"
				actions={
					<SchoolYearTermSelector
						selectedSchoolYear={selectedSchoolYear}
						selectedTerm={selectedTerm}
						onYearChange={handleYearArrow}
						onTermChange={handleTermChange}
					/>
				}
			/>

            {isLoading ? (
                <div className="layout-loading-wrapper" style={{ minHeight: "400px" }}>
                    <LoadingSpinner size="lg" label="Đang tải danh sách lớp học..." role="student" />
                </div>
            ) : (
                <>
                    <ClassStats
                        totalAssignmentsPending={totalAssignmentsPending}
                        totalCompletedLessons={totalCompletedLessons}
                        totalLessons={totalLessons}
                        currentWeek={currentWeek}
                        totalWeeks={TOTAL_WEEKS}
                    />

                    <div className="student-classes-layout">
                        <Card className="student-classes-main-card" bodyClassName="student-classes-main-card__body">
                            <ClassToolbar
                                searchValue={searchValue}
                                onSearchChange={handleSearchChange}
                                onClearSearch={handleClearSearch}
                                lastVisitedClass={lastVisitedClass}
                                onGoToLastVisitedClass={handleGoToLastVisitedClass}
                            />

                            <ClassList
                                classes={paginatedClasses}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPrevPage={goPrevPage}
                                onNextPage={goNextPage}
                                onViewClassDetail={handleViewClassDetail}
                            />
                        </Card>

                        <TodoPanel tasks={upcomingTasks} />
                    </div>
                </>
            )}
		</section>
	);
}

