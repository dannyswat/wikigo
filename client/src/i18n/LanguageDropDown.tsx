interface LanguageDropDownProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
    value: string;
    onChange: (lang: string) => void;
    className?: string;
}

export default function LanguageDropDown(
    { className, value, onChange }: LanguageDropDownProps) {
    return (
        <select className={'rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-1' + (className ? ' ' + className : '')}
            value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="en">English</option>
            <option value="cn">简体中文</option>
            <option value="zh">繁體中文</option>
            <option value="fr">Français</option>
            <option value="jp">日本語</option>
        </select>);
}