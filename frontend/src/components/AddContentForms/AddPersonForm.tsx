// src/components/AddContent/AddPersonModal.tsx
import React, { useState } from "react";
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
  Select,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { PersonDTO } from "../../types/PersonDTO";

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  episodeId: string;
  onPersonAdded: (person: PersonDTO) => void;
}

interface AddPersonResponse {
  message: string;
  episode: {
    id: string;
    title: string;
    videoPath: string | null;
    isMovie: boolean;
    seasonId: string;
    persons: PersonDTO[];
  };
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  episodeId,
  onPersonAdded,
}) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [role, setRole] = useState("");
  const [awards, setAwards] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: Partial<PersonDTO> = { name, age, role, awards, gender };
      const response = await axios.post<AddPersonResponse>(`https://localhost:7204/episode/${episodeId}/person`, payload);
// Feltételezzük, hogy az új személy a tömb végén található:
      const newPerson = response.data.episode.persons[response.data.episode.persons.length - 1];
      onPersonAdded(newPerson);
      toast({
        title: "Person added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Clear form fields
      setName("");
      setAge(undefined);
      setRole("");
      setAwards("");
      setGender("");
      onClose();
    } catch (err) {
      console.error("Error adding person:", err);
      toast({
        title: "Error adding person",
        description: "An error occurred. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Person</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Age</FormLabel>
            <Input
              type="number"
              value={age !== undefined ? age : ""}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder="Enter age"
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Role</FormLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value)} placeholder="Select role">
              <option value="actor">Actor</option>
              <option value="actress">Actress</option>
              <option value="director">Director</option>
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Awards</FormLabel>
            <Input value={awards} onChange={(e) => setAwards(e.target.value)} placeholder="Enter awards" />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Gender</FormLabel>
            <Select value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Select gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
