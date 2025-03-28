// IUser.types.ts
export interface User {
    id: string;
    username: string;
    profilePicture: string;
    role: "User" | "Admin";
    normalName?: string;
    email?: string;
    nickname?: string;
}

export interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>; // hogy aszinkron legyen
}

export interface UserProviderProps {
    children: React.ReactNode;
}
