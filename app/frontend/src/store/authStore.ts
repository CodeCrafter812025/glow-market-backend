import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  phone: string;
  name: string;
  role: "customer" | "seller";
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (phone: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: (phone: string) => {
        set({
          isAuthenticated: true,
          user: {
            phone,
            name: "کاربر گلو مارکت",
            role: "customer",
          },
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    {
      name: "glowmarket-auth",
    }
  )
);