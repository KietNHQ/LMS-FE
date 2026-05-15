import { Button } from "../../../../../components/ui";
import "./exportReportSection.css";

const ExportReportSection = ({ isVisible, isFloating, onExportPdf }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div
        className={`admin-reports__export-compact admin-reports__export-inline ${
          isFloating ? "is-hidden" : ""
        }`}
        aria-label="Xuất báo cáo"
      >
        <span className="admin-reports__export-compact-label">Xuất báo cáo</span>
        <div className="admin-reports__export-actions">
          <Button size="sm" onClick={onExportPdf}>PDF</Button>
        </div>
      </div>

      <div
        className={`admin-reports__export-compact admin-reports__export-compact--floating ${
          isFloating ? "is-visible" : ""
        }`}
        aria-label="Xuất báo cáo nổi"
      >
        <span className="admin-reports__export-compact-label">Xuất báo cáo</span>
        <div className="admin-reports__export-actions">
          <Button size="sm" onClick={onExportPdf}>PDF</Button>
        </div>
      </div>
    </>
  );
};

export default ExportReportSection;
