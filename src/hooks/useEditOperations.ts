import { useState, useCallback } from 'react';

interface HistoryState {
  data: any[];
  columns: string[];
}

export function useEditOperations() {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [historyLimit, setHistoryLimitState] = useState(50);
  const [clipboard, setClipboard] = useState<any>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);

  const saveToHistory = useCallback((data: any[], columns: string[]) => {
    setHistory(prevHistory => {
      const truncated = prevHistory.slice(0, historyIndex + 1);
      truncated.push({ data: [...data], columns: [...columns] });

      if (truncated.length > historyLimit) {
        const excess = truncated.length - historyLimit;
        truncated.splice(0, excess);
      }

      setHistoryIndex(truncated.length - 1);
      return truncated;
    });
  }, [historyIndex, historyLimit]);

  const undo = useCallback((currentData: any[], currentColumns: string[]) => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      return previousState;
    }
    return { data: currentData, columns: currentColumns };
  }, [history, historyIndex]);

  const redo = useCallback((currentData: any[], currentColumns: string[]) => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      return nextState;
    }
    return { data: currentData, columns: currentColumns };
  }, [history, historyIndex]);

  const setHistoryLimit = useCallback((limit: number) => {
    const sanitized = Math.max(1, Math.min(limit, 500));
    setHistoryLimitState(sanitized);
    setHistory(prevHistory => {
      if (prevHistory.length <= sanitized) {
        return prevHistory;
      }

      const trimmed = prevHistory.slice(prevHistory.length - sanitized);
      const removed = prevHistory.length - trimmed.length;

      setHistoryIndex(prevIndex => {
        if (trimmed.length === 0) return -1;
        const adjusted = Math.min(trimmed.length - 1, Math.max(0, prevIndex - removed));
        return adjusted;
      });

      return trimmed;
    });
  }, []);

  const cut = useCallback((data: any[], _columns: string[]) => {
    if (selectedCell) {
      const cellValue = data[selectedCell.row][selectedCell.col];
      setClipboard(cellValue);
      
      const newData = [...data];
      newData[selectedCell.row] = { ...newData[selectedCell.row], [selectedCell.col]: '' };
      return newData;
    }
    return data;
  }, [selectedCell]);

  const copy = useCallback((data: any[]) => {
    if (selectedCell) {
      const cellValue = data[selectedCell.row][selectedCell.col];
      setClipboard(cellValue);
    }
  }, [selectedCell]);

  const paste = useCallback((data: any[], _columns: string[]) => {
    if (selectedCell && clipboard !== null) {
      const newData = [...data];
      newData[selectedCell.row] = { ...newData[selectedCell.row], [selectedCell.col]: clipboard };
      return newData;
    }
    return data;
  }, [selectedCell, clipboard]);

  return {
    history,
    historyIndex,
    clipboard,
    selectedCell,
    setSelectedCell,
    saveToHistory,
    undo,
    redo,
    cut,
    copy,
    paste,
    setHistoryLimit,
  };
}
