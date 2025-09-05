import { base64, fromBase64 } from "../../common/base64";
import { baseApiUrl } from "../../common/baseApi";
import { getErrorMessage } from "../../common/errorMessage";

export interface LoginRequest {
  username: string;
  password: string;
  publicKey: string;
  timestamp: string;
}

interface LoginResponse {
  token: string;
}

export async function loginApi(request: LoginRequest): Promise<LoginResponse> {
  const { cipher, key } = await encryptPassword(
    request.password,
    request.publicKey,
    request.timestamp
  );

  const res = await fetch(baseApiUrl + "/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: request.username,
      password: cipher,
      key: key,
    }),
  });

  if (res.status >= 400) {
    throw new Error(await getErrorMessage(res));
  }

  return await res.json();
}

interface PublicKeyResponse {
  key: string;
  timestamp: string;
}

export async function getPublicKeyApi(
  purpose: string
): Promise<PublicKeyResponse> {
  const resp = await fetch(baseApiUrl + `/auth/publickey/${purpose}`);
  return await resp.json();
}

export async function logoutApi() {
  const resp = await fetch(baseApiUrl + "/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (resp.status >= 400) {
    throw new Error(await getErrorMessage(resp));
  }
  return await resp.json();
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  publicKey: string;
  newPublicKey: string;
  timestamp: string;
}

export async function changePasswordApi(request: ChangePasswordRequest) {
  const { cipher, key } = await encryptPassword(
    request.oldPassword,
    request.publicKey,
    request.timestamp
  );
  const { cipher: newCipher, key: newKey } = await encryptPassword(
    request.newPassword,
    request.newPublicKey,
    request.timestamp
  );

  const resp = await fetch(baseApiUrl + "/user/changepassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      oldPassword: cipher,
      newPassword: newCipher,
      key: key,
      newKey: newKey,
    }),
  });
  if (resp.status >= 400) {
    throw new Error(await getErrorMessage(resp));
  }
  return await resp.json();
}

interface UserRoleResponse {
  role: string;
}

export async function getUserRoleApi(): Promise<UserRoleResponse> {
  const resp = await fetch(baseApiUrl + "/user/role", {
    credentials: "include",
  });
  return await resp.json();
}

async function encryptPassword(
  password: string,
  publicKey: string,
  timestamp: string
) {
  const oneTimeKey = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits", "deriveKey"]
  );
  const oneTimePublic = await crypto.subtle.exportKey(
    "raw",
    oneTimeKey.publicKey
  );
  const serverPublicKey = await crypto.subtle.importKey(
    "raw",
    fromBase64(publicKey),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  const sharedKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: serverPublicKey },
    oneTimeKey.privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  const iv = getRandomArrayBuffer(12);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    new TextEncoder().encode(timestamp + password)
  );
  return {
    cipher: base64(concat(iv, cipherBuffer)),
    key: base64(oneTimePublic),
  };
}

function getRandomArrayBuffer(length: number) {
  const ab = new ArrayBuffer(length);
  const arr = new Uint8Array(ab);
  crypto.getRandomValues(arr);
  return ab;
}

function concat(a: ArrayBuffer, b: ArrayBuffer) {
  const aAr = new Uint8Array(a);
  const bAr = new Uint8Array(b);
  const buf = new ArrayBuffer(aAr.byteLength + bAr.byteLength);
  const ar = new Uint8Array(buf);
  for (let i = 0; i < aAr.length; i++) ar[i] = aAr[i];
  for (let i = 0; i < bAr.length; i++) ar[aAr.byteLength + i] = bAr[i];
  return buf;
}
