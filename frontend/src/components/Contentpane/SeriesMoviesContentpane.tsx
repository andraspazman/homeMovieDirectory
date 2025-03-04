import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"; //MOD: Importáljuk a useNavigate hookot
import { 
  SimpleGrid, Box, Image, Text, Skeleton, SkeletonText, GridItem, 
  Flex, HStack, Select, Button 
} from "@chakra-ui/react";
import styles from "./Contentpane.module.scss";

// Kiterjesztett típusdefiníció, amely tartalmazza a language és year mezőket is
interface Item {
  id: string;
  title: string;
  genre: string;
  coverImagePath: string;
  description: string;
  language: string;
  releaseYear: number;
}

interface ContentPaneProps {
  selectedGenres: string[];
  selectedCountries: string[];
}

const ContentPane = ({ selectedGenres, selectedCountries }: ContentPaneProps) => {
  const location = useLocation();
  const navigate = useNavigate(); //MOD: Inicializáljuk a useNavigate hookot
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Új szűrési állapotok
  const [filterLanguage, setFilterLanguage] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterGenre, setFilterGenre] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("desc"); // Alapértelmezett: év csökkenő

  // Pagination állapotok
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // A jelenlegi URL alapján eldöntjük, melyik endpoint-ot hívjuk meg
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
        setCurrentPage(1); // Reset pagination if endpoint changes
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError("Error loading data.");
        setLoading(false);
      });
  }, [endpoint]);

  // Szűrés: az eredeti szűrés mellett az új mezők is érvényesülnek
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

    return genreMatch && countryMatch && languageMatch && yearMatch;
  });

  // Rendezés az év alapján: csökkenő vagy növekvő sorrendben
  const sortedItems = [...filteredItems].sort((a, b) => {
    return orderBy === "desc" ? b.releaseYear - a.releaseYear : a.releaseYear - b.releaseYear;
  });

  // Pagination logika
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

  //MOD: Meghatározzuk, hogy a részletes oldal melyik prefix-et használja (movie vagy series)
  const detailRoutePrefix = location.pathname.includes("movies") ? "/movie" : "/series";

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
            <option value="english">English</option>
            <option value="hungarian">Hungarian</option>
            <option value="french">French</option>
            <option value="spanish">Spanish</option>
            {/* További nyelvek, ha szükséges */}
          </Select>
          <Select 
            placeholder="Year" 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            {/* További évek */}
          </Select>
          <Select 
            placeholder="Genre" 
            value={filterGenre} 
            onChange={(e) => setFilterGenre(e.target.value)}
          >
            <option value="action">Action</option>
            <option value="Comedy">Comedy</option>
            <option value="drama">Drama</option>
            {/* További műfajok */}
          </Select>
          <Select 
            placeholder="Order by Year" 
            value={orderBy} 
            onChange={(e) => setOrderBy(e.target.value)}
          >
            <option value="desc">Year Descending</option>
            <option value="asc">Year Ascending</option>
          </Select>
        </HStack>
      </Flex>

      {/* Grid megjelenítés */}
      <SimpleGrid rowGap={0} spacing={5} columns={[5]} className={styles.grid}>
        {currentItems.map((item) => (
          //MOD: A grid elemre kattintva navigálunk a részletes oldalra
          <GridItem 
            key={item.id} 
            className={styles.gridItem} 
            onClick={() => navigate(`${detailRoutePrefix}/${item.id}`)} //MOD: Navigáció a megfelelő oldalra
            cursor="pointer" //MOD: Mutatja, hogy az elem kattintható
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
      <Flex justifyContent="center" alignItems="center" mt={4} paddingBottom={"2%"}>
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
