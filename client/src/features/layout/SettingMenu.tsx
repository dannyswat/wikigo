import { IconSettings } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { logoutApi } from "../auth/authApi";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../auth/UserProvider";

export function SettingMenu({ returnUrl }: { returnUrl?: string }) {
  const navigate = useNavigate();
  const { isAdmin } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const logout = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      window.location.href = returnUrl || "/";
    },
  });

  useEffect(() => {
    if (isOpen) {
      const closeMenu = () => setIsOpen(false);
      setTimeout(() => document.addEventListener("click", closeMenu), 0);
      return () => document.removeEventListener("click", closeMenu);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      <button onClick={() => setIsOpen((p) => !p)}>
        <IconSettings
          size={24}
          className="inline transition hover:rotate-180"
        />
      </button>
      <div
        className={
          "absolute right-0 w-48 py-2 mt-2 z-10 bg-white dark:bg-gray-800 text-left border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl " +
          (isOpen ? "block" : "hidden")
        }
      >
        {isAdmin && (
          <>
            <button
              onClick={() => navigate("/users")}
              className="w-full box-border px-4 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Users
            </button>
            <button onClick={() => navigate("/site-setting")}
              className="w-full box-border px-4 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Site Setting
            </button>
            <button
              onClick={() => navigate("/security-setting")}
              className="w-full box-border px-4 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Security Setting
            </button>
            <button onClick={() => navigate("/filebrowser")}
              className="w-full box-border px-4 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              File Browser
            </button>
            <button onClick={() => navigate('/page-admin')}
              className="w-full box-border px-4 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >Rebuild Search</button>
          </>
        )}
        <button
          onClick={() => navigate("/change-password")}
          className="w-full box-border px-4 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Change Password
        </button>
        <button
          onClick={() => logout.mutate()}
          className="w-full box-border px-4 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
