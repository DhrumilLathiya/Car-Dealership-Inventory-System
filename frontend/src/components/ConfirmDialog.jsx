import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, busy }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-container modal-sm confirm-dialog">
        <div className="confirm-icon">!</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-danger-solid" onClick={onConfirm} disabled={busy}>
            {busy ? 'Removing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
