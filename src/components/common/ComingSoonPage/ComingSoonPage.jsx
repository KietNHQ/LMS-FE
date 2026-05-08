/**
 * ComingSoonPage — placeholder component dùng cho các trang chưa xây dựng.
 * Props: title (string), description (string), icon (string emoji)
 */
import "./ComingSoonPage.css";

export default function ComingSoonPage({ title = "Trang đang phát triển", description, icon = "🚧" }) {
    return (
        <div className="coming-soon-page">
            <div className="coming-soon-page__card">
                <div className="coming-soon-page__icon">{icon}</div>
                <h1 className="coming-soon-page__title">{title}</h1>
                {description && (
                    <p className="coming-soon-page__description">{description}</p>
                )}
                <div className="coming-soon-page__badge">Đang phát triển</div>
            </div>
        </div>
    );
}

