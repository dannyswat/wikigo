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