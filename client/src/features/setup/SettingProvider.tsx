import { createContext, ReactNode, useEffect, useState } from "react";
import { getSetting, Setting } from "./setupApi";
import Loading from "../layout/Loading";

interface SettingContextValues {
    setting: Setting | undefined;
    updateSetting: (value: Setting) => void;
}

export const SettingContext = createContext<SettingContextValues>({ updateSetting: () => { }, setting: undefined });

interface SettingProviderProps {
    children: ReactNode;
    setup: ReactNode;
}

export default function SettingProvider({ children, setup }: SettingProviderProps) {
    const [setting, setSetting] = useState(getSettingFromLocalStorage);
    const [isLoading, setIsLoading] = useState(!setting);

    useEffect(() => {
        if (!isLoading) return;
        getSetting().then((res) => {
            if (res.is_admin_created && res.is_setup_complete)
                updateSetting(res.setting);

            setIsLoading(false);
        })
    }, []);

    function updateSetting(value: Setting) {
        localStorage.setItem('wikicfg', JSON.stringify(value));
        setSetting(value);
    }

    if (isLoading) return <Loading />;

    return <SettingContext.Provider value={{ setting, updateSetting }}>{!!setting ? children : setup}</SettingContext.Provider>
}

function getSettingFromLocalStorage(): Setting | undefined {
    const wikicfg = localStorage.getItem('wikicfg');
    if (!wikicfg) return undefined;

    return JSON.parse(wikicfg);
}