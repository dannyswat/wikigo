import { useMutation, useQuery } from "@tanstack/react-query";
import { MouseEvent, useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getPublicKeyApi, loginApi, LoginRequest } from "./authApi";
import { UserContext } from "./UserProvider";

export default function LoginPage() {
  const navigate = useNavigate();
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
    onSuccess: () => navigate(returnUrl ?? "/"),
  });

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
          "url(1726537215_sheep-flock-of-sheep-series-standing-on-85683.jpeg)",
      }}
    >
      <div className="w-96 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 text-white p-2 rounded"
          onClick={handleLoginClick}
        >
          Login
        </button>
        {login.error && (
          <div className="mt-4 text-red-700 dark:text-red-400">{login.error?.message}</div>
        )}
      </div>
    </div>
  );
}
