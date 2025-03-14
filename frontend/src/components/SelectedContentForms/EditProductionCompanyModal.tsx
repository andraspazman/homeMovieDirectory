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

interface EditProductionCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  productionCompany: ProductionCompanyDTO;
  onProductionCompanyUpdated: (updatedCompany: ProductionCompanyDTO) => void;
}

const EditProductionCompanyModal: React.FC<EditProductionCompanyModalProps> = ({
  isOpen,
  onClose,
  productionCompany,
  onProductionCompanyUpdated,
}) => {
  const [name, setName] = useState(productionCompany.name);
  const [foundationYear, setFoundationYear] = useState<number | string>(
    productionCompany.foundationYear ?? ""
  );
  const [country, setCountry] = useState(productionCompany.country);
  const [website, setWebsite] = useState(productionCompany.website);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (productionCompany) {
      setName(productionCompany.name);
      setFoundationYear(productionCompany.foundationYear ?? "");
      setCountry(productionCompany.country);
      setWebsite(productionCompany.website);
    }
  }, [productionCompany]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        id: productionCompany.id,
        name,
        foundationYear: Number(foundationYear),
        country,
        website,
      };
      const response = await axios.put<ProductionCompanyDTO>(
        `https://localhost:7204/api/ProductionCompany/${productionCompany.id}`,
        payload
      );
      onProductionCompanyUpdated(response.data);
      toast({
        title: "Production company updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error("Error updating production company:", error);
      toast({
        title: "Error updating production company",
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
        <ModalHeader>Edit Production Company</ModalHeader>
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
              value={foundationYear}
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

export default EditProductionCompanyModal;
