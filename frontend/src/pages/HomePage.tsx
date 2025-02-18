import { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { Flex, Box } from "@chakra-ui/react";
import SeriesGrid from "../components/Contentpane/Contentpane";

interface HomePageProps {
  isSidebarOpen: boolean;
}

const HomePage = ({ isSidebarOpen }: HomePageProps) => {
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

      <Box
        ml={isSidebarOpen ? "13%" : "2%"} p={1} flex="1" padding={10}
      >
        <SeriesGrid
          selectedGenres={selectedGenres}
          selectedCountries={selectedCountries}
        />
      </Box>
    </Flex>
  );
};

export default HomePage;
