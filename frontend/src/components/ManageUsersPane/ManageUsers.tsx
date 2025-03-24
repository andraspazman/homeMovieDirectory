import React, { useEffect, useState } from "react";
import {Box,Heading,Table,Thead,Tbody, Tr, Th,Td, Spinner,Text,TableContainer,Image,Button,Flex,Input,useToast,} from "@chakra-ui/react";
import axios from "axios";
import EditUserModal from "../ManageUsersPane/EditUserModal"; // igazítsd az elérési utat
import { FilePenLine } from "lucide-react";

interface User {
  id: string;
  normalName: string;
  email: string;
  isActive: boolean;
  role: string;
  imageId?: string | null;
}

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const toast = useToast();

  // Kereső állapota
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Paginációs állapotok
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Szűrés: keresés név és email alapján (kis-nagybetű érzéketlen)
  const filteredUsers = users.filter((user) =>
    user.normalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Állapot az aktuálisan szerkesztendő felhasználóhoz és a modal megnyitásához
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get<User[]>("https://localhost:7204/users", {
        headers: { accept: "application/json" },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Error fetching users");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Amikor a keresőmező értéke változik, visszaállítjuk az oldalszámot 1-re
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setIsEditModalOpen(false);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    toast({
      title: "User updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <Box p={4}>
        <Spinner size="xl" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box pt={10}>
      <Heading mb={4}>Manage Users</Heading>
      
      {/* Keresőmező */}
      <Box mb={4} pt={5} pr={"5%"} pl={"5%"} >
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Profile</Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Active</Th>
              <Th>Role</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedUsers.map((user) => (
              <Tr key={user.id}>
                <Td>
                  {user.imageId ? (
                    <Image
                      src={`https://localhost:7204/users/profile-picture?userId=${user.id}`}
                      alt={`${user.normalName}'s profile`}
                      boxSize="40px"
                      borderRadius="full"
                      objectFit="cover"
                    />
                  ) : (
                    <Box
                      boxSize="40px"
                      borderRadius="full"
                      bg="gray.300"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="sm" color="white">
                        {user.normalName.charAt(0)}
                      </Text>
                    </Box>
                  )}
                </Td>
                <Td>{user.normalName}</Td>
                <Td>{user.email}</Td>
                <Td>{user.isActive ? "Yes" : "No"}</Td>
                <Td>{user.role}</Td>
                <Td>
                  <Button
                    size="xs"
                    color="orange"
                    pl={4}
                    onClick={() => openEditModal(user)}
                    colorScheme="white"
                  >
                    <FilePenLine size={17} />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Flex justifyContent="space-between" alignItems="center" mt={5} pr="35%" pl="30%">
        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </Flex>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Box>
  );
};

export default ManageUsers;
