import { useState } from 'react';

export interface FilterCondition {
  column: string;
  operator: 'equals' | 'contains' | 'starts-with' | 'ends-with' | 'greater-than' | 'less-than' | 'not-equals' | 'is-empty' | 'is-not-empty';
  value: string;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export function useDataOperations() {
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // ==================== SORTING ====================
  
  const sortData = (data: any[], columns: string[], column: string, direction: 'asc' | 'desc') => {
    // Validate that the column exists in the columns array
    if (!columns.includes(column)) {
      console.warn(`Column "${column}" not found in available columns: ${columns.join(', ')}`);
      return data;
    }
    
    const sorted = [...data].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      
      // Handle empty values
      if (aVal === '' || aVal === null || aVal === undefined) return direction === 'asc' ? 1 : -1;
      if (bVal === '' || bVal === null || bVal === undefined) return direction === 'asc' ? -1 : 1;
      
      // Try to parse as numbers
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
    
    setSortConfig({ column, direction });
    return sorted;
  };

  // ==================== FILTERING ====================
  
  const applyFilter = (data: any[], conditions: FilterCondition[]) => {
    if (conditions.length === 0) return data;
    
    return data.filter(row => {
      return conditions.every(condition => {
        const cellValue = String(row[condition.column] || '').toLowerCase();
        const filterValue = condition.value.toLowerCase();
        
        switch (condition.operator) {
          case 'equals':
            return cellValue === filterValue;
          case 'not-equals':
            return cellValue !== filterValue;
          case 'contains':
            return cellValue.includes(filterValue);
          case 'starts-with':
            return cellValue.startsWith(filterValue);
          case 'ends-with':
            return cellValue.endsWith(filterValue);
          case 'greater-than':
            const num1 = parseFloat(cellValue);
            const num2 = parseFloat(filterValue);
            return !isNaN(num1) && !isNaN(num2) && num1 > num2;
          case 'less-than':
            const num3 = parseFloat(cellValue);
            const num4 = parseFloat(filterValue);
            return !isNaN(num3) && !isNaN(num4) && num3 < num4;
          case 'is-empty':
            return cellValue === '';
          case 'is-not-empty':
            return cellValue !== '';
          default:
            return true;
        }
      });
    });
  };

  const addFilterCondition = (condition: FilterCondition) => {
    const newConditions = [...filterConditions, condition];
    setFilterConditions(newConditions);
    return newConditions;
  };

  const removeFilterCondition = (index: number) => {
    const newConditions = filterConditions.filter((_, i) => i !== index);
    setFilterConditions(newConditions);
    return newConditions;
  };

  const clearFilters = () => {
    setFilterConditions([]);
    return [];
  };

  // ==================== STATISTICS ====================
  
  const calculateStats = (data: any[], column: string) => {
    const values = data.map(row => row[column]).filter(val => val !== '' && val !== null && val !== undefined);
    const numbers = values.map(val => parseFloat(val)).filter(num => !isNaN(num));
    
    if (numbers.length === 0) {
      return {
        count: values.length,
        unique: new Set(values).size,
        empty: data.length - values.length,
        type: 'text'
      };
    }
    
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    const mean = sum / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      count: values.length,
      unique: new Set(values).size,
      empty: data.length - values.length,
      type: 'numeric',
      sum,
      mean,
      median,
      min,
      max,
      stdDev,
      variance
    };
  };

  // ==================== DATA TRANSFORMATION ====================
  
  const removeDuplicates = (data: any[], columns: string[], selectedColumns?: string[]) => {
    const keyCols = selectedColumns || columns;
    const seen = new Set<string>();
    
    return data.filter(row => {
      const key = keyCols.map(col => row[col]).join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const fillMissingValues = (data: any[], columns: string[], column: string, method: 'forward' | 'backward' | 'mean' | 'median' | 'zero' | 'custom', customValue?: string) => {
    // Validate that the column exists in the columns array
    if (!columns.includes(column)) {
      console.warn(`Column "${column}" not found in available columns: ${columns.join(', ')}`);
      return data;
    }
    
    const newData = [...data];
    const values = newData.map(row => row[column]);
    
    if (method === 'forward') {
      let lastValid = '';
      for (let i = 0; i < newData.length; i++) {
        if (values[i] === '' || values[i] === null || values[i] === undefined) {
          newData[i][column] = lastValid;
        } else {
          lastValid = values[i];
        }
      }
    } else if (method === 'backward') {
      let lastValid = '';
      for (let i = newData.length - 1; i >= 0; i--) {
        if (values[i] === '' || values[i] === null || values[i] === undefined) {
          newData[i][column] = lastValid;
        } else {
          lastValid = values[i];
        }
      }
    } else if (method === 'mean' || method === 'median') {
      const numbers = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
      if (numbers.length > 0) {
        let fillValue: number;
        if (method === 'mean') {
          fillValue = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        } else {
          const sorted = [...numbers].sort((a, b) => a - b);
          fillValue = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
        }
        for (let i = 0; i < newData.length; i++) {
          if (values[i] === '' || values[i] === null || values[i] === undefined) {
            newData[i][column] = fillValue.toString();
          }
        }
      }
    } else if (method === 'zero') {
      for (let i = 0; i < newData.length; i++) {
        if (values[i] === '' || values[i] === null || values[i] === undefined) {
          newData[i][column] = '0';
        }
      }
    } else if (method === 'custom' && customValue !== undefined) {
      for (let i = 0; i < newData.length; i++) {
        if (values[i] === '' || values[i] === null || values[i] === undefined) {
          newData[i][column] = customValue;
        }
      }
    }
    
    return newData;
  };

  const transpose = (data: any[], columns: string[]) => {
    if (data.length === 0) return { data: [], columns: [] };
    
    const newColumns = ['Field', ...data.map((_, i) => `Row ${i + 1}`)];
    const newData = columns.map(col => {
      const row: any = { Field: col };
      data.forEach((dataRow, i) => {
        row[`Row ${i + 1}`] = dataRow[col];
      });
      return row;
    });
    
    return { data: newData, columns: newColumns };
  };

  // ==================== COLUMN OPERATIONS ====================
  
  const addCalculatedColumn = (data: any[], columns: string[], newColumnName: string, formula: string) => {
    const newColumns = [...columns, newColumnName];
    const newData = data.map(row => {
      const newRow = { ...row };
      try {
        // Replace column names with values in the formula
        let evalFormula = formula;
        columns.forEach(col => {
          const value = parseFloat(row[col]) || 0;
          evalFormula = evalFormula.replace(new RegExp(`\\[${col}\\]`, 'g'), value.toString());
        });
        
        // Evaluate the formula
        // eslint-disable-next-line no-eval
        const result = eval(evalFormula);
        newRow[newColumnName] = isNaN(result) ? '' : result.toString();
      } catch (e) {
        newRow[newColumnName] = 'Error';
      }
      return newRow;
    });
    
    return { data: newData, columns: newColumns };
  };

  const splitColumn = (data: any[], columns: string[], column: string, delimiter: string, newColumnNames?: string[]) => {
    const firstRow = data[0];
    const sampleSplit = String(firstRow[column] || '').split(delimiter);
    const numParts = sampleSplit.length;
    
    const newCols = newColumnNames || Array.from({ length: numParts }, (_, i) => `${column}_${i + 1}`);
    const columnIndex = columns.indexOf(column);
    const newColumns = [
      ...columns.slice(0, columnIndex + 1),
      ...newCols,
      ...columns.slice(columnIndex + 1)
    ];
    
    const newData = data.map(row => {
      const newRow = { ...row };
      const parts = String(row[column] || '').split(delimiter);
      newCols.forEach((newCol, i) => {
        newRow[newCol] = parts[i] || '';
      });
      return newRow;
    });
    
    return { data: newData, columns: newColumns };
  };

  const mergeColumns = (data: any[], columns: string[], columnsToMerge: string[], newColumnName: string, delimiter: string = ' ') => {
    const newColumns = columns.filter(col => !columnsToMerge.includes(col));
    newColumns.push(newColumnName);
    
    const newData = data.map(row => {
      const newRow: any = {};
      columns.forEach(col => {
        if (!columnsToMerge.includes(col)) {
          newRow[col] = row[col];
        }
      });
      newRow[newColumnName] = columnsToMerge.map(col => row[col] || '').join(delimiter);
      return newRow;
    });
    
    return { data: newData, columns: newColumns };
  };

  // ==================== TEXT OPERATIONS ====================
  
  const transformText = (data: any[], columns: string[], column: string, operation: 'uppercase' | 'lowercase' | 'capitalize' | 'trim') => {
    // Validate that the column exists in the columns array
    if (!columns.includes(column)) {
      console.warn(`Column "${column}" not found in available columns: ${columns.join(', ')}`);
      return data;
    }
    
    return data.map(row => {
      const newRow = { ...row };
      const value = String(row[column] || '');
      
      switch (operation) {
        case 'uppercase':
          newRow[column] = value.toUpperCase();
          break;
        case 'lowercase':
          newRow[column] = value.toLowerCase();
          break;
        case 'capitalize':
          newRow[column] = value.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          break;
        case 'trim':
          newRow[column] = value.trim();
          break;
      }
      
      return newRow;
    });
  };

  // ==================== NUMERIC OPERATIONS ====================
  
  const normalizeColumn = (data: any[], columns: string[], column: string, method: 'min-max' | 'z-score') => {
    // Validate that the column exists in the columns array
    if (!columns.includes(column)) {
      console.warn(`Column "${column}" not found in available columns: ${columns.join(', ')}`);
      return data;
    }
    
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    if (values.length === 0) return data;
    
    const newData = [...data];
    
    if (method === 'min-max') {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      
      if (range === 0) return data;
      
      newData.forEach(row => {
        const val = parseFloat(row[column]);
        if (!isNaN(val)) {
          row[column] = ((val - min) / range).toFixed(4);
        }
      });
    } else if (method === 'z-score') {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev === 0) return data;
      
      newData.forEach(row => {
        const val = parseFloat(row[column]);
        if (!isNaN(val)) {
          row[column] = ((val - mean) / stdDev).toFixed(4);
        }
      });
    }
    
    return newData;
  };

  const roundColumn = (data: any[], columns: string[], column: string, decimals: number) => {
    // Validate that the column exists in the columns array
    if (!columns.includes(column)) {
      console.warn(`Column "${column}" not found in available columns: ${columns.join(', ')}`);
      return data;
    }
    
    return data.map(row => {
      const newRow = { ...row };
      const val = parseFloat(row[column]);
      if (!isNaN(val)) {
        newRow[column] = val.toFixed(decimals);
      }
      return newRow;
    });
  };

  // ==================== GROUPING & AGGREGATION ====================
  
  const groupBy = (data: any[], columns: string[], groupColumns: string[], aggregations: { column: string; operation: 'sum' | 'avg' | 'count' | 'min' | 'max' }[]) => {
    // Validate that all group columns exist in the columns array
    const missingColumns = groupColumns.filter(col => !columns.includes(col));
    if (missingColumns.length > 0) {
      console.warn(`Group columns not found in available columns: ${missingColumns.join(', ')}. Available columns: ${columns.join(', ')}`);
      return { data: [], columns: [] };
    }
    
    // Validate that all aggregation columns exist in the columns array
    const missingAggColumns = aggregations.filter(agg => !columns.includes(agg.column));
    if (missingAggColumns.length > 0) {
      console.warn(`Aggregation columns not found in available columns: ${missingAggColumns.map(agg => agg.column).join(', ')}. Available columns: ${columns.join(', ')}`);
      return { data: [], columns: [] };
    }
    
    const groups = new Map<string, any[]>();
    
    // Group the data
    data.forEach(row => {
      const key = groupColumns.map(col => row[col]).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });
    
    // Aggregate
    const newData: any[] = [];
    const newColumns = [...groupColumns, ...aggregations.map(agg => `${agg.operation}(${agg.column})`)];
    
    groups.forEach((groupRows, key) => {
      const newRow: any = {};
      
      // Set group column values
      groupColumns.forEach((col, i) => {
        newRow[col] = key.split('|')[i];
      });
      
      // Calculate aggregations
      aggregations.forEach(agg => {
        const values = groupRows.map(r => parseFloat(r[agg.column])).filter(v => !isNaN(v));
        const colName = `${agg.operation}(${agg.column})`;
        
        switch (agg.operation) {
          case 'sum':
            newRow[colName] = values.reduce((a, b) => a + b, 0).toFixed(2);
            break;
          case 'avg':
            newRow[colName] = values.length > 0 
              ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
              : '0';
            break;
          case 'count':
            newRow[colName] = groupRows.length.toString();
            break;
          case 'min':
            newRow[colName] = values.length > 0 ? Math.min(...values).toFixed(2) : '';
            break;
          case 'max':
            newRow[colName] = values.length > 0 ? Math.max(...values).toFixed(2) : '';
            break;
        }
      });
      
      newData.push(newRow);
    });
    
    return { data: newData, columns: newColumns };
  };

  return {
    // State
    filterConditions,
    sortConfig,
    
    // Sorting
    sortData,
    
    // Filtering
    applyFilter,
    addFilterCondition,
    removeFilterCondition,
    clearFilters,
    
    // Statistics
    calculateStats,
    
    // Transformation
    removeDuplicates,
    fillMissingValues,
    transpose,
    
    // Column operations
    addCalculatedColumn,
    splitColumn,
    mergeColumns,
    
    // Text operations
    transformText,
    
    // Numeric operations
    normalizeColumn,
    roundColumn,
    
    // Grouping
    groupBy,
  };
}
