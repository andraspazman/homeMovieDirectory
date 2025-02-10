import { VStack, Box, Link } from "@chakra-ui/react";

export default function SideNav() {
  return (
    <Box 
      position="fixed" 
      top="60px" // A TopBar alá kerül
      left="0" 
      width="250px" 
      height="calc(100vh - 60px)" // A teljes képernyő magassága mínusz a TopBar
      bg="gray.800" 
      color="white" 
      p={5}
    >
      <VStack spacing={4} align="stretch">
        <Link href="#" _hover={{ color: "blue.300" }}>Home</Link>
        <Link href="#" _hover={{ color: "blue.300" }}>My List</Link>
        <Link href="#" _hover={{ color: "blue.300" }}>Genres</Link>
        <Link href="#" _hover={{ color: "blue.300" }}>Settings</Link>
      </VStack>
    </Box>
  );
}
