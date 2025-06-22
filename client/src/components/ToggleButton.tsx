import { IconCheck, IconCrop11 } from "@tabler/icons-react";

interface ToggleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked: boolean;
    label: string;
    onChange: (value: boolean) => void;
}

export default function ToggleButton({ className, checked, onChange, label, ...props }: ToggleButtonProps) {

    return (
        <button className={'inline-block cursor-pointer' + (className ? ' ' + className : '')} {...props}
            onClick={() => onChange(!checked)}>
            {checked && <IconCheck className="mr-2 inline-block text-green-700 dark:text-green-500" />}
            {!checked && <IconCrop11 className="mr-2 inline-block" />}
            <label className="inline-block">{label}</label>
        </button>
    );
}