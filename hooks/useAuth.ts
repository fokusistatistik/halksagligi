import { useSession } from "next-auth/react";
import { UserRole } from "@/types";

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const hasRole = (allowedRoles: UserRole[]) => {
    if (!session?.user) return false;
    return allowedRoles.includes((session.user as any).role);
  };

  const isAdmin = () => hasRole(["admin"]);
  const isHalkSagligiMudur = () => hasRole(["admin", "halk_sagligi_mudur"]);
  const isBirimMudur = () => hasRole(["admin", "halk_sagligi_mudur", "birim_mudur"]);
  const isPersonel = () => hasRole(["personel"]);

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    hasRole,
    isAdmin,
    isHalkSagligiMudur,
    isBirimMudur,
    isPersonel,
  };
}
