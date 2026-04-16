import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";

export default function VpAcademicNotifications() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem'}}>
            <PageHeader
                title="Thông Báo Chỉ Đạo Chuyên Môn"
                eyebrow="Liên lạc và gửi chỉ thị nhắc nhở tới Tổ Chuyên môn và Giáo viên"
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
                <div style={{background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', color: '#64748b'}}>
                    <p style={{margin: 0}}>Module phát thông báo đồng bộ với Cổng Kỷ luật và Giáo vụ. Giao diện đang được tối ưu riêng.</p>
                </div>
            </div>
        </div>
    );
}
