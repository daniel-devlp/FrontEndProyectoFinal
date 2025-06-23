import React from 'react';
import { Button, Modal as BootstrapModal } from 'react-bootstrap';
import '../../assets/styles/Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  size?: 'sm' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  onSubmit,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  size = 'lg',
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <BootstrapModal
      show={isOpen}
      onHide={onClose}
      size={size}
      centered
      className="custom-modal"
    >
      <div className="custom-modal-header">
        {title && <BootstrapModal.Title>{title}</BootstrapModal.Title>}
      </div>

      <div className="custom-modal-body">
        {onSubmit ? (
          <form onSubmit={handleSubmit}>
            {children}
          </form>
        ) : (
          children
        )}
      </div>

      <div className="custom-modal-footer">
        <Button variant="secondary" onClick={onClose}>
          {cancelText}
        </Button>
        {onSubmit && (
          <Button variant="primary" type="submit" onClick={handleSubmit}>
            {submitText}
          </Button>
        )}
      </div>
    </BootstrapModal>
  );
};

export default Modal;