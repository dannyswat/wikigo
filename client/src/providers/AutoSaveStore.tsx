import { useCallback, useState } from "react";

const AUTO_SAVE_KEY = "autoSave";
const AUTO_SAVE_DEFAULT = true;

export function useAutoSaveStore() {
  // Get the current setting from localStorage (default: true)
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(() => {
    const value = localStorage.getItem(AUTO_SAVE_KEY);
    if (value === null) return AUTO_SAVE_DEFAULT; // default enabled
    return value === "true";
  });

  // Set the setting in localStorage
  const setAutoSave = useCallback((enabled: boolean) => {
    localStorage.setItem(AUTO_SAVE_KEY, String(enabled));
    setIsAutoSaveEnabled(enabled);
  }, []);

  return { isAutoSaveEnabled, setAutoSave };
}
