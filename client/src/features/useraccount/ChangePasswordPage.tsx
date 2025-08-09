import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { changePasswordApi, ChangePasswordRequest, getPublicKeyApi } from "../auth/authApi";
import { beginPasskeyRegistration, finishPasskeyRegistration, getUserPasskeyDevices, deletePasskeyDevice } from "../auth/fido2Api";
import { useTheme } from "../../contexts/ThemeProvider";
import { UserContext } from "../auth/UserProvider";

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { username } = useContext(UserContext);
    const [deviceName, setDeviceName] = useState('');
    const { data: devices, refetch: refetchDevices } = useQuery({
        queryKey: ['user-passkey-devices', username],
        queryFn: getUserPasskeyDevices,
        refetchOnWindowFocus: false,
    });
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


    const registerPasskey = useMutation({
        mutationFn: async () => {
            if (!deviceName.trim()) {
                throw new Error("Please enter a device name");
            }

            const { options, sessionKey } = await beginPasskeyRegistration(deviceName.trim());
            console.log('Registration response:', { options, sessionKey }); // Debug log
            const key = options.publicKey || options;
            // The options should be the PublicKeyCredentialCreationOptions directly
            console.log('Options:', options); // Debug log
            console.log('Challenge type:', typeof key.challenge, key.challenge); // Debug log
            console.log('User ID type:', typeof key.user?.id, key.user?.id); // Debug log

            // Ensure the response has the expected structure
            if (!key || !key.challenge || !key.user || !key.user.id) {
                console.error('Invalid options structure:', key);
                throw new Error("Invalid registration options received from server");
            }

            // Convert base64url strings to ArrayBuffers for the browser API
            const credentialCreationOptions: CredentialCreationOptions = {
                publicKey: {
                    ...key,
                    challenge: base64urlToBuffer(key.challenge),
                    user: {
                        ...key.user,
                        id: base64urlToBuffer(key.user.id)
                    },
                    // Handle excludeCredentials if present
                    excludeCredentials: key.excludeCredentials?.map((cred: any) => ({
                        ...cred,
                        id: base64urlToBuffer(cred.id)
                    }))
                }
            };

            const credential = await navigator.credentials.create(credentialCreationOptions) as PublicKeyCredential;
            if (!credential) {
                throw new Error("No credential received");
            }

            await finishPasskeyRegistration(credential, deviceName.trim(), sessionKey);
        },
        onSuccess: () => {
            setDeviceName('');
            refetchDevices();
        }
    });

    const deleteDevice = useMutation({
        mutationFn: (deviceId: string) => deletePasskeyDevice(deviceId),
        onSuccess: () => {
            refetchDevices();
        }
    });

    // Helper function to convert base64url to ArrayBuffer
    function base64urlToBuffer(input: any): ArrayBuffer {
        if (!input) {
            throw new Error("Invalid input data for base64url conversion");
        }

        // If it's already an ArrayBuffer, return it
        if (input instanceof ArrayBuffer) {
            return input;
        }

        // Convert to string and process
        const base64url = String(input);
        console.log('Converting base64url:', base64url); // Debug log

        if (!base64url || base64url === 'undefined') {
            throw new Error("Invalid base64url string: " + base64url);
        }

        const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64.length % 4;
        const padded = base64 + '='.repeat(padding === 0 ? 0 : 4 - padding);

        try {
            const binary = atob(padded);
            const buffer = new ArrayBuffer(binary.length);
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return buffer;
        } catch (error) {
            console.error('Failed to decode base64url:', base64url, error);
            throw new Error("Failed to decode base64url data");
        }
    }

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

                <div className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-4">
                    <h2 className="text-lg font-semibold mb-4">PassKey Management</h2>

                    <div className="mb-4">
                        <input
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-2"
                            placeholder="Device name (e.g., iPhone, Windows Hello)"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                        />
                        <button
                            className="w-full bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-800 text-white p-2 rounded"
                            onClick={() => registerPasskey.mutate()}
                            disabled={registerPasskey.isPending || !deviceName.trim()}
                        >
                            {registerPasskey.isPending ? "Registering..." : "Connect with PassKey"}
                        </button>
                    </div>

                    {devices && devices.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Your PassKeys:</h3>
                            {devices.map((device) => (
                                <div key={device.id} className="flex justify-between items-center p-2 border border-gray-300 dark:border-gray-600 rounded mb-2">
                                    <div>
                                        <div className="font-medium">{device.name}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Added: {new Date(device.createdAt).toLocaleDateString()}
                                            {device.lastUsedAt && ` • Last used: ${new Date(device.lastUsedAt).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <button
                                        className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                        onClick={() => deleteDevice.mutate(device.id)}
                                        disabled={deleteDevice.isPending}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button className="w-full bg-gray-300 text-white mt-4 p-2 rounded" onClick={() => navigate('/')}>Cancel</button>
                {(error || registerPasskey.error || deleteDevice.error) && (
                    <p className="text-red-600 mt-2">{error || registerPasskey.error?.message || deleteDevice.error?.message}</p>
                )}
            </div>
        </div>
    );
}