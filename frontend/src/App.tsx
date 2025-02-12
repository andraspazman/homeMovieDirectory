import React, { useState, useEffect } from "react";
import { Flex, Box } from "@chakra-ui/react";
import axios from "axios";
import { BASE_URL } from "./constant";
/*
import TopBar from "./components/TopBar";
import SideNav from "./components/SideNavigation";
import SeriesGrid from "./components/SeriesGrid";
*/
import AuthPage from "./pages/AuthPage";
import NavBar from "./components/Navbar/Navbar";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);


  useEffect(() => {
    checkAuth();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const checkAuth = async () => {
    try {
      await axios.get('https://localhost:7204/check', { withCredentials: true });
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = () => {
    setIsLoading(true);
    axios.get(`${BASE_URL}series`)
      .then((response) => {
        // A SeriesGrid saját maga szerzi be az adatokat.
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  if (!isAuthenticated) return <AuthPage onLoginSuccess={checkAuth} />;

  return (
    <Flex>
      
    
      
      <Box flex="1" ml={isSidebarOpen ? "0px" : "0"}>
      <NavBar userName={""} onSettingsClick={function (): void {
        throw new Error("Function not implemented.");
      } } onEditProfileClick={function (): void {
        throw new Error("Function not implemented.");
      } } onFavouritesClick={function (): void {
        throw new Error("Function not implemented.");
      } } onLogoutClick={function (): void {
        throw new Error("Function not implemented.");
      } }></NavBar>
      </Box>
    </Flex>
    /*
      {isSidebarOpen && <SideNav />}
    */
  );
}

export default App;
