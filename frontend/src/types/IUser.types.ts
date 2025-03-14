

export interface User {
    username: string;
    profilePicture: string;
    role: "user" | "admin";
}

export interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export interface UserProviderProps {
    children: React.ReactNode;
}