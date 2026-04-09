export default function Modal({ title, children, onClose, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={wide ? { maxWidth: 600 } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
