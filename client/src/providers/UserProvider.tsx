import { useState, createContext, useEffect } from "react";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import { getUserRoleApi } from "../api/authApi";
import { queryClient } from "../common/query";

export type UserContextType = {
  username?: string;
  role?: string;
  setUsername: (username: string) => void;
  isLoggedIn: boolean;
  canEdit: boolean;
  isAdmin: boolean;
};

const defaultUserContext: UserContextType = {
  setUsername: () => {},
  isLoggedIn: false,
  canEdit: false,
  isAdmin: false,
};

export const UserContext = createContext<UserContextType>(defaultUserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState(Cookies.get("user"));
  const { data: dataRole } = useQuery({
    queryKey: ["role", username],
    queryFn: async () => {
      if (username) {
        return await getUserRoleApi();
      }
      return { role: "" };
    },
  });
  const canEdit = dataRole?.role === "admin" || dataRole?.role === "editor";
  const isAdmin = dataRole?.role === "admin";

  useEffect(() => {
    const timer = window.setInterval(() => {
      const user = Cookies.get("user");
      if (user !== username) {
        queryClient.clear();
        setUsername(user);
      }
    }, 500);

    return () => {
      window.clearInterval(timer);
    };
  }, [username]);

  return (
    <UserContext.Provider
      value={{
        username,
        role: dataRole?.role,
        setUsername,
        isLoggedIn: !!username,
        canEdit,
        isAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
