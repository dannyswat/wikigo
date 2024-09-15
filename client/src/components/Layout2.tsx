import { ReactNode, useContext } from 'react';
import SideNav from './SideNav2';
import { NavLink, useParams } from 'react-router-dom';
import { UserContext } from '../providers/UserProvider';
import Logo from '../assets/logo-no-background.svg';

interface Layout2Props {
    children: ReactNode;
    isPage?: boolean;
}

export default function Layout2({ children, isPage }: Layout2Props) {
    const { isLoggedIn } = useContext(UserContext);
    const { id } = useParams();
    const pageId = id ?? 'main';

    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
                <div className="text-xl font-bold">
                    <NavLink to="/"><img src={Logo} alt="Wiki GO" className="h-8" /></NavLink>
                </div>
                <div className="space-x-4">
                    {!isLoggedIn && <NavLink to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</NavLink>}
                    {isLoggedIn && <NavLink to="/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Create</NavLink>}
                    {isLoggedIn && isPage && pageId && <NavLink to={`/edit/${pageId}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Edit</NavLink>}
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
}