import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

interface DataTableProps {
  data: any[];
  columns: string[];
  onDataChange: (data: any[], columns: string[]) => void;
  onCellSelect?: (cell: { row: number; col: string } | null) => void;
  onColumnSelect?: (column: string) => void;
  searchHighlight?: { text: string; matchCase: boolean };
}

export function DataTable({ data, columns, onDataChange, onCellSelect, onColumnSelect, searchHighlight }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [columnMenuOpen, setColumnMenuOpen] = useState<string | null>(null);
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const columnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  useEffect(() => {
    if (editingColumn && columnInputRef.current) {
      columnInputRef.current.focus();
      columnInputRef.current.select();
    }
  }, [editingColumn]);

  const handleCellClick = (rowIndex: number, column: string) => {
    setEditingCell({ row: rowIndex, col: column });
    if (onCellSelect) {
      onCellSelect({ row: rowIndex, col: column });
    }
  };

  const handleCellChange = (value: string, rowIndex: number, column: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    onDataChange(newData, columns);
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleColumnNameChange = (oldName: string, newName: string) => {
    if (newName && newName !== oldName && !columns.includes(newName)) {
      const newColumns = columns.map(col => col === oldName ? newName : col);
      const newData = data.map(row => {
        const newRow = { ...row };
        newRow[newName] = row[oldName];
        delete newRow[oldName];
        return newRow;
      });
      onDataChange(newData, newColumns);
    }
    setEditingColumn(null);
  };

  const addColumn = () => {
    let columnNumber = columns.length + 1;
    let newColumnName = `Column ${columnNumber}`;
    while (columns.includes(newColumnName)) {
      columnNumber++;
      newColumnName = `Column ${columnNumber}`;
    }
    const newColumns = [...columns, newColumnName];
    const newData = data.map(row => ({ ...row, [newColumnName]: '' }));
    onDataChange(newData, newColumns);
  };

  const addRow = () => {
    const newRow: any = {};
    columns.forEach(col => {
      newRow[col] = '';
    });
    onDataChange([...data, newRow], columns);
  };

  const deleteColumn = (columnName: string) => {
    const newColumns = columns.filter(col => col !== columnName);
    const newData = data.map(row => {
      const newRow = { ...row };
      delete newRow[columnName];
      return newRow;
    });
    onDataChange(newData, newColumns);
    setColumnMenuOpen(null);
  };

  const deleteRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    onDataChange(newData, columns);
  };

  const insertRowAbove = (rowIndex: number) => {
    const newRow: any = {};
    columns.forEach(col => {
      newRow[col] = '';
    });
    const newData = [...data];
    newData.splice(rowIndex, 0, newRow);
    onDataChange(newData, columns);
  };

  const insertRowBelow = (rowIndex: number) => {
    const newRow: any = {};
    columns.forEach(col => {
      newRow[col] = '';
    });
    const newData = [...data];
    newData.splice(rowIndex + 1, 0, newRow);
    onDataChange(newData, columns);
  };

  const clearAll = () => {
    const newData = data.map(() => {
      const newRow: any = {};
      columns.forEach(col => {
        newRow[col] = '';
      });
      return newRow;
    });
    onDataChange(newData, columns);
    setEditDropdownOpen(false);
  };

  const deleteAllRows = () => {
    onDataChange([], columns);
    setEditDropdownOpen(false);
  };

  const highlightText = (text: string) => {
    if (!searchHighlight || !searchHighlight.text) return text;
    
    const searchText = searchHighlight.text;
    const regex = new RegExp(
      `(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      searchHighlight.matchCase ? 'g' : 'gi'
    );
    
    const parts = String(text).split(regex);
    return parts.map((part, i) => {
      const isMatch = searchHighlight.matchCase 
        ? part === searchText
        : part.toLowerCase() === searchText.toLowerCase();
      
      return isMatch ? (
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 text-black px-1 rounded">
          {part}
        </mark>
      ) : part;
    });
  };

  if (data.length === 0 && columns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 text-(--color-text-secondary)"
      >
        <p className="text-lg">No data loaded yet</p>
        <p className="text-sm mt-2">Upload a file to get started</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 pb-2 border-b border-(--color-border)">
        <button onClick={addRow} className="btn-secondary text-sm">
          + Add Row
        </button>
        <button onClick={addColumn} className="btn-secondary text-sm">
          + Add Column
        </button>
        <div className="relative">
          <button 
            onClick={() => setEditDropdownOpen(!editDropdownOpen)} 
            className="btn-secondary text-sm"
          >
            Edit ▼
          </button>
          <AnimatePresence>
            {editDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-1 bg-(--color-bg) border border-(--color-border) rounded-lg shadow-lg overflow-hidden"
                style={{ zIndex: 1000 }}
              >
                <button
                  onClick={clearAll}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-(--color-bg-secondary) whitespace-nowrap"
                >
                  Clear All Data
                </button>
                <button
                  onClick={deleteAllRows}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-(--color-bg-secondary) text-red-500 whitespace-nowrap"
                >
                  Delete All Rows
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="ml-auto text-sm text-(--color-text-secondary)">
          {data.length} rows × {columns.length} columns
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-auto rounded-lg border border-(--color-border) max-h-[calc(100vh-300px)]"
      >
        <table className="min-w-full divide-y divide-(--color-border)">
          <thead className="sticky top-0" style={{ zIndex: 10 }}>
            <tr>
              <th className="w-12 px-2 py-3 text-center text-xs font-medium text-white bg-blue-600 dark:bg-blue-700 border-r border-(--color-border)">
                #
              </th>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-white bg-blue-600 dark:bg-blue-700 tracking-wider border-r border-(--color-border) relative group"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (onColumnSelect) {
                      onColumnSelect(column);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    {editingColumn === column ? (
                      <input
                        ref={columnInputRef}
                        type="text"
                        defaultValue={column}
                        onBlur={(e) => handleColumnNameChange(column, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleColumnNameChange(column, e.currentTarget.value);
                          } else if (e.key === 'Escape') {
                            setEditingColumn(null);
                          }
                        }}
                        className="bg-(--color-bg) border border-(--color-primary) rounded px-2 py-1 text-xs w-full"
                      />
                    ) : (
                      <>
                        <span 
                          onDoubleClick={() => setEditingColumn(column)}
                          className="cursor-pointer uppercase"
                        >
                          {column}
                        </span>
                        <button
                          onClick={() => setColumnMenuOpen(columnMenuOpen === column ? null : column)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ⋮
                        </button>
                      </>
                    )}
                  </div>
                  <AnimatePresence>
                    {columnMenuOpen === column && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-1 bg-(--color-bg) border border-(--color-border) rounded-lg shadow-lg overflow-hidden"
                        style={{ zIndex: 1000 }}
                      >
                        <button
                          onClick={() => {
                            setEditingColumn(column);
                            setColumnMenuOpen(null);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-(--color-bg-secondary) whitespace-nowrap"
                        >
                          Rename Column
                        </button>
                        <button
                          onClick={() => deleteColumn(column)}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-(--color-bg-secondary) text-red-500 whitespace-nowrap"
                        >
                          Delete Column
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-(--color-bg) divide-y divide-(--color-border)">
            {data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(rowIndex * 0.02, 0.3) }}
                className="group"
              >
                <td className="w-12 px-2 py-2 text-center text-xs text-(--color-text-secondary) border-r border-(--color-border) bg-(--color-bg-secondary)">
                  <div className="flex items-center justify-center gap-1">
                    <span>{rowIndex + 1}</span>
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          const menu = document.getElementById(`row-menu-${rowIndex}`);
                          if (menu) menu.classList.toggle('hidden');
                        }}
                        className="text-xs"
                      >
                        ⋮
                      </button>
                      <div
                        id={`row-menu-${rowIndex}`}
                        className="hidden absolute left-full top-0 ml-1 bg-(--color-bg) border border-(--color-border) rounded-lg shadow-lg overflow-hidden whitespace-nowrap"
                        style={{ zIndex: 1000 }}
                      >
                        <button
                          onClick={() => insertRowAbove(rowIndex)}
                          className="block w-full px-4 py-2 text-left text-xs hover:bg-(--color-bg-secondary)"
                        >
                          Insert Row Above
                        </button>
                        <button
                          onClick={() => insertRowBelow(rowIndex)}
                          className="block w-full px-4 py-2 text-left text-xs hover:bg-(--color-bg-secondary)"
                        >
                          Insert Row Below
                        </button>
                        <button
                          onClick={() => deleteRow(rowIndex)}
                          className="block w-full px-4 py-2 text-left text-xs hover:bg-(--color-bg-secondary) text-red-500"
                        >
                          Delete Row
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-0 py-0 text-sm text-(--color-text) border-r border-(--color-border) cursor-pointer hover:bg-(--color-bg-secondary) transition-colors"
                    onClick={() => handleCellClick(rowIndex, column)}
                  >
                    {editingCell?.row === rowIndex && editingCell?.col === column ? (
                      <input
                        ref={inputRef}
                        type="text"
                        defaultValue={row[column] || ''}
                        onChange={(e) => handleCellChange(e.target.value, rowIndex, column)}
                        onBlur={handleCellBlur}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCellBlur();
                          } else if (e.key === 'Escape') {
                            handleCellBlur();
                          }
                        }}
                        className="w-full h-full px-4 py-3 bg-(--color-bg) border-2 border-(--color-primary) outline-none"
                      />
                    ) : (
                      <div className="px-4 py-3 min-h-10">
                        {searchHighlight ? highlightText(row[column] || '') : (row[column] || '')}
                      </div>
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
