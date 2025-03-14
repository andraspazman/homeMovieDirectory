import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserContextType, UserProviderProps } from "../types/IUser.types";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Logout függvény: töröljük a token-t és állítsuk a user-t null-ra
  const logout = () => {
    localStorage.removeItem("jwt"); // vagy bármilyen más tárolt hitelesítési adat
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
