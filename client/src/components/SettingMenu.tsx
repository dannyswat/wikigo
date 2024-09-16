import { IconSettings } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { logoutApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

export function SettingMenu() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const logout = useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            navigate('/');
        }
    })

    useEffect(() => {
        if (isOpen) {
            const closeMenu = () => setIsOpen(false);
            setTimeout(() => document.addEventListener('click', closeMenu), 0);
            return () => document.removeEventListener('click', closeMenu);
        }
    }, [isOpen]);

    return (
        <div className="relative inline-block">
            <button onClick={() => setIsOpen((p) => !p)}><IconSettings size={24} className="inline" /></button>
            <div className={'absolute right-0 w-48 py-2 mt-2 z-10 bg-white text-left border border-gray-200 rounded-lg shadow-xl ' + (isOpen ? 'block' : 'hidden')}>
                <button onClick={() => navigate('/change-password')} className="w-full box-border px-4 py-2 text-left text-gray-800 hover:bg-gray-200">Change Password</button>
                <button onClick={() => logout.mutate()} className="w-full box-border px-4 py-2 text-left text-gray-800 hover:bg-gray-200">Logout</button>
            </div>
        </div >
    )
}