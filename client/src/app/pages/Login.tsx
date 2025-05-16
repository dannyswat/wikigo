import { useMutation, useQuery } from "@tanstack/react-query";
import { MouseEvent, useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getPublicKeyApi, loginApi, LoginRequest } from "../../api/authApi";
import { UserContext } from "../../providers/UserProvider";

export default function Login() {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const keyQuery = useQuery({
    queryKey: ["publicKey"],
    queryFn: async () => await getPublicKeyApi("login"),
  });
  const login = useMutation({
    mutationFn: async (request: LoginRequest) => await loginApi(request),
    onSuccess: () => navigate("/"),
  });

  if (isLoggedIn) {
    return <Navigate to="/" />;
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
      <div className="w-96 bg-white p-4 rounded shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 text-white p-2 rounded"
          onClick={handleLoginClick}
        >
          Login
        </button>
        {login.error && (
          <div className="mt-4 text-red-700">{login.error?.message}</div>
        )}
      </div>
    </div>
  );
}
