# MiniDataManim

A powerful, Excel-like data manipulation and visualization application built with React, TypeScript, and JS data manipulation libraries. MiniDataManim provides an intuitive interface for working with spreadsheet data, performing complex data operations, and creating interactive charts.

## Features

### File Management
- Import CSV, Excel (xlsx, xls), and LibreOffice (ods) files
- Export to multiple formats: CSV, Excel, JSON, PDF, HTML
- Multi-sheet workbook support with easy sheet management
- Drag and drop file loading
- Auto-save functionality

### Data Manipulation
- Sort data by any column (ascending/descending)
- Advanced filtering with multiple conditions
- Remove duplicate rows
- Fill missing values with various strategies (forward fill, backward fill, mean, median, zero, custom)
- Transpose data
- Text transformation (uppercase, lowercase, capitalize, trim)
- Split columns by delimiter
- Merge multiple columns
- Group by with aggregations (sum, average, count, min, max)
- Column statistics (mean, median, mode, standard deviation, min/max, quartiles)
- Data normalization (min-max scaling, z-score)

### Data Visualization
- Create interactive charts with Plotly.js
- Supported chart types:
  - Bar charts with optional grouping
  - Line charts with multiple series
  - Scatter plots
  - Pie charts
  - Histograms
  - Box plots
- Dedicated Charts sheet for managing visualizations
- Download charts as PNG images
- Customizable colors, legends, and grid options

### Editing Features
- Inline cell editing
- Add/delete rows and columns
- Cut, copy, paste operations
- Undo/redo support
- Find and replace
- Column and row selection

### User Interface
- Light and dark theme support
- Adjustable font size (small, medium, large)
- Zoom controls (50% - 200%)
- Fullscreen mode
- Keyboard shortcuts for common operations
- Responsive design

### Preferences
- In-place mode: Edit original data or create copies
- Customizable display settings
- Auto-save intervals
- Configurable undo history depth
- Date and number format preferences

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd minidatamanim

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Plotly.js** - Interactive charts
- **PapaParse** - CSV parsing
- **SheetJS (xlsx)** - Excel file handling
- **jsPDF** - PDF generation
- **FileSaver.js** - File downloads

## Project Structure

```
src/
├── components/          # React components
│   ├── DataTable.tsx           # Main spreadsheet grid
│   ├── SheetTabs.tsx           # Multi-sheet navigation
│   ├── ChartsViewer.tsx        # Chart display and management
│   ├── CreateChartDialog.tsx   # Chart configuration
│   ├── SettingsDialog.tsx      # Application settings
│   ├── PreferencesDialog.tsx   # User preferences
│   └── DataManipulationDialogs.tsx  # Data operation dialogs
├── hooks/               # Custom React hooks
│   ├── useDataOperations.ts    # Data manipulation logic
│   ├── useEditOperations.ts    # Edit operations
│   ├── useFileOperations.ts    # File I/O
│   ├── useSearchOperations.ts  # Find/replace
│   └── useViewOperations.ts    # View controls
├── sections/            # Layout sections
│   └── taskbar.tsx             # Top menu bar
├── types/               # TypeScript type definitions
│   └── workbook.ts             # Workbook and Sheet types
├── utilities/           # Utility functions
│   ├── settings.ts             # Theme management
│   └── preferences.ts          # User preferences manager
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New table |
| Ctrl/Cmd + O | Open file |
| Ctrl/Cmd + S | Save |
| Ctrl/Cmd + P | Print |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Y | Redo |
| Ctrl/Cmd + X | Cut |
| Ctrl/Cmd + C | Copy |
| Ctrl/Cmd + V | Paste |
| Ctrl/Cmd + F | Find |
| Ctrl/Cmd + H | Replace |
| Ctrl/Cmd + Plus | Zoom in |
| Ctrl/Cmd + Minus | Zoom out |
| Ctrl/Cmd + 0 | Reset zoom |
| F11 | Toggle fullscreen |
| Ctrl/Cmd + K | Show shortcuts |

## Usage

### Importing Data
1. Click "Open File" or drag and drop a file onto the application
2. Supported formats: CSV, Excel (.xlsx, .xls), LibreOffice (.ods)
3. Data will be loaded into the first sheet

### Creating Charts
1. Navigate to a data sheet with your data
2. Click Tools menu and select "Charts"
3. Choose chart type and configure axes
4. Charts are saved to a dedicated Charts sheet
5. Click download button on any chart to save as PNG

### Data Manipulation
1. Right-click a column header to select it
2. Use the Data menu to access operations
3. Enable "In-place mode" in Preferences to modify original data
4. Disable to create copies of modified data

### Multi-Sheet Management
1. Use sheet tabs at the bottom to navigate
2. Right-click tabs for options: Rename, Duplicate, Delete
3. Click "+" button to add new sheets
4. Charts sheet is automatically created when you make your first chart

## Contributing

We welcome contributions to MiniDataManim. Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add feature: description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Code Style
- Follow existing TypeScript and React patterns
- Use functional components with hooks
- Maintain type safety (avoid `any` types where possible)
- Keep components focused and reusable
- Add comments for complex logic

### Testing Guidelines
- Test all new features manually
- Verify file import/export works correctly
- Check data manipulation operations produce correct results
- Ensure UI is responsive and accessible
- Test keyboard shortcuts

### Areas for Contribution
- Additional chart types or customization options
- More data manipulation operations
- Performance optimizations for large datasets
- Improved mobile support
- Accessibility enhancements
- Internationalization
- Unit and integration tests
- Documentation improvements

### Reporting Issues
When reporting bugs, please include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Sample data file if applicable

### Feature Requests
- Check existing issues first to avoid duplicates
- Describe the use case clearly
- Explain how it benefits users
- Consider implementation complexity

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built with modern web technologies and inspired by spreadsheet applications like Excel and Google Sheets, designed to provide a lightweight, browser-based alternative for data manipulation and visualization tasks.

```
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

### Contact me for more info or to be added as a contributor
Email: [motrenewed@gmail.com](mailto:motrenewed@gmail.com)

LinkedIn: [TADSTech](https://linkedin.com/in/tadstech)
