import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon } from 'lucide-react';
import { preferencesManager } from '../utilities/preferences';
import type { Preferences } from '../utilities/preferences';

interface PreferencesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesChange?: (prefs: Preferences) => void;
}

export function PreferencesDialog({ isOpen, onClose, onPreferencesChange }: PreferencesDialogProps) {
  const [prefs, setPrefs] = useState<Preferences>(preferencesManager.get());

  useEffect(() => {
    if (isOpen) {
      setPrefs(preferencesManager.get());
    }
  }, [isOpen]);

  const handleSave = () => {
    const updated = preferencesManager.set(prefs);
    if (onPreferencesChange) {
      onPreferencesChange(updated);
    }
    onClose();
  };

  const handleCancel = () => {
    setPrefs(preferencesManager.get());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-9998"
            onClick={handleCancel}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-(--color-bg) shadow-2xl z-9999 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-(--color-border) p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Preferences</h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-(--color-bg-secondary) rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Data Manipulation */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-(--color-primary)">Data Manipulation</h3>
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg-secondary) cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={prefs.inPlaceMode}
                    onChange={(e) => setPrefs({ ...prefs, inPlaceMode: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Modify data in-place</div>
                    <div className="text-xs text-(--color-text-secondary)">
                      When enabled, data operations modify the original dataset. When disabled, creates a copy.
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg-secondary) cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.dataManipulationDefaultToNewSheet}
                    onChange={(e) => setPrefs({ ...prefs, dataManipulationDefaultToNewSheet: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Apply changes to new sheet by default</div>
                    <div className="text-xs text-(--color-text-secondary)">
                      When enabled, data manipulations create a new sheet. When disabled, they modify the current sheet.
                    </div>
                  </div>
                </label>
              </div>

              {/* Appearance */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-(--color-primary)">Appearance</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg border flex items-center justify-center gap-2 ${
                        prefs.theme === 'light'
                          ? 'bg-(--color-primary) text-white border-(--color-primary)'
                          : 'bg-(--color-bg-secondary) border-(--color-border)'
                      }`}
                      onClick={() => setPrefs({ ...prefs, theme: 'light' })}
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </button>
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg border flex items-center justify-center gap-2 ${
                        prefs.theme === 'dark'
                          ? 'bg-(--color-primary) text-white border-(--color-primary)'
                          : 'bg-(--color-bg-secondary) border-(--color-border)'
                      }`}
                      onClick={() => setPrefs({ ...prefs, theme: 'dark' })}
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm ${
                        prefs.fontSize === 'small'
                          ? 'bg-(--color-primary) text-white border-(--color-primary)'
                          : 'bg-(--color-bg-secondary) border-(--color-border)'
                      }`}
                      onClick={() => setPrefs({ ...prefs, fontSize: 'small' })}
                    >
                      Small
                    </button>
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        prefs.fontSize === 'medium'
                          ? 'bg-(--color-primary) text-white border-(--color-primary)'
                          : 'bg-(--color-bg-secondary) border-(--color-border)'
                      }`}
                      onClick={() => setPrefs({ ...prefs, fontSize: 'medium' })}
                    >
                      Medium
                    </button>
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg border text-lg ${
                        prefs.fontSize === 'large'
                          ? 'bg-(--color-primary) text-white border-(--color-primary)'
                          : 'bg-(--color-bg-secondary) border-(--color-border)'
                      }`}
                      onClick={() => setPrefs({ ...prefs, fontSize: 'large' })}
                    >
                      Large
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="border-t border-(--color-border) p-6">
              <div className="flex gap-2 justify-end">
                <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>Save Preferences</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
