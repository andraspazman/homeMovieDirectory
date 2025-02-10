import { useState } from "react";
import { Button, Input, VStack, FormControl, FormLabel } from "@chakra-ui/react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE_URL}/register`, { email, password });
      alert("Registration successful! You can now log in.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Registration failed");
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormControl>
      <Button colorScheme="green" onClick={handleRegister}>Register</Button>
    </VStack>
  );
}
