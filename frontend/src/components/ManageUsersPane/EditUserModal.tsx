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
  Switch,
  Select,
} from "@chakra-ui/react";
import axios from "axios";

interface User {
  id: string;
  normalName: string;
  email: string;
  isActive: boolean;
  role: string;
  imageId?: string | null;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: (updatedUser: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}) => {
  const [localIsActive, setLocalIsActive] = useState<boolean>(false);
  const [localRole, setLocalRole] = useState<string>("");

  useEffect(() => {
    if (user) {
      setLocalIsActive(user.isActive);
      setLocalRole(user.role);
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const response = await axios.put<User>(`https://localhost:7204/users/status/${user.id}`, {
        isActive: localIsActive,
        role: localRole,
      });
      onUserUpdated(response.data);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      // Itt érdemes lehet toast üzenettel jelezni a hibát.
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {user && (
            <>
              <FormControl mb={4}>
                <FormLabel>Active</FormLabel>
                <Switch
                  isChecked={localIsActive}
                  onChange={(e) => setLocalIsActive(e.target.checked)}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Role</FormLabel>
                <Select
                  value={localRole}
                  onChange={(e) => setLocalRole(e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  {/* További role-ok, ha szükséges */}
                </Select>
              </FormControl>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditUserModal;
