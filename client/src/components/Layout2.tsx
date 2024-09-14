import React from 'react';
import SideNav from './SideNav2';
import { NavLink } from 'react-router-dom';

interface Layout2Props {
    children: React.ReactNode;
}

const Layout2: React.FC<Layout2Props> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
                <div className="text-xl font-bold">Wiki GO</div>
                <div className="space-x-4">
                    <NavLink to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</NavLink>
                    <NavLink to="/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Create</NavLink>
                </div>
            </header>
            <div className="flex flex-1">
                <SideNav />
                <div className="flex-1 p-4">
                    {children}
                </div>
            </div>
            <footer className="bg-gray-800 text-white text-center p-4">
                &copy; {new Date().getFullYear()} Wiki GO. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout2;
