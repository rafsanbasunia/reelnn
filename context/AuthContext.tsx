import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";

interface BackendUser {
  user_id: number;
  registration_date: string;
  is_active: boolean;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  authDate?: string;
  guest?: boolean;
  backendUser?: BackendUser | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, backendUserData?: BackendUser | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authProtectionEnabled, setAuthProtectionEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthConfiguration();
  }, []);

  const checkAuthConfiguration = async () => {
    try {
      const response = await fetch("/api/auth/protection-status");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setAuthProtectionEnabled(data.authProtectionEnabled);

      if (data.authProtectionEnabled) {
        await checkAuthStatus();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to check auth configuration:", error);
      setAuthProtectionEnabled(false);
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("authToken");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User, backendUserData?: BackendUser | null) => {
    const userWithBackend: User = {
      ...userData,
      backendUser: backendUserData || null,
      guest: false,
    };
    setUser(userWithBackend);
    localStorage.setItem("user", JSON.stringify(userWithBackend));
    router.push("/");
  };

  const loginAsGuest = () => {
    // Guest user minimal info, no backendUser, no token saved
    const guestUser: User = {
      id: "guest",
      guest: true,
      firstName: "Guest User",
      backendUser: null,
    };
    setUser(guestUser);
    localStorage.removeItem("authToken");
    localStorage.setItem("user", JSON.stringify(guestUser));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: authProtectionEnabled ? !!user : true,
    login,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
