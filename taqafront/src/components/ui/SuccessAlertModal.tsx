import React from 'react';
import { AlertModal } from './alert-modal';
import Alert from './alert/Alert';

interface SuccessAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const SuccessAlertModal: React.FC<SuccessAlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  // Auto-close after 5 seconds
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Format message with proper line breaks
  const formattedMessage = message.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < message.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <AlertModal 
      isOpen={isOpen} 
      onClose={onClose}
      className="absolute top-4 right-4 w-auto min-w-[320px] max-w-[420px] transform transition-all duration-500 ease-in-out animate-slide-in-right"
    >
      <Alert
        variant="success"
        title={title}
        message={formattedMessage}
      />
    </AlertModal>
  );
};

export default SuccessAlertModal; 