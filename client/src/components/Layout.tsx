import { ReactNode, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { IconSettings } from '@tabler/icons-react';

import { UserContext } from '../providers/UserProvider';

interface LayoutProps {
    customMenu?: ReactNode;
}

export default function Layout({ customMenu }: LayoutProps) {
    const { isLoggedIn } = useContext(UserContext);

    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
                <div className="text-xl font-bold">
                    <img src="/logo-no-background.svg" alt="Wiki GO" className="h-8" />
                </div>
                <div className="space-x-4 text-right">
                    {isLoggedIn && (customMenu ?? <IconSettings size={24} className="inline" />)}
                </div>
            </header>
            <div className="flex-1">
                <div className="box-border p-4">
                    <Outlet />
                </div>
            </div>
            <footer className="bg-gray-800 text-white text-center p-4">
                &copy; {new Date().getFullYear()} Wiki GO. All rights reserved.
            </footer>
        </div>
    );
}