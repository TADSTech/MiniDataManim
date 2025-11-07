import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DialogContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function DialogContainer({ isOpen, onClose, title, children }: DialogContainerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
            <h2 className="text-2xl font-bold text-(--color-text)">{title}</h2>
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
    </AnimatePresence>
  );
}

// ==================== COLUMN SELECT DIALOG ====================
interface ColumnSelectDialogProps extends DialogProps {
  columns: string[];
  onSelect: (column: string) => void;
}

export function ColumnSelectDialog({ isOpen, onClose, columns, onSelect }: ColumnSelectDialogProps) {
  const [selectedColumn, setSelectedColumn] = useState(columns[0] || '');

  const handleSelect = () => {
    if (selectedColumn) {
      onSelect(selectedColumn);
      onClose();
    }
  };

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Select Column for Statistics">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Column</label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          <option value="">-- Select a column --</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSelect}>Show Statistics</button>
      </div>
    </DialogContainer>
  );
}

// ==================== SORT DIALOG ====================
interface SortDialogProps extends DialogProps {
  columns: string[];
  onSort: (column: string, direction: 'asc' | 'desc') => void;
}

export function SortDialog({ isOpen, onClose, columns, onSort }: SortDialogProps) {
  const [selectedColumn, setSelectedColumn] = useState(columns[0] || '');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = () => {
    onSort(selectedColumn, direction);
    onClose();
  };

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Sort Data">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Column</label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          <option value="">-- Select a column --</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Direction</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="asc"
              checked={direction === 'asc'}
              onChange={(e) => setDirection(e.target.value as 'asc')}
            />
            Ascending (A-Z, 0-9)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="desc"
              checked={direction === 'desc'}
              onChange={(e) => setDirection(e.target.value as 'desc')}
            />
            Descending (Z-A, 9-0)
          </label>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSort}>Sort</button>
      </div>
    </DialogContainer>
  );
}

// ==================== FILTER DIALOG ====================
interface FilterDialogProps extends DialogProps {
  columns: string[];
  onFilter: (column: string, operator: string, value: string) => void;
}

export function FilterDialog({ isOpen, onClose, columns, onFilter }: FilterDialogProps) {
  const [selectedColumn, setSelectedColumn] = useState(columns[0] || '');
  const [operator, setOperator] = useState('contains');
  const [value, setValue] = useState('');

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not-equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts-with', label: 'Starts With' },
    { value: 'ends-with', label: 'Ends With' },
    { value: 'greater-than', label: 'Greater Than' },
    { value: 'less-than', label: 'Less Than' },
    { value: 'is-empty', label: 'Is Empty' },
    { value: 'is-not-empty', label: 'Is Not Empty' },
  ];

  const handleFilter = () => {
    onFilter(selectedColumn, operator, value);
    onClose();
    setValue('');
  };

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Filter Data">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Column</label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          <option value="">-- Select a column --</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Operator</label>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          {operators.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </div>

      {operator !== 'is-empty' && operator !== 'is-not-empty' && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-(--color-text)">Value</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) placeholder-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            placeholder="Enter value..."
          />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleFilter}>Add Filter</button>
      </div>
    </DialogContainer>
  );
}

// ==================== STATISTICS DIALOG ====================
interface StatsDialogProps extends DialogProps {
  stats: any;
  columnName: string;
}

