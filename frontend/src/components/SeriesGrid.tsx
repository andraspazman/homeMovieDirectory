import React, { useEffect, useState } from "react";
import { Box, Skeleton, Text, Image } from "@chakra-ui/react";
import axios from "axios";
import { Series } from "../types/series"; // Series típus interfész

// Képek alap URL-je
const URL_IMAGES = "https://localhost:7204/images/";

export default function SeriesGrid({ isLoading, isAuthenticated }: { isLoading: boolean; isAuthenticated: boolean }) {
  const [seriesData, setSeriesData] = useState<Series[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSeries();
    }
  }, [isAuthenticated]);

  const fetchSeries = async () => {
    try {
      // Az API endpoint, amely a series adatokat adja vissza
      const response = await axios.get("https://localhost:7204/series");
      setSeriesData(response.data);
    } catch (error) {
      console.error("Error fetching series:", error);
    }
  };

  if (isLoading) {
    return (
      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} height="200px" />
        ))}
      </Box>
    );
  }

  return (
    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
      {seriesData.map((series) => (
        <Box
          key={series.id}
          p={4}
          border="1px"
          borderRadius="md"
          borderColor="gray.300"
          boxShadow="md"
        >
          {/* Helyes URL összeállítása a konstans változóval */}
          <Image
            src={series.coverImagePath ? `${URL_IMAGES}${series.coverImagePath}` : "https://via.placeholder.com/200x300"}
            alt={series.title}
            borderRadius="md"
            mb={2}
          />

          <Text fontSize="xl" fontWeight="bold">
            {series.title}
          </Text>
          <Text fontSize="md" color="gray.600">
            {series.genre}
          </Text>
          <Text fontSize="sm" mt={1}>
            {series.description}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Release Year: {series.releaseYear}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Final Year: {series.finalYear}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
