import { useEffect, useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import './App.css'
import { themeSetting, appSettingsManager, type AppSettings } from './utilities/settings';
import { preferencesManager } from './utilities/preferences';
import { Taskbar } from './taskbar/taskbar';
import { DataTable } from './components/DataTable';
import { DocumentationPage } from './components/DocumentationPage';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { AboutPage } from './components/AboutPage';
import { SheetTabs } from './components/SheetTabs';
import { PreferencesDialog } from './components/PreferencesDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { MobileWarningDialog } from './components/MobileWarningDialog';
import { CreateChartDialog } from './components/CreateChartDialog';
import { ChartsViewer } from './components/ChartsViewer';
import { ConfirmDialog, ChoiceDialog } from './components/ConfirmDialog';
import { ExportDialog, SaveDialog, PrintDialog, FindDialog, ReplaceDialog, DataManipulationConfirmDialog } from './components/Dialog';
import { SortDialog, FilterDialog, StatsDialog, RemoveDuplicatesDialog, FillMissingDialog, TextTransformDialog, SplitColumnDialog, GroupByDialog, ColumnSelectDialog } from './components/DataManipulationDialogs';
import { useEditOperations } from './hooks/useEditOperations';
import { useFileOperations } from './hooks/useFileOperations';
import { useSearchOperations } from './hooks/useSearchOperations';
import { useViewOperations } from './hooks/useViewOperations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDataOperations } from './hooks/useDataOperations';
import { createWorkbook, createSheet, createChartsSheet } from './types/workbook';
import type { Workbook } from './types/workbook';
import type { ChartConfig } from './components/CreateChartDialog';
import { useScrollbarStyles } from 'stylisticscroll/react';
import { FilePlus, FileSpreadsheet } from 'lucide-react';

const AUTOSAVE_STORAGE_KEY = 'minidatamanim-autosave';

function App() {

  useScrollbarStyles({ color: '#2563eb', width: '12px', thumbOpacity: 0.8});
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [, setTheme] = useState<'light' | 'dark'>(themeSetting.get() as 'light' | 'dark');
  const [showDocs, setShowDocs] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateChart, setShowCreateChart] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showFindDialog, setShowFindDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showColumnSelectDialog, setShowColumnSelectDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showRemoveDuplicatesDialog, setShowRemoveDuplicatesDialog] = useState(false);
  const [showFillMissingDialog, setShowFillMissingDialog] = useState(false);
  const [showTextTransformDialog, setShowTextTransformDialog] = useState(false);
  const [showSplitColumnDialog, setShowSplitColumnDialog] = useState(false);
  const [showGroupByDialog, setShowGroupByDialog] = useState(false);
  const [showDataManipulationConfirm, setShowDataManipulationConfirm] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<{ name: string; action: (createNewSheet: boolean) => void } | null>(null);
  const [showNewWorkbookConfirm, setShowNewWorkbookConfirm] = useState(false);
  const [columnStats, setColumnStats] = useState<any>(null);
  const [statsColumnName, setStatsColumnName] = useState<string>('');
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [activeSearch, setActiveSearch] = useState<{ text: string; matchCase: boolean } | null>(null);
  
  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'danger' | 'warning';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  const [choiceDialog, setChoiceDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    option1Text: string;
    option2Text: string;
    onChoice: (choice: boolean) => void;
  }>({ isOpen: false, title: '', message: '', option1Text: '', option2Text: '', onChoice: () => {} });
  const [appSettings, setAppSettings] = useState<AppSettings>(appSettingsManager.get());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openConfirm = useCallback((options: { title: string; message: string; variant?: 'default' | 'danger' | 'warning'; onConfirm: () => void; }) => {
    setConfirmDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      variant: options.variant,
      onConfirm: () => {
        options.onConfirm();
      },
    });
  }, []);

  const handleSettingsChange = useCallback((nextSettings: AppSettings) => {
    const updated = appSettingsManager.set(nextSettings);
    setAppSettings(updated);
  }, []);

  // Get current active sheet
  const activeSheet = workbook?.sheets.find(s => s.id === workbook.activeSheetId);
  const data = activeSheet?.data || [];
  const columns = activeSheet?.columns || [];
  const fileName = workbook?.fileName || '';
  const fileType = workbook?.fileType || '';
  const hasActiveTable = workbook !== null;

  // Custom hooks
  const editOps = useEditOperations();
  const fileOps = useFileOperations();
  const searchOps = useSearchOperations();
  const viewOps = useViewOperations();
  const dataOps = useDataOperations();

  // Sync app settings to edit operations
  useEffect(() => {
    editOps.setHistoryLimit(appSettings.maxUndoSteps);
  }, [appSettings.maxUndoSteps, editOps]);

  useEffect(() => {
    const prefs = preferencesManager.get();
    
    // Apply theme
    let effectiveTheme: 'light' | 'dark' = prefs.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : prefs.theme;
      
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setTheme(effectiveTheme);
    
    // Apply font size
    document.documentElement.setAttribute('data-font-size', prefs.fontSize);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.theme) themeSetting.set(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Show mobile warning on first detection
  useEffect(() => {
    if (isMobile && !showMobileWarning) {
      const hasSeenWarning = sessionStorage.getItem('mobile-warning-seen');
      if (!hasSeenWarning) {
        setShowMobileWarning(true);
        sessionStorage.setItem('mobile-warning-seen', 'true');
      }
    }
  }, [isMobile, showMobileWarning]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { workbook?: Workbook } | null;
        if (parsed?.workbook && !workbook) {
          setWorkbook(parsed.workbook);
          setDisplayData([]);
        }
      }
    } catch (error) {
      console.error('Failed to restore autosaved workbook', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { setHistoryLimit } = editOps;

  useEffect(() => {
    setHistoryLimit(appSettings.maxUndoSteps);
  }, [appSettings.maxUndoSteps, setHistoryLimit]);

  useEffect(() => {
    if (!appSettings.autoSave || !workbook) {
      return;
    }

    const intervalMs = Math.max(1, appSettings.autoSaveInterval) * 60_000;

    const persistWorkbook = () => {
      try {
        localStorage.setItem(
          AUTOSAVE_STORAGE_KEY,
          JSON.stringify({ workbook, timestamp: Date.now() })
        );
      } catch (error) {
        console.error('Failed to auto-save workbook', error);
      }
    };

    persistWorkbook();
    const id = window.setInterval(persistWorkbook, intervalMs);
    return () => window.clearInterval(id);
  }, [appSettings.autoSave, appSettings.autoSaveInterval, workbook]);

  useEffect(() => {
    if (!hasActiveTable) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasActiveTable]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNew: () => handleNewTable(),
    onOpen: () => handleOpenFile(),
    onSave: () => hasActiveTable && setShowSaveDialog(true),
    onPrint: () => hasActiveTable && setShowPrintDialog(true),
    onUndo: () => hasActiveTable && handleUndo(),
    onRedo: () => hasActiveTable && handleRedo(),
    onCut: () => hasActiveTable && editOps.selectedCell && handleCut(),
    onCopy: () => hasActiveTable && editOps.selectedCell && handleCopy(),
    onPaste: () => hasActiveTable && editOps.selectedCell && handlePaste(),
    onFind: () => hasActiveTable && setShowFindDialog(true),
    onReplace: () => hasActiveTable && setShowReplaceDialog(true),
    onZoomIn: () => viewOps.zoomIn(),
    onZoomOut: () => viewOps.zoomOut(),
    onResetZoom: () => viewOps.resetZoom(),
    onFullscreen: () => viewOps.toggleFullscreen(),
    onShowShortcuts: () => setShowShortcuts(true),
  }, true);

  // Handle preferences changes
  const handlePreferencesChange = (prefs: any) => {
    // Apply theme
    let effectiveTheme: 'light' | 'dark' = prefs.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : prefs.theme;
      
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setTheme(effectiveTheme);
    
    // Apply font size
    document.documentElement.setAttribute('data-font-size', prefs.fontSize);
  };

  const handleMenuAction = (actionId: string) => {
    switch (actionId) {
      case 'new':
        handleNewTable();
        break;
      case 'open':
        handleOpenFile();
        break;
      case 'save':
        setShowSaveDialog(true);
        break;
      case 'save-as':
        setShowSaveAsDialog(true);
        break;
      case 'export':
        setShowExportDialog(true);
        break;
      case 'print':
        setShowPrintDialog(true);
        break;
      case 'undo':
        handleUndo();
        break;
      case 'redo':
        handleRedo();
        break;
      case 'cut':
        handleCut();
        break;
      case 'copy':
        handleCopy();
        break;
      case 'paste':
        handlePaste();
        break;
      case 'find':
        setShowFindDialog(true);
        break;
      case 'replace':
        setShowReplaceDialog(true);
        break;
      case 'zoom-in':
        viewOps.zoomIn();
        break;
      case 'zoom-out':
        viewOps.zoomOut();
        break;
      case 'zoom-reset':
        viewOps.resetZoom();
        break;
      case 'fullscreen':
        viewOps.toggleFullscreen();
        break;
      case 'sort':
        setShowSortDialog(true);
        break;
      case 'filter':
        setShowFilterDialog(true);
        break;
      case 'clear-filter':
        handleClearFilters();
        break;
      case 'remove-duplicates':
        setShowRemoveDuplicatesDialog(true);
        break;
      case 'fill-missing':
        setShowFillMissingDialog(true);
        break;
      case 'transpose':
        handleTranspose();
        break;
      case 'text-transform':
        setShowTextTransformDialog(true);
        break;
      case 'split-column':
        setShowSplitColumnDialog(true);
        break;
      case 'group-by':
        setShowGroupByDialog(true);
        break;
      case 'column-stats':
        setShowColumnSelectDialog(true);
        break;
      case 'docs':
        setShowDocs(true);
        break;
      case 'shortcuts':
        setShowShortcuts(true);
        break;
      case 'about':
        setShowAbout(true);
        break;
      case 'preferences':
        setShowPreferences(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'charts':
        handleCreateChart();
        break;
      case 'close':
        openConfirm({
          title: 'Close Workbook',
          message: 'Are you sure you want to close the current workbook?\n\nAny unsaved changes will be lost.',
          variant: 'warning',
          onConfirm: () => {
            setWorkbook(null);
            setDisplayData([]);
          }
        });
        break;
    }
  };

  // ==================== WORKBOOK & SHEET MANAGEMENT ====================

  const handleNewTable = () => {
    setShowNewWorkbookConfirm(true);
  };

  const confirmNewWorkbook = () => {
    const newWorkbook = createWorkbook('Untitled', 'New Table');
    setWorkbook(newWorkbook);
    setDisplayData([]);
    setShowNewWorkbookConfirm(false);
  };

  const updateActiveSheet = (newData: any[], newColumns: string[]) => {
    if (!workbook || !activeSheet) return;
    
    const inPlace = preferencesManager.getInPlace();
    const targetData = inPlace ? newData : [...newData.map(row => ({...row}))];
    
    const updatedSheets = workbook.sheets.map(sheet =>
      sheet.id === activeSheet.id
        ? { ...sheet, data: targetData, columns: newColumns, modifiedAt: Date.now() }
        : sheet
    );
    
    setWorkbook({ ...workbook, sheets: updatedSheets, modifiedAt: Date.now() });
  };

  const handleSheetChange = (sheetId: string) => {
    if (!workbook) return;
    setWorkbook({ ...workbook, activeSheetId: sheetId });
    setDisplayData([]);
    dataOps.clearFilters();
  };

  const handleSheetAdd = () => {
    if (!workbook) return;
    const newSheet = createSheet(`Sheet${workbook.sheets.length + 1}`);
    setWorkbook({
      ...workbook,
      sheets: [...workbook.sheets, newSheet],
      activeSheetId: newSheet.id,
      modifiedAt: Date.now(),
    });
  };

  const handleSheetRename = (sheetId: string, newName: string) => {
    if (!workbook) return;
    const updatedSheets = workbook.sheets.map(sheet =>
      sheet.id === sheetId ? { ...sheet, name: newName, modifiedAt: Date.now() } : sheet
    );
    setWorkbook({ ...workbook, sheets: updatedSheets, modifiedAt: Date.now() });
  };

  const handleSheetDelete = (sheetId: string) => {
    if (!workbook || workbook.sheets.length <= 1) return;
    const updatedSheets = workbook.sheets.filter(s => s.id !== sheetId);
    const newActiveId = workbook.activeSheetId === sheetId
      ? updatedSheets[0].id
      : workbook.activeSheetId;
    setWorkbook({
      ...workbook,
      sheets: updatedSheets,
      activeSheetId: newActiveId,
      modifiedAt: Date.now(),
    });
  };

  const handleSheetDuplicate = (sheetId: string) => {
    if (!workbook) return;
    const sheet = workbook.sheets.find(s => s.id === sheetId);
    if (!sheet) return;
    const newSheet = createSheet(`${sheet.name} Copy`, [...sheet.data], [...sheet.columns]);
    setWorkbook({
      ...workbook,
      sheets: [...workbook.sheets, newSheet],
      activeSheetId: newSheet.id,
      modifiedAt: Date.now(),
    });
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      // If workbook exists, ask user if they want to replace or import to new sheet
      if (workbook && hasActiveTable) {
        setChoiceDialog({
          isOpen: true,
          title: 'Import File',
          message: 'How would you like to import this file?',
          option1Text: 'Import to New Sheet(s)',
          option2Text: 'Replace Current Workbook',
          onChoice: (importToNewSheet) => {
            if (importToNewSheet) {
              // Import to new sheet(s)
              if (extension === 'csv') {
                fileOps.parseCSV(file, (newWorkbook) => {
                  const importedSheet = newWorkbook.sheets[0];
                  setWorkbook({
                    ...workbook,
                    sheets: [...workbook.sheets, importedSheet],
                    activeSheetId: importedSheet.id,
                    modifiedAt: Date.now(),
                  });
                });
              } else if (extension === 'xlsx' || extension === 'xls' || extension === 'ods') {
                fileOps.parseExcel(file, (newWorkbook) => {
                  setWorkbook({
                    ...workbook,
                    sheets: [...workbook.sheets, ...newWorkbook.sheets],
                    activeSheetId: newWorkbook.sheets[0].id,
                    modifiedAt: Date.now(),
                  });
                });
              }
            } else {
              // Replace workbook
              if (extension === 'csv') {
                fileOps.parseCSV(file, (newWorkbook) => {
                  setWorkbook(newWorkbook);
                });
              } else if (extension === 'xlsx' || extension === 'xls' || extension === 'ods') {
                fileOps.parseExcel(file, (newWorkbook) => {
                  setWorkbook(newWorkbook);
                });
              }
            }
          }
        });
      } else {
        // No existing workbook, just load the file
        if (extension === 'csv') {
          fileOps.parseCSV(file, (newWorkbook) => {
            setWorkbook(newWorkbook);
          });
        } else if (extension === 'xlsx' || extension === 'xls' || extension === 'ods') {
          fileOps.parseExcel(file, (newWorkbook) => {
            setWorkbook(newWorkbook);
          });
        }
      }
    }
    event.target.value = '';
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      // If workbook exists, ask user if they want to replace or import to new sheet
      if (workbook && hasActiveTable) {
        setChoiceDialog({
          isOpen: true,
          title: 'Import File',
          message: 'How would you like to import this file?',
          option1Text: 'Import to New Sheet(s)',
          option2Text: 'Replace Current Workbook',
          onChoice: (importToNewSheet) => {
            if (importToNewSheet) {
              // Import to new sheet(s)
              if (extension === 'csv') {
                fileOps.parseCSV(file, (newWorkbook) => {
                  const importedSheet = newWorkbook.sheets[0];
                  setWorkbook({
                    ...workbook,
                    sheets: [...workbook.sheets, importedSheet],
                    activeSheetId: importedSheet.id,
                    modifiedAt: Date.now(),
                  });
                });
              } else if (extension === 'xlsx' || extension === 'xls' || extension === 'ods') {
                fileOps.parseExcel(file, (newWorkbook) => {
                  setWorkbook({
                    ...workbook,
                    sheets: [...workbook.sheets, ...newWorkbook.sheets],
                    activeSheetId: newWorkbook.sheets[0].id,
                    modifiedAt: Date.now(),
                  });
                });
              }
            } else {
              // Replace workbook
              if (extension === 'csv') {
                fileOps.parseCSV(file, (newWorkbook) => {
                  setWorkbook(newWorkbook);
                });
              } else if (extension === 'xlsx' || extension === 'xls' || extension === 'ods') {
                fileOps.parseExcel(file, (newWorkbook) => {
                  setWorkbook(newWorkbook);
                });
              }
            }
          }
        });
      } else {
        // No existing workbook, just load the file
        if (extension === 'csv') {
          fileOps.parseCSV(file, (newWorkbook) => {
            setWorkbook(newWorkbook);
          });
        } else if (extension === 'xlsx' || extension === 'xls' || extension === 'ods') {
          fileOps.parseExcel(file, (newWorkbook) => {
            setWorkbook(newWorkbook);
          });
        }
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDataChange = (newData: any[], newColumns: string[]) => {
    editOps.saveToHistory(data, columns);
    updateActiveSheet(newData, newColumns);
  };

  const handleUndo = () => {
    const result = editOps.undo(data, columns);
    updateActiveSheet(result.data, result.columns);
  };

  const handleRedo = () => {
    const result = editOps.redo(data, columns);
    updateActiveSheet(result.data, result.columns);
  };

  const handleCut = () => {
    const newData = editOps.cut(data, columns);
    handleDataChange(newData, columns);
  };

  const handleCopy = () => {
    editOps.copy(data);
  };

  const handlePaste = () => {
    const newData = editOps.paste(data, columns);
    handleDataChange(newData, columns);
  };

  const handleSave = (newFileName: string, mode: 'save' | 'save-as' = 'save') => {
    if (!workbook || data.length === 0) return;
    
    // Update workbook fileName
    const updatedWorkbook = {
      ...workbook,
      fileName: newFileName,
      modifiedAt: Date.now(),
    };
    setWorkbook(updatedWorkbook);
    
    // Only download on "Save As" mode
    if (mode === 'save-as') {
      const currentExtension = fileName.split('.').pop()?.toLowerCase();
      if (currentExtension === 'xlsx' || currentExtension === 'xls') {
        fileOps.exportToExcel(updatedWorkbook, newFileName);
      } else {
        // For CSV, export only the active sheet
        fileOps.exportToCSV(data, newFileName);
      }
    }
  };

  const handleExport = (format: 'csv' | 'xlsx', exportFileName: string, exportAllSheets: boolean) => {
    if (!workbook || data.length === 0) return;
    
    if (format === 'csv') {
      // CSV can only export active sheet
      fileOps.exportToCSV(data, exportFileName);
    } else {
      // Excel - export all sheets or just active sheet
      if (exportAllSheets) {
        fileOps.exportToExcel(workbook, exportFileName);
      } else {
        // Create a temporary workbook with just the active sheet
        const tempWorkbook = {
          ...workbook,
          sheets: [activeSheet!],
        };
        fileOps.exportToExcel(tempWorkbook, exportFileName);
      }
    }
  };

  const handlePrint = (orientation: 'portrait' | 'landscape') => {
    fileOps.exportToPDF(data, columns, fileName || 'table', orientation);
  };

  const handleFind = (searchText: string, matchCase: boolean) => {
    const count = searchOps.find(data, columns, searchText, matchCase);
    setActiveSearch({ text: searchText, matchCase });
    if (count === 0) {
      alert(`No matches found for "${searchText}"`);
    }
  };

  const handleReplace = (searchText: string, replaceText: string, matchCase: boolean) => {
    const { newData } = searchOps.replace(data, columns, searchText, replaceText, matchCase);
    handleDataChange(newData, columns);
    setActiveSearch(null);
  };

  const handleReplaceSingle = (searchText: string, replaceText: string, matchCase: boolean, index: number) => {
    const { newData, nextIndex, totalMatches } = searchOps.replaceSingle(
      data, 
      columns, 
      searchText, 
      replaceText, 
      matchCase, 
      index
    );
    handleDataChange(newData, columns);
    setActiveSearch({ text: searchText, matchCase });
    return { nextIndex, totalMatches };
  };

  const handleFindMatches = (searchText: string, matchCase: boolean) => {
    return searchOps.find(data, columns, searchText, matchCase);
  };

  // ==================== DATA MANIPULATION HANDLERS ====================

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    confirmDataManipulation('Sort', (createNewSheet) => {
      const sorted = dataOps.sortData(displayData.length > 0 ? displayData : data, columns, column, direction);
      if (createNewSheet) {
        applyToNewSheetOrCurrent(sorted, columns, 'Sorted');
      } else {
        if (displayData.length > 0) {
          setDisplayData(sorted);
        } else {
          handleDataChange(sorted, columns);
        }
      }
    });
  };

  const handleFilter = (column: string, operator: string, value: string) => {
    confirmDataManipulation('Filter', (createNewSheet) => {
      const condition = { column, operator: operator as any, value };
      const newConditions = dataOps.addFilterCondition(condition);
      const filtered = dataOps.applyFilter(data, newConditions);
      if (createNewSheet) {
        applyToNewSheetOrCurrent(filtered, columns, 'Filtered');
      } else {
        setDisplayData(filtered);
      }
    });
  };

  const handleClearFilters = () => {
    dataOps.clearFilters();
    setDisplayData([]);
  };

  const handleColumnSelect = (column: string) => {
    const stats = dataOps.calculateStats(data, column);
    setColumnStats(stats);
    setStatsColumnName(column);
    setShowStatsDialog(true);
  };

  // Helper to show confirmation dialog for data manipulation
  const confirmDataManipulation = (operationName: string, action: (createNewSheet: boolean) => void) => {
    setPendingOperation({ name: operationName, action });
    setShowDataManipulationConfirm(true);
  };

  const handleDataManipulationConfirm = (createNewSheet: boolean) => {
    if (pendingOperation) {
      pendingOperation.action(createNewSheet);
      setPendingOperation(null);
    }
  };

  const applyToNewSheetOrCurrent = (newData: any[], newColumns: string[], operationName: string) => {
    if (!workbook) return;
    
    const newSheet = createSheet(`${operationName} Result`, newData, newColumns);
    const updatedSheets = [...workbook.sheets, newSheet];
    setWorkbook({ ...workbook, sheets: updatedSheets, activeSheetId: newSheet.id });
  };

  const handleRemoveDuplicates = (selectedColumns: string[]) => {
    confirmDataManipulation('Remove Duplicates', (createNewSheet) => {
      const newData = dataOps.removeDuplicates(data, columns, selectedColumns);
      if (createNewSheet) {
        applyToNewSheetOrCurrent(newData, columns, 'Duplicates Removed');
      } else {
        handleDataChange(newData, columns);
      }
    });
  };

  const handleFillMissing = (column: string, method: string, customValue?: string) => {
    confirmDataManipulation('Fill Missing', (createNewSheet) => {
      const newData = dataOps.fillMissingValues(data, columns, column, method as any, customValue);
      if (createNewSheet) {
        applyToNewSheetOrCurrent(newData, columns, 'Missing Filled');
      } else {
        handleDataChange(newData, columns);
      }
    });
  };

  const handleTranspose = () => {
    const { data: newData, columns: newColumns } = dataOps.transpose(data, columns);
    updateActiveSheet(newData, newColumns);
    setDisplayData([]);
  };

  const handleTextTransform = (column: string, operation: string) => {
    confirmDataManipulation('Text Transform', (createNewSheet) => {
      const newData = dataOps.transformText(data, columns, column, operation as any);
      if (createNewSheet) {
        applyToNewSheetOrCurrent(newData, columns, 'Text Transformed');
      } else {
        handleDataChange(newData, columns);
      }
    });
  };

  const handleSplitColumn = (column: string, delimiter: string) => {
    confirmDataManipulation('Split Column', (createNewSheet) => {
      const { data: newData, columns: newColumns } = dataOps.splitColumn(data, columns, column, delimiter);
      if (createNewSheet) {
        applyToNewSheetOrCurrent(newData, newColumns, 'Column Split');
      } else {
        handleDataChange(newData, newColumns);
      }
    });
  };

  const handleGroupBy = (groupColumns: string[], aggregations: any[]) => {
    confirmDataManipulation('Group By', (createNewSheet) => {
      const { data: newData, columns: newColumns } = dataOps.groupBy(data, columns, groupColumns, aggregations);
      if (createNewSheet) {
        applyToNewSheetOrCurrent(newData, newColumns, 'Grouped');
      } else {
        updateActiveSheet(newData, newColumns);
        setDisplayData([]);
      }
    });
  };

  // ==================== CHART MANAGEMENT ====================

  const handleCreateChart = () => {
    // Find or create a Charts sheet
    if (!workbook) return;
    
    let chartsSheet = workbook.sheets.find(s => s.type === 'charts');
    
    if (!chartsSheet) {
      chartsSheet = createChartsSheet('Charts');
      setWorkbook({
        ...workbook,
        sheets: [...workbook.sheets, chartsSheet],
      });
    }
    
    setShowCreateChart(true);
  };

  const handleAddChart = (chart: ChartConfig) => {
    if (!workbook) return;
    
    const chartsSheet = workbook.sheets.find(s => s.type === 'charts');
    if (!chartsSheet) return;
    
    const updatedSheets = workbook.sheets.map(sheet =>
      sheet.id === chartsSheet.id
        ? { ...sheet, charts: [...(sheet.charts || []), chart], modifiedAt: Date.now() }
        : sheet
    );
    
    setWorkbook({ ...workbook, sheets: updatedSheets, modifiedAt: Date.now() });
    setShowCreateChart(false);
    
    // Switch to charts sheet
    setWorkbook(prev => prev ? { ...prev, activeSheetId: chartsSheet.id } : prev);
  };

  const handleDeleteChart = (chartId: string) => {
    if (!workbook) return;
    
    const chartsSheet = workbook.sheets.find(s => s.type === 'charts');
    if (!chartsSheet) return;
    
    const updatedSheets = workbook.sheets.map(sheet =>
      sheet.id === chartsSheet.id
        ? { ...sheet, charts: (sheet.charts || []).filter(c => c.id !== chartId), modifiedAt: Date.now() }
        : sheet
    );
    
    setWorkbook({ ...workbook, sheets: updatedSheets, modifiedAt: Date.now() });
  };

  const handleDownloadChart = (chartId: string) => {
    // The download is handled by Plotly's built-in download feature
    console.log('Download chart:', chartId);
  };

  return (
    <>
      <Taskbar onMenuAction={handleMenuAction} isMobile={isMobile} />
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.ods"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {isMobile ? (
        <main className="app-main z-0 p-4 pb-20">
          {workbook === null ? (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
              <div className="text-center">
                <FilePlus className="w-12 h-12 mx-auto mb-4 text-(--color-primary)" aria-hidden="true" />
                <h1 className="text-2xl font-bold text-(--color-text) mb-2">MiniDataManim</h1>
                <p className="text-(--color-text-secondary) mb-6">Open a spreadsheet to get started</p>
              </div>
              <button 
                onClick={handleOpenFile}
                className="px-6 py-3 bg-(--color-primary) text-white rounded-lg font-medium hover:bg-(--color-primary)/90 transition-colors"
              >
                Open File
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-(--color-text)">{fileName}</h1>
                <button
                  onClick={() => handleMenuAction('theme')}
                  className="p-2 hover:bg-(--color-bg) rounded transition-colors"
                  title="Toggle theme"
                >
                  {themeSetting.get() === 'dark' ? '☀️' : '🌙'}
                </button>
              </div>

              {/* Sheet Tabs - Mobile */}
              {workbook && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {workbook.sheets.map(sheet => (
                    <button
                      key={sheet.id}
                      onClick={() => handleSheetChange(sheet.id)}
                      className={`px-3 py-1 rounded whitespace-nowrap text-sm transition-colors ${
                        sheet.id === workbook.activeSheetId
                          ? 'bg-(--color-primary) text-white'
                          : 'bg-(--color-bg) text-(--color-text) hover:bg-(--color-border)'
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Data Table - Mobile optimized */}
              {data.length > 0 && (
                <div className="bg-(--color-surface) rounded-lg border border-(--color-border) overflow-hidden">
                  <DataTable 
                    data={displayData.length > 0 ? displayData : data} 
                    columns={columns} 
                    onDataChange={handleDataChange}
                    onCellSelect={editOps.setSelectedCell}
                    searchHighlight={activeSearch || undefined}
                  />
                </div>
              )}

              {/* Mobile Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={() => setShowExportDialog(true)}
                  className="px-4 py-2 bg-(--color-primary) text-white rounded-lg text-sm font-medium hover:bg-(--color-primary)/90 transition-colors"
                >
                  Export
                </button>
                <button
                  onClick={() => handleSheetAdd()}
                  className="px-4 py-2 bg-(--color-primary) text-white rounded-lg text-sm font-medium hover:bg-(--color-primary)/90 transition-colors"
                >
                  New Sheet
                </button>
              </div>
            </div>
          )}
        </main>
      ) : (
        <main 
          className="app-main z-0 p-8 pb-20 transition-transform duration-200" 
          style={{ transform: `scale(${viewOps.zoom / 100})`, transformOrigin: 'top left' }}
        >
          <div className="max-w-7xl mx-auto">
            {!hasActiveTable ? (
              <div
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-(--color-border) rounded-lg p-12 text-center cursor-pointer hover:border-(--color-primary) transition-colors"
                onClick={handleOpenFile}
              >
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-(--color-primary)" aria-hidden="true" />
                <h2 className="text-2xl font-bold text-(--color-text) mb-2">
                  Drag & drop your spreadsheet here
                </h2>
                <p className="text-(--color-text-secondary) mb-4">
                  or click to browse files
                </p>
                <p className="text-xs text-(--color-text-secondary)">
                  Supports: CSV, Excel (.xlsx, .xls), LibreOffice (.ods)
                </p>
                <div className="mt-6">
                  <button className="btn-primary mr-4" onClick={(e) => { e.stopPropagation(); handleOpenFile(); }}>
                    Open File
                  </button>
                  <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); handleNewTable(); }}>
                    New Table
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-(--color-text)">{fileName}</h1>
                    <p className="text-sm text-(--color-text-secondary) mt-1">
                      {fileType} • Zoom: {viewOps.zoom}% • {activeSheet?.type === 'charts' ? `${activeSheet.charts?.length || 0} charts` : displayData.length > 0 ? `${displayData.length} of ${data.length} rows (filtered)` : `${data.length} rows`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={handleNewTable}>New</button>
                    <button className="btn-secondary" onClick={handleOpenFile}>Open</button>
                    <button className="btn-primary" onClick={() => setShowExportDialog(true)}>Export</button>
                  </div>
                </div>
                
                {activeSheet?.type === 'charts' ? (
                  <ChartsViewer
                    charts={activeSheet.charts || []}
                    data={workbook?.sheets.find(s => s.type === 'data')?.data || []}
                    onDeleteChart={handleDeleteChart}
                    onDownloadChart={handleDownloadChart}
                  />
                ) : (
                  <DataTable 
                    data={displayData.length > 0 ? displayData : data} 
                    columns={columns} 
                    onDataChange={handleDataChange}
                    onCellSelect={editOps.setSelectedCell}
                    searchHighlight={activeSearch || undefined}
                  />
                )}
                
              </div>
            )}
          </div>
        </main>
      )}

      {/* Fixed Sheet Tabs */}
      {workbook && workbook.sheets.length > 0 && (
        <SheetTabs
          sheets={workbook.sheets}
          activeSheetId={workbook.activeSheetId}
          onSheetChange={handleSheetChange}
          onSheetAdd={handleSheetAdd}
          onSheetRename={handleSheetRename}
          onSheetDelete={handleSheetDelete}
          onSheetDuplicate={handleSheetDuplicate}
        />
      )}

      <AnimatePresence>
        {showDocs && <DocumentationPage onClose={() => setShowDocs(false)} />}
        {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
        {showAbout && <AboutPage onClose={() => setShowAbout(false)} />}
      </AnimatePresence>

      <PreferencesDialog
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onPreferencesChange={handlePreferencesChange}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        defaultFileName={fileName || 'export'}
        hasMultipleSheets={workbook ? workbook.sheets.filter(s => s.type === 'data').length > 1 : false}
      />

      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        defaultFileName={fileName || 'untitled'}
        mode="save"
      />

      <SaveDialog
        isOpen={showSaveAsDialog}
        onClose={() => setShowSaveAsDialog(false)}
        onSave={handleSave}
        defaultFileName={fileName || 'untitled'}
        mode="save-as"
      />

      <PrintDialog
        isOpen={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        onPrint={handlePrint}
      />

      <FindDialog
        isOpen={showFindDialog}
        onClose={() => {
          setShowFindDialog(false);
          setActiveSearch(null);
        }}
        onFind={handleFind}
      />

      <ReplaceDialog
        isOpen={showReplaceDialog}
        onClose={() => {
          setShowReplaceDialog(false);
          setActiveSearch(null);
        }}
        onReplace={handleReplace}
        onReplaceSingle={handleReplaceSingle}
        onFindMatches={handleFindMatches}
      />

      <SortDialog
        isOpen={showSortDialog}
        onClose={() => setShowSortDialog(false)}
        columns={columns}
        onSort={handleSort}
      />

      <FilterDialog
        isOpen={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        columns={columns}
        onFilter={handleFilter}
      />

      <ColumnSelectDialog
        isOpen={showColumnSelectDialog}
        onClose={() => setShowColumnSelectDialog(false)}
        columns={columns}
        onSelect={handleColumnSelect}
      />

      <StatsDialog
        isOpen={showStatsDialog}
        onClose={() => setShowStatsDialog(false)}
        stats={columnStats}
        columnName={statsColumnName}
      />

      <DataManipulationConfirmDialog
        isOpen={showDataManipulationConfirm}
        onClose={() => {
          setShowDataManipulationConfirm(false);
          setPendingOperation(null);
        }}
        onConfirm={handleDataManipulationConfirm}
        operationName={pendingOperation?.name || ''}
        defaultToNewSheet={preferencesManager.get().dataManipulationDefaultToNewSheet}
      />

      <RemoveDuplicatesDialog
        isOpen={showRemoveDuplicatesDialog}
        onClose={() => setShowRemoveDuplicatesDialog(false)}
        columns={columns}
        onRemove={handleRemoveDuplicates}
      />

      <FillMissingDialog
        isOpen={showFillMissingDialog}
        onClose={() => setShowFillMissingDialog(false)}
        columns={columns}
        onFill={handleFillMissing}
      />

      <TextTransformDialog
        isOpen={showTextTransformDialog}
        onClose={() => setShowTextTransformDialog(false)}
        columns={columns}
        onTransform={handleTextTransform}
      />

      <SplitColumnDialog
        isOpen={showSplitColumnDialog}
        onClose={() => setShowSplitColumnDialog(false)}
        columns={columns}
        onSplit={handleSplitColumn}
      />

      <GroupByDialog
        isOpen={showGroupByDialog}
        onClose={() => setShowGroupByDialog(false)}
        columns={columns}
        onGroup={handleGroupBy}
      />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={appSettings}
        onSettingsChange={handleSettingsChange}
      />

      <MobileWarningDialog
        isOpen={showMobileWarning}
        onAcknowledge={() => setShowMobileWarning(false)}
      />

      <CreateChartDialog
        isOpen={showCreateChart}
        onClose={() => setShowCreateChart(false)}
        columns={workbook?.sheets.find(s => s.type === 'data')?.columns || []}
        onCreateChart={handleAddChart}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />

      <ChoiceDialog
        isOpen={choiceDialog.isOpen}
        onClose={() => setChoiceDialog({ ...choiceDialog, isOpen: false })}
        onChoice={choiceDialog.onChoice}
        title={choiceDialog.title}
        message={choiceDialog.message}
        option1Text={choiceDialog.option1Text}
        option2Text={choiceDialog.option2Text}
      />

      {/* New Workbook Confirmation Dialog */}
      <AnimatePresence>
        {showNewWorkbookConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-9999 flex items-center justify-center p-4"
            onClick={() => setShowNewWorkbookConfirm(false)}
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
                  <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FilePlus className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-(--color-text) mb-2">
                      Create New Workbook
                    </h3>
                    <p className="text-(--color-text-secondary)">
                      This will create a new workbook. Any unsaved changes to the current workbook will be lost. Are you sure you want to continue?
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-(--color-border) px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowNewWorkbookConfirm(false)}
                  className="px-4 py-2 text-sm border border-(--color-border) rounded hover:bg-(--color-bg-secondary) transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmNewWorkbook}
                  className="px-4 py-2 text-sm border border-(--color-border) rounded hover:bg-(--color-bg-secondary) transition-colors"
                >
                  Create New Workbook
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
