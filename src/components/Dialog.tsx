import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="border-b border-(--color-border) px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-(--color-text)">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 text-(--color-text-secondary) hover:text-(--color-text) rounded-lg hover:bg-(--color-bg-secondary) transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'csv' | 'xlsx', fileName: string, exportAllSheets: boolean) => void;
  defaultFileName: string;
  hasMultipleSheets?: boolean;
}

export function ExportDialog({ isOpen, onClose, onExport, defaultFileName, hasMultipleSheets = false }: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [fileName, setFileName] = useState(defaultFileName);
  const [exportAllSheets, setExportAllSheets] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFileName(defaultFileName.replace(/\.[^/.]+$/, ''));
      // Default to Excel if multiple sheets
      if (hasMultipleSheets) {
        setFormat('xlsx');
      }
    }
  }, [isOpen, defaultFileName, hasMultipleSheets]);

  const handleExport = () => {
    if (fileName.trim()) {
      onExport(format, fileName.trim(), exportAllSheets);
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export Data">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-(--color-text) mb-2">
            File Name
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:border-(--color-primary)"
            placeholder="Enter file name"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-(--color-text) mb-2">
            Format
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="csv"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="w-4 h-4 text-(--color-primary)"
              />
              <span className="text-(--color-text)">CSV (.csv)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="xlsx"
                checked={format === 'xlsx'}
                onChange={() => setFormat('xlsx')}
                className="w-4 h-4 text-(--color-primary)"
              />
              <span className="text-(--color-text)">Excel (.xlsx)</span>
            </label>
          </div>
        </div>
        {hasMultipleSheets && format === 'xlsx' && (
          <div>
            <label className="block text-sm font-medium text-(--color-text) mb-2">
              Export Options
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={exportAllSheets}
                  onChange={() => setExportAllSheets(true)}
                  className="w-4 h-4 text-(--color-primary)"
                />
                <span className="text-(--color-text)">All sheets</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!exportAllSheets}
                  onChange={() => setExportAllSheets(false)}
                  className="w-4 h-4 text-(--color-primary)"
                />
                <span className="text-(--color-text)">Active sheet only</span>
              </label>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleExport} className="btn-primary">
            Export
          </button>
        </div>
      </div>
    </Dialog>
  );
}

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fileName: string, mode: 'save' | 'save-as') => void;
  defaultFileName: string;
  mode: 'save' | 'save-as';
}

export function SaveDialog({ isOpen, onClose, onSave, defaultFileName, mode }: SaveDialogProps) {
  const [fileName, setFileName] = useState(defaultFileName);

  useEffect(() => {
    if (isOpen) {
      setFileName(defaultFileName);
    }
  }, [isOpen, defaultFileName]);

  const handleSave = () => {
    if (fileName.trim()) {
      onSave(fileName.trim(), mode);
      onClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={mode === 'save' ? 'Save' : 'Save As'}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-(--color-text) mb-2">
            File Name
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:border-(--color-primary)"
            placeholder="Enter file name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save
          </button>
        </div>
      </div>
    </Dialog>
  );
}

interface FindDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFind: (searchText: string, matchCase: boolean) => void;
}

export function FindDialog({ isOpen, onClose, onFind }: FindDialogProps) {
  const [searchText, setSearchText] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  const handleFind = () => {
    if (searchText.trim()) {
      onFind(searchText.trim(), matchCase);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Find">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-(--color-text) mb-2">
            Search For
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:border-(--color-primary)"
            placeholder="Enter search text"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFind();
              }
            }}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-(--color-text)">Match case</span>
          </label>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleFind} className="btn-primary">
            Find All
          </button>
        </div>
      </div>
    </Dialog>
  );
}

interface ReplaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReplace: (searchText: string, replaceText: string, matchCase: boolean) => void;
  onReplaceSingle: (searchText: string, replaceText: string, matchCase: boolean, index: number) => { nextIndex: number; totalMatches: number };
  onFindMatches: (searchText: string, matchCase: boolean) => number;
}

