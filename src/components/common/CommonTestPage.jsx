import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";

import { Button } from "../ui";
import {
    EmptyState,
    LoadingSpinner,
    PageHeader,
    SearchBar,
    SectionCard,
    StatusBadge,
} from "../common";

export default function CommonTestPage() {
    const [keyword, setKeyword] = useState("student");

    return (
        <div style={{ padding: "30px", display: "grid", gap: "24px" }}>
            <PageHeader
                eyebrow="Common Components"
                title="Common Test Page"
                description="Trang này dùng để test riêng các component trong thư mục components/common trước khi gắn vào từng module thật."
                actions={
                    <Button>
                        <FiPlus style={{ marginRight: 6 }} />
                        Add New
                    </Button>
                }
                breadcrumbs={["Home", "Common Test"]}
            />

            <SectionCard
                title="SearchBar"
                subtitle="Dùng cho tìm kiếm nhanh ở đầu bảng, danh sách, hoặc dashboard."
            >
                <SearchBar
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onClear={() => setKeyword("")}
                    placeholder="Search students, teachers, classes..."
                    rightAddon={<Button variant="secondary">Filter</Button>}
                />
            </SectionCard>

            <SectionCard
                title="StatusBadge"
                subtitle="Hiển thị trạng thái ngắn gọn, trực quan."
            >
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <StatusBadge status="active" />
                    <StatusBadge status="pending" />
                    <StatusBadge status="inactive" />
                    <StatusBadge status="published" />
                </div>
            </SectionCard>

            <SectionCard
                title="EmptyState"
                subtitle="Dùng khi chưa có dữ liệu để tránh giao diện bị trống."
            >
                <EmptyState
                    title="No data available"
                    description="Bạn có thể dùng component này cho danh sách trống, bảng trống, hoặc khi chưa tạo dữ liệu."
                    action={<Button variant="secondary">Create first item</Button>}
                />
            </SectionCard>

            <SectionCard
                title="LoadingSpinner"
                subtitle="Dùng khi đang tải dữ liệu từ API hoặc xử lý bất đồng bộ."
            >
                <LoadingSpinner label="Loading common components..." />
            </SectionCard>

            <SectionCard
                title="PageHeader Preview"
                subtitle="Ví dụ trực tiếp của PageHeader."
            >
                <PageHeader
                    eyebrow="Preview"
                    title="Student Management"
                    description="Manage student records, status, and learning progress."
                    actions={<Button variant="secondary">Export</Button>}
                    breadcrumbs={["Dashboard", "Students"]}
                />
            </SectionCard>
        </div>
    );
}