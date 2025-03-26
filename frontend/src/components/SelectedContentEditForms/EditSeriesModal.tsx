import React, { useEffect, useState } from "react";
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
  Textarea, 
  useToast,
  Select
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
  // Új state a cover image fájlhoz
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const toast = useToast();

  // Statikus opciók a lenyíló listákhoz
  const genreOptions = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(new Array(50), (_, i) => currentYear - i);

  useEffect(() => {
    // Frissítjük a mezőket, ha a series adat változik
    setTitle(series.title);
    setGenre(series.genre);
    setReleaseYear(series.releaseYear);
    setDescription(series.description);
    setCoverImage(null); // reset, ha újra megnyitják
  }, [series]);

  const handleUpdate = async () => {
    try {
      // Létrehozunk egy FormData objektumot, amely tartalmazza a módosított adatokat
      const formData = new FormData();
      formData.append("title", title);
      formData.append("genre", genre);
      formData.append("releaseYear", releaseYear.toString());
      formData.append("description", description);
      
      // Ha van kiválasztott új cover image, akkor azt is csatoljuk
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      
      // A backend update endpointját hívjuk, amely multipart/form-data formátumot vár
      const response = await axios.put<SeriesDTO>(
        `https://localhost:7204/series/${series.id}`, 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onSeriesUpdated(response.data);
      toast({
        title: "Series updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (err) {
      console.error("Error updating series:", err);
      toast({
        title: "Error updating series",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
            <Select value={genre} onChange={(e) => setGenre(e.target.value)}>
              {genreOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Release Year</FormLabel>
            <Select value={releaseYear} onChange={(e) => setReleaseYear(parseInt(e.target.value))}>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Cover Image</FormLabel>
            <Input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setCoverImage(e.target.files[0]);
                }
              }}
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
