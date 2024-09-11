import { ReactNode } from 'react';
import SideNav from './SideNav';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <><header className="bg-white shadow">
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-gray-800">WikiGo</h1>
            </div>
        </header>

            <main className="container mx-auto px-4 py-6">
                <div className="flex">
                    <SideNav />
                    <article className="w-3/4">
                        {children}
                    </article>
                </div>
            </main>

            <footer className="bg-gray-200 py-4">
                <div className="container mx-auto px-4">
                    <p className="text-center text-gray-600">© 2024 WikiGo. All rights reserved.</p>
                </div>
            </footer></>
    );
}