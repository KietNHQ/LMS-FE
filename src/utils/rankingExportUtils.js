/**
 * Ranking Export Utilities
 * Exports discipline leaderboard data to styled Excel files using the xlsx library.
 */

import * as XLSX from "xlsx";

/**
 * Export discipline class rankings to an Excel file
 * @param {Array} rankingData - Array of ranking items from the leaderboard
 * @param {Object} meta - { schoolYear, term, week, normalizeBySize }
 */
export function exportRankingToExcel(rankingData, meta = {}) {
    const { schoolYear = "", term = "", week = 1, normalizeBySize = false } = meta;

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Bảng Xếp Hạng ──────────────────────────────────────────────
    const headerRow = [
        "Hạng",
        "Lớp",
        "GV Chủ Nhiệm",
        "Khối",
        "Điểm Gốc",
        "Cộng Thưởng",
        "Trừ Phạt",
        "Điểm Thi Đua",
        "Sĩ Số",
        "Hạng Trước",
        "Thay Đổi",
    ];

    const dataRows = rankingData.map((item) => [
        item.tied ? `${item.rank} (=)` : item.rank,
        item.class,
        item.homeroom,
        item.grade,
        item.rawScore != null ? Number(item.rawScore).toFixed(1) : "",
        Number(item.bonusPoints || 0).toFixed(1),
        item.penaltyPoints != null ? Number(item.penaltyPoints).toFixed(1) : "",
        Number(item.points).toFixed(2),
        item.studentCount,
        item.previousRank != null ? item.previousRank : "",
        item.isNew ? "Mới" : item.rankChange !== 0 ? (item.rankChange > 0 ? `+${item.rankChange}` : item.rankChange) : "—",
    ]);

    const sheetData = [headerRow, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Column widths
    ws["!cols"] = [
        { wch: 8 },   // Hạng
        { wch: 10 },  // Lớp
        { wch: 22 },  // GV Chủ Nhiệm
        { wch: 8 },   // Khối
        { wch: 12 },  // Điểm Gốc
        { wch: 12 },  // Cộng Thưởng
        { wch: 12 },  // Trừ Phạt
        { wch: 14 },  // Điểm Thi Đua
        { wch: 8 },   // Sĩ Số
        { wch: 10 },  // Hạng Trước
        { wch: 12 },  // Thay Đổi
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Bang_Xep_Hang");

    // ── Sheet 2: Tóm tắt ────────────────────────────────────────────────────
    const summaryData = [
        ["BÁO CÁO BẢNG XẾP HẠNG THI ĐUA NỀ NẾP"],
        [""],
        ["Năm học:", schoolYear],
        ["Học kỳ:", term],
        ["Tuần:", week],
        ["Chuẩn hóa theo sĩ số:", normalizeBySize ? "Có" : "Không"],
        [""],
        ["Tổng số lớp:", rankingData.length],
        ["Điểm TB toàn trường:", rankingData.length > 0
            ? (rankingData.reduce((s, r) => s + r.points, 0) / rankingData.length).toFixed(2)
            : "—"
        ],
        [""],
        ["Thời gian xuất:", new Date().toLocaleString("vi-VN")],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Tom_Tat");

    const fileName = `BXH_ThiDua_NeNep_T${week}_${schoolYear || "unknown"}.xlsx`;
    XLSX.writeFile(wb, fileName);
    return fileName;
}
