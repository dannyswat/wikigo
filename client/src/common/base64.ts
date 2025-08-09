export function base64(bufArray: ArrayBuffer) {
    const arr = new Uint8Array(bufArray);
    const ir = [];
    for (let i = 0; i < arr.byteLength; i++) {
        ir.push(String.fromCharCode(arr[i]))
    }
    return btoa(ir.join(''));
}

export function fromBase64(str: string) {
    const s = atob(str);
    const buf = new ArrayBuffer(s.length);
    const arr = new Uint8Array(buf);

    for (let i = 0; i < s.length; i++) {
        arr[i] = s.charCodeAt(i);
    }
    return buf;
}

// Helper functions for WebAuthn base64url conversion

export function base64urlToBuffer(input: any): ArrayBuffer {
    if (!input) {
        throw new Error("Invalid input data for base64url conversion");
    }

    // If it's already an ArrayBuffer, return it
    if (input instanceof ArrayBuffer) {
        return input;
    }

    // Convert to string and process
    const base64url = String(input);

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

export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
