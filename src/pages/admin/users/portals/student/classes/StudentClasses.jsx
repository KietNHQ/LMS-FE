import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentClasses.css";
import { classList, upcomingTasks } from "./classesData";
import ClassesHeader from "./components/ClassesHeader/ClassesHeader";
import ClassStats from "./components/ClassStats/ClassStats";
import ClassToolbar from "./components/ClassToolbar/ClassToolbar";
import ClassList from "./components/ClassList/ClassList";
import TodoPanel from "./components/TodoPanel/TodoPanel";
import { Card } from "../../../../../../components/ui";

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

	const [searchValue, setSearchValue] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [lastVisitedClassId, setLastVisitedClassId] = useState(() =>
		localStorage.getItem(LAST_VISITED_CLASS_KEY)
	);

	const totalAssignmentsPending = useMemo(() => {
		return classList.reduce((sum, item) => sum + item.assignmentsPending, 0);
	}, []);

	const totalCompletedLessons = useMemo(() => {
		return classList.reduce((sum, item) => sum + item.completedLessons, 0);
	}, []);

	const totalLessons = useMemo(() => {
		return classList.reduce((sum, item) => sum + item.totalLessons, 0);
	}, []);

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
	}, []);

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
	}, [searchValue]);

	const totalPages = Math.max(1, Math.ceil(filteredClasses.length / ITEMS_PER_PAGE));

	const paginatedClasses = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredClasses.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredClasses, currentPage]);

	const lastVisitedClass = useMemo(() => {
		return classList.find((item) => String(item.id) === String(lastVisitedClassId)) || null;
	}, [lastVisitedClassId]);

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
			<ClassesHeader title="Lớp học của tôi" />

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
		</section>
	);
}


