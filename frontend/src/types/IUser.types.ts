// IUser.types.ts
export interface User {
    username: string;
    profilePicture: string;
    role: "User" | "Admin";
}

export interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>; // hogy aszinkron legyen
}

export interface UserProviderProps {
    children: React.ReactNode;
}
