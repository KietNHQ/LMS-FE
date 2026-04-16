import { useState } from "react";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { FiUploadCloud, FiFileText, FiCheck, FiX, FiArrowRight } from "react-icons/fi";
import { toast } from "react-toastify";
import "./AcademicStaffImport.css";

export default function AcademicStaffImport() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const [step, setStep] = useState(1);
    
    // Mock Data that "would be extracted" from excel
    const mockPreviewData = [
        { id: 1, studentId: "HS25001", name: "Nguyễn Trung Hiếu", dob: "12/05/2010", cls: "10A1", status: "Hợp lệ" },
        { id: 2, studentId: "HS25002", name: "Trần Mai Anh", dob: "22/11/2010", cls: "10A1", status: "Hợp lệ" },
        { id: 3, studentId: "HS25003", name: "Lê Văn Đạt", dob: "Sai định dạng", cls: "10A2", status: "Lỗi Dữ Liệu" },
        { id: 4, studentId: "HS25004", name: "Phạm Bình M", dob: "01/01/2010", cls: "", status: "Trống Lớp" }
    ];

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            toast.info(`Đang tải lên và phân tích file: ${file.name}`);
            setTimeout(() => {
                setStep(2);
            }, 1000);
        }
    };

    const handleImportSubmit = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                pending: 'Đang Import dữ liệu vào hệ thống...',
                success: 'Import thành công 2/4 bản ghi hợp lệ! 🎉',
                error: 'Import thất bại'
            }
        ).then(() => {
            setStep(1);
        });
    };

    return (
        <div className="academic-import">
            <PageHeader
                title="Import Dữ Liệu"
                eyebrow="Tải lên danh sách học sinh, giáo viên hoặc học bạ từ file Excel"
                actions={
                    <SchoolYearTermSelector
                        selectedSchoolYear={selectedSchoolYear}
                        selectedTerm={selectedTerm}
                        onYearChange={handleYearArrow}
                        onTermChange={handleTermChange}
                    />
                }
            />

            <div className="import-content">
                <div className="import-steps">
                    <div className={`step-item ${step === 1 ? 'active' : ''}`}>
                        <span className="step-number">1</span>
                        <span>Tải file Excel lên</span>
                    </div>
                    <FiArrowRight style={{color: '#cbd5e1'}} />
                    <div className={`step-item ${step === 2 ? 'active' : ''}`}>
                        <span className="step-number">2</span>
                        <span>Kiểm tra dữ liệu (Preview)</span>
                    </div>
                </div>

                {step === 1 && (
                    <div>
                        <div style={{marginBottom: '1rem'}}>
                            Mẫu Data chuẩn: <a href="#" style={{color: '#2563eb'}}>Tải File Mẫu (Template_Upload_HS.xlsx)</a>
                        </div>
                        <label className="upload-zone" htmlFor="excel-upload">
                            <FiUploadCloud />
                            <p>Kéo thả file vào đây hoặc Nhấn để chọn file</p>
                            <span>Hỗ trợ: .xlsx, .xls, .csv (Tối đa 5MB)</span>
                            <input 
                                type="file" 
                                id="excel-upload" 
                                style={{display: 'none'}} 
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileSelect}
                            />
                        </label>
                    </div>
                )}

                {step === 2 && (
                    <div className="preview-wrap">
                        <div className="preview-header">
                            <h4>Dữ liệu trích xuất từ file (Tìm thấy 4 bản ghi)</h4>
                            <div style={{display: 'flex', gap: '0.5rem'}}>
                                <button className="btn-secondary" onClick={() => setStep(1)}>
                                    Hủy tải lên
                                </button>
                                <button className="btn-primary" onClick={handleImportSubmit}>
                                    <FiCheck /> Xác nhận Import (Bỏ qua lỗi)
                                </button>
                            </div>
                        </div>
                        <div className="table-wrap">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>Mã Tạm</th>
                                        <th>Họ & Tên</th>
                                        <th>Ngày Sinh</th>
                                        <th>Lớp Dự Kiến</th>
                                        <th>Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockPreviewData.map(row => (
                                        <tr key={row.id}>
                                            <td>{row.studentId}</td>
                                            <td>{row.name}</td>
                                            <td style={row.dob === 'Sai định dạng' ? {color: '#dc2626'} : {}}>{row.dob}</td>
                                            <td style={!row.cls ? {color: '#dc2626'} : {}}>{row.cls || 'Chưa có'}</td>
                                            <td>
                                                <span className={`status-badge ${row.status === 'Hợp lệ' ? 'valid' : 'invalid'}`}>
                                                    {row.status === 'Hợp lệ' ? <FiCheck/> : <FiX/>} {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
