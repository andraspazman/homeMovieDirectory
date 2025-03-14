import React, { useState } from "react";
import {Modal,ModalOverlay,ModalContent,ModalHeader,ModalCloseButton,ModalBody,ModalFooter,FormControl,FormLabel,Input,Button,Text,} from "@chakra-ui/react";
import axios from "axios";

type AddCharacterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  episodeId: string;
  personId: string;
  onCharacterAdded: (character: any) => void;
};

export const AddCharacterModal: React.FC<AddCharacterModalProps> = ({
  isOpen,
  onClose,
  episodeId,
  personId,
  onCharacterAdded,
}) => {
  
  const [characterName, setCharacterName] = useState("");
  const [role, setRole] = useState("");
  const [nickName, setNickName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        characterName,
        role,
        nickName,
        episodeId,
        personId,
      };
      const response = await axios.post(
        `https://localhost:7204/character/episode/${episodeId}`,
        payload
      );
      //*******************************     */  
      // Mivel a response.data nem tartalmazza a karaktert (persons tömb üres), kézzel készítünk egy új karakter objektumot:
      // *********************************************** */
      const newCharacter = {
        // Ideiglenes ID, ha nincs generált id a backendből
        id: 'temp-' + Date.now(),
        characterName,
        role,
        nickName,
      };
      onCharacterAdded(newCharacter);
      onClose();
    } catch (err) {
      console.error("Error adding character:", err);
      setError("Error at adding character.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add new character</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="characterName" mb={4} isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="character name"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
            />
          </FormControl>
          <FormControl id="role" mb={4}>
            <FormLabel>Role</FormLabel>
            <Input
              placeholder="character role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </FormControl>
          <FormControl id="nickName" mb={4}>
            <FormLabel>Nickname</FormLabel>
            <Input
              placeholder="nickname"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

