import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveProps<T> {
  key: string;
  data: T;
  onRestore?: (data: T) => void;
  debounceMs?: number;
  enabled?: boolean;
  isDirty?: boolean; // Prevent overwriting draft when form is not modified
}

export function useAutoSave<T>({
  key,
  data,
  onRestore,
  debounceMs = 3000,
  enabled = true,
  isDirty = true,
}: UseAutoSaveProps<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialDataStr, setInitialDataStr] = useState(() => JSON.stringify(data));

  // Update initialDataStr if key changes
  useEffect(() => {
    setInitialDataStr(JSON.stringify(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Check for existing draft on mount
  useEffect(() => {
    if (!enabled) return;
    
    try {
      const savedDraft = localStorage.getItem(`draft_${key}`);
      if (savedDraft) {
        setHasDraft(true);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [key, enabled]);

  // Save draft with debounce
  useEffect(() => {
    if (!enabled || !isDirty) return;

    const currentDataStr = JSON.stringify(data);
    if (currentDataStr === initialDataStr) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`draft_${key}`, currentDataStr);
        setLastSaved(new Date());
      } catch (e) {
        console.warn('Failed to save draft:', e);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [data, key, debounceMs, enabled, isDirty, initialDataStr]);

  const restoreDraft = useCallback(() => {
    try {
      const savedDraft = localStorage.getItem(`draft_${key}`);
      if (savedDraft && onRestore) {
        const parsedData = JSON.parse(savedDraft);
        onRestore(parsedData);
        toast.success('Draft restored successfully');
      }
    } catch (e) {
      console.warn('Failed to restore draft:', e);
      toast.error('Failed to restore draft');
    }
  }, [key, onRestore]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(`draft_${key}`);
      setHasDraft(false);
      setLastSaved(null);
    } catch (e) {
      console.warn('Failed to clear draft:', e);
    }
  }, [key]);

  return {
    hasDraft,
    lastSaved,
    restoreDraft,
    clearDraft,
  };
}
