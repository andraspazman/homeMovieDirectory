import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Progress,
} from "@chakra-ui/react";
import axios from "axios";
import { EpisodeDTO } from "../../types/EpisodeDTO";

interface AddEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  seasonId: string;
  onEpisodeAdded: (episode: EpisodeDTO) => void;
}

export const AddEpisodeModal: React.FC<AddEpisodeModalProps> = ({
  isOpen,
  onClose,
  seasonId,
  onEpisodeAdded,
}) => {
  const [episodeNumber, setEpisodeNumber] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  // Új state a feltöltési előrehaladás nyomon követésére
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const num = Number(episodeNumber);
    if (!episodeNumber || isNaN(num) || num <= 0) {
      setError("Please enter a valid episode number");
      setLoading(false);
      return;
    }

    const fullTitle = `EP${num}: ${title}`;

    try {
      const formData = new FormData();
      formData.append("title", fullTitle);
      formData.append("SeasonId", seasonId);
      formData.append("IsMovie", "false");
      if (file) {
        formData.append("videoFile", file);
      }

      const response = await axios.post(
        "https://localhost:7204/episode",
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

      onEpisodeAdded(response.data.episode);
      setEpisodeNumber("");
      setTitle("");
      setFile(null);
      onClose();
    } catch (err: any) {
      console.error("Error adding episode:", err);
      setError("Failed to add episode.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Episode</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Episode Number</FormLabel>
            <Input
              type="number"
              placeholder="Episode Number"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="Episode Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Video File</FormLabel>
            <Input
              type="file"
              accept="video/mp4,video/*"
              onChange={handleFileChange}
            />
          </FormControl>
          {/* Megjelenítjük a feltöltési csíkot, ha van file és folyamatban van a feltöltés */}
          {file && loading && uploadProgress < 100 && (
            <Progress value={uploadProgress} size="sm" colorScheme="blue" mb={3} />
          )}
          {error && <Text color="red.500">{error}</Text>}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose} ml={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
