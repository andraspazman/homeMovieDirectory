import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  SimpleGrid, Box, Image, Text, Skeleton, SkeletonText, GridItem, 
  Flex, HStack, Select, Button 
} from "@chakra-ui/react";
import styles from "./Contentpane.module.scss";

// Kiterjesztett típusdefiníció
interface Item {
  id: string;
  title: string;
  genre: string;
  coverImagePath: string;
  description: string;
  language: string;
  releaseYear: number;
  isMovie: boolean;
}

interface ContentPaneProps {
  selectedGenres: string[];
  selectedCountries: string[];
  selectedDecades: string[];
}

const ContentPane = ({ selectedGenres, selectedCountries, selectedDecades }: ContentPaneProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Lokális szűrési állapotok
  const [filterLanguage, setFilterLanguage] = useState<string>("");
  const [filterGenre, setFilterGenre] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>(""); 
  const [orderBy, setOrderBy] = useState<string>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Endpoint kiválasztása
  let endpoint = "";
  if (location.pathname.includes("movies")) {
    endpoint = "https://localhost:7204/movie";
  } else if (location.pathname.includes("series")) {
    endpoint = "https://localhost:7204/series";
  } else {
    endpoint = "https://localhost:7204/series";
  }

  useEffect(() => {
    setLoading(true);
    axios.get<Item[]>(endpoint)
      .then((response) => {
        setItems(response.data);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Error loading data.");
        setLoading(false);
      });
  }, [endpoint]);

  // Generáljuk a release year opciókat (jelenlegi évtől 1900-ig)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 1900; y--) {
    yearOptions.push(<option key={y} value={y}>{y}</option>);
  }

  // Lehetőségek listája a Language és Genre szűréshez
  const languages = ["english", "hungarian", "french", "spanish", "german", "italian", "japanese", "chinese"];
  const genres = ["action", "comedy", "drama", "horror", "animation", "sci-fi", "documentary", "thriller"];

  // Szűrés különböző feltételek alapján
  const filteredItems = items.filter((item) => {
    const genreMatch =
      (selectedGenres.length === 0 || selectedGenres.includes(item.genre)) &&
      (filterGenre === "" || item.genre === filterGenre);
    const countryMatch =
      selectedCountries.length === 0 || selectedCountries.includes(item.description);
    const languageMatch =
      filterLanguage === "" || item.language === filterLanguage;
    const yearMatch =
      filterYear === "" || String(item.releaseYear) === filterYear;
    const decadeMatch =
      selectedDecades.length === 0 ||
      selectedDecades.some((decadeRange) => {
        const [upper, lower] = decadeRange.split('-').map(Number);
        return item.releaseYear <= upper && item.releaseYear >= lower;
      });

    if (location.pathname.includes("movies")) {
      return item.isMovie === true && genreMatch && countryMatch && languageMatch && yearMatch && decadeMatch;
    }
    return genreMatch && countryMatch && languageMatch && yearMatch && decadeMatch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    return orderBy === "desc" ? b.releaseYear - a.releaseYear : a.releaseYear - b.releaseYear;
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const currentItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <SimpleGrid columns={[5]} spacing={2} className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Box key={index} className={styles.skeletonBox}>
            <Skeleton className={styles.skeletonImage} />
            <Box className={styles.skeletonContent}>
              <SkeletonText className={styles.skeletonText} noOfLines={2} />
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    );
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  const detailRoutePrefix = location.pathname.includes("movies") ? "/movie" : "/series";

  // Reset a szűrők alaphelyzetbe állításához
  const resetFilters = () => {
    setFilterLanguage("");
    setFilterGenre("");
    setFilterYear("");
    setOrderBy("desc");
  };

  return (
    <>
      {/* Filter Panel */}
      <Flex justifyContent="center" mb={4}>
        <HStack spacing={4} paddingTop="2%">
          <Select 
            placeholder="Language" 
            value={filterLanguage} 
            onChange={(e) => setFilterLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </Select>
          <Select 
            placeholder="Genre" 
            value={filterGenre} 
            onChange={(e) => setFilterGenre(e.target.value)}
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </option>
            ))}
          </Select>
          <Select 
            placeholder="Year" 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
          >
            {yearOptions}
          </Select>
          <Select 
            placeholder="Order by Year" 
            value={orderBy} 
            onChange={(e) => setOrderBy(e.target.value)}
            maxW="200px"
          >
            <option value="desc">Year Descending</option>
            <option value="asc">Year Ascending</option>
          </Select>
          <Button onClick={resetFilters} colorScheme="red" variant="outline" pl={"10%"} pr={"10%"}>
            Reset Filters
          </Button>
        </HStack>
      </Flex>

      {/* Grid megjelenítés */}
      <SimpleGrid rowGap={0} spacing={5} columns={[5]} className={styles.grid}>
        {currentItems.map((item) => (
          <GridItem 
            key={item.id} 
            className={styles.gridItem} 
            onClick={() => navigate(`${detailRoutePrefix}/${item.id}`)}
            cursor="pointer"
          >
            <Image
              src={`https://localhost:7204/images/${item.coverImagePath}`}
              alt={item.title}
              className={styles.image}
            />
            <Box className={styles.infoBox}>
              <Text className={styles.title}>{item.title}</Text>
              <Text className={styles.genre}>{item.genre}</Text>
            </Box>
          </GridItem>
        ))}
      </SimpleGrid>

      {/* Pagination Controls */}
      <Flex justifyContent="center" alignItems="center" mt={4} pb="2%">
        <Button 
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          mr={4}
        >
          Previous
        </Button>
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <Button 
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          ml={4}
        >
          Next
        </Button>
      </Flex>
    </>
  );
};

export default ContentPane;
