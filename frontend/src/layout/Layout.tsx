import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import NavBar from "../components/Navbar/Navbar";
import HomePage from "../pages/HomePage";
import AuthModal from "../components/Login/LoginForm";
import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";

export default function Layout() {
  const { setUser } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();


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
        onLoginClick={onOpen} 
      />
      <Routes>
        <Route path="/" element={<HomePage isSidebarOpen={isSidebarOpen} />} />
      </Routes>
      <AuthModal isOpen={isOpen} onClose={onClose} onAuthSuccess={checkAuth} />
    </BrowserRouter>
  );
}
