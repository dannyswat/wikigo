import { IconSettings } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAutoSaveStore } from "./AutoSaveStore";
import ToggleButton from "../../components/ToggleButton";
import { useTranslation } from "react-i18next";

export default function EditorMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { isAutoSaveEnabled, setAutoSave } = useAutoSaveStore();

  useEffect(() => {
    if (isOpen) {
      const closeMenu = () => setIsOpen(false);
      setTimeout(() => document.addEventListener("click", closeMenu), 0);
      return () => document.removeEventListener("click", closeMenu);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button onClick={() => setIsOpen((p) => !p)}>
        <IconSettings
          size={24}
          className="inline transition hover:rotate-180"
        />
      </button>
      <div
        className={
          "absolute right-0 w-48 py-2 mt-2 z-10 bg-white dark:bg-gray-800 text-left border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl " +
          (isOpen ? "block" : "hidden")
        }
      >
        <div className="flex items-center justify-between px-4 py-2 text-gray-800 dark:text-gray-200">
          <ToggleButton
            label={t('Auto Save')}
            checked={isAutoSaveEnabled}
            className="ms-4"
            onChange={() => setAutoSave(!isAutoSaveEnabled)}
          />
        </div>
      </div>
    </div>
  );
}
