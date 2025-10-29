import type { ChartConfig } from '../components/CreateChartDialog';

export interface Sheet {
  id: string;
  name: string;
  data: any[];
  columns: string[];
  createdAt: number;
  modifiedAt: number;
  type?: 'data' | 'charts';
  charts?: ChartConfig[];
}

export interface Workbook {
  id: string;
  fileName: string;
  fileType: string;
  sheets: Sheet[];
  activeSheetId: string;
  createdAt: number;
  modifiedAt: number;
}

export function createSheet(name: string, data: any[] = [], columns: string[] = []): Sheet {
  return {
    id: `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    data,
    columns,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    type: 'data',
  };
}

export function createChartsSheet(name: string = 'Charts'): Sheet {
  return {
    id: `charts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    data: [],
    columns: [],
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    type: 'charts',
    charts: [],
  };
}

export function createWorkbook(fileName: string, fileType: string, initialSheet?: Sheet): Workbook {
  const sheet = initialSheet || createSheet('Sheet1', [
    { 'Column 1': '', 'Column 2': '', 'Column 3': '' },
    { 'Column 1': '', 'Column 2': '', 'Column 3': '' },
    { 'Column 1': '', 'Column 2': '', 'Column 3': '' }
  ], ['Column 1', 'Column 2', 'Column 3']);

  return {
    id: `workbook-${Date.now()}`,
    fileName,
    fileType,
    sheets: [sheet],
    activeSheetId: sheet.id,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
}
