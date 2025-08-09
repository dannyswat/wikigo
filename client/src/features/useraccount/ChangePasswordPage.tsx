import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { changePasswordApi, ChangePasswordRequest, getPublicKeyApi } from "../auth/authApi";
import { useTheme } from "../../contexts/ThemeProvider";
import PassKeyConnect from "./PassKeyConnect";

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();
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
        if (!cpkey || !authKey) {
            setError('Public key or timestamp is missing');
            return;
        }

        if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (data.newPassword !== data.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        changePassword.mutate({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
            publicKey: cpkey.key,
            timestamp: cpkey.timestamp,
            newPublicKey: authKey.key
        });
        setError('');
    }

    return (
        <div className="flex items-center justify-center h-screen bg-cover" style={{ backgroundImage: theme === 'dark' ? 'url(dark-blue-sky.jpg)' : 'url(1726537215_sheep-flock-of-sheep-series-standing-on-85683.jpeg)' }}>
            <div className="w-96 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Change Password</h1>
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4" placeholder="Your password" name="oldPassword" type="password" onChange={handleChange} />
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4" placeholder="New password" name="newPassword" type="password" onChange={handleChange} />
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4" placeholder="Confirm your new password" name="confirmPassword" type="password" onChange={handleChange} />
                <button disabled={isLoading} className="w-full bg-blue-500 text-white p-2 rounded" onClick={handleSubmit}>Change Password</button>

                <PassKeyConnect className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-4" />

                <button className="w-full bg-gray-300 text-white mt-4 p-2 rounded" onClick={() => navigate('/')}>Cancel</button>
                {error && (
                    <p className="text-red-600 mt-2">{error}</p>
                )}
            </div>
        </div>
    );
}