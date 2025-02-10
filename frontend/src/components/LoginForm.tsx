import { useState } from "react";
import { Button, Input, VStack, FormControl, FormLabel, Box, Heading, Card, CardBody } from "@chakra-ui/react";
import axios from "axios";

const API_BASE_URL = "https://localhost:7204/login";

export default function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await axios.post(
        API_BASE_URL,
        { email, password },
        { withCredentials: true }
      );
      //alert("Login successful!");
      onLoginSuccess();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Login failed");
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <Box 
      height="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      backgroundColor="gray.100"
    >
      <Card width="400px" shadow="lg" borderRadius="md" backgroundColor="white">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading textAlign="center" size="lg">Login</Heading>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button colorScheme="blue" onClick={handleLogin} width="full">
              Login
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
