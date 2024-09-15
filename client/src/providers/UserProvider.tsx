import { useState, createContext, useEffect } from 'react';
import Cookies from 'js-cookie';

export type UserContextType = {
    username?: string;
    setUsername: (username: string) => void;
    isLoggedIn: boolean;
};

const defaultUserContext: UserContextType = {
    setUsername: () => { },
    isLoggedIn: false,
};

export const UserContext = createContext<UserContextType>(defaultUserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [username, setUsername] = useState(Cookies.get('user'));

    useEffect(() => {
        const timer = window.setInterval(() => {
            const user = Cookies.get('user');
            if (user !== username) {
                setUsername(user);
            }
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [username]);

    return (
        <UserContext.Provider value={{ username, setUsername, isLoggedIn: !!username }}>
            {children}
        </UserContext.Provider>
    );
}