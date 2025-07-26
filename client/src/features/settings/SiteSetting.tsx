import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import ImageInput from "../../components/ImageInput";

export default function SiteSetting() {
    const queryClient = useQueryClient();
    const { data: siteSetting, isLoading, error } = useQuery({
        queryKey: ['site-setting'],
        queryFn: async () => {
            const response = await fetch('/api/setting');
            if (!response.ok) {
                throw new Error('Failed to fetch site setting');
            }
            return response.json();
        },
        refetchOnWindowFocus: false,
    });

    const [form, setForm] = useState<any | null>(null);
    React.useEffect(() => {
        if (siteSetting) setForm(siteSetting);
    }, [siteSetting]);

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch('/api/admin/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to update site setting');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-setting'] });
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form) mutation.mutate(form);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600 dark:text-red-400">{(error as Error).message}</div>;
    if (!form) return null;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Site Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Site Name</label>
                    <input
                        type="text"
                        name="site_name"
                        value={form.site_name || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Logo URL</label>
                    <ImageInput value={form.logo || ''} onChange={(value) => setForm({ ...form, logo: value })} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Theme</label>
                    <input
                        type="text"
                        name="theme"
                        value={form.theme || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Footer</label>
                    <input
                        type="text"
                        name="footer"
                        value={form.footer || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Language</label>
                    <input
                        type="text"
                        name="language"
                        value={form.language || ''}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="is_site_protected"
                        checked={form.is_site_protected}
                        onChange={(e) => setForm({ ...form, is_site_protected: e.target.checked })}
                        className="mr-2"
                    />
                    <label className="text-sm">Protect Site (Enable this to restrict access to authorized users only)</label>
                </div>
                {mutation.isError && <div className="text-red-600 dark:text-red-400">{(mutation.error as Error).message}</div>}
                {mutation.isSuccess && <div className="text-green-600 dark:text-green-400">Settings updated!</div>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white py-2 rounded disabled:opacity-50"
                    disabled={mutation.status === 'pending'}
                >
                    {mutation.status === 'pending' ? "Saving..." : "Save Settings"}
                </button>
            </form>
        </div>
    );
}