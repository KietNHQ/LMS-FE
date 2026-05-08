import "./Modal.css";
import { FiX } from "react-icons/fi";

export default function Modal({
  open,
  title,
  children,
  onClose,
  closeOnOverlay = true,
  className = "",
}) {
  if (!open) return null;

  const handleOverlayClick = () => {
    if (!closeOnOverlay || typeof onClose !== "function") return;
    onClose();
  };

  const handleDialogClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="ui-modal-overlay" onClick={handleOverlayClick}>
      <div className={`ui-modal ${className}`.trim()} role="dialog" aria-modal="true" onClick={handleDialogClick}>
        {(title || onClose) && (
          <header className="ui-modal__header">
            {title ? <h3 className="ui-modal__title">{title}</h3> : <span />}
            {typeof onClose === "function" ? (
              <button
                type="button"
                className="ui-modal__close"
                onClick={onClose}
                aria-label="Dong hop thoai"
              >
                <FiX />
              </button>
            ) : null}
          </header>
        )}

        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  );
}
