import { Flex, Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "./constant";
import { Series } from "./types/series";
import TopBar from "./components/TopBar";
import SideNav from "./components/SideNavigation";
import SeriesGrid from "./components/SeriesGrid";
import AuthPage from "./pages/AuthPage";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Kezdő állapot: nyitva
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Sidebar állapotának váltása
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
    // Itt megírhatod a kijelentkezést (pl. cookie törlés)
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = () => {
    setIsLoading(true);
    axios.get(`${BASE_URL}series`)
      .then((response) => {
        // Itt nem kell a data prop, a SeriesGrid az adatokat magától szerzi be.
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  if (!isAuthenticated) return <AuthPage onLoginSuccess={checkAuth} />;

  return (
    <Flex>
      {/* Sidebar feltételes megjelenítése */}
      {isSidebarOpen && <SideNav />}
      {/* Tartalom doboz - ha a sidebar nyitva van, toljuk arrébb */}
      <Box flex="1" ml={isSidebarOpen ? "250px" : "0"}>
        <TopBar onToggleSidebar={toggleSidebar} isAuthenticated={isAuthenticated} onSignOut={signOut} />
        {/* Ide jön a fő tartalom */}
        <SeriesGrid isLoading={isLoading} isAuthenticated={isAuthenticated} />
      </Box>
    </Flex>
  );
}

export default App;
