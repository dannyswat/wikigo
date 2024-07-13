import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen">
            <div className="w-64 bg-gray-800">
                <div className="p-4 text-white">Admin Panel</div>
                <div className="p-4">
                    <ul>
                        <li className="p-2 hover:bg-gray-700">Dashboard</li>
                        <li className="p-2 hover:bg-gray-700">Users</li>
                        <li className="p-2 hover:bg-gray-700">Settings</li>
                    </ul>
                </div>
            </div>
            <div className="flex-1 bg-gray-100 p-4">
                {children}
            </div>
        </div>
    );
}