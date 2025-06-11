import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  authDate: string;
  backendUser: {
    user_id: number;
    registration_date: string;
    is_active: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, backendUserData?: any) => void;
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

  const login = (userData: User, backendUserData?: any) => {
    const userWithBackend = {
      ...userData,
      backendUser: backendUserData,
    };
    setUser(userWithBackend);
    localStorage.setItem("user", JSON.stringify(userWithBackend));

    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: authProtectionEnabled ? !!user : true,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
