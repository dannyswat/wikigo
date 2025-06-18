import { useContext } from "react";
import { SettingContext } from "../setup/SettingProvider";

export function Footer() {
    const { setting } = useContext(SettingContext);
    return (
        <footer className="bg-gray-800 text-white text-center p-4">
            {setting?.footer || `All rights reserved © Wiki Go ${new Date().getFullYear()}.`}
            <span className="ms-2">Powered by <a href="https://github.com/dannyswat/wikigo" target="_blank">Wiki Go</a></span>
        </footer>
    );
}