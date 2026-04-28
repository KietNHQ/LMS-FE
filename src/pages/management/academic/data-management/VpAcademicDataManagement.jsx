import { PageHeader, SchoolYearTermSelector } from "../../../../components/common";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { FiDownloadCloud, FiUploadCloud } from "react-icons/fi";

export default function VpAcademicDataManagement() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem'}}>
            <PageHeader
                title="Quản Lý Dữ Liệu Học Tập"
                eyebrow="Kiết xuất dữ liệu điểm thi, khối lượng giảng dạy ra file Excel"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                <div style={{background: '#fff', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <h3 style={{margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><FiDownloadCloud /> Export (Kết Xuất)</h3>
                    <p style={{color: '#64748b', fontSize: '0.9rem', margin: '0 0 1rem 0'}}>Tải xuống các báo cáo định kỳ về dữ liệu điểm năng lực, danh sách thi...</p>
                    
                    <button style={{background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}>
                        <span style={{fontWeight: 500, color: '#334155'}}>Bảng điểm tất cả môn học T10</span>
                        <span style={{color: '#3b82f6', fontSize: '0.8rem'}}>Tải xuống (XLSX)</span>
                    </button>
                    <button style={{background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}>
                        <span style={{fontWeight: 500, color: '#334155'}}>Hồ sơ xét duyệt Hạnh kiểm / Học lực</span>
                        <span style={{color: '#3b82f6', fontSize: '0.8rem'}}>Tải xuống (CSV)</span>
                    </button>
                </div>

                <div style={{background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                    <div style={{width: '3rem', height: '3rem', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'}}>
                        <FiUploadCloud />
                    </div>
                    <div>
                        <h4 style={{margin: '0 0 0.5rem 0', color: '#1e3a8a'}}>Import Dữ Liệu Thi</h4>
                        <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>Kéo thả file .xlsx của nhà trường vào đây để nạp tự động, hoặc duyệt file.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
