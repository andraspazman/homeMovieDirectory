import { Outlet } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import NavBar from "../components/Navbar/Navbar";
import AuthModal from "../components/Login/LoginForm";
import { useState, useEffect } from "react"; 
import { useDisclosure } from "@chakra-ui/react";
import { AddMediaModal } from "../components/AddContent/AddMediaForm";

export default function Layout() {
  const { setUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    isOpen: isAuthModalOpen,
    onOpen: onAuthModalOpen,
    onClose: onAuthModalClose,
  } = useDisclosure(); 

  const {
    isOpen: isAddMediaOpen,
    onOpen: onAddMediaOpen,
    onClose: onAddMediaClose,
  } = useDisclosure(); 

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(`https://localhost:7204/check`, {
        withCredentials: true,
      });
      console.log("Authentication successful", response.data);
    } catch (error) {
      console.error("Authentication failed", error);
      // 401 --> set user(null) 
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <NavBar
        onSettingsClick={() => {}}
        onEditProfileClick={() => {}}
        onFavouritesClick={() => {}}
        onLogoutClick={() => setUser(null)}
        toggleSidebar={toggleSidebar}
        onLoginClick={onAuthModalOpen} 
        onAddMediaClick={onAddMediaOpen}
      />
      {/* Az Outlet helyére kerül a dinamikus tartalom */}
      <Outlet context={{ isSidebarOpen }} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={onAuthModalClose}
        onAuthSuccess={checkAuth}
      />
      <AddMediaModal
        isOpen={isAddMediaOpen}
        onClose={onAddMediaClose}
      /> 
    </>
  );
}
