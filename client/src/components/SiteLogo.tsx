import { useContext } from "react";
import { SettingContext } from "../features/setup/SettingProvider";

const DEFAULT_LOGO_URL = "/logo-no-background.svg";
const DEFAULT_SITE_NAME = "Wiki GO";

export default function SiteLogo() {
    const { setting } = useContext(SettingContext);
    return <img src={setting?.logo || DEFAULT_LOGO_URL} alt={setting?.site_name || DEFAULT_SITE_NAME} className="h-8" />;
}