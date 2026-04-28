import React, { useState } from "react";
import "./teacherAssignmentSection.css";

export default function TeacherAssignmentSection({
	teacher,
	classOptions,
	onAssignClass,
	onRemoveAssignedClass,
	onUpdateHomeroomClass,
}) {
	const [classInput, setClassInput] = useState("");

	if (!teacher) {
		return (
			<section className="teacher-assignment-card">
				<h3>Phân công giảng dạy</h3>
				<p className="teacher-assignment-empty">Chọn giáo viên để phân công lớp.</p>
			</section>
		);
	}

	return (
		<section className="teacher-assignment-card">
			<h3>Phân công giảng dạy</h3>

			<div className="teacher-assignment-row">
				<span>Giáo viên</span>
				<strong>{teacher.name}</strong>
			</div>

			<div className="teacher-assignment-control">
				<label>Lớp chủ nhiệm</label>
				<select
					value={teacher.homeroomClass || ""}
					onChange={(e) => onUpdateHomeroomClass(e.target.value)}
				>
					<option value="">Chưa phân công</option>
					{classOptions.map((className) => (
						<option key={className} value={className}>
							{className}
						</option>
					))}
				</select>
			</div>

			<div className="teacher-assignment-control">
				<label>Thêm lớp giảng dạy</label>
				<div className="teacher-assignment-add-row">
					<input
						type="text"
						placeholder="VD: 10A3"
						value={classInput}
						onChange={(e) => setClassInput(e.target.value)}
					/>
					<button
						type="button"
						onClick={() => {
							onAssignClass(classInput);
							setClassInput("");
						}}
					>
						Thêm
					</button>
				</div>
			</div>

			<div className="teacher-assignment-chip-wrap">
				{(!teacher.assignedClasses || teacher.assignedClasses.length === 0) ? (
					<p className="teacher-assignment-empty">Chưa có lớp được phân công.</p>
				) : (
					(teacher.assignedClasses || []).map((className) => (
						<span key={className} className="teacher-assignment-chip">
							{className}
							<button type="button" onClick={() => onRemoveAssignedClass(className)}>
								x
							</button>
						</span>
					))
				)}
			</div>
		</section>
	);
}

