import React, { useEffect, useState } from "react";
import { Box, Skeleton, Text, Image } from "@chakra-ui/react";
import axios from "axios";
import { Series } from "../types/series";  // Frontenden használt Series típus

export default function SeriesGrid({ isLoading, isAuthenticated }: { isLoading: boolean; isAuthenticated: boolean }) {
  const [seriesData, setSeriesData] = useState<Series[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSeries();
    }
  }, [isAuthenticated]);

  const fetchSeries = async () => {
    try {
      const response = await axios.get("https://localhost:7204/series");  // Az API endpoint
      setSeriesData(response.data);  // API válasz adatait beállítjuk
    } catch (error) {
      console.error("Error fetching series:", error);
    }
  };

  // Ha betöltés alatt vagyunk, placeholder-eket jelenítünk meg
  if (isLoading) {
    return (
      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} height="200px" />
        ))}
      </Box>
    );
  }

  // Adatok megjelenítése
  return (
    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
      {seriesData.map((series) => (
        <Box key={series.id} p={4} border="1px" borderRadius="md" borderColor="gray.300" boxShadow="md">
          {/* Kép vagy placeholder, ha van */}
          <Image src="https://via.placeholder.com/200x300" alt={series.title} borderRadius="md" />
          <Text fontSize="xl" fontWeight="bold" mt={2}>{series.title}</Text>
          <Text fontSize="sm" color="gray.600">{series.genre}</Text>
          <Text fontSize="sm" mt={2}>{series.description}</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>Release Year: {series.releaseYear}</Text>
          <Text fontSize="sm" color="gray.500">Final Year: {series.finalYear}</Text>
        </Box>
      ))}
    </Box>
  );
}
