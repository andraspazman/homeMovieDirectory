import React, { useEffect, useState } from "react";
import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalCloseButton, ModalBody, ModalFooter, 
  Button, FormControl, FormLabel, Input 
} from "@chakra-ui/react";
import axios from "axios";
import { SeriesDTO } from "../../types/SeriesDTO";

interface EditSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: SeriesDTO; // a kiválasztott series adatai
  onSeriesUpdated: (updated: SeriesDTO) => void;
}

export const EditSeriesModal: React.FC<EditSeriesModalProps> = ({ isOpen, onClose, series, onSeriesUpdated }) => {
  const [title, setTitle] = useState(series.title);
  const [genre, setGenre] = useState(series.genre);
  const [releaseYear, setReleaseYear] = useState<number>(series.releaseYear);
  const [description, setDescription] = useState(series.description);

  useEffect(() => {
    // Ha a modal megnyitásakor betöltjük a series adatait
    setTitle(series.title);
    setGenre(series.genre);
    setReleaseYear(series.releaseYear);
    setDescription(series.description);
  }, [series]);

  const handleUpdate = async () => {
    try {
      // PUT /series/{id}
      const updateData = {
        title,
        genre,
        releaseYear,
        description
      };
      const response = await axios.put<SeriesDTO>(
        `https://localhost:7204/series/${series.id}`, 
        updateData
      );
      onSeriesUpdated(response.data);
      onClose();
    } catch (err) {
      console.error("Error updating series:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Series</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Genre</FormLabel>
            <Input value={genre} onChange={(e) => setGenre(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Release Year</FormLabel>
            <Input 
              type="number"
              value={releaseYear} 
              onChange={(e) => setReleaseYear(parseInt(e.target.value))}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleUpdate}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
