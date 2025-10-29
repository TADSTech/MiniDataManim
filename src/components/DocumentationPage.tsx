import { motion } from 'motion/react';
import { X, FolderOpen, Table, LineChart, Workflow, Phone, ChartBar } from 'lucide-react';

export function DocumentationPage({ onClose }: { onClose: () => void }) {
  return (
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
        className="bg-(--color-bg) rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-(--color-bg) border-b border-(--color-border) px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-(--color-text)">Documentation</h2>
          <button
            onClick={onClose}
            className="p-2 text-(--color-text-secondary) hover:text-(--color-text) rounded-lg hover:bg-(--color-bg-secondary) transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xl font-semibold text-(--color-primary) mb-3">Getting Started</h3>
            <p className="text-(--color-text) mb-2">
              MiniDataManim is a lightweight data manipulation and animation tool for spreadsheets.
            </p>
            <ul className="list-disc list-inside space-y-2 text-(--color-text)">
              <li>Drag and drop CSV, Excel, or LibreOffice files</li>
              <li>Explore and manipulate data in an interactive table</li>
              <li>Apply transformations and export results</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-(--color-primary) mb-3">Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card">
                <h4 className="font-semibold text-(--color-text) mb-2 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-(--color-primary)" />
                  <span>File Support</span>
                </h4>
                <p className="text-sm text-(--color-text-secondary)">
                  CSV, Excel (.xlsx, .xls), LibreOffice (.ods)
                </p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-(--color-text) mb-2 flex items-center gap-2">
                  <Table className="w-5 h-5 text-(--color-primary)" />
                  <span>Data Table</span>
                </h4>
                <p className="text-sm text-(--color-text-secondary)">
                  Interactive table with sorting, filtering, and editing
                </p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-(--color-text) mb-2 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-(--color-primary)" />
                  <span>Statistics</span>
                </h4>
                <p className="text-sm text-(--color-text-secondary)">
                  Automatic column statistics and data insights
                </p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-(--color-text) mb-2 flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-(--color-primary)" />
                  <span>Transformations</span>
                </h4>
                <p className="text-sm text-(--color-text-secondary)">
                  Apply operations to columns and rows
                </p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-(--color-text) mb-2 flex items-center gap-2">
                  <ChartBar className="w-5 h-5 text-(--color-primary)" />
                  <span>Visualizations</span>
                </h4>
                <p className="text-sm text-(--color-text-secondary)">
                  Create charts and graphs from your data
                </p>
              </div>
              <div className="card">
                <h4 className="font-semibold text-(--color-text) mb-2 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-(--color-primary)" />
                  <span>Mobile Support</span>
                </h4>
                <p className="text-sm text-(--color-text-secondary)">
                  Edit your docs on the go with responsive design
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-(--color-primary) mb-3">How to Use</h3>
            <ol className="list-decimal list-inside space-y-3 text-(--color-text)">
              <li>
                <strong>Upload a file:</strong> Drag and drop or use File → Open
              </li>
              <li>
                <strong>Explore your data:</strong> View in the interactive table
              </li>
              <li>
                <strong>Transform:</strong> Apply operations to your data
              </li>
              <li>
                <strong>Visualize:</strong> Create charts and graphs from your data
              </li>
              <li>
                <strong>Export:</strong> Save your visualized data as img or export your transformed data as CSV or Excel
              </li>
            </ol>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
