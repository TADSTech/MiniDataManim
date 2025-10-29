import { motion } from 'motion/react';
import { X } from 'lucide-react';

export function KeyboardShortcuts({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { keys: 'Ctrl + N', description: 'Create new table' },
    { keys: 'Ctrl + O', description: 'Open file' },
    { keys: 'Ctrl + S', description: 'Save file' },
    { keys: 'Ctrl + P', description: 'Export to PDF' },
    { keys: 'Ctrl + Z', description: 'Undo' },
    { keys: 'Ctrl + Y', description: 'Redo' },
    { keys: 'Ctrl + X', description: 'Cut cell' },
    { keys: 'Ctrl + C', description: 'Copy cell' },
    { keys: 'Ctrl + V', description: 'Paste cell' },
    { keys: 'Ctrl + F', description: 'Find in table' },
    { keys: 'Ctrl + H', description: 'Find and replace' },
    { keys: 'Ctrl + /', description: 'Show keyboard shortcuts' },
    { keys: 'Click cell', description: 'Select and edit cell' },
    { keys: 'Enter', description: 'Confirm cell edit' },
    { keys: 'Escape', description: 'Cancel cell edit' },
    { keys: 'Double-click column', description: 'Rename column' },
    { keys: '⋮ on column', description: 'Column menu (rename/delete)' },
    { keys: '⋮ on row', description: 'Row menu (insert/delete)' },
    { keys: 'Drag & Drop', description: 'Import CSV/Excel file' },
  ];

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
        className="bg-(--color-bg) rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-(--color-bg) border-b border-(--color-border) px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-(--color-text)">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 text-(--color-text-secondary) hover:text-(--color-text) rounded-lg hover:bg-(--color-bg-secondary) transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid gap-3">
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-(--color-bg-secondary) transition-colors"
              >
                <span className="text-(--color-text)">{shortcut.description}</span>
                <kbd className="px-3 py-1 bg-(--color-bg-secondary) border border-(--color-border) rounded text-sm font-mono text-(--color-text)">
                  {shortcut.keys}
                </kbd>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
