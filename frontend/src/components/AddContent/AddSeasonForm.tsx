import React, { useState } from "react";
import {Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormLabel,Input,} from "@chakra-ui/react";
import axios from "axios";
import { SeasonDTO } from "../../types/SeasonDTO";

interface AddSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId: string;
  onSeasonAdded: (season: SeasonDTO) => void;
}

export const AddSeasonModal: React.FC<AddSeasonModalProps> = ({
  isOpen,
  onClose,
  seriesId,
  onSeasonAdded,
}) => {
  // Az űrlap mezők állapota
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [releaseYear, setReleaseYear] = useState<number>(2023);

  const handleSubmit = async () => {
    try {
      // Készítünk egy objektumot a backend által várttal megegyező adatszerkezettel.
      // Az EpisodeCount-ot nem küldjük, mert az számított érték.
      const seasonData = {
        seasonNumber: seasonNumber,
        releaseYear: releaseYear,
      };

      // POST kérés a /seasons/addtoseries/{seriesId} végpontra
      const response = await axios.post<SeasonDTO>(
        `https://localhost:7204/seasons/addtoseries/${seriesId}`,
        seasonData
      );
      // A sikeres válasz után meghívjuk a callback-et a parent komponens felé,
      // hogy frissítsük az évadok listáját
      onSeasonAdded(response.data);
      // űrlap alaphelyzetbe állítása, majd a modál bezárása
      setSeasonNumber(1);
      setReleaseYear(2023);
      onClose();
    } catch (error) {
      console.error("Error adding season:", error);
      // Hibakezelést itt kiegészítheted (pl. hibaüzenet megjelenítése)
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Season</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Season Number</FormLabel>
            <Input
              type="number"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(Number(e.target.value))}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Release Year</FormLabel>
            <Input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(Number(e.target.value))}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
