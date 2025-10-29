import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onFind?: () => void;
  onReplace?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onFullscreen?: () => void;
  onShowShortcuts?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd + N: New
      if (isMod && e.key === 'n') {
        e.preventDefault();
        handlers.onNew?.();
      }
      // Ctrl/Cmd + O: Open
      if (isMod && e.key === 'o') {
        e.preventDefault();
        handlers.onOpen?.();
      }
      // Ctrl/Cmd + S: Save
      if (isMod && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      }
      // Ctrl/Cmd + P: Print
      if (isMod && e.key === 'p') {
        e.preventDefault();
        handlers.onPrint?.();
      }
      // Ctrl/Cmd + Z: Undo
      if (isMod && e.key === 'z') {
        e.preventDefault();
        handlers.onUndo?.();
      }
      // Ctrl/Cmd + Y: Redo
      if (isMod && e.key === 'y') {
        e.preventDefault();
        handlers.onRedo?.();
      }
      // Ctrl/Cmd + X: Cut
      if (isMod && e.key === 'x') {
        e.preventDefault();
        handlers.onCut?.();
      }
      // Ctrl/Cmd + C: Copy
      if (isMod && e.key === 'c') {
        e.preventDefault();
        handlers.onCopy?.();
      }
      // Ctrl/Cmd + V: Paste
      if (isMod && e.key === 'v') {
        e.preventDefault();
        handlers.onPaste?.();
      }
      // Ctrl/Cmd + F: Find
      if (isMod && e.key === 'f') {
        e.preventDefault();
        handlers.onFind?.();
      }
      // Ctrl/Cmd + H: Replace
      if (isMod && e.key === 'h') {
        e.preventDefault();
        handlers.onReplace?.();
      }
      // Ctrl/Cmd + =: Zoom In
      if (isMod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handlers.onZoomIn?.();
      }
      // Ctrl/Cmd + -: Zoom Out
      if (isMod && e.key === '-') {
        e.preventDefault();
        handlers.onZoomOut?.();
      }
      // Ctrl/Cmd + 0: Reset Zoom
      if (isMod && e.key === '0') {
        e.preventDefault();
        handlers.onResetZoom?.();
      }
      // F11: Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        handlers.onFullscreen?.();
      }
      // Ctrl/Cmd + /: Show Shortcuts
      if (isMod && e.key === '/') {
        e.preventDefault();
        handlers.onShowShortcuts?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers, enabled]);
}
