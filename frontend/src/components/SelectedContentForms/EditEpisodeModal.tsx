import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import axios from "axios";
import { EpisodeDTO } from "../../types/EpisodeDTO";

interface EditEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: EpisodeDTO; // A szerkesztendő epizód adatai
  onEpisodeUpdated: (updatedEpisode: EpisodeDTO) => void;
}

export const EditEpisodeModal: React.FC<EditEpisodeModalProps> = ({
  isOpen,
  onClose,
  episode,
  onEpisodeUpdated,
}) => {
  // Az űrlapmezők állapota: epizód címe és opcionális videofájl
  const [title, setTitle] = useState(episode.title);
  const [file, setFile] = useState<File | null>(null);

  // Amikor az episode prop változik, frissítjük az űrlap értékét
  useEffect(() => {
    setTitle(episode.title);
    setFile(null);
  }, [episode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    try {
      // Készítünk egy FormData objektumot a videofájl és a többi mező elküldéséhez
      const formData = new FormData();
      formData.append("Title", title);
      // Az isMovie értékét mindig false-ra állítjuk
      formData.append("IsMovie", "false");
      if (file) {
        formData.append("newVideoFile", file);
      }

      // PUT kérés a /episode/{id} végpontra
      const response = await axios.put<EpisodeDTO>(
        `https://localhost:7204/episode/${episode.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Sikeres frissítés után értesítjük a parent komponensét
      onEpisodeUpdated(response.data);
      onClose();
    } catch (error) {
      console.error("Error updating episode:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Episode</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Video File</FormLabel>
            <Input type="file" onChange={handleFileChange} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleUpdate}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
