import { MouseEvent, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../common/query";
import { IconFidgetSpinner } from "@tabler/icons-react";
import { createUserApi, CreateUserRequest, getRolesApi } from "../../api/userApi";

export default function UsersCreate() {
    const navigate = useNavigate();
    const [data, setData] = useState<CreateUserRequest>({
        username: '',
        email: '',
        password: '',
        role: 'reader',
    });
    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: getRolesApi,
    });
    const createUser = useMutation({
        mutationFn: (data: CreateUserRequest) => createUserApi(data),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ['users'] });
            navigate('/users');
        },
        onError: (err, ...args) => {
            alert(err);
            console.log(args);
        }
    })

    function handleSubmitClick(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        createUser.mutate(data);
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
            <input className="basis-3/4 border-2 rounded-md p-2" autoComplete="secret" type="password" value={data.password}
                onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))} />
        </section>
        <section className="flex flex-row items-center">
            <label className="basis-1/4">Role</label>
            <select className="basis-3/4 border-2 rounded-md p-2" value={data.role}
                onChange={(e) => setData((prev) => ({ ...prev, role: e.target.value }))}>
                {roles?.map((role) => <option key={role.role} value={role.role}>{role.name}</option>)}
            </select>
        </section>
        <section className="flex flex-row justify-items-end">
            <button disabled={createUser.isPending} onClick={handleSubmitClick}
                className="basis-1/2 sm:basis-1/6 bg-lime-700 text-white rounded-md py-2 px-5">
                {createUser.isPending ? <IconFidgetSpinner className="animate-spin mx-auto" /> : 'Create'}
            </button>
            <button onClick={() => {
                if (!data.username || confirm('Are you sure to leave?'))
                    navigate('/users')
            }} className="basis-1/2 sm:basis-1/6 bg-gray-700 text-white rounded-md py-2 px-5 ms-4">Cancel</button>
        </section>
    </div>;
}