import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import { Flex, Box } from "@chakra-ui/react";
import ContentPane from "../components/Contentpane/SeriesMoviesContentpane";

interface OutletContextType {
  isSidebarOpen: boolean;
}

const MoviePage = () => {
  const { isSidebarOpen } = useOutletContext<OutletContextType>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  // Új state az évtized-szűréshez
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);

  return (
    <Flex>
      <Sidebar
        isOpen={isSidebarOpen}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        // Itt a selectedDecades-et adod át, nem a selectedCountries-t!
        selectedDecades={selectedDecades}
        setSelectedDecades={setSelectedDecades}
      />

      <Box ml={isSidebarOpen ? "13%" : "2%"} p={1} flex="1" padding={10}>
        <ContentPane
          selectedGenres={selectedGenres}
          // Ha a ContentPane interfésze már módosítva van és tartalmazza a selectedDecades-et, add át:
          selectedDecades={selectedDecades}
          // Ha szükséges, a régi selectedCountries-t most üres tömbbel helyettesítheted:
          selectedCountries={[]}
        />
      </Box>
    </Flex>
  );
};

export default MoviePage;
