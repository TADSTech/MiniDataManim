import { motion } from 'motion/react';
import { Info, OctagonAlert, TriangleAlert, HelpCircle, type LucideIcon } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    type VariantStyle = {
      Icon: LucideIcon;
      iconBg: string;
      iconColor: string;
      buttonClass: string;
    };

    switch (variant) {
      case 'danger':
        return {
          Icon: OctagonAlert,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonClass: 'bg-red-600! btn-primary',
        } satisfies VariantStyle;
      case 'warning':
        return {
          Icon: TriangleAlert,
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        } satisfies VariantStyle;
      default:
        return {
          Icon: Info,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonClass: 'btn-primary',
        } satisfies VariantStyle;
    }
  };

  const styles = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-(--color-bg) rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <styles.Icon className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-(--color-text) mb-2">
                {title}
              </h3>
              <p className="text-(--color-text-secondary) whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-(--color-border) px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={styles.buttonClass}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ChoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChoice: (choice: boolean) => void;
  title: string;
  message: string;
  option1Text: string;
  option2Text: string;
}

export function ChoiceDialog({
  isOpen,
  onClose,
  onChoice,
  title,
  message,
  option1Text,
  option2Text,
}: ChoiceDialogProps) {
  if (!isOpen) return null;

  const handleChoice = (choice: boolean) => {
    onChoice(choice);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-(--color-bg) rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-(--color-text) mb-2">
                {title}
              </h3>
              <p className="text-(--color-text-secondary) whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-(--color-border) px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={() => handleChoice(false)}
            className="btn-secondary"
          >
            {option2Text}
          </button>
          <button
            onClick={() => handleChoice(true)}
            className="btn-primary"
          >
            {option1Text}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
