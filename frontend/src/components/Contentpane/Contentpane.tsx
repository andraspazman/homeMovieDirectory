import { useEffect, useState } from "react";
import axios from "axios";
import { SimpleGrid, Box, Image, Text, Skeleton, SkeletonText, GridItem, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // useNavigate importálása
import { Series } from "../../types/series";
import styles from "./Contentpane.module.scss";

interface SeriesGridProps {
  selectedGenres: string[];
  selectedDecades: string[];  // Ez már szerepel a propokban
}

const SeriesGrid = ({ selectedGenres, selectedDecades }: SeriesGridProps) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate(); // useNavigate inicializálása

  useEffect(() => {
    axios
      .get<Series[]>("https://localhost:7204/latest")
      .then((response) => {
        // Rendezés releaseYear alapján csökkenő sorrendbe (legújabb elöl)
        const sortedData = response.data.sort((a, b) => b.releaseYear - a.releaseYear);
        setSeries(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching latest content:", err);
        setError("Error loading latest content.");
        setLoading(false);
      });
  }, []);

  // Szűrés: a genre és a decade (évtized) alapján
  const filteredSeries = series.filter((item) => {
    const genreMatch =
      selectedGenres.length === 0 || selectedGenres.includes(item.genre);

    const decadeMatch =
      selectedDecades.length === 0 ||
      selectedDecades.some((decadeRange) => {
        // Az évtized intervallumot pl. "2025-2016" várjuk
        const [upper, lower] = decadeRange.split('-').map(Number);
        return item.releaseYear <= upper && item.releaseYear >= lower;
      });

    return genreMatch && decadeMatch;
  });

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

  return (
    <>
      <Box className={styles.movieText} mb={4} textAlign="center" bg="grey.200" p={4} borderRadius="md" boxShadow="lg">
        <Heading as="h2" size="lg" color="black">
          Latest Releases
        </Heading>
      </Box>
      <SimpleGrid rowGap={0} spacing={5} columns={[5]} className={styles.grid}>
        {filteredSeries.map((item) => (
          <GridItem
            key={item.id}
            className={styles.gridItem}
            onClick={() => {
              if (item.isMovie) {
                navigate(`/movie/${item.id}`);
              } else {
                navigate(`/series/${item.id}`);
              }
            }}
            style={{ cursor: "pointer" }}
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
    </>
  );
};

export default SeriesGrid;
