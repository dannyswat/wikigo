import { useTranslation } from "react-i18next";

interface ThemeDropDownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
    value: string;
    onChange: (theme: string) => void;
    className?: string;
}

export default function ThemeDropDown(
    { className, value, onChange }: ThemeDropDownProps) {
    const { t } = useTranslation();

    return (
        <select className={'rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1' + (className ? ' ' + className : '')}
            value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="default">{t('Auto Theme')}</option>
            <option value="light">{t('Light')}</option>
            <option value="dark">{t('Dark')}</option>

        </select>);
}