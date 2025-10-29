import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Monitor, AlertCircle } from 'lucide-react';

interface MobileWarningDialogProps {
  isOpen: boolean;
  onAcknowledge: () => void;
}

export function MobileWarningDialog({ isOpen, onAcknowledge }: MobileWarningDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-(--color-bg) border border-(--color-border) rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-(--color-border)">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-(--color-secondary)" aria-hidden="true" />
                <h2 className="text-xl font-bold text-(--color-text)">
                  Limited Mobile Experience
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-(--color-text-secondary)">
                You're viewing this on a mobile device. The full experience is
                optimized for desktop.
              </p>

           
              <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-(--color-text) flex items-center gap-2">
                  <Smartphone className="w-4 h-4" aria-hidden="true" />
                  Available on Mobile:
                </h3>
                <ul className="text-sm text-(--color-text-secondary) space-y-2 pl-6 list-disc">
                  <li>View and browse data</li>
                  <li>Manage sheets</li>
                  <li>Export and create sheets</li>
                  <li>Switch themes</li>
                </ul>
              </div>

              <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-lg p-4">
                <h3 className="font-semibold text-(--color-text) flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4" aria-hidden="true" />
                  Full Features (Desktop):
                </h3>
                <p className="text-sm text-(--color-text-secondary)">
                  Data manipulation, charts, find & replace, advanced analytics,
                  and more.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-(--color-border) flex justify-end bg-(--color-bg-secondary)">
              <button
                onClick={onAcknowledge}
                className="px-6 py-2 bg-(--color-primary) text-white rounded-lg font-medium hover:bg-(--color-primary-dark) transition-colors"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}