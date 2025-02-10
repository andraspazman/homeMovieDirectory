import { VStack, Heading } from "@chakra-ui/react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

export default function AuthPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  return (
    <VStack spacing={4} p={6} align="stretch" maxW="md" mx="auto">
      <Heading textAlign="center">Authentication</Heading>
      <LoginForm onLoginSuccess={onLoginSuccess} />
      <RegisterForm />
    </VStack>
  );
}
