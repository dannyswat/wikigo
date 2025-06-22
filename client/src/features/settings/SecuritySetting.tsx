import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

interface SecuritySetting {
    allow_cors: boolean;
    allowed_cors_origins?: string[];
    allowed_cors_methods: string;
    frame_options: string;
    referrer_policy: string;
    strict_transport_security: string;
    content_security_policy: string;
    x_content_type_options: string;
    x_xss_protection: string;
    x_robots_tag: string;
}

export default function SecuritySetting() {
    const queryClient = useQueryClient();
    const { data: securitySetting, isLoading, error } = useQuery({
        queryKey: ['security-setting'],
        queryFn: async () => {
            const response = await fetch('/api/securitysetting');
            if (!response.ok) {
                throw new Error('Failed to fetch security setting');
            }
            return response.json();
        },
        refetchOnWindowFocus: false,
    });

    const [form, setForm] = useState<SecuritySetting | null>(null);
    React.useEffect(() => {
        if (securitySetting) setForm(securitySetting);
    }, [securitySetting]);

    const mutation = useMutation({
        mutationFn: async (data: SecuritySetting) => {
            const response = await fetch('/api/securitysetting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to update security setting');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['security-setting'] });
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => prev ? {
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        } : prev);
    };

    const handleOriginsChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        if (!form) return;
        const newOrigins = [...form.allowed_cors_origins ?? []];
        newOrigins[idx] = e.target.value;
        setForm({ ...form, allowed_cors_origins: newOrigins });
    };

    const addOrigin = () => {
        if (!form) return;
        setForm({ ...form, allowed_cors_origins: [...form.allowed_cors_origins ?? [], ""] });
    };
    const removeOrigin = (idx: number) => {
        if (!form) return;
        const newOrigins = (form.allowed_cors_origins ?? []).filter((_, i) => i !== idx);
        setForm({ ...form, allowed_cors_origins: newOrigins });
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
            <h2 className="text-2xl font-bold mb-4">Security Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Allow CORS</label>
                    <input
                        type="checkbox"
                        name="allow_cors"
                        checked={form.allow_cors}
                        onChange={handleChange}
                        className="mr-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Allowed CORS Origins</label>
                    {(form.allowed_cors_origins ?? []).map((origin, idx) => (
                        <div key={idx} className="flex mb-1">
                            <input
                                type="text"
                                value={origin}
                                onChange={e => handleOriginsChange(e, idx)}
                                className="flex-1 border rounded px-3 py-2"
                            />
                            <button type="button" onClick={() => removeOrigin(idx)} className="ml-2 text-red-600 dark:text-red-400">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addOrigin} className="mt-1 text-blue-600 dark:text-blue-400">Add Origin</button>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Allowed CORS Methods</label>
                    <input
                        type="text"
                        name="allowed_cors_methods"
                        value={form.allowed_cors_methods}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">X-Frame-Options</label>
                    <input
                        type="text"
                        name="frame_options"
                        value={form.frame_options}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Referrer-Policy</label>
                    <input
                        type="text"
                        name="referrer_policy"
                        value={form.referrer_policy}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Strict-Transport-Security</label>
                    <input
                        type="text"
                        name="strict_transport_security"
                        value={form.strict_transport_security}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Content-Security-Policy</label>
                    <input
                        type="text"
                        name="content_security_policy"
                        value={form.content_security_policy}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">X-Content-Type-Options</label>
                    <input
                        type="text"
                        name="x_content_type_options"
                        value={form.x_content_type_options}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">X-XSS-Protection</label>
                    <input
                        type="text"
                        name="x_xss_protection"
                        value={form.x_xss_protection}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">X-Robots-Tag</label>
                    <input
                        type="text"
                        name="x_robots_tag"
                        value={form.x_robots_tag}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
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