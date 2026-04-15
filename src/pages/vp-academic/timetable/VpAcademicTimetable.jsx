import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";

export default function VpAcademicTimetable() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem'}}>
            <PageHeader
                title="Khung Thời Khóa Biểu Chung"
                eyebrow="Góc nhìn kiểm soát vướng lịch, kẹt lịch của PHT Chuyên Môn"
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
                <div style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: '#1e3a8a'}}>
                    <h3 style={{margin: '0 0 0.5rem 0'}}>Mô đun TKB Toàn Trường</h3>
                    <p style={{margin: 0, fontSize: '0.9rem', color: '#3b82f6'}}>Đã được đồng bộ với chức năng Thời khóa biểu bên Giáo Vụ. Nhấp vào các thẻ lớp bên dưới để thanh tra.</p>
                </div>
            </div>
        </div>
    );
}
