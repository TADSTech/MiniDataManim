import { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, LineChart, ScatterChart, PieChart, ChartColumn, Box, X, type LucideIcon } from 'lucide-react';

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram' | 'box';
  title: string;
  xColumn: string;
  yColumn: string;
  groupColumn?: string;
  color?: string;
  showLegend: boolean;
  showGrid: boolean;
}

interface CreateChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columns: string[];
  onCreateChart: (config: ChartConfig) => void;
}

interface ChartTypeOption {
  value: ChartConfig['type'];
  label: string;
  description: string;
  Icon: LucideIcon;
}

const CHART_TYPES: ChartTypeOption[] = [
  { value: 'bar', label: 'Bar Chart', description: 'Compare values across categories', Icon: BarChart3 },
  { value: 'line', label: 'Line Chart', description: 'Show trends over time', Icon: LineChart },
  { value: 'scatter', label: 'Scatter Plot', description: 'Show correlation between variables', Icon: ScatterChart },
  { value: 'pie', label: 'Pie Chart', description: 'Show proportions of a whole', Icon: PieChart },
  { value: 'histogram', label: 'Histogram', description: 'Show distribution of values', Icon: ChartColumn },
  { value: 'box', label: 'Box Plot', description: 'Show statistical distribution', Icon: Box },
];

const COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea',
  '#0891b2', '#ea580c', '#be123c', '#4f46e5', '#65a30d'
];

export function CreateChartDialog({ isOpen, onClose, columns, onCreateChart }: CreateChartDialogProps) {
  const [chartType, setChartType] = useState<ChartConfig['type']>('bar');
  const [title, setTitle] = useState('');
  const [xColumn, setXColumn] = useState(columns[0] || '');
  const [yColumn, setYColumn] = useState(columns[1] || columns[0] || '');
  const [groupColumn, setGroupColumn] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const handleCreate = () => {
    if (!xColumn || (!yColumn && chartType !== 'pie' && chartType !== 'histogram')) {
      alert('Please select required columns');
      return;
    }

    const config: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: chartType,
      title: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      xColumn,
      yColumn,
      groupColumn: groupColumn || undefined,
      color,
      showLegend,
      showGrid,
    };

    onCreateChart(config);
    onClose();
    
    // Reset form
    setTitle('');
    setXColumn(columns[0] || '');
    setYColumn(columns[1] || columns[0] || '');
    setGroupColumn('');
  };

  if (!isOpen) return null;

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
        className="bg-(--color-bg) rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-(--color-bg) border-b border-(--color-border) px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-(--color-text)">Create Chart</h2>
          <button
            onClick={onClose}
            className="p-2 text-(--color-text-secondary) hover:text-(--color-text) rounded-lg hover:bg-(--color-bg-secondary) transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Chart Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-(--color-text)">Chart Type</label>
            <div className="grid grid-cols-2 gap-3">
              {CHART_TYPES.map((type, index) => (
                <motion.button
                  key={type.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setChartType(type.value as ChartConfig['type'])}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    chartType === type.value
                      ? 'border-(--color-primary) bg-(--color-primary)/10'
                      : 'border-(--color-border) hover:border-(--color-primary)/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1 text-(--color-text)">
                    <type.Icon className="w-5 h-5" />
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <div className="text-xs text-(--color-text-secondary)">{type.description}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chart Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-(--color-text)">Chart Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chart title..."
              className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) placeholder-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
          </div>

          {/* Column Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-3 text-(--color-text)">
                {chartType === 'pie' ? 'Labels' : chartType === 'histogram' ? 'Values' : 'X-Axis'} *
              </label>
              <select
                value={xColumn}
                onChange={(e) => setXColumn(e.target.value)}
                className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            {chartType !== 'histogram' && (
              <div>
                <label className="block text-sm font-medium mb-3 text-(--color-text)">
                  {chartType === 'pie' ? 'Values' : 'Y-Axis'} *
                </label>
                <select
                  value={yColumn}
                  onChange={(e) => setYColumn(e.target.value)}
                  className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Group By (optional) */}
          {(chartType === 'bar' || chartType === 'line') && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-(--color-text)">Group By (optional)</label>
              <select
                value={groupColumn}
                onChange={(e) => setGroupColumn(e.target.value)}
                className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              >
                <option value="">None</option>
                {columns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          )}

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-(--color-text)">Primary Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c, index) => (
                <motion.button
                  key={c}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-6 flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="w-4 h-4 text-(--color-primary) bg-(--color-bg-secondary) border-(--color-border) rounded focus:ring-(--color-primary)"
              />
              <span className="text-sm text-(--color-text)">Show Legend</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 text-(--color-primary) bg-(--color-bg-secondary) border-(--color-border) rounded focus:ring-(--color-primary)"
              />
              <span className="text-sm text-(--color-text)">Show Grid</span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-(--color-border)">
            <button
              className="px-4 py-2 text-(--color-text-secondary) hover:text-(--color-text) border border-(--color-border) rounded-lg transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-(--color-primary) text-white rounded-lg hover:bg-(--color-primary)/90 transition-colors"
              onClick={handleCreate}
            >
              Create Chart
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
