import { useEffect, useState } from "react";
import axios from "axios";
import { SimpleGrid, Box, Image, Text, Skeleton, SkeletonText, GridItem } from "@chakra-ui/react";
import { Series } from "../../types/series";
import styles from "./Contentpane.module.scss";

interface SeriesGridProps {
  selectedGenres: string[];
  selectedCountries: string[];
}

const SeriesGrid = ({ selectedGenres, selectedCountries }: SeriesGridProps) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    axios
      .get<Series[]>("https://localhost:7204/series")
      .then((response) => {
        setSeries(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching series:", err);
        setError("Error loading series.");
        setLoading(false);
      });
  }, []);

  const filteredSeries = series.filter((item) => {
    const genreMatch =
      selectedGenres.length === 0 || selectedGenres.includes(item.genre);

    const countryMatch =
      selectedCountries.length === 0 || selectedCountries.includes(item.description);

    return genreMatch && countryMatch;
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
    <Box className={styles.movieText} >
      <Text>Latest releases</Text>
    </Box>
    <SimpleGrid rowGap={0} spacing={5} columns={[5]} className={styles.grid}>
      {filteredSeries.map((item) => (
        <GridItem key={item.id} className={styles.gridItem}>
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
