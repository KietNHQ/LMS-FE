import NotificationItem from "../NotificationItem/NotificationItem";
import "./NotificationList.css";

export default function NotificationList({ notifications, onOpen, onToggleImportant }) {
    return (
        <div className="notification-scroll">
            {notifications.map((item) => (
                <NotificationItem
                    key={item.id}
                    item={item}
                    onOpen={onOpen}
                    onToggleImportant={onToggleImportant}
                />
            ))}
        </div>
    );
}
