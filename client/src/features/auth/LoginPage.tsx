import { useMutation, useQuery } from "@tanstack/react-query";
import { MouseEvent, useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPublicKeyApi, loginApi, LoginRequest } from "./authApi";
import { beginPasskeyLogin, finishPasskeyLogin } from "./fido2Api";
import { UserContext } from "./UserProvider";
import { useTheme } from "../../contexts/ThemeProvider";

export default function LoginPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isLoggedIn } = useContext(UserContext);
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get("returnUrl");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const keyQuery = useQuery({
    queryKey: ["publicKey"],
    queryFn: async () => await getPublicKeyApi("login"),
  });
  const login = useMutation({
    mutationFn: async (request: LoginRequest) => await loginApi(request),
    onSuccess: () => {
      window.location.href = returnUrl || "/";
    }
  });

  const passkeyLogin = useMutation({
    mutationFn: async () => {
      const { options, sessionKey } = await beginPasskeyLogin();

      // Extract the publicKey options from the response (handle both formats)
      const requestOptions = options.publicKey || options;

      // Convert base64url strings back to ArrayBuffers for the browser API
      const credentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          ...requestOptions,
          challenge: base64urlToBuffer(requestOptions.challenge as any),
          allowCredentials: requestOptions.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: base64urlToBuffer(cred.id as any)
          }))
        }
      };

      const credential = await navigator.credentials.get(credentialRequestOptions) as PublicKeyCredential;
      if (!credential) {
        throw new Error("No credential received");
      }

      return await finishPasskeyLogin(credential, sessionKey);
    },
    onSuccess: () => {
      window.location.href = returnUrl || "/";
    }
  });

  // Helper function to convert base64url to ArrayBuffer
  function base64urlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    const padded = base64 + '='.repeat(padding === 0 ? 0 : 4 - padding);
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  if (isLoggedIn) {
    return <Navigate to={returnUrl ?? "/"} />;
  }

  function handleLoginClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    login.mutate({
      username,
      password,
      publicKey: keyQuery.data?.key || "",
      timestamp: keyQuery.data?.timestamp || "",
    });
  }

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover"
      style={{
        backgroundImage:
          theme === 'dark' ? "url(dark-blue-sky.jpg)" : "url(1726537215_sheep-flock-of-sheep-series-standing-on-85683.jpeg)",
      }}
    >
      <div className="w-96 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded shadow-lg">
        <h1 className="text-2xl font-bold mb-4">{t("Login")}</h1>
        <input
          type="text"
          placeholder={t("Username")}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder={t("Password")}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white p-2 rounded"
          onClick={handleLoginClick}
        >
          {t("Login")}
        </button>
        <div className="mt-4 text-center text-gray-600 dark:text-gray-400">{t("or")}</div>
        <button
          className="w-full bg-green-500 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-800 text-white p-2 rounded mt-4"
          onClick={() => passkeyLogin.mutate()}
          disabled={passkeyLogin.isPending}
        >
          {passkeyLogin.isPending ? t("Authenticating") : t("Login with PassKey")}
        </button>
        {(login.error || passkeyLogin.error) && (
          <div className="mt-4 text-red-700 dark:text-red-400">
            {login.error?.message || passkeyLogin.error?.message}
          </div>
        )}
      </div>
    </div>
  );
}