export function ReplaceDialog({ isOpen, onClose, onReplace, onReplaceSingle, onFindMatches }: ReplaceDialogProps) {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  // Update match count when search text or match case changes
  useEffect(() => {
    if (searchText.trim()) {
      const count = onFindMatches(searchText.trim(), matchCase);
      setTotalMatches(count);
      setCurrentIndex(count > 0 ? 0 : -1);
    } else {
      setTotalMatches(0);
      setCurrentIndex(-1);
    }
  }, [searchText, matchCase, onFindMatches]);

  const handleReplaceAll = () => {
    if (searchText.trim()) {
      onReplace(searchText.trim(), replaceText, matchCase);
      onClose();
    }
  };

  const handleReplaceSingle = () => {
    if (searchText.trim() && currentIndex >= 0) {
      const { nextIndex, totalMatches: newTotal } = onReplaceSingle(
        searchText.trim(), 
        replaceText, 
        matchCase, 
        currentIndex
      );
      setTotalMatches(newTotal);
      setCurrentIndex(nextIndex);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalMatches - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Find and Replace">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-(--color-text) mb-2">
            Find
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:border-(--color-primary)"
            placeholder="Enter search text"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-(--color-text) mb-2">
            Replace With
          </label>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="w-full px-3 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:border-(--color-primary)"
            placeholder="Enter replacement text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleReplaceSingle();
              }
            }}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-(--color-text)">Match case</span>
          </label>
        </div>
        
        {totalMatches > 0 && (
          <div className="flex items-center gap-2 text-sm text-(--color-text-secondary)">
            <span>Match {currentIndex + 1} of {totalMatches}</span>
            <button
              onClick={handlePrevious}
              disabled={currentIndex <= 0}
              className="px-2 py-1 text-xs btn-secondary disabled:opacity-50"
              title="Previous match"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= totalMatches - 1}
              className="px-2 py-1 text-xs btn-secondary disabled:opacity-50"
              title="Next match"
            >
              →
            </button>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleReplaceSingle} 
            className="btn-primary"
            disabled={totalMatches === 0}
          >
            Replace
          </button>
          <button 
            onClick={handleReplaceAll} 
            className="btn-primary"
            disabled={totalMatches === 0}
          >
            Replace All
          </button>
        </div>
      </div>
    </Dialog>
  );
}

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (orientation: 'portrait' | 'landscape') => void;
}

export function PrintDialog({ isOpen, onClose, onPrint }: PrintDialogProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  const handlePrint = () => {
    onPrint(orientation);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Export to PDF">
      <div className="space-y-4">
        <p className="text-(--color-text)">
          Export your data table as a PDF document.
        </p>
        <div>
          <label className="block text-sm font-medium text-(--color-text) mb-2">
            Page Orientation
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="portrait"
                checked={orientation === 'portrait'}
                onChange={() => setOrientation('portrait')}
                className="w-4 h-4 text-(--color-primary)"
              />
              <span className="text-(--color-text)">Portrait</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="landscape"
                checked={orientation === 'landscape'}
                onChange={() => setOrientation('landscape')}
                className="w-4 h-4 text-(--color-primary)"
              />
              <span className="text-(--color-text)">Landscape</span>
            </label>
          </div>
        </div>
        <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-lg p-4">
          <p className="text-sm text-(--color-text-secondary)">
            Tip: Landscape orientation works better for wide tables.
          </p>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handlePrint} className="btn-primary">
            Generate PDF
          </button>
        </div>
      </div>
    </Dialog>
  );
}

interface DataManipulationConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (createNewSheet: boolean) => void;
  operationName: string;
  defaultToNewSheet?: boolean;
}

export function DataManipulationConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  operationName,
  defaultToNewSheet = true 
}: DataManipulationConfirmDialogProps) {
  const [createNewSheet, setCreateNewSheet] = useState(defaultToNewSheet);

  useEffect(() => {
    if (isOpen) {
      setCreateNewSheet(defaultToNewSheet);
    }
  }, [isOpen, defaultToNewSheet]);

  const handleConfirm = () => {
    onConfirm(createNewSheet);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Apply ${operationName}`}>
      <div className="space-y-4">
        <p className="text-(--color-text)">
          How would you like to apply this operation?
        </p>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-(--color-border) cursor-pointer hover:bg-(--color-bg-secondary) transition-colors">
            <input
              type="radio"
              checked={createNewSheet}
              onChange={() => setCreateNewSheet(true)}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Create new sheet</div>
              <div className="text-xs text-(--color-text-secondary)">
                Apply changes to a new sheet, keeping the original data intact
              </div>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-3 rounded-lg border border-(--color-border) cursor-pointer hover:bg-(--color-bg-secondary) transition-colors">
            <input
              type="radio"
              checked={!createNewSheet}
              onChange={() => setCreateNewSheet(false)}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Modify current sheet</div>
              <div className="text-xs text-(--color-text-secondary)">
                Apply changes directly to the current sheet
              </div>
            </div>
          </label>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary">
            Apply
          </button>
        </div>
      </div>
    </Dialog>
  );
}
