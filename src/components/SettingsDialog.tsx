import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal } from 'lucide-react';
import { DEFAULT_APP_SETTINGS, type AppSettings } from '../utilities/settings';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsDialog({ isOpen, onClose, settings, onSettingsChange }: SettingsDialogProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetNotice, setShowResetNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft(settings);
      setShowResetConfirm(false);
      setShowResetNotice(false);
    }
  }, [isOpen, settings]);

  const handleToggle = (key: keyof AppSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(prev => ({ ...prev, [key]: event.target.checked } as AppSettings));
  };

  const handleNumberChange = (key: keyof AppSettings, min: number, max: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = Number(event.target.value);
    const clamped = Number.isFinite(numeric) ? Math.min(Math.max(numeric, min), max) : min;
    setDraft(prev => ({ ...prev, [key]: clamped } as AppSettings));
  };

  const handleSelect = (key: keyof AppSettings) => (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDraft(prev => ({ ...prev, [key]: event.target.value } as AppSettings));
  };

  const handleSave = () => {
    onSettingsChange(draft);
    onClose();
  };

  const handleCancel = () => {
    setDraft(settings);
    setShowResetConfirm(false);
    setShowResetNotice(false);
    onClose();
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setDraft(DEFAULT_APP_SETTINGS);
    setShowResetConfirm(false);
    setShowResetNotice(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-9998"
            onClick={handleCancel}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-(--color-bg) shadow-2xl z-9999 flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-(--color-border) p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-6 h-6 text-(--color-primary)" aria-hidden="true" />
                  <h2 className="text-2xl font-bold">Application Settings</h2>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-(--color-bg-secondary) rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3 text-(--color-primary)">General</h3>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg-secondary) cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={draft.autoSave}
                    onChange={handleToggle('autoSave')}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Auto-save</div>
                    <div className="text-xs text-(--color-text-secondary)">
                      Automatically store your workbook locally at regular intervals
                    </div>
                  </div>
                </label>

                {draft.autoSave && (
                  <div className="ml-7 mb-4">
                    <label className="block text-sm font-medium mb-2">Auto-save interval (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={draft.autoSaveInterval}
                      onChange={handleNumberChange('autoSaveInterval', 1, 60)}
                      className="input w-32"
                    />
                    <p className="text-xs text-(--color-text-secondary) mt-1">
                      Range: 1 to 60 minutes
                    </p>
                  </div>
                )}

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg-secondary) cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={draft.confirmDelete}
                    onChange={handleToggle('confirmDelete')}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Confirm before deleting</div>
                    <div className="text-xs text-(--color-text-secondary)">
                      Ask for confirmation before removing rows, columns, or sheets
                    </div>
                  </div>
                </label>

                <div className="p-3 rounded-lg bg-(--color-bg-secondary)/40">
                  <label className="block text-sm font-medium mb-2">Maximum undo steps</label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={draft.maxUndoSteps}
                    onChange={handleNumberChange('maxUndoSteps', 10, 200)}
                    className="input w-32"
                  />
                  <p className="text-xs text-(--color-text-secondary) mt-1">
                    Higher limits increase memory usage
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 text-(--color-primary)">Display</h3>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg-secondary) cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={draft.showGridLines}
                    onChange={handleToggle('showGridLines')}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Show grid lines</div>
                    <div className="text-xs text-(--color-text-secondary)">
                      Toggle table borders for a cleaner or more structured look
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-(--color-bg-secondary) cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.highlightSelectedCell}
                    onChange={handleToggle('highlightSelectedCell')}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">Highlight selected cell</div>
                    <div className="text-xs text-(--color-text-secondary)">
                      Emphasize the active cell with a subtle highlight
                    </div>
                  </div>
                </label>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 text-(--color-primary)">Formats</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Date format</label>
                  <select
                    value={draft.dateFormat}
                    onChange={handleSelect('dateFormat')}
                    className="input w-full"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2025-10-29)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (10/29/2025)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (29/10/2025)</option>
                    <option value="DD-MMM-YYYY">DD-MMM-YYYY (29-Oct-2025)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Number format</label>
                  <select
                    value={draft.numberFormat}
                    onChange={handleSelect('numberFormat')}
                    className="input w-full"
                  >
                    <option value="#,##0.00">#,##0.00 (1,234.56)</option>
                    <option value="#,##0">#,##0 (1,235)</option>
                    <option value="0.00">0.00 (1234.56)</option>
                    <option value="0">0 (1235)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">CSV delimiter</label>
                  <select
                    value={draft.csvDelimiter}
                    onChange={handleSelect('csvDelimiter')}
                    className="input w-full"
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                    <option value="|">Pipe (|)</option>
                  </select>
                </div>
              </section>

              {showResetConfirm && (
                <div className="p-4 rounded-lg border border-(--color-border) bg-(--color-bg-secondary)/40">
                  <p className="text-sm text-(--color-text) mb-3">
                    Reset all settings to their original defaults?
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>Cancel</button>
                    <button className="btn-secondary text-red-500 hover:bg-red-500 hover:text-white" onClick={confirmReset}>
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {showResetNotice && !showResetConfirm && (
                <div className="p-3 rounded-lg bg-(--color-primary)/10 text-(--color-primary)">
                  Defaults restored. Review and save to apply.
                </div>
              )}
            </div>

            <div className="border-t border-(--color-border) p-6 flex items-center justify-between">
              <button className="btn-secondary" onClick={handleReset}>
                Restore Defaults
              </button>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>Save Settings</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
