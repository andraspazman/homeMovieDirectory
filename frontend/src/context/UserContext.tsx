// UserContext.tsx
import  { createContext, useContext, useState } from "react";
import axios from "axios";
import { User, UserContextType, UserProviderProps } from "../types/IUser.types";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Custom hook to check if the user is an Admin
export const useIsAdmin = () => {
  const { user } = useUser();
  console.log("User from context:", user);
  return user?.role === "Admin";
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = async () => {
    try {
      // A backend logout végpont meghívása
      await axios.post("https://localhost:7204/logout");
      setUser(null);
      console.error("Logout succes:");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
