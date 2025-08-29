import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { UserContext } from "../auth/UserProvider";
import { beginPasskeyRegistration, finishPasskeyRegistration, getUserPasskeyDevices, deletePasskeyDevice } from "../auth/fido2Api";
import { base64urlToBuffer } from "../../common/base64";
import { useTranslation } from "react-i18next";

interface PassKeyConnectProps {
    className?: string;
}

export default function PassKeyConnect({ className }: PassKeyConnectProps) {
    const { t } = useTranslation();
    const { username } = useContext(UserContext);
    const [deviceName, setDeviceName] = useState('');

    const { data: devices, refetch: refetchDevices } = useQuery({
        queryKey: ['user-passkey-devices', username],
        queryFn: getUserPasskeyDevices,
        refetchOnWindowFocus: false,
    });

    const registerPasskey = useMutation({
        mutationFn: async () => {
            if (!deviceName.trim()) {
                throw new Error(t("Please enter a device name"));
            }

            const { options, sessionKey } = await beginPasskeyRegistration(deviceName.trim());
            const key = options.publicKey || options;

            // Ensure the response has the expected structure
            if (!key || !key.challenge || !key.user || !key.user.id) {
                console.error('Invalid options structure:', key);
                throw new Error(t("Invalid registration options received from server"));
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
                throw new Error(t("No credential received"));
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

    return (
        <div className={className}>
            <h2 className="text-lg font-semibold mb-4">{t('PassKey Management')}</h2>

            <div className="mb-4">
                <input
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-2"
                    placeholder={t('Device name')}
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                />
                <button
                    className="w-full bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-800 text-white p-2 rounded"
                    onClick={() => registerPasskey.mutate()}
                    disabled={registerPasskey.isPending || !deviceName.trim()}
                >
                    {registerPasskey.isPending ? t("Registering...") : t("Connect with PassKey")}
                </button>
            </div>

            {devices && devices.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">{t('Your PassKeys')}:</h3>
                    {devices.map((device) => (
                        <div key={device.id} className="flex justify-between items-center p-2 border border-gray-300 dark:border-gray-600 rounded mb-2">
                            <div>
                                <div className="font-medium">{device.name}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('Added')}: {new Date(device.createdAt).toLocaleDateString()}
                                    {device.lastUsedAt && ` • ${t('Last used')}: ${new Date(device.lastUsedAt).toLocaleDateString()}`}
                                </div>
                            </div>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                onClick={() => deleteDevice.mutate(device.id)}
                                disabled={deleteDevice.isPending}
                            >
                                {t('Delete')}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {(registerPasskey.error || deleteDevice.error) && (
                <p className="text-red-600 mt-2">{registerPasskey.error?.message || deleteDevice.error?.message}</p>
            )}
        </div>
    );
}
