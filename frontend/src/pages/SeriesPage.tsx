import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { Flex, Box } from "@chakra-ui/react";
import ContentPane from "../components/Contentpane/SeriesMoviesContentpane";

interface OutletContextType {
  isSidebarOpen: boolean;
}

const SeriesPage = () => {
  const { isSidebarOpen } = useOutletContext<OutletContextType>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);

  return (
    <Flex>
      <Sidebar
        isOpen={isSidebarOpen}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        selectedDecades={selectedDecades}
        setSelectedDecades={setSelectedDecades}
      />

      <Box ml={isSidebarOpen ? "13%" : "2%"} p={1} flex="1" padding={10}>
        <ContentPane
          selectedGenres={selectedGenres}
          selectedDecades={selectedDecades}
          selectedCountries={[]}  // Ha a ContentPane interfész még tartalmazza a selectedCountries-et, ide üres tömböt adunk át
        />
      </Box>
    </Flex>
  );
};

export default SeriesPage;
