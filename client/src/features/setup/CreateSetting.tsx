import React, { useState } from "react";
import { createSetting } from "./setupApi";

export default function CreateSetting() {
    const [form, setForm] = useState({
        site_name: "Wiki Go",
        logo: "",
        theme: "default",
        footer: "All rights reserved © Wiki Go",
        language: "en",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await createSetting(form);
            setSuccess("Setting created successfully.");
            setForm({ site_name: "", logo: "", theme: "", footer: "", language: "" });
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.replace('/');
        } catch (err: any) {
            setError(err.message || "Failed to create setting.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Setup Site Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Site Name</label>
                    <input
                        type="text"
                        name="site_name"
                        value={form.site_name}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Logo URL</label>
                    <input
                        type="text"
                        name="logo"
                        value={form.logo}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Theme</label>
                    <input
                        type="text"
                        name="theme"
                        value={form.theme}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Footer</label>
                    <input
                        type="text"
                        name="footer"
                        value={form.footer}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Language</label>
                    <input
                        type="text"
                        name="language"
                        value={form.language}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                {error && <div className="text-red-600">{error}</div>}
                {success && <div className="text-green-600">{success}</div>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Settings"}
                </button>
            </form>
        </div>
    );
}