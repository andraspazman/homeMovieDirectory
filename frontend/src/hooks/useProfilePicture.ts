import { useState, useEffect } from "react";
import axios from "axios";

interface ProfilePictureParams {
  id?: string;
  email?: string;
}

const useProfilePicture = ({ id, email }: ProfilePictureParams) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  // Első useEffect: ha van id, akkor azt használjuk, ha nincs, akkor email alapján lekérjük az id-t.
  useEffect(() => {
    if (id) {
      setUserId(id);
    } else if (email) {
      axios
        .get(`https://localhost:7204/api/Users/${email}`)
        .then((response) => {
          if (response.data && response.data.id) {
            setUserId(response.data.id);
          }
        })
        .catch((err) => {
          console.error("Error fetching user by email:", err);
        });
    }
  }, [id, email]);

  // Második useEffect: ha rendelkezésre áll a userId, akkor lekéri a profilkép URL-t.
  useEffect(() => {
    if (userId) {
      axios
        .get(`https://localhost:7204/users/profile-picture?userId=${userId}`, {
          responseType: "blob",
          headers: { accept: "image/png" },
        })
        .then((response) => {
          const url = URL.createObjectURL(response.data);
          setImageUrl(url);
        })
        .catch((err) => {
          console.error("Error fetching profile picture:", err);
        });
    }
  }, [userId]);

  return imageUrl;
};

export default useProfilePicture;
