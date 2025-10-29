import { useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createWorkbook, createSheet } from '../types/workbook';
import type { Workbook } from '../types/workbook';

export function useFileOperations() {
  const detectFileType = useCallback((file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return 'CSV File';
      case 'xlsx':
      case 'xls':
        return 'Excel Spreadsheet';
      case 'ods':
        return 'LibreOffice Spreadsheet';
      default:
        return 'Unknown';
    }
  }, []);

  const parseCSV = useCallback((file: File, onSuccess: (workbook: Workbook) => void) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          const rows = results.data.slice(1) as string[][];
          
          const parsedData = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          }).filter(row => Object.values(row).some(val => val !== ''));
          
          const sheet = createSheet('Sheet1', parsedData, headers);
          const workbook = createWorkbook(file.name, 'CSV File', sheet);
          onSuccess(workbook);
        }
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file');
      }
    });
  }, []);

  const parseExcel = useCallback((file: File, onSuccess: (workbook: Workbook) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const xlsxWorkbook = XLSX.read(data, { type: 'array' });
        
        const sheets = xlsxWorkbook.SheetNames.map(sheetName => {
          const worksheet = xlsxWorkbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length > 0) {
            const headers = jsonData[0].map((h: any) => String(h));
            const rows = jsonData.slice(1);
            
            const parsedData = rows.map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] !== undefined ? String(row[index]) : '';
              });
              return obj;
            }).filter(row => Object.values(row).some(val => val !== ''));
            
            return createSheet(sheetName, parsedData, headers);
          }
          return createSheet(sheetName, [], []);
        });
        
        if (sheets.length > 0) {
          const workbook = createWorkbook(file.name, 'Excel Spreadsheet', sheets[0]);
          workbook.sheets = sheets;
          onSuccess(workbook);
        }
      } catch (error) {
        console.error('Excel parsing error:', error);
        alert('Error parsing Excel file');
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const exportToCSV = useCallback((data: any[], fileName: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${fileName}.csv`);
  }, []);

  const exportToExcel = useCallback((workbook: Workbook, fileName: string) => {
    const xlsxWorkbook = XLSX.utils.book_new();
    
    workbook.sheets.forEach(sheet => {
      if (sheet.type === 'data' && sheet.data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(xlsxWorkbook, worksheet, sheet.name);
      }
    });
    
    const excelBuffer = XLSX.write(xlsxWorkbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
  }, []);

  const exportToPDF = useCallback((data: any[], columns: string[], fileName: string, orientation: 'portrait' | 'landscape') => {
    if (data.length === 0 || columns.length === 0) {
      return;
    }

    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    doc.setFontSize(16);
    doc.text(fileName || 'Data Table', 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${data.length} rows × ${columns.length} columns`, 14, 22);

    const tableData = data.map(row => 
      columns.map(col => row[col] !== undefined ? String(row[col]) : '')
    );

    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { top: 28, right: 14, bottom: 14, left: 14 },
      theme: 'grid',
    });

    const pdfFileName = fileName.replace(/\.[^/.]+$/, '') || 'table';
    doc.save(`${pdfFileName}.pdf`);
  }, []);

  return {
    detectFileType,
    parseCSV,
    parseExcel,
    exportToCSV,
    exportToExcel,
    exportToPDF,
  };
}
