import { useContext } from "react";
import { SettingContext } from "../setup/SettingProvider";
import { useTranslation } from "react-i18next";

export function Footer() {
    const { t } = useTranslation();
    const { setting } = useContext(SettingContext);
    return (
        <footer className="bg-gray-800 dark:bg-black text-white p-4 text-center">
            <div className="pb-2 md:inline">{setting?.footer || `${t('All rights reserved')} © ${t('Wiki Go')} ${new Date().getFullYear()}.`}</div>
            <div className="pb-2 md:inline md:ms-2"><a href="https://github.com/dannyswat/wikigo" target="_blank">{t('Powered by Wiki Go')}</a></div>
        </footer>
    );
}