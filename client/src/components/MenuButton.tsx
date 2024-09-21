import { IconDotsVertical } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface MenuButtonProps {
    children: React.ReactNode;
    className?: string;
}

export default function MenuButton({ children, className }: MenuButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const closeMenu = () => setIsOpen(false);
            setTimeout(() => document.addEventListener('click', closeMenu), 0);
            return () => document.removeEventListener('click', closeMenu);
        }
    }, [isOpen]);

    return (
        <div className={'relative inline-block' + (className ? ' ' + className : '')}>
            <button onClick={() => setIsOpen((p) => !p)}>
                <IconDotsVertical size={24} className="inline-block -mt-2 transition hover:rotate-90" />
            </button>
            <div className={'absolute bottom-8 w-48 py-2 mt-2 z-10 bg-white text-left border border-gray-200 rounded-lg shadow-xl ' + (isOpen ? 'block' : 'hidden')}>
                {children}
            </div>
        </div >
    )
}