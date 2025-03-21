import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { Flex, Box } from "@chakra-ui/react";
import SelectedSeriesContentPane from "../components/SelectedContent/SelectedSeriesContentpane"; // az előbb létrehozott komponens

interface OutletContextType {
  isSidebarOpen: boolean;
}

const SelectedMoviePage = () => {
  const { isSidebarOpen } = useOutletContext<OutletContextType>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  return (
    <Flex>
      <Sidebar
        isOpen={isSidebarOpen}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        selectedCountries={selectedCountries}
        setSelectedCountries={setSelectedCountries}
      />

      <Box ml={isSidebarOpen ? "13%" : "2%"} p={1} flex="1" padding={10}>
        <SelectedSeriesContentPane></SelectedSeriesContentPane>
      </Box>
    </Flex>
  );
};

export default SelectedMoviePage;
