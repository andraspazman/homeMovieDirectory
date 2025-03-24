import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { Flex, Box } from "@chakra-ui/react";
import SeriesGrid from "../components/Contentpane/Contentpane";

interface OutletContextType {
  isSidebarOpen: boolean;
}

const HomePage = () => {
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
        <SeriesGrid
          selectedGenres={selectedGenres}
          selectedDecades={selectedDecades}
        />
      </Box>
    </Flex>
  );
};

export default HomePage;
