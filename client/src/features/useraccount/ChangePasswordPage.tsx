import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { changePasswordApi, ChangePasswordRequest, getPublicKeyApi } from "../auth/authApi";

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const { data: cpkey, isLoading: cpLoading } = useQuery({
        queryKey: ['public-key', 'changepassword'],
        queryFn: () => getPublicKeyApi('changepassword'),
    });
    const { data: authKey, isLoading: authLoading } = useQuery({
        queryKey: ['public-key', 'login'],
        queryFn: () => getPublicKeyApi('login'),
    });
    const changePassword = useMutation({
        mutationFn: (request: ChangePasswordRequest) => changePasswordApi(request),
        onSuccess: () => {
            navigate('/');
        }
    });
    const isLoading = cpLoading || authLoading;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit() {
        if (!authKey || !cpkey) return;
        if (data.newPassword !== data.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        changePassword.mutate({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
            publicKey: authKey.key,
            newPublicKey: cpkey.key,
            timestamp: authKey.timestamp,
        });
        setError('');
    }

    return (
        <div className="flex items-center justify-center h-screen bg-cover" style={{ backgroundImage: 'url(1726537215_sheep-flock-of-sheep-series-standing-on-85683.jpeg)' }}>
            <div className="w-96 bg-white p-4 rounded shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Change Password</h1>
                <input className="w-full p-2 border border-gray-300 rounded mb-4" placeholder="Your password" name="oldPassword" type="password" onChange={handleChange} />
                <input className="w-full p-2 border border-gray-300 rounded mb-4" placeholder="New password" name="newPassword" type="password" onChange={handleChange} />
                <input className="w-full p-2 border border-gray-300 rounded mb-4" placeholder="Confirm your new password" name="confirmPassword" type="password" onChange={handleChange} />
                <button className="w-full bg-blue-500 text-white p-2 rounded" disabled={isLoading} onClick={handleSubmit}>Change Password</button>
                <button className="w-full bg-gray-300 text-white mt-4 p-2 rounded" disabled={isLoading} onClick={() => navigate('/')}>Cancel</button>
                {error && <p className="text-red-600">{error}</p>}
            </div>
        </div>
    );
}