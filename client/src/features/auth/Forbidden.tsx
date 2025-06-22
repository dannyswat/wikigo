import { NavLink } from "react-router-dom";

export default function Forbidden() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">Forbidden</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">You do not have permission to view this page.</p>
            <div className="mt-4">
                <NavLink to="/" className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Go to Home
                </NavLink>
            </div>
        </div>
    );
}