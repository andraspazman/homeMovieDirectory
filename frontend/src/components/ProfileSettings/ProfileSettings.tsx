import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useUser } from "../../context/UserContext";

const ProfileSettings: React.FC = () => {
  const { user, setUser } = useUser();
  const toast = useToast();

  // Állapot a megtekintés és szerkesztési módhoz
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Lokális állapot az űrlaphoz
  const [normalName, setNormalName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Amikor a komponens betöltődik vagy a user változik,
  // töltsük be a lokális állapotokat a user adataiból.
  useEffect(() => {
    if (user) {
      setNormalName(user.normalName ?? user.username); // Ha nincs normalName, a username legyen a fallback.
      setEmail(user.email ?? "");
      setNickname(user.nickname ?? "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await axios.put(
        `https://localhost:7204/users/${user.id}`,
        {
          normalName,
          email,
          nickname,
        },
        {
          headers: {
            password: password,
          },
        }
      );
      setUser(response.data);
      toast({
        title: "Profile updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile.",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Heading mb={4}>Profile Settings</Heading>
      {user && !isEditing && (
        <Box mb={4}>
          <Text>
            <strong>Name:</strong> {user.normalName ?? user.username}
          </Text>
          <Text>
            <strong>Email:</strong> {user.email}
          </Text>
          <Text>
            <strong>Nickname:</strong> {user.nickname || "-"}
          </Text>
          <Button mt={2} colorScheme="blue" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </Box>
      )}

      {isEditing && (
        <Box>
          <FormControl mb={3}>
            <FormLabel>Full Name</FormLabel>
            <Input
              value={normalName}
              onChange={(e) => setNormalName(e.target.value)}
              placeholder="Enter your full name"
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Nickname</FormLabel>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={loading}
            mr={3}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ProfileSettings;
