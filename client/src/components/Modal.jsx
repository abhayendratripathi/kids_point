import React, { useEffect } from 'react';
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-drag" />
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}
