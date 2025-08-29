import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getUsersApi } from "./userApi";
import { IconLock } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";

export default function Users() {
    const { t } = useTranslation();
    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            return await getUsersApi();
        }
    });

    if (isLoading) return <div>{t("Loading")}</div>;
    if (isError) return <div>{t("Error loading users")}</div>;

    return <div className="w-full">
        <h1 className="text-2xl font-semibold">{t("Users")}</h1>
        <div className="flex justify-end">
            <NavLink to="/users/create" className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">{t("Add User")}</NavLink>
        </div>
        <div className="table w-full my-2">
            <div className="table-header-group">
                <div className="table-row bg-gray-700 dark:bg-gray-800 text-white">

                    <div className="table-cell border border-gray-400 dark:border-gray-600 px-4 py-2 font-bold">{t("Username")}</div>
                    <div className="hidden sm:table-cell border border-gray-400 dark:border-gray-600 px-4 py-2 font-bold">{t("Email")}</div>
                    <div className="table-cell border border-gray-400 dark:border-gray-600 px-4 py-2 font-bold">{t("Role")}</div>
                    <div className="table-cell border border-gray-400 dark:border-gray-600 px-4 py-2 font-bold">{t("Status")}</div>
                    <div className="table-cell border border-gray-400 dark:border-gray-600 px-4 py-2 font-bold"></div>
                </div>
            </div>
            <div className="table-row-group">
                {users?.map(user => (
                    <div className="table-row" key={user.id}>
                        <div className="table-cell border border-gray-400 dark:border-gray-600 px-4 py-2">{user.username}</div>
                        <div className="hidden sm:table-cell border border-gray-400 dark:border-gray-600 px-4 py-2">{user.email}</div>
                        <div className="table-cell border border-gray-400 dark:border-gray-600 px-4 py-2">{user.role}</div>
                        <div className="table-cell border border-gray-400 dark:border-gray-600 px-4 py-2 text-center">{user.isLockedOut && <IconLock size={24} />}</div>
                        <div className="table-cell border border-gray-400 dark:border-gray-600 px-4 py-2 text-center">
                            <NavLink to={`/users/${user.id}`} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">{t("Edit")}</NavLink>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
}