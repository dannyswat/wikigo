import { baseApiUrl } from "./baseApi";

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    isLockedOut: boolean;
}

export async function getUsersApi(): Promise<User[]> {
    const resp = await fetch(baseApiUrl + '/admin/users', {
        credentials: 'include',
    });
    return await resp.json();
}

export interface CreateUserRequest {
    username: string;
    email: string;
    role: string;
    password: string;
}

export async function createUserApi(request: CreateUserRequest): Promise<User> {
    const resp = await fetch(baseApiUrl + '/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });
    if (resp.status >= 400) {
        throw new Error(await resp.text());
    }
    return await resp.json();
}

interface Role {
    role: string;
    name: string;
}

const roles: Role[] = [
    { role: 'reader', name: 'Reader' },
    { role: 'editor', name: 'Editor' },
    { role: 'admin', name: 'Admin' },
];

export function getRolesApi(): Role[] {
    return roles;
}