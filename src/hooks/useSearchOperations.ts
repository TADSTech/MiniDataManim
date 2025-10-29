import { useCallback } from 'react';

export interface SearchMatch {
  rowIndex: number;
  column: string;
  value: string;
}

export function useSearchOperations() {
  const findMatches = useCallback((data: any[], columns: string[], searchText: string, matchCase: boolean): SearchMatch[] => {
    const matches: SearchMatch[] = [];
    const searchValue = matchCase ? searchText : searchText.toLowerCase();
    
    data.forEach((row, rowIndex) => {
      columns.forEach((col) => {
        const cellValue = String(row[col] || '');
        const compareValue = matchCase ? cellValue : cellValue.toLowerCase();
        if (compareValue.includes(searchValue)) {
          matches.push({ rowIndex, column: col, value: cellValue });
        }
      });
    });
    
    return matches;
  }, []);

  const find = useCallback((data: any[], columns: string[], searchText: string, matchCase: boolean) => {
    const matches = findMatches(data, columns, searchText, matchCase);
    return matches.length;
  }, [findMatches]);

  const replace = useCallback((data: any[], columns: string[], searchText: string, replaceText: string, matchCase: boolean) => {
    let replaced = 0;
    const searchValue = matchCase ? searchText : searchText.toLowerCase();
    
    const newData = data.map(row => {
      const newRow = { ...row };
      columns.forEach(col => {
        const cellValue = String(row[col] || '');
        const compareValue = matchCase ? cellValue : cellValue.toLowerCase();
        
        if (compareValue.includes(searchValue)) {
          if (matchCase) {
            newRow[col] = cellValue.replaceAll(searchText, replaceText);
          } else {
            const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            newRow[col] = cellValue.replace(regex, replaceText);
          }
          replaced++;
        }
      });
      return newRow;
    });
    
    return { newData, replaced };
  }, []);

  const replaceSingle = useCallback((
    data: any[], 
    columns: string[], 
    searchText: string, 
    replaceText: string, 
    matchCase: boolean,
    currentIndex: number
  ) => {
    const matches = findMatches(data, columns, searchText, matchCase);
    
    if (matches.length === 0 || currentIndex >= matches.length) {
      return { newData: data, nextIndex: -1, totalMatches: 0 };
    }

    const match = matches[currentIndex];
    const newData = data.map((row, idx) => {
      if (idx !== match.rowIndex) return row;
      
      const newRow = { ...row };
      const cellValue = String(row[match.column] || '');
      
      if (matchCase) {
        newRow[match.column] = cellValue.replace(searchText, replaceText);
      } else {
        const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        newRow[match.column] = cellValue.replace(regex, replaceText);
      }
      
      return newRow;
    });

    // Find next match after replacement
    const newMatches = findMatches(newData, columns, searchText, matchCase);
    const nextIndex = newMatches.length > 0 ? Math.min(currentIndex, newMatches.length - 1) : -1;

    return { newData, nextIndex, totalMatches: newMatches.length };
  }, [findMatches]);

  return {
    find,
    findMatches,
    replace,
    replaceSingle,
  };
}
