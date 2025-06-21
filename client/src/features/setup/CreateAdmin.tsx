import React, { useContext, useState } from "react";
import { createAdmin } from "./setupApi";
import { SettingContext } from "./SettingProvider";
import { Navigate } from "react-router-dom";

export default function CreateAdmin() {
    const setting = useContext(SettingContext);
    const [form, setForm] = useState({
        user_name: "admin",
        email: "",
        password: "",
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
            await createAdmin(form);
            setSuccess("Admin account created successfully.");
            setForm({ user_name: "", email: "", password: "" });
            setting.updateAdminCreated();
        } catch (err: any) {
            setError(err.message || "Failed to create admin account.");
        } finally {
            setLoading(false);
        }
    };

    if (setting && setting.isAdminCreated) {
        return <Navigate to="/setup-site" replace />;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Create Admin Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Username</label>
                    <input
                        type="text"
                        name="user_name"
                        value={form.user_name}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                        minLength={3}
                        maxLength={50}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                        minLength={6}
                        maxLength={100}
                    />
                </div>
                {error && <div className="text-red-600">{error}</div>}
                {success && <div className="text-green-600">{success}</div>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Admin"}
                </button>
            </form>
        </div>
    );
}