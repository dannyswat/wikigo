import { useQuery } from "@tanstack/react-query";

import { getUsersApi } from "../../api/userApi";
import { IconLock } from "@tabler/icons-react";

export default function Users() {
    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            return await getUsersApi();
        }
    });

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error loading users...</div>;

    return <div className="w-full">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex justify-end">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add User</button>
        </div>
        <table className="w-full">
            <thead>
                <tr>
                    <th className="border border-gray-400 px-4 py-2">Username</th>
                    <th className="border border-gray-400 px-4 py-2">Email</th>
                    <th className="border border-gray-400 px-4 py-2">Role</th>
                    <th className="border border-gray-400 px-4 py-2">Locked Out</th>
                </tr>
            </thead>
            <tbody>
                {users?.map(user => (
                    <tr key={user.id}>
                        <td className="border border-gray-400 px-4 py-2">{user.username}</td>
                        <td className="border border-gray-400 px-4 py-2">{user.email}</td>
                        <td className="border border-gray-400 px-4 py-2">{user.role}</td>
                        <td className="border border-gray-400 px-4 py-2 text-center">{user.isLockedOut && <IconLock size={24} />}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}