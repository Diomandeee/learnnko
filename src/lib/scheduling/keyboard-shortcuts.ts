import { useEffect, useCallback } from 'react';
import { schedulingHistory } from './history';

interface ShortcutHandlers {
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
}

export function useKeyboardShortcuts({
  onCopy,
  onPaste,
  onDelete,
  onSave
}: ShortcutHandlers) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if target is an input element
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Undo/Redo
    if (event.metaKey || event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          if (event.shiftKey) {
            event.preventDefault();
            schedulingHistory.redo();
          } else {
            event.preventDefault();
            schedulingHistory.undo();
          }
          break;
        case 'c':
          if (onCopy) {
            event.preventDefault();
            onCopy();
          }
          break;
        case 'v':
          if (onPaste) {
            event.preventDefault();
            onPaste();
          }
          break;
        case 's':
          if (onSave) {
            event.preventDefault();
            onSave();
          }
          break;
      }
    }

    // Delete
    if (event.key === 'Delete' && onDelete) {
      event.preventDefault();
      onDelete();
    }
  }, [onCopy, onPaste, onDelete, onSave]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
