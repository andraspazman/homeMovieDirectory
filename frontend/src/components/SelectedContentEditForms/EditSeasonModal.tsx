// EditSeasonModal.tsx
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
  Text
} from "@chakra-ui/react";
import axios from "axios";
import { SeasonDTO } from "../../types/SeasonDTO";

interface EditSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: SeasonDTO;
  onSeasonUpdated: (updatedSeason: SeasonDTO) => void;
}

export const EditSeasonModal: React.FC<EditSeasonModalProps> = ({
  isOpen,
  onClose,
  season,
  onSeasonUpdated,
}) => {
  const [seasonNumber, setSeasonNumber] = useState<number>(season.seasonNumber);
  const [releaseYear, setReleaseYear] = useState<number>(season.releaseYear);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Szinkronizáljuk a komponens belső állapotát, ha a season prop változik
  useEffect(() => {
    setSeasonNumber(season.seasonNumber);
    setReleaseYear(season.releaseYear);
  }, [season]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // PATCH kérés a szerver felé, a season frissítéséhez
      const response = await axios.patch<SeasonDTO>(
        `https://localhost:7204/seasons/${season.id}`,
        {
          seasonNumber,
          releaseYear,
        }
      );
      onSeasonUpdated(response.data);
      onClose();
    } catch (err: any) {
      console.error("Error updating season:", err);
      setError("Failed to update season. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Season</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Season Number</FormLabel>
            <Input
              type="number"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(parseInt(e.target.value, 10))}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Release Year</FormLabel>
            <Input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(parseInt(e.target.value, 10))}
            />
          </FormControl>
          {error && <Text color="red.500" mt={2}>{error}</Text>}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={isLoading}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
