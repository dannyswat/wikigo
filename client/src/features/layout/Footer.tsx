import { useContext } from "react";
import { SettingContext } from "../setup/SettingProvider";

export function Footer() {
    const { setting } = useContext(SettingContext);
    return (
        <footer className="bg-gray-800 dark:bg-black text-white p-4 text-center">
            <div className="pb-2 md:inline">{setting?.footer || `All rights reserved © Wiki Go ${new Date().getFullYear()}.`}</div>
            <div className="pb-2 md:inline md:ms-2">Powered by <a href="https://github.com/dannyswat/wikigo" target="_blank">Wiki Go</a></div>
        </footer>
    );
}