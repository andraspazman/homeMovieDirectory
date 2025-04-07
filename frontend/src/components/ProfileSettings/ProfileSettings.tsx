import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Image,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import useProfilePicture from "../../hooks/useProfilePicture";
import { useNavigate } from "react-router-dom";

const ProfileSettings: React.FC = () => {
  const { user, setUser, logout   } = useUser();
  const toast = useToast();
  const navigate = useNavigate();

  // Állapot a megtekintési és szerkesztési módhoz
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Lokális állapot az űrlaphoz
  const [normalName, setNormalName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [password, setPassword] = useState<string>(""); // Frissítéshez használt jelszó
  const [loading, setLoading] = useState<boolean>(false);

  // Új profilkép fájl állapota
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // A useProfilePicture hook-ot a user.id vagy user.email alapján hívjuk meg
  const profilePictureUrl = useProfilePicture({
    id: user?.id,
    email: user?.email,
  });

  // A Delete Profile modal kezeléséhez
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deletePassword, setDeletePassword] = useState<string>("");

  // A komponens mountolásakor lekérjük a felhasználó adatait egyszer
  useEffect(() => {
    if (user && user.email) {
      axios
        .get(`https://localhost:7204/users/${user.email}`)
        .then((response) => {
          const data = response.data;
          setUser(data);
          setNormalName(data.normalName || data.username);
          setEmail(data.email);
          setNickname(data.nickname || "");
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
    // Csak egyszer fusson le
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Szöveges adatok frissítése
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
      setUser({
        ...user,
        ...response.data,
      });
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

  // Kezeli a file input változását
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Feltölti az új profilképet az API segítségével
  const handlePictureUpload = async () => {
    if (!user?.id || !selectedFile) return;
    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("file", selectedFile);
    try {
      const response = await axios.put(
        "https://localhost:7204/users/profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUser({
        ...user,
        ...response.data,
      });
      toast({
        title: "Profile picture updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast({
        title: "Error updating profile picture.",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Profil törlésének kezelése a modalból
  const handleConfirmDeleteProfile = async () => {
  if (!user?.id) return;
  if (!deletePassword) {
    toast({
      title: "Please enter your password.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }
  setLoading(true);
  try {
    // Mentsük el az aktuális user ID-t, mert a logout után a user context null lesz.
    const userId = user.id;
    // Küldjük el a DELETE kérést a backendnek a megadott jelszóval.
    await axios.delete(`https://localhost:7204/users/${userId}`, {
      headers: {
        password: deletePassword,
      },
    });
    toast({
      title: "Profile deleted successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    // Először hívjuk meg a logout függvényt a kijelentkezéshez,
    // majd navigálunk a /home oldalra.
    navigate("/");
    await logout();
    onClose();
  } catch (error) {
    console.error("Error deleting profile:", error);
    toast({
      title: "Error deleting profile.",
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
    <Box
      p={4}
      mt="5%"
      maxW="600px"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      textAlign="center"
    >
      {user && !isEditing ? (
        <Flex direction="row" align="center" justify="center">
          {/* Bal oldal: profilkép és feltöltés */}
          <Flex direction="column" align="center" mr={4}>
            {profilePictureUrl && (
              <Image
                src={profilePictureUrl}
                alt="Profile Picture"
                boxSize="150px"
                objectFit="cover"
                borderRadius="full"
              />
            )}
            <FormControl mt={2} maxW="300px">
              <FormLabel>Upload New Profile Picture</FormLabel>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {selectedFile && (
                <Button mt={2} colorScheme="teal" onClick={handlePictureUpload}>
                  Upload Picture
                </Button>
              )}
            </FormControl>
          </Flex>
          {/* Jobb oldal: felhasználói adatok */}
          <Box textAlign="left">
            <Text>
              <strong>Name:</strong> {user.normalName || user.username}
            </Text>
            <Text>
              <strong>Email:</strong> {user.email}
            </Text>
            <Text>y
              <strong>Nickname:</strong> {user.nickname || "-"}
            </Text>
            <Button
              mt={2}
              colorScheme="blue"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile Data
            </Button>
            <Button
              mt={2}
              colorScheme="red"
              onClick={onOpen}  // Modal megnyitása a törléshez
            >
              Delete Profile
            </Button>
          </Box>
        </Flex>
      ) : (
        // Szerkesztési mód: csak a szöveges adatok módosítása
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

      {/* Delete Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Profile Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Please verify your password to delete your profile. This action cannot be undone.
            </Text>
            <FormControl>
              <FormLabel>Verify Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleConfirmDeleteProfile} isLoading={loading}>
              Delete Profile
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfileSettings;
