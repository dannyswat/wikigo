import { baseApiUrl } from "../../common/baseApi";

// Utility functions
function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function apiRequest(url: string, options: RequestInit): Promise<any> {
    const response = await fetch(baseApiUrl + url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
}

export interface UserDevice {
    id: string;
    user_id: string;
    credential_id: string;
    device_name: string;
    name: string; // Frontend expects 'name' property
    created_at: string;
    createdAt: string; // Frontend expects 'createdAt' property
    last_used: string;
    lastUsedAt: string; // Frontend expects 'lastUsedAt' property
}

// Utility functions for WebAuthn
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function credentialToJSON(credential: PublicKeyCredential): any {
    const response = credential.response as AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;

    let result: any = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {}
    };

    if (response instanceof AuthenticatorAttestationResponse) {
        // Registration response
        result.response = {
            clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
            attestationObject: arrayBufferToBase64Url(response.attestationObject)
        };
    } else if (response instanceof AuthenticatorAssertionResponse) {
        // Authentication response
        result.response = {
            clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
            authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
            signature: arrayBufferToBase64Url(response.signature),
            userHandle: response.userHandle ? arrayBufferToBase64Url(response.userHandle) : null
        };
    }

    return result;
}

// Session key management
function generateSessionKey(): string {
    return generateRandomString(32);
}

// Passkey Registration Functions
export async function beginPasskeyRegistration(deviceName?: string): Promise<{ options: any; sessionKey: string }> {
    const sessionKey = generateSessionKey();

    const response = await apiRequest('/user/passkey/begin-register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Key': sessionKey,
        },
        body: JSON.stringify({ device_name: deviceName || 'New Device' }),
    });

    return { options: response, sessionKey };
}

export async function finishPasskeyRegistration(credential: PublicKeyCredential, deviceName: string, sessionKey: string): Promise<void> {
    const credentialJSON = credentialToJSON(credential);

    await apiRequest('/user/passkey/finish-register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Session-Key': sessionKey,
        },
        body: JSON.stringify({
            ...credentialJSON,
            name: deviceName,
            sessionKey: sessionKey,
        }),
    });
}

// Passkey Login Functions
export async function beginPasskeyLogin(): Promise<{ options: any; sessionKey: string }> {
    const sessionKey = generateSessionKey();

    const response = await apiRequest('/auth/passkey/begin-login', {
        method: 'POST',
        headers: {
            'X-Session-Key': sessionKey,
        },
    });

    return { options: response, sessionKey };
}

export async function finishPasskeyLogin(credential: PublicKeyCredential, sessionKey: string): Promise<{ token: string; user: any }> {
    const credentialJSON = credentialToJSON(credential);

    return apiRequest('/auth/passkey/finish-login', {
        method: 'POST',
        headers: {
            'X-Session-Key': sessionKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialJSON)
    });
}

// Device Management Functions
export async function getUserPasskeyDevices(): Promise<UserDevice[]> {
    const devices = await apiRequest('/user/passkey/devices', {
        method: 'GET',
    });

    // Transform the backend response to match frontend expectations
    return devices;
}

export async function deletePasskeyDevice(deviceId: string): Promise<void> {
    await apiRequest(`/user/passkey/devices/${deviceId}`, {
        method: 'DELETE',
    });
}