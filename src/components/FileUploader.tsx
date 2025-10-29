import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'motion/react';
import { FileSpreadsheet } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File, fileType: string) => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const fileType = detectFileType(file);
      onFileUpload(file, fileType);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
    },
    multiple: false,
  });

  const detectFileType = (file: File): string => {
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
  };

  return (
    <motion.div
      {...(getRootProps() as any)}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? 'border-(--color-primary) bg-(--color-bg-secondary)'
          : 'border-(--color-border) hover:border-(--color-primary)'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input {...getInputProps()} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-(--color-primary)" aria-hidden="true" />
        {isDragActive ? (
          <p className="text-lg text-(--color-primary) font-medium">
            Drop your file here...
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-(--color-text) mb-2">
              Drag & drop your spreadsheet here
            </p>
            <p className="text-sm text-(--color-text-secondary) mb-4">
              or click to browse files
            </p>
            <p className="text-xs text-(--color-text-secondary)">
              Supports: CSV, Excel (.xlsx, .xls), LibreOffice (.ods)
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
