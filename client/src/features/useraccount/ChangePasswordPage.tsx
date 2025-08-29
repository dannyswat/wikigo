import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { changePasswordApi, ChangePasswordRequest, getPublicKeyApi } from "../auth/authApi";
import { useTheme } from "../../contexts/ThemeProvider";
import PassKeyConnect from "./PassKeyConnect";
import { useTranslation } from "react-i18next";

export default function ChangePasswordPage() {
    const { t } = useTranslation();
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
            setError(t('errors.publicKeyMissing'));
            return;
        }

        if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
            setError(t('errors.allFieldsRequired'));
            return;
        }
        if (data.newPassword !== data.confirmPassword) {
            setError(t('errors.passwordsDoNotMatch'));
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
                <h1 className="text-2xl font-bold mb-4">{t('auth.changePassword')}</h1>
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4" placeholder={t('forms.yourPassword')} name="oldPassword" type="password" onChange={handleChange} />
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4" placeholder={t('forms.newPassword')} name="newPassword" type="password" onChange={handleChange} />
                <input className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4" placeholder={t('forms.confirmNewPassword')} name="confirmPassword" type="password" onChange={handleChange} />
                <button disabled={isLoading} className="w-full bg-blue-500 text-white p-2 rounded" onClick={handleSubmit}>{t('auth.changePassword')}</button>

                <PassKeyConnect className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-4" />

                <button className="w-full bg-gray-300 text-white mt-4 p-2 rounded" onClick={() => navigate('/')}>{t('buttons.cancel')}</button>
                {error && (
                    <p className="text-red-600 mt-2">{error}</p>
                )}
            </div>
        </div>
    );
}