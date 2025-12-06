"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface UrzednikUser {
  id: string;
  imie: string;
  nazwisko: string;
  email: string;
  urzad: {
    nazwa: string;
    powiat: string;
    wojewodztwo: string;
  };
  rola: "urzednik" | "admin";
}

export const DEMO_USERS: UrzednikUser[] = [
  {
    id: "demo-1",
    imie: "Jan",
    nazwisko: "Kowalski",
    email: "jan.kowalski@um.wroclaw.pl",
    urzad: {
      nazwa: "Urząd Miejski Wrocławia - Biuro Rzeczy Znalezionych",
      powiat: "Wrocław",
      wojewodztwo: "dolnośląskie",
    },
    rola: "urzednik",
  },
  {
    id: "demo-2",
    imie: "Anna",
    nazwisko: "Nowak",
    email: "anna.nowak@um.warszawa.pl",
    urzad: {
      nazwa: "Urząd Dzielnicy Śródmieście m.st. Warszawy",
      powiat: "Warszawa",
      wojewodztwo: "mazowieckie",
    },
    rola: "urzednik",
  },
  {
    id: "demo-3",
    imie: "Piotr",
    nazwisko: "Wiśniewski",
    email: "piotr.wisniewski@um.krakow.pl",
    urzad: {
      nazwa: "Urząd Miasta Krakowa - Wydział Spraw Administracyjnych",
      powiat: "Kraków",
      wojewodztwo: "małopolskie",
    },
    rola: "admin",
  },
];

interface AuthContextType {
  user: UrzednikUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "urzednik_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UrzednikUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const foundUser = DEMO_USERS.find((u) => u.id === parsed.userId);
        if (foundUser) {
          setUser(foundUser);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (foundUser && password.length >= 4) {
      setUser(foundUser);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ userId: foundUser.id, timestamp: Date.now() })
      );
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isAuthenticated };
}

