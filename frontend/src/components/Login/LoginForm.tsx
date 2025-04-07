import { useState } from "react";
import {Button,Input,VStack,FormControl,FormLabel,Modal,ModalOverlay,ModalContent,ModalHeader,ModalBody, ModalCloseButton,Text, Checkbox,} from "@chakra-ui/react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { useUser } from "../../context/UserContext";

const API_REGISTER_URL = "https://localhost:7204/users";


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

interface TokenPayload {
  sub: string;
  email: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
  iss: string;
  aud: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}: AuthModalProps) {
  const { setUser } = useUser();
  const [isRegistration, setIsRegistration] = useState(false);
  const [normalName, setNormalName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const clearFields = () => {
    setNormalName("");
    setNickname("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      const response = await axios.post(
        "https://localhost:7204/login",
        { email, password },
        { withCredentials: true }
      );
      const token = response.data.token;
      const decoded: TokenPayload = jwtDecode(token);
      console.log("Decoded token:", decoded);

      const role: "Admin" | "User" =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Admin"
          ? "Admin"
          : "User";

      const basicUserData = {
        id: decoded.sub,
        username: decoded.email,
        profilePicture: "",
        role: role,
      };

      setUser(basicUserData);

      const fullUserResponse = await axios.get(
        `https://localhost:7204/users/${decoded.email}`
      );
      setUser(fullUserResponse.data);

      // Ürítjük az input mezőket sikeres bejelentkezés után
      clearFields();

      onAuthSuccess();
      onClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Login failed");
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  const handleRegistration = async () => {
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
    if (/\d/.test(normalName)) {
      setErrorMessage("Normal name should not contain numbers!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage(
        "Invalid email format! Please use something@something.com"
      );
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long!");
      return;
    }
    if (!(/[a-z]/.test(password) && /[A-Z]/.test(password))) {
      setErrorMessage(
        "Password must contain both lowercase and uppercase letters!"
      );
      return;
    }

    try {
      await axios.post(
        API_REGISTER_URL,
        {
          normalName,
          email,
          password,
          nickname,
        },
        { withCredentials: true }
      );
      // Regisztráció után automatikusan bejelentkezünk:
      await handleLogin();

      // Sikeres regisztráció után ürítjük az input mezőket
      clearFields();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Registration failed"
        );
      } else {
        setErrorMessage("An unexpected error occurred");
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
            {isRegistration && (
              <FormControl>
                <FormLabel>Normal Name</FormLabel>
                <Input
                  type="text"
                  value={normalName}
                  onChange={(e) => setNormalName(e.target.value)}
                  placeholder="Enter your name"
                />
              </FormControl>
            )}
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </FormControl>
            <FormControl>
              <Checkbox
                isChecked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              >
                Show Password
              </Checkbox>
            </FormControl>
            {isRegistration && (
              <>
                <FormControl>
                  <FormLabel>Verify Password</FormLabel>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify password"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Nickname</FormLabel>
                  <Input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your nickname"
                  />
                </FormControl>
              </>
            )}
            {errorMessage && <Text color="red.500">{errorMessage}</Text>}
            <Button
              colorScheme="blue"
              onClick={isRegistration ? handleRegistration : handleLogin}
              width="full"
            >
              {isRegistration ? "Register" : "Login"}
            </Button>
            <Text fontSize="sm" textAlign="center">
              {isRegistration
                ? "Have an account?"
                : "Don't have an account?"}{" "}
              <Button
                variant="link"
                colorScheme="blue"
                onClick={() => {
                  setIsRegistration(!isRegistration);
                  setErrorMessage("");
                }}
              >
                {isRegistration ? "Login" : "Register"}
              </Button>
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}