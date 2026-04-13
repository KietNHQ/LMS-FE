import { useEffect, useRef } from "react";
import NotificationItem from "../NotificationItem/NotificationItem";
import "./NotificationList.css";

export default function NotificationList({
    notifications,
    onOpen,
    onToggleImportant,
    hasMore = false,
    onLoadMore,
    isFiltered = false,
}) {
    const loadMoreRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (!hasMore || typeof onLoadMore !== "function") return undefined;

        const node = loadMoreRef.current;
        if (!node) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    onLoadMore();
                }
            },
            {
                root: scrollContainerRef.current,
                rootMargin: "160px",
            }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [hasMore, onLoadMore, notifications.length]);

    return (
        <div className="notification-scroll" ref={scrollContainerRef}>
            {notifications.map((item) => (
                <NotificationItem
                    key={item.id}
                    item={item}
                    onOpen={onOpen}
                    onToggleImportant={onToggleImportant}
                />
            ))}

            {notifications.length === 0 && (
                <div className="notification-list-empty">
                    {isFiltered
                        ? "Chưa có thông báo nào được đánh dấu."
                        : "Không có thông báo để hiển thị."}
                </div>
            )}

            {hasMore && <div ref={loadMoreRef} className="notification-load-sentinel" />}

            {hasMore && (
                <button
                    type="button"
                    className="notification-load-more-btn"
                    onClick={onLoadMore}
                >
                    Tải thêm 5 thông báo
                </button>
            )}

            {!hasMore && notifications.length > 0 && (
                <div className="notification-list-end">Đã hiển thị tất cả thông báo</div>
            )}
        </div>
    );
}

