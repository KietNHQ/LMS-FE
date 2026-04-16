import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiCalendar, FiPlus } from "react-icons/fi";

export default function VpAcademicExams() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem'}}>
            <PageHeader
                title="Quản Lý Lịch Thi"
                eyebrow="Kiểm soát, dời, hoặc xếp lịch thi tập trung"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div style={{background: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h3 style={{margin: 0, color: '#0f172a'}}>Kỳ thi sắp diễn ra</h3>
                    <button style={{background: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                        <FiPlus /> Tổ chức kỳ thi mới
                    </button>
                </div>

                <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                    {[
                        {title: "Thi Giữa Kỳ - Khối 10", time: "25/11 - 28/11/2026", status: "Sắp tới"},
                        {title: "Thi Học Kỳ I - Toàn Trường", time: "15/12 - 22/12/2026", status: "Đang lập kế hoạch"}
                    ].map((exam, i) => (
                        <div key={i} style={{flex: '1 1 300px', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <strong style={{color: '#1e3a8a', fontSize: '1.1rem'}}>{exam.title}</strong>
                                <span style={{padding: '0.2rem 0.5rem', background: '#dbeafe', color: '#1d4ed8', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 600}}>{exam.status}</span>
                            </div>
                            <span style={{color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                                <FiCalendar /> {exam.time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
