import { useMutation, useQuery } from '@tanstack/react-query';
import { MouseEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicKeyApi, loginApi } from '../../api/authApi';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const keyQuery = useQuery({
        queryKey: ['publicKey'],
        queryFn: () => getPublicKeyApi('login'),
    });
    const login = useMutation({
        mutationFn: loginApi,
        onSuccess: () => navigate('/'),
    });
    function handleLoginClick(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        login.mutate({
            username,
            password,
            publicKey: keyQuery.data?.key || '',
            timestamp: keyQuery.data?.timestamp || '',
        })
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-96 bg-white p-4 rounded shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="w-full bg-blue-500 text-white p-2 rounded"
                    onClick={handleLoginClick}>
                    Login
                </button>
            </div>
        </div>
    );
}