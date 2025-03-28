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
  Progress,
  Textarea,
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
  const [title, setTitle] = useState(episode.title);
  const [file, setFile] = useState<File | null>(null);
  // Új state a feltöltési előrehaladás nyomon követésére
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    setTitle(episode.title);
    setFile(null);
    setUploadProgress(0);
  }, [episode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("Title", title);
      // Az isMovie értékét mindig false-ra állítjuk
      formData.append("IsMovie", "false");
      if (file) {
        formData.append("newVideoFile", file);
      }

      const response = await axios.put<EpisodeDTO>(
        `https://localhost:7204/episode/${episode.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? 1;
            const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
            setUploadProgress(percentCompleted);
          },
        }
      );

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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Video File</FormLabel>
            <Input type="file" accept="video/mp4,video/*" onChange={handleFileChange} />
          </FormControl>
          {file && uploadProgress > 0 && uploadProgress < 100 && (
            <Progress value={uploadProgress} size="sm" colorScheme="blue" mb={3} />
          )}
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
