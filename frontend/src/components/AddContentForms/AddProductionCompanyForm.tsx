import React, { useState, useEffect } from "react";
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
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { ProductionCompanyDTO } from "../../types/ProductionCompanyDTO";

interface AddProductionCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  episodeId: string;
  onProductionCompanyAdded: (newCompany: ProductionCompanyDTO) => void;
}

const AddProductionCompanyModal: React.FC<AddProductionCompanyModalProps> = ({
  isOpen,
  onClose,
  episodeId,
  onProductionCompanyAdded,
}) => {
  const [name, setName] = useState("");
  const [foundationYear, setFoundationYear] = useState<number | string>("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Reset form fields when modal is closed
    if (!isOpen) {
      setName("");
      setFoundationYear("");
      setCountry("");
      setWebsite("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        foundationYear: Number(foundationYear),
        country,
        website,
      };
      const response = await axios.post<ProductionCompanyDTO>(
        `https://localhost:7204/episode/${episodeId}/productioncompany`,
        payload
      );
      // Biztosítjuk, hogy az id és website mindig definiált legyen
      const newCompany: ProductionCompanyDTO = {
        id: response.data.id || "generated-id", // fallback, ha nincs id
        name: response.data.name,
        website: response.data.website || "n/a",
      };
      onProductionCompanyAdded(newCompany);
      toast({
        title: "Production company added",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error("Error adding production company:", error);
      toast({
        title: "Error adding production company",
        description: "Please try again.",
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
        <ModalHeader>Add Production Company</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Name</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter company name"
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Foundation Year</FormLabel>
            <Input
              type="number"
              value={foundationYear || ""}
              onChange={(e) => setFoundationYear(e.target.value)}
              placeholder="Enter foundation year"
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Country</FormLabel>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter country"
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Website</FormLabel>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Enter website"
            />
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

export default AddProductionCompanyModal;
