import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import NavBar from "../components/Navbar/Navbar";
import HomePage from "../pages/HomePage";
import AuthModal from "../components/Login/LoginForm";
import { useState, useEffect } from "react"; 
import { useDisclosure } from "@chakra-ui/react";
import { AddMediaModal } from "../components/AddContent/AddMediaForm";

export default function Layout() {
  const { setUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // MODIFIED: Külön useDisclosure hook-ok a login és az új média modalhoz
  const {
    isOpen: isAuthModalOpen,
    onOpen: onAuthModalOpen,
    onClose: onAuthModalClose,
  } = useDisclosure(); //login modal

  const {
    isOpen: isAddMediaOpen,
    onOpen: onAddMediaOpen,
    onClose: onAddMediaClose,
  } = useDisclosure(); // new media modal

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const checkAuth = async () => {
    try {
      const response = await axios.get(`https://localhost:7204/check`, {
        withCredentials: true,
      });
      setUser(response.data);
      console.log("Authentication successful", response.data);
    } catch (error) {
      console.error("Authentication failed", error);
    }
  };

  // AuseEffect hook, hogy az oldal betöltésekor ellenőrizze az autentikációt
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <NavBar
        onSettingsClick={() => {}}
        onEditProfileClick={() => {}}
        onFavouritesClick={() => {}}
        onLogoutClick={() => {
          setUser(null);
        }}
        toggleSidebar={toggleSidebar}
        onLoginClick={onAuthModalOpen} 
        onAddMediaClick={onAddMediaOpen}
      />
      <Routes>
        <Route path="/" element={<HomePage isSidebarOpen={isSidebarOpen} />} />
      </Routes>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={onAuthModalClose}
        onAuthSuccess={checkAuth}
      />
      <AddMediaModal
        isOpen={isAddMediaOpen}
        onClose={onAddMediaClose}
      /> 
    </BrowserRouter>
  );
}
