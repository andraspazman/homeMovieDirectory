import { useEffect } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext";

export default function ProfileLoader() {
  const { setUser } = useUser();

  useEffect(() => {
    axios
      .get("https://localhost:7204/profile", { withCredentials: true })
      .then((response) => {
        console.log("Profile response:", response.data);
        setUser({
          username: response.data.email,
          profilePicture: "",
          role: response.data.role === "Admin" ? "Admin" : "User",
        });
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setUser(null);
      });
  }, [setUser]);

  return null; // no actual UI to render
}
