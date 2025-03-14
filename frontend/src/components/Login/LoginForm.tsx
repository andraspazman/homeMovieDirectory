import { useState } from "react";
import {Button, Input, VStack, FormControl,FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Text,} from "@chakra-ui/react";
import axios from "axios";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const API_LOGIN_URL = "https://localhost:7204/login";
const API_REGISTER_URL = "https://localhost:7204/register";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}: AuthModalProps) {
  const [isRegistration, setIsRegistration] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async () => {
    try {
      await axios.post(
        API_LOGIN_URL,
        { email, password },
        { withCredentials: true }
      );
      onAuthSuccess();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Login failed");
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  const handleRegistration = async () => {
    // CHANGED: Hungarian text replaced with English
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await axios.post(
        API_REGISTER_URL,
        { email, password },
        { withCredentials: true }
      );
      onAuthSuccess();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Registration failed");
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isRegistration ? "Registration" : "Login"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            {isRegistration && (
              <FormControl>
                <FormLabel>Verify password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </FormControl>
            )}
            <Button
              colorScheme="blue"
              onClick={isRegistration ? handleRegistration : handleLogin}
              width="full"
            >
              {isRegistration ? "Registration" : "Login"}
            </Button>
            <Text fontSize="sm" textAlign="center">
              {isRegistration
                ? "Have an account?"
                : "Don't have an account?"}{" "}
              <Button
                variant="link"
                colorScheme="blue"
                onClick={() => setIsRegistration(!isRegistration)}
              >
                {isRegistration ? "Login" : "Registration"}
              </Button>
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}