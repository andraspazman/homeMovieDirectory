import { useState, useEffect } from "react";
import axios from "axios";

const useProfilePicture = (userId: string) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  useEffect(() => {
    axios
      .get(`https://localhost:7204/users/profile-picture?userId=${userId}`, {
        responseType: "blob",
        headers: { accept: "image/png" }
      })
      .then((response) => {
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      })
      .catch((err) => {
        console.error("Error fetching profile picture:", err);
      });
  }, [userId]);
  return imageUrl;
};

export default useProfilePicture;
