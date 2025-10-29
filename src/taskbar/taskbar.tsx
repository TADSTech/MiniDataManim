import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { themeSetting } from '../utilities/settings';

export interface MenuItem {
  id: string;
  label: string;
  items?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  label: string;
  action?: () => void;
  shortcut?: string;
  divider?: boolean;
}

interface TaskbarProps {
  onMenuAction?: (actionId: string) => void;
  isMobile?: boolean;
}

export function Taskbar({ onMenuAction, isMobile }: TaskbarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [theme, setTheme] = useState(themeSetting.get());

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    themeSetting.set(newTheme);
    setTheme(newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleMenuItemClick = (item: SubMenuItem) => {
    if (onMenuAction) {
      onMenuAction(item.id);
    }
    if (item.action) {
      item.action();
    }
    setActiveMenu(null);
  };

  const handleBackdropClick = () => {
    setActiveMenu(null);
  };

  const TASKBAR_MENUS: MenuItem[] = [
    { id: 'file', label: 'File', items: [
      { id: 'new', label: 'New', shortcut: 'Ctrl+N' },
      { id: 'open', label: 'Open...', shortcut: 'Ctrl+O' ,divider: true},
      { id: 'save', label: 'Save', shortcut: 'Ctrl+S' },
      { id: 'save-as', label: 'Save As...', shortcut: 'Ctrl+Shift+S' },
      { id: 'div1', label: '', divider: true },
      { id: 'export', label: 'Export' },
      { id: 'print', label: 'Print', shortcut: 'Ctrl+P' },
      { id: 'div2', label: '', divider: true },
      { id: 'close', label: 'Close' },
    ]},
    { id: 'edit', label: 'Edit', items: [
      { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
      { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Y' },
      { id: 'div1', label: '', divider: true },
      { id: 'cut', label: 'Cut', shortcut: 'Ctrl+X' },
      { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C' },
      { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
      { id: 'div2', label: '', divider: true },
      { id: 'find', label: 'Find', shortcut: 'Ctrl+F' },
      { id: 'replace', label: 'Replace', shortcut: 'Ctrl+H' },
    ]},
    { id: 'view', label: 'View', items: [
      { id: 'zoom-in', label: 'Zoom In', shortcut: 'Ctrl++' },
      { id: 'zoom-out', label: 'Zoom Out', shortcut: 'Ctrl+-' },
      { id: 'zoom-reset', label: 'Reset Zoom', shortcut: 'Ctrl+0' },
      { id: 'div1', label: '', divider: true },
      { id: 'fullscreen', label: 'Fullscreen', shortcut: 'F11' },
    ]},
    { id: 'data', label: 'Data', items: [
      { id: 'sort', label: 'Sort...' },
      { id: 'filter', label: 'Filter...' },
      { id: 'clear-filter', label: 'Clear Filters' },
      { id: 'div1', label: '', divider: true },
      { id: 'remove-duplicates', label: 'Remove Duplicates' },
      { id: 'fill-missing', label: 'Fill Missing Values...' },
      { id: 'transpose', label: 'Transpose' },
      { id: 'div2', label: '', divider: true },
      { id: 'text-transform', label: 'Text Transform...' },
      { id: 'split-column', label: 'Split Column...' },
      { id: 'group-by', label: 'Group By...' },
      { id: 'div3', label: '', divider: true },
      { id: 'column-stats', label: 'Column Statistics...' },
    ]},
    { id: 'tools', label: 'Tools', items: [
      { id: 'settings', label: 'Settings' },
      { id: 'charts', label: 'Charts' },
      { id: 'preferences', label: 'Preferences' },
    ]},
    { id: 'help', label: 'Help', items: [
      { id: 'docs', label: 'Documentation' },
      { id: 'shortcuts', label: 'Keyboard Shortcuts' },
      { id: 'div1', label: '', divider: true },
      { id: 'about', label: 'About' },
    ]},
  ];

  // Filter menus for mobile - only keep File (with export), and Tools (with theme/settings)
  const filteredMenus = isMobile ? TASKBAR_MENUS.filter(menu => {
    if (menu.id === 'file') {
      return true; // Keep File menu
    }
    if (menu.id === 'tools') {
      return true; // Keep Tools menu for settings/preferences
    }
    return false;
  }).map(menu => {
    if (menu.id === 'file' && menu.items) {
      // Filter File menu to only show essential items for mobile
      return {
        ...menu,
        items: menu.items.filter(item => 
          ['export', 'close', 'div1', 'div2'].includes(item.id)
        )
      };
    }
    if (menu.id === 'tools' && menu.items) {
      // Filter Tools menu to only show settings and preferences for mobile
      return {
        ...menu,
        items: menu.items.filter(item => 
          ['settings', 'preferences'].includes(item.id)
        )
      };
    }
    return menu;
  }) : TASKBAR_MENUS;

  return (
    <>
      <AnimatePresence>
        {activeMenu && (
          <motion.div className="fixed inset-0 z-998 bg-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleBackdropClick} />
        )}
      </AnimatePresence>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} className="sticky top-0 left-0 right-0 z-999 bg-(--color-bg) border-b border-(--color-border) shadow-sm backdrop-blur-[10px] transition-all duration-300">
        <div className="flex items-center px-4 h-14 max-w-full gap-2">
          <motion.button onClick={toggleTheme} className="flex items-center gap-2 mr-6 cursor-pointer select-none" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <motion.img src='/logo.svg' alt="MiniDataManim Logo" className="w-10 h-10 rounded-full border-2 border-(--color-primary) shadow-md" whileHover={{ scale: 1.05, rotate: 3 }} transition={{ type: 'spring', stiffness: 150, damping: 12 }} />
            <span className="font-semibold text-lg text-(--color-text) hidden sm:inline">MiniDataManim</span>
          </motion.button>
          <div className="flex items-center gap-1 flex-1 scrollbar-none relative z-1000">
            {filteredMenus.map((menu) => (
              <div key={menu.id} className="relative">
                <motion.button className={`bg-transparent border-none px-3.5 py-2 font-medium text-sm text-(--color-text) cursor-pointer rounded-md transition-colors duration-150 whitespace-nowrap ${activeMenu === menu.id ? 'bg-(--color-bg-secondary)' : ''}`} onClick={() => handleMenuClick(menu.id)} whileHover={{ backgroundColor: 'var(--color-bg-secondary)' }} whileTap={{ scale: 0.95 }}>{menu.label}</motion.button>
                <AnimatePresence>
                  {activeMenu === menu.id && menu.items && (
                    <motion.div className="absolute top-full left-0 mt-1 min-w-56 bg-(--color-bg) border border-(--color-border) rounded-lg shadow-lg p-1.5" style={{ zIndex: 9999 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                      {menu.items.map((item) => item.divider ? <div key={item.id} className="h-px bg-(--color-border) my-1.5" /> : <motion.button key={item.id} className="flex items-center justify-between w-full px-3 py-2 bg-transparent border-none rounded-md font-normal text-sm text-(--color-text) cursor-pointer text-left transition-colors duration-100" onClick={() => handleMenuItemClick(item)} whileHover={{ backgroundColor: 'var(--color-primary)', color: 'white' }} transition={{ duration: 0.1 }}><span>{item.label}</span>{item.shortcut && <span className="text-xs text-(--color-text-secondary) ml-4">{item.shortcut}</span>}</motion.button>)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
