import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { Flex, Box } from "@chakra-ui/react";
import ProfileSettings from "../components/ProfileSettings/ProfileSettings";

// Ezt a típust te használod az useOutletContext-hez, hogy kiderüljön, nyitva van-e a sidebar
interface OutletContextType {
  isSidebarOpen: boolean;
}

const UserProfileSettings = () => {
  // Kivesszük a sidebar állapotát a contextből
  const { isSidebarOpen } = useOutletContext<OutletContextType>();

  // Ha van szükség extra state-re (pl. szűrők), itt is létrehozhatsz hasonlót,
  // mint a selectedGenres, selectedCountries stb.

  return (
    <Flex>
      {/* Sidebar komponens, ugyanaz, mint a MoviePage-nél */}
      <Sidebar
        isOpen={isSidebarOpen}
        // Ha nincsenek speciális propjaid itt, akár ki is hagyhatod
      />

      {/* Fő tartalomrész (statistics) */}
      <Box ml={isSidebarOpen ? "13%" : "2%"} p={1} flex="1" padding={10}>
        {/* Itt hívjuk meg az általad létrehozott StatisticsPane komponenst */}
        <ProfileSettings />
      </Box>
    </Flex>
  );
};

export default UserProfileSettings;