export function StatsDialog({ isOpen, onClose, stats, columnName }: StatsDialogProps) {
  if (!stats) {
    return (
      <DialogContainer isOpen={isOpen} onClose={onClose} title={`Statistics: ${columnName}`}>
        <div className="text-center py-8 text-(--color-text-secondary)">
          <p>No statistics available</p>
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </DialogContainer>
    );
  }

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title={`Statistics: ${columnName}`}>
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span className="font-medium">Count:</span>
          <span>{stats.count}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Unique:</span>
          <span>{stats.unique}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Empty:</span>
          <span>{stats.empty}</span>
        </div>
        
        {stats.type === 'numeric' && (
          <>
            <hr className="my-2" />
            <div className="flex justify-between">
              <span className="font-medium">Sum:</span>
              <span>{stats.sum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Mean:</span>
              <span>{stats.mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Median:</span>
              <span>{stats.median.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Min:</span>
              <span>{stats.min.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Max:</span>
              <span>{stats.max.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Std Dev:</span>
              <span>{stats.stdDev.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </DialogContainer>
  );
}

// ==================== REMOVE DUPLICATES DIALOG ====================
interface RemoveDuplicatesDialogProps extends DialogProps {
  columns: string[];
  onRemove: (selectedColumns: string[]) => void;
}

export function RemoveDuplicatesDialog({ isOpen, onClose, columns, onRemove }: RemoveDuplicatesDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([...columns]);

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleRemove = () => {
    onRemove(selectedColumns.length > 0 ? selectedColumns : columns);
    onClose();
  };

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Remove Duplicates">
      <p className="mb-4 text-sm text-(--color-text-secondary)">
        Select columns to check for duplicates. Rows with matching values in these columns will be removed.
      </p>

      <div className="mb-6 max-h-64 overflow-y-auto space-y-2">
        {columns.map(col => (
          <label key={col} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedColumns.includes(col)}
              onChange={() => toggleColumn(col)}
            />
            {col}
          </label>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleRemove}>Remove Duplicates</button>
      </div>
    </DialogContainer>
  );
}

// ==================== FILL MISSING VALUES DIALOG ====================
interface FillMissingDialogProps extends DialogProps {
  columns: string[];
  onFill: (column: string, method: string, customValue?: string) => void;
}

export function FillMissingDialog({ isOpen, onClose, columns, onFill }: FillMissingDialogProps) {
  const [selectedColumn, setSelectedColumn] = useState(columns[0] || '');
  const [method, setMethod] = useState('forward');
  const [customValue, setCustomValue] = useState('');

  const methods = [
    { value: 'forward', label: 'Forward Fill' },
    { value: 'backward', label: 'Backward Fill' },
    { value: 'mean', label: 'Mean (numeric)' },
    { value: 'median', label: 'Median (numeric)' },
    { value: 'zero', label: 'Zero' },
    { value: 'custom', label: 'Custom Value' },
  ];

  const handleFill = () => {
    onFill(selectedColumn, method, customValue);
    onClose();
  };

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Fill Missing Values">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Column</label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          <option value="">-- Select a column --</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          {methods.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {method === 'custom' && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-(--color-text)">Custom Value</label>
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) placeholder-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            placeholder="Enter custom value..."
          />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleFill}>Fill</button>
      </div>
    </DialogContainer>
  );
}

// ==================== TEXT TRANSFORM DIALOG ====================
interface TextTransformDialogProps extends DialogProps {
  columns: string[];
  onTransform: (column: string, operation: string) => void;
}

export function TextTransformDialog({ isOpen, onClose, columns, onTransform }: TextTransformDialogProps) {
  const [selectedColumn, setSelectedColumn] = useState(columns[0] || '');
  const [operation, setOperation] = useState('uppercase');

  const operations = [
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize Words' },
    { value: 'trim', label: 'Trim Whitespace' },
  ];

  const handleTransform = () => {
    onTransform(selectedColumn, operation);
    onClose();
  };

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Transform Text">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Column</label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          <option value="">-- Select a column --</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Operation</label>
        <div className="space-y-2">
          {operations.map(op => (
            <label key={op.value} className="flex items-center gap-2">
              <input
                type="radio"
                value={op.value}
                checked={operation === op.value}
                onChange={(e) => setOperation(e.target.value)}
              />
              {op.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleTransform}>Transform</button>
      </div>
    </DialogContainer>
  );
}

// ==================== SPLIT COLUMN DIALOG ====================
interface SplitColumnDialogProps extends DialogProps {
  columns: string[];
  onSplit: (column: string, delimiter: string) => void;
}

export function SplitColumnDialog({ isOpen, onClose, columns, onSplit }: SplitColumnDialogProps) {
  const [selectedColumn, setSelectedColumn] = useState(columns[0] || '');
  const [delimiter, setDelimiter] = useState(' ');

  const handleSplit = () => {
    onSplit(selectedColumn, delimiter);
    onClose();
  };

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Split Column">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Column</label>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        >
          <option value="">-- Select a column --</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-(--color-text)">Delimiter</label>
        <input
          type="text"
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value)}
          className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) placeholder-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          placeholder="Enter delimiter (e.g., space, comma, |)"
        />
        <p className="text-xs text-(--color-text-secondary) mt-1">
          Common: space ( ), comma (,), pipe (|), semicolon (;)
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSplit}>Split</button>
      </div>
    </DialogContainer>
  );
}

// ==================== GROUP BY DIALOG ====================
interface GroupByDialogProps extends DialogProps {
  columns: string[];
  onGroup: (groupColumns: string[], aggregations: any[]) => void;
}

export function GroupByDialog({ isOpen, onClose, columns, onGroup }: GroupByDialogProps) {
  const [groupColumns, setGroupColumns] = useState<string[]>([columns[0] || '']);
  const [aggregations, setAggregations] = useState<{column: string; operation: string}[]>([
    { column: columns[1] || columns[0] || '', operation: 'sum' }
  ]);

  const operations = ['sum', 'avg', 'count', 'min', 'max'];

  const toggleGroupColumn = (column: string) => {
    setGroupColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const addAggregation = () => {
    setAggregations([...aggregations, { column: columns[0] || '', operation: 'sum' }]);
  };

  const removeAggregation = (index: number) => {
    setAggregations(aggregations.filter((_, i) => i !== index));
  };

  const updateAggregation = (index: number, field: 'column' | 'operation', value: string) => {
    const newAggs = [...aggregations];
    newAggs[index][field] = value;
    setAggregations(newAggs);
  };

  const handleGroup = () => {
    if (groupColumns.length === 0 || aggregations.length === 0) {
      alert('Please select at least one group column and one aggregation');
      return;
    }
    onGroup(groupColumns, aggregations);
    onClose();
  };

  return (
    <DialogContainer isOpen={isOpen} onClose={onClose} title="Group By & Aggregate">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Group By Columns</label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {columns.map(col => (
            <label key={col} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={groupColumns.includes(col)}
                onChange={() => toggleGroupColumn(col)}
              />
              {col}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Aggregations</label>
        {aggregations.map((agg, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={agg.operation}
              onChange={(e) => updateAggregation(index, 'operation', e.target.value)}
              className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary) flex-1"
            >
              {operations.map(op => (
                <option key={op} value={op}>{op.toUpperCase()}</option>
              ))}
            </select>
            <select
              value={agg.column}
              onChange={(e) => updateAggregation(index, 'column', e.target.value)}
              className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary) flex-1"
            >
              <option value="">-- Select column --</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <button 
              className="btn-secondary px-3"
              onClick={() => removeAggregation(index)}
            >
              ✕
            </button>
          </div>
        ))}
        <button className="btn-secondary mt-2" onClick={addAggregation}>
          + Add Aggregation
        </button>
      </div>

      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleGroup}>Group & Aggregate</button>
      </div>
    </DialogContainer>
  );
}
