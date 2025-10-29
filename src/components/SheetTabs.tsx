import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Sheet } from '../types/workbook';

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSheetChange: (sheetId: string) => void;
  onSheetAdd: () => void;
  onSheetRename: (sheetId: string, newName: string) => void;
  onSheetDelete: (sheetId: string) => void;
  onSheetDuplicate: (sheetId: string) => void;
}

export function SheetTabs({
  sheets,
  activeSheetId,
  onSheetChange,
  onSheetAdd,
  onSheetRename,
  onSheetDelete,
  onSheetDuplicate,
}: SheetTabsProps) {
  const [contextMenuSheet, setContextMenuSheet] = useState<string | null>(null);
  const [renamingSheet, setRenamingSheet] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCannotDeleteAlert, setShowCannotDeleteAlert] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContextMenu = (e: React.MouseEvent, sheetId: string) => {
    e.preventDefault();
    setContextMenuSheet(sheetId);
  };

  const handleRename = (sheetId: string) => {
    const sheet = sheets.find(s => s.id === sheetId);
    if (sheet) {
      setNewName(sheet.name);
      setRenamingSheet(sheetId);
      setContextMenuSheet(null);
      setTimeout(() => inputRef.current?.select(), 10);
    }
  };

  const handleRenameSubmit = (sheetId: string) => {
    if (newName.trim() && newName !== sheets.find(s => s.id === sheetId)?.name) {
      onSheetRename(sheetId, newName.trim());
    }
    setRenamingSheet(null);
  };

  const handleDelete = (sheetId: string) => {
    setContextMenuSheet(null);
    
    if (sheets.length === 1) {
      setShowCannotDeleteAlert(true);
      return;
    }
    
    setSheetToDelete(sheetId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (sheetToDelete) {
      onSheetDelete(sheetToDelete);
      setSheetToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleDuplicate = (sheetId: string) => {
    setContextMenuSheet(null);
    onSheetDuplicate(sheetId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-(--color-border) bg-(--color-bg-secondary) px-2 py-1 flex items-center gap-2 z-100">
      <div className="flex gap-1 flex-1 scrollbar-thin">
        {sheets.map((sheet) => (
          <div key={sheet.id} className="relative group">
            {renamingSheet === sheet.id ? (
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleRenameSubmit(sheet.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSubmit(sheet.id);
                  if (e.key === 'Escape') setRenamingSheet(null);
                }}
                className="px-4 py-1.5 text-sm border border-(--color-primary) rounded-t-lg outline-none w-32"
              />
            ) : (
              <motion.button
                onClick={() => onSheetChange(sheet.id)}
                onContextMenu={(e) => handleContextMenu(e, sheet.id)}
                onDoubleClick={() => handleRename(sheet.id)}
                className={`px-4 py-1.5 text-sm rounded-t-lg transition-colors whitespace-nowrap ${
                  activeSheetId === sheet.id
                    ? 'bg-(--color-bg) border-t border-l border-r border-(--color-border) font-medium'
                    : 'bg-transparent hover:bg-(--color-bg-secondary) text-(--color-text-secondary)'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {sheet.name}
              </motion.button>
            )}

            {/* Context Menu */}
            {contextMenuSheet === sheet.id && (
              <>
                <div
                  className="fixed inset-0 z-9998"
                  onClick={() => setContextMenuSheet(null)}
                />
                <div className="absolute bottom-full left-0 mb-1 bg-(--color-bg) border border-(--color-border) rounded-lg shadow-lg p-1.5 z-9999 min-w-40">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(sheet.id);
                    }}
                    className="w-full px-3 py-1.5 text-sm text-left rounded hover:bg-(--color-bg-secondary) transition-colors"
                  >
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(sheet.id);
                    }}
                    className="w-full px-3 py-1.5 text-sm text-left rounded hover:bg-(--color-bg-secondary) transition-colors"
                  >
                    Duplicate
                  </button>
                  <div className="h-px bg-(--color-border) my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sheet.id);
                    }}
                    className="w-full px-3 py-1.5 text-sm text-left rounded hover:bg-red-500 hover:text-white transition-colors text-red-500"
                    disabled={sheets.length === 1}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <motion.button
        onClick={onSheetAdd}
        className="px-3 py-1.5 text-sm bg-(--color-primary) text-white rounded-lg hover:bg-(--color-primary-dark) transition-colors flex items-center gap-1 shrink-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>+</span>
        <span>Add Sheet</span>
      </motion.button>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4"
            onClick={() => {
              setShowDeleteConfirm(false);
              setSheetToDelete(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-(--color-bg) rounded-lg shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-(--color-text) mb-2">
                      Delete Sheet
                    </h3>
                    <p className="text-(--color-text-secondary)">
                      Are you sure you want to delete this sheet? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-(--color-border) px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSheetToDelete(null);
                  }}
                  className="px-4 py-2 text-sm border border-(--color-border) rounded hover:bg-(--color-bg-secondary) transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm border border-(--color-border) rounded hover:bg-(--color-bg-secondary) transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cannot Delete Last Sheet Alert */}
      <AnimatePresence>
        {showCannotDeleteAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4"
            onClick={() => setShowCannotDeleteAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-(--color-bg) rounded-lg shadow-xl max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-(--color-text) mb-2">
                      Cannot Delete Sheet
                    </h3>
                    <p className="text-sm text-(--color-text-secondary)">
                      Cannot delete the last sheet. A workbook must have at least one sheet.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-(--color-border) px-6 py-3 flex justify-end">
                <button
                  onClick={() => setShowCannotDeleteAlert(false)}
                  className="px-4 py-2 text-sm bg-(--color-primary) text-white rounded hover:bg-(--color-primary-dark) transition-colors"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
