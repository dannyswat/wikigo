import { MouseEvent, useEffect, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { queryClient } from "../../common/query";
import { IconFidgetSpinner } from "@tabler/icons-react";
import { getRolesApi, getUserApi, updateUserApi, UpdateUserRequest } from "./userApi";

export default function UsersEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const userId = parseInt(id || '');
    const [data, setData] = useState<UpdateUserRequest>({
        id: 0,
        username: '',
        email: '',
        newPassword: '',
        role: 'reader',
    });
    const { data: user } = useQuery({
        queryKey: ['user', userId],
        queryFn: async () => {
            return await getUserApi(userId);
        }
    })
    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: getRolesApi,
    });
    const updateUser = useMutation({
        mutationFn: (data: UpdateUserRequest) => updateUserApi(data),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['users'] });
            navigate('/users');
        },
        onError: (err, ...args) => {
            alert(err);
            console.log(args);
        }
    });

    useEffect(() => {
        if (user) {
            setData({ ...user, newPassword: '' });
        }
    }, [user]);

    function handleSubmitClick(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        updateUser.mutate(data);
    }
    if (!id) {
        navigate('/users');
        return null;
    }

    return <div className="w-full flex flex-col gap-4">
        <section className="flex flex-row items-center">
            <label className="basis-1/4">Login Name</label>
            <input className="basis-3/4 border-2 rounded-md p-2" autoComplete="secret" type="text" value={data.username}
                onChange={(e) => setData((prev) => ({ ...prev, username: e.target.value }))} />
        </section>
        <section className="flex flex-row items-center">
            <label className="basis-1/4">Email</label>
            <input className="basis-3/4 border-2 rounded-md p-2" autoComplete="secret" type="text" value={data.email}
                onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))} />
        </section>
        <section className="flex flex-row items-center">
            <label className="basis-1/4">New Password</label>
            <input className="basis-3/4 border-2 rounded-md p-2" autoComplete="secret" type="password" value={data.newPassword}
                onChange={(e) => setData((prev) => ({ ...prev, newPassword: e.target.value }))} />
        </section>
        <section className="flex flex-row items-center">
            <label className="basis-1/4">Role</label>
            <select className="basis-3/4 border-2 rounded-md p-2" value={data.role}
                onChange={(e) => setData((prev) => ({ ...prev, role: e.target.value }))}>
                {roles?.map((role) => <option key={role.role} value={role.role}>{role.name}</option>)}
            </select>
        </section>
        <section className="flex flex-row justify-items-end">
            <button disabled={updateUser.isPending} onClick={handleSubmitClick}
                className="basis-1/2 sm:basis-1/6 bg-lime-700 text-white rounded-md py-2 px-5">
                {updateUser.isPending ? <IconFidgetSpinner className="animate-spin mx-auto" /> : 'Save'}
            </button>
            <button onClick={() => {
                if (confirm('Are you sure to leave?'))
                    navigate('/users')
            }} className="basis-1/2 sm:basis-1/6 bg-gray-700 text-white rounded-md py-2 px-5 ms-4">Cancel</button>
        </section>
    </div>;
}