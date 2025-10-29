import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js-dist-min';
import type { Config, ModeBarDefaultButtons, PlotData, Layout } from 'plotly.js';
import jsPDF from 'jspdf';
import { X, BarChart3, Download, Trash2 } from 'lucide-react';
import type { ChartConfig } from './CreateChartDialog';
import { ConfirmDialog } from './ConfirmDialog';

interface ChartsViewerProps {
  charts: ChartConfig[];
  data: Record<string, any>[];
  onDeleteChart: (chartId: string) => void;
  onDownloadChart?: (chartId: string) => void;
}

type DownloadMode = 'single' | 'pdf';

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'chart';

export function ChartsViewer({ charts, data, onDeleteChart, onDownloadChart }: ChartsViewerProps) {
  const [selectedChart, setSelectedChart] = useState<string | null>(charts[0]?.id || null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chartIdPendingDelete, setChartIdPendingDelete] = useState<string | null>(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadMode, setDownloadMode] = useState<DownloadMode>('single');
  const [downloadChartId, setDownloadChartId] = useState<string>(charts[0]?.id || '');
  const [downloadPdfIds, setDownloadPdfIds] = useState<string[]>(charts.map(chart => chart.id));
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedChartConfig = charts.find(c => c.id === selectedChart);

  const handleDownloadClick = () => {
    if (!selectedChartConfig) return;
    setDownloadMode('single');
    setDownloadChartId(selectedChartConfig.id);
    setDownloadPdfIds(charts.map(chart => chart.id));
    setShowDownloadDialog(true);
  };

  const handleDeleteRequest = () => {
    if (!selectedChartConfig) return;
    setChartIdPendingDelete(selectedChartConfig.id);
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    if (charts.length === 0) {
      setSelectedChart(null);
      setDownloadChartId('');
      setDownloadPdfIds([]);
      return;
    }

    setSelectedChart(prev => {
      if (prev && charts.some(chart => chart.id === prev)) {
        return prev;
      }
      return charts[0].id;
    });

    setDownloadChartId(prev => {
      if (prev && charts.some(chart => chart.id === prev)) {
        return prev;
      }
      return charts[0].id;
    });

    setDownloadPdfIds(prev => {
      const retained = prev.filter(id => charts.some(chart => chart.id === id));
      return retained.length > 0 ? retained : charts.map(chart => chart.id);
    });
  }, [charts]);

  const generatePlotData = (config: ChartConfig) => {
    if (!data || data.length === 0) return [];

    const xValues = data.map(row => row[config.xColumn]);
    const yValues = data.map(row => row[config.yColumn]);

    switch (config.type) {
      case 'bar':
        if (config.groupColumn) {
          // Grouped bar chart
          const groups = [...new Set(data.map(row => row[config.groupColumn!]))];
          return groups.map((group, idx) => {
            const filteredData = data.filter(row => row[config.groupColumn!] === group);
            return {
              x: filteredData.map(row => row[config.xColumn]),
              y: filteredData.map(row => parseFloat(row[config.yColumn]) || 0),
              type: 'bar',
              name: String(group),
              marker: { color: config.color, opacity: 0.8 - (idx * 0.1) },
            };
          });
        }
        return [{
          x: xValues,
          y: yValues.map(v => parseFloat(v) || 0),
          type: 'bar',
          marker: { color: config.color },
        }];

      case 'line':
        if (config.groupColumn) {
          const groups = [...new Set(data.map(row => row[config.groupColumn!]))];
          return groups.map(group => {
            const filteredData = data.filter(row => row[config.groupColumn!] === group);
            return {
              x: filteredData.map(row => row[config.xColumn]),
              y: filteredData.map(row => parseFloat(row[config.yColumn]) || 0),
              type: 'scatter',
              mode: 'lines+markers',
              name: String(group),
              line: { color: config.color },
            };
          });
        }
        return [{
          x: xValues,
          y: yValues.map(v => parseFloat(v) || 0),
          type: 'scatter',
          mode: 'lines+markers',
          line: { color: config.color },
          marker: { color: config.color },
        }];

      case 'scatter':
        return [{
          x: xValues.map(v => parseFloat(v) || 0),
          y: yValues.map(v => parseFloat(v) || 0),
          type: 'scatter',
          mode: 'markers',
          marker: { 
            color: config.color,
            size: 10,
          },
        }];

      case 'pie': {
        // Aggregate values by label
        const pieData: { [key: string]: number } = {};
        data.forEach(row => {
          const label = String(row[config.xColumn]);
          const value = parseFloat(row[config.yColumn]) || 0;
          pieData[label] = (pieData[label] || 0) + value;
        });
        
        return [{
          labels: Object.keys(pieData),
          values: Object.values(pieData),
          type: 'pie',
          marker: {
            colors: Object.keys(pieData).map((_, idx) => 
              `hsl(${(idx * 360) / Object.keys(pieData).length}, 70%, 60%)`
            ),
          },
        }];
      }

      case 'histogram':
        return [{
          x: xValues.map(v => parseFloat(v) || 0),
          type: 'histogram',
          marker: { color: config.color },
        }];

      case 'box':
        return [{
          y: yValues.map(v => parseFloat(v) || 0),
          type: 'box',
          name: config.yColumn,
          marker: { color: config.color },
        }];

      default:
        return [];
    }
  };

  const generateLayout = (config: ChartConfig) => {
    return {
      title: config.title,
      showlegend: config.showLegend,
      xaxis: {
        title: config.xColumn,
        showgrid: config.showGrid,
      },
      yaxis: {
        title: config.type === 'pie' ? undefined : config.yColumn,
        showgrid: config.showGrid,
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: 'var(--color-text)',
      },
      margin: { t: 50, r: 20, b: 50, l: 60 },
    };
  };

  const renderChartToTempDiv = async (config: ChartConfig) => {
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-10000px';
    tempDiv.style.top = '-10000px';
    tempDiv.style.width = '1000px';
    tempDiv.style.height = '600px';
    document.body.appendChild(tempDiv);

    await Plotly.newPlot(
      tempDiv,
      generatePlotData(config) as PlotData[],
      generateLayout(config) as Partial<Layout>,
      { staticPlot: true, displayModeBar: false }
    );

    return tempDiv;
  };

  const downloadChartImage = async (config: ChartConfig) => {
    const tempDiv = await renderChartToTempDiv(config);

    try {
      await Plotly.downloadImage(tempDiv, {
        format: 'png',
        filename: sanitizeFileName(config.title || 'chart'),
        height: 600,
        width: 1000,
        scale: 2,
      });
    } finally {
      Plotly.purge(tempDiv);
      tempDiv.remove();
    }
  };

  const downloadChartsPdf = async (chartIds: string[]) => {
    const orderedCharts = charts.filter(chart => chartIds.includes(chart.id));
    if (orderedCharts.length === 0) return;

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1000, 700] });

    for (let index = 0; index < orderedCharts.length; index += 1) {
      const chart = orderedCharts[index];
      const tempDiv = await renderChartToTempDiv(chart);

      try {
        const imageData = await Plotly.toImage(tempDiv, {
          format: 'png',
          height: 600,
          width: 1000,
          scale: 2,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setFontSize(18);
        pdf.text(chart.title || 'Chart', pageWidth / 2, 40, { align: 'center' });

        const marginX = 40;
        const marginY = 60;
        pdf.addImage(
          imageData,
          'PNG',
          marginX,
          marginY,
          pageWidth - marginX * 2,
          pageHeight - marginY - 40
        );

        if (index < orderedCharts.length - 1) {
          pdf.addPage();
        }
      } finally {
        Plotly.purge(tempDiv);
        tempDiv.remove();
      }
    }

    const pdfFileName =
      orderedCharts.length === 1
        ? `${sanitizeFileName(orderedCharts[0].title || 'chart')}.pdf`
        : `charts_${new Date().toISOString().slice(0, 10)}.pdf`;

    pdf.save(pdfFileName);
  };

  const handleDownloadConfirm = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      if (downloadMode === 'single') {
        const chart = charts.find(c => c.id === downloadChartId) || selectedChartConfig;
        if (!chart) return;
        await downloadChartImage(chart);
        onDownloadChart?.(chart.id);
      } else {
        const idsInOrder = charts
          .filter(chart => downloadPdfIds.includes(chart.id))
          .map(chart => chart.id);

        if (idsInOrder.length === 0) return;

        await downloadChartsPdf(idsInOrder);
      }
    } catch (error) {
      console.error('Failed to download chart(s)', error);
    } finally {
      setIsDownloading(false);
      setShowDownloadDialog(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!chartIdPendingDelete) return;

    const targetId = chartIdPendingDelete;
    setShowDeleteConfirm(false);
    setChartIdPendingDelete(null);

    const currentIndex = charts.findIndex(chart => chart.id === targetId);

    onDeleteChart(targetId);

    if (charts.length > 1) {
      const nextChart = charts[currentIndex === 0 ? 1 : currentIndex - 1];
      setSelectedChart(nextChart.id);
    } else {
      setSelectedChart(null);
    }
  };

  const togglePdfChart = (chartId: string) => {
    setDownloadPdfIds(prev => {
      if (prev.includes(chartId)) {
        return prev.filter(id => id !== chartId);
      }

      const next = [...prev, chartId];
      return charts.filter(chart => next.includes(chart.id)).map(chart => chart.id);
    });
  };

  const selectAllPdfCharts = () => {
    setDownloadPdfIds(charts.map(chart => chart.id));
  };

  const isDownloadConfirmDisabled =
    downloadMode === 'pdf' ? downloadPdfIds.length === 0 : !downloadChartId;

  if (charts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-12 text-center">
        <div>
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-(--color-primary)" aria-hidden="true" />
          <h3 className="text-xl font-bold mb-2">No charts yet</h3>
          <p className="text-(--color-text-secondary)">
            Create your first chart to visualize your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full">
        <div className="w-64 border-r border-(--color-border) p-4 overflow-y-auto">
          <h3 className="font-bold mb-3 text-(--color-text)">Charts</h3>
          <div className="space-y-2">
            {charts.map(chart => (
              <motion.div
                key={chart.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChart === chart.id
                    ? 'bg-(--color-primary) text-white'
                    : 'bg-(--color-bg-secondary) hover:bg-(--color-primary)/20'
                }`}
                onClick={() => setSelectedChart(chart.id)}
              >
                <div className="font-medium text-sm mb-1">{chart.title}</div>
                <div className="text-xs opacity-75">
                  {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {selectedChartConfig && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedChartConfig.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadClick}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleDeleteRequest}
                    className="btn-secondary flex items-center gap-2 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="bg-(--color-bg) rounded-lg p-4 border border-(--color-border)">
                <Plot
                  data={generatePlotData(selectedChartConfig) as PlotData[]}
                  layout={generateLayout(selectedChartConfig) as Partial<Layout>}
                  config={{
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'plotlyIcon'] as unknown as ModeBarDefaultButtons[],
                    toImageButtonOptions: {
                      format: 'png',
                      filename: sanitizeFileName(selectedChartConfig.title),
                      height: 600,
                      width: 1000,
                      scale: 2,
                    },
                  } as Partial<Config>}
                  style={{ width: '100%', height: '500px' }}
                />
              </div>

              <div className="mt-4 p-4 bg-(--color-bg-secondary) rounded-lg">
                <h4 className="font-semibold mb-2">Chart Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-(--color-text-secondary)">Type:</span>{' '}
                    {selectedChartConfig.type}
                  </div>
                  <div>
                    <span className="text-(--color-text-secondary)">X-Axis:</span>{' '}
                    {selectedChartConfig.xColumn}
                  </div>
                  <div>
                    <span className="text-(--color-text-secondary)">Y-Axis:</span>{' '}
                    {selectedChartConfig.yColumn || 'N/A'}
                  </div>
                  {selectedChartConfig.groupColumn && (
                    <div>
                      <span className="text-(--color-text-secondary)">Group:</span>{' '}
                      {selectedChartConfig.groupColumn}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <DownloadChartsDialog
        isOpen={showDownloadDialog}
        charts={charts}
        mode={downloadMode}
        onModeChange={setDownloadMode}
        selectedChartId={downloadChartId}
        onSelectChart={setDownloadChartId}
        selectedPdfChartIds={downloadPdfIds}
        onTogglePdfChart={togglePdfChart}
        onSelectAllPdfCharts={selectAllPdfCharts}
        onClose={() => setShowDownloadDialog(false)}
        onConfirm={handleDownloadConfirm}
        isConfirmDisabled={isDownloadConfirmDisabled}
        isDownloading={isDownloading}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setChartIdPendingDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete chart?"
        message="This action will permanently remove the selected chart."
        confirmText="Delete"
        cancelText="Keep chart"
        variant="danger"
      />
    </>
  );
}

interface DownloadChartsDialogProps {
  isOpen: boolean;
  charts: ChartConfig[];
  mode: DownloadMode;
  onModeChange: (mode: DownloadMode) => void;
  selectedChartId: string;
  onSelectChart: (chartId: string) => void;
  selectedPdfChartIds: string[];
  onTogglePdfChart: (chartId: string) => void;
  onSelectAllPdfCharts: () => void;
  onClose: () => void;
  onConfirm: () => void;
  isConfirmDisabled: boolean;
  isDownloading: boolean;
}

function DownloadChartsDialog({
  isOpen,
  charts,
  mode,
  onModeChange,
  selectedChartId,
  onSelectChart,
  selectedPdfChartIds,
  onTogglePdfChart,
  onSelectAllPdfCharts,
  onClose,
  onConfirm,
  isConfirmDisabled,
  isDownloading,
}: DownloadChartsDialogProps) {
  if (!isOpen) return null;

  const hasMultipleCharts = charts.length > 1;

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
        className="bg-(--color-bg) rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={event => event.stopPropagation()}
      >
        <div className="sticky top-0 bg-(--color-bg) border-b border-(--color-border) px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-(--color-text)">Download Charts</h2>
          <button
            onClick={onClose}
            className="p-2 text-(--color-text-secondary) hover:text-(--color-text) rounded-lg hover:bg-(--color-bg-secondary) transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {hasMultipleCharts && (
            <div className="space-y-3">
              <span className="text-sm font-medium text-(--color-text)">Download mode</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onModeChange('single')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    mode === 'single'
                      ? 'border-(--color-primary) text-(--color-text)'
                      : 'border-(--color-border) text-(--color-text-secondary) hover:border-(--color-primary)/60'
                  }`}
                >
                  Single chart (PNG)
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange('pdf')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    mode === 'pdf'
                      ? 'border-(--color-primary) text-(--color-text)'
                      : 'border-(--color-border) text-(--color-text-secondary) hover:border-(--color-primary)/60'
                  }`}
                >
                  PDF bundle
                </button>
              </div>
            </div>
          )}

          {mode === 'single' || !hasMultipleCharts ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-(--color-text)">
                Select chart to download
              </label>
              {hasMultipleCharts ? (
                <select
                  value={selectedChartId}
                  onChange={event => onSelectChart(event.target.value)}
                  className="w-full px-3 py-2 bg-(--color-bg-secondary) border border-(--color-border) rounded-lg text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
                >
                  {charts.map(chart => (
                    <option key={chart.id} value={chart.id}>
                      {chart.title}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-3 bg-(--color-bg-secondary) rounded-lg border border-(--color-border)">
                  {charts[0]?.title}
                </div>
              )}
              <p className="text-xs text-(--color-text-secondary)">
                The selected chart will download as a high-resolution PNG file.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-(--color-text)">
                  Choose charts to include
                </span>
                <button
                  type="button"
                  onClick={onSelectAllPdfCharts}
                  className="text-xs text-(--color-primary) hover:underline"
                >
                  Select all
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto border border-(--color-border) rounded-lg divide-y divide-(--color-border)">
                {charts.map(chart => {
                  const checked = selectedPdfChartIds.includes(chart.id);
                  return (
                    <label
                      key={chart.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-(--color-bg-secondary)"
                    >
                      <span className="text-sm text-(--color-text)">{chart.title}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onTogglePdfChart(chart.id)}
                        className="w-4 h-4"
                      />
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-(--color-text-secondary)">
                A landscape PDF will be generated with one chart per page.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-(--color-border) px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-(--color-text-secondary) hover:text-(--color-text) border border-(--color-border) rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirmDisabled || isDownloading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isConfirmDisabled || isDownloading
                ? 'bg-(--color-border) text-(--color-text-secondary) cursor-not-allowed'
                : 'bg-(--color-primary) text-white hover:bg-(--color-primary)/90'
            }`}
          >
            {isDownloading ? 'Preparing…' : 'Download'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
