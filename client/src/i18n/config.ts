import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import zh from "./zh.json";
import jp from "./jp.json";
import fr from "./fr.json";
import cn from "./cn.json";

i18next
    .use(initReactI18next)
    .init({
        resources: {
            en,
            zh,
            jp,
            fr,
            cn
        }
    });