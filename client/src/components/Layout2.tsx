import { ReactNode, useContext, useState } from 'react';
import SideNav from './SideNav2';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../providers/UserProvider';
import Logo from '../assets/logo-no-background.svg';
import { IconClearAll, IconMenu2 } from '@tabler/icons-react';
import { Footer } from './Footer';
import { SettingMenu } from './SettingMenu';

interface Layout2Props {
    children: ReactNode;
    isPage?: boolean;
}

export default function Layout2({ children, isPage }: Layout2Props) {
    const navigate = useNavigate();
    const { isLoggedIn } = useContext(UserContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { id } = useParams();
    const pageId = isPage ? (id ? window.location.pathname.substring(3) : 'home') : '';

    function navigateTo(path: string) {
        setIsMenuOpen(false);
        navigate(path);
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
                <div className="text-xl font-bold">
                    <button className="p-2 sm:hidden" onClick={() => setIsMenuOpen((p) => !p)}>
                        <IconMenu2 className="hover:text-gray-200" size={24} />
                    </button>
                    <NavLink className="hidden sm:inline" to="/">
                        <img src={Logo} alt="Wiki GO" className="h-8" />
                    </NavLink>
                </div>
                <div className="space-x-4 text-right">
                    {!isLoggedIn && <NavLink to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login</NavLink>}
                    {isLoggedIn && <NavLink to="/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Create</NavLink>}
                    {isLoggedIn && isPage && pageId && <NavLink to={`/edit/${pageId}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Edit</NavLink>}
                    {isLoggedIn && <SettingMenu />}
                </div>
            </header>
            <div className="flex flex-1">
                <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden fixed inset-0 bg-white bg-opacity-50 z-10`} onClick={() => setIsMenuOpen(false)}></div>
                <SideNav
                    navigate={navigateTo}
                    className={`fixed inset-0 w-full ${isMenuOpen ? 'block' : 'hidden'} sm:block sm:relative sm:w-1/4 z-20`}
                    headerComponent={<button className="absolute right-4 top-4 sm:hidden hover:text-gray-700" onClick={() => setIsMenuOpen(false)}><IconClearAll height={24} /></button>}
                />
                <div className="flex-1 p-4">
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
}