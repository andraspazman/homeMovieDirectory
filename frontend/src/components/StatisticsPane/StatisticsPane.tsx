/* StatisticsPane.tsx */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Box, Grid, Heading } from "@chakra-ui/react";

// Register necessary chart.js components for both Pie and Bar charts
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  language: string;
  genre: string; // Make sure your backend includes this field
}

interface Series {
  id: string;
  title: string;
  releaseYear: number;
  language: string;
  genre: string; // Also ensure your backend includes genre
}

const StatisticsPane: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          axios.get<Movie[]>("https://localhost:7204/movie"),
          axios.get<Series[]>("https://localhost:7204/series"),
        ]);
        setMovies(moviesRes.data);
        setSeries(seriesRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Series: counts by year, language, genre
  const seriesYearCount = countBy(series, "releaseYear");
  const seriesLangCount = countBy(series, "language");
  const seriesGenreCount = countBy(series, "genre");

  // Movies: counts by year, language, genre
  const movieYearCount = countBy(movies, "releaseYear");
  const movieLangCount = countBy(movies, "language");
  const movieGenreCount = countBy(movies, "genre");

  // Convert to pie chart data
  const seriesYearData = pieDataFromMap(seriesYearCount, "Series by Year");
  const seriesLangData = pieDataFromMap(seriesLangCount, "Series by Language");
  const movieYearData = pieDataFromMap(movieYearCount, "Movies by Year");
  const movieLangData = pieDataFromMap(movieLangCount, "Movies by Language");

  // Convert to bar chart data
  const seriesGenreBarData = barDataFromMap(seriesGenreCount, "Series by Genre");
  const movieGenreBarData = barDataFromMap(movieGenreCount, "Movies by Genre");

  if (loading) {
    return <Box p="2rem">Loading statistics...</Box>;
  }

  return (
    <Box mt={10} p={1}>
      {/* First row: Series */}
      <Grid
        templateColumns="repeat(3, 300px)"
        gap="2rem"
        justifyContent="center"
        mb="2rem"
      >
        {/* Series by Year (Pie) */}
        <Box>
          <Heading as="h3" size="md" mb="1rem">
            Series (Year)
          </Heading>
          <Pie data={seriesYearData} />
        </Box>

        {/* Series by Language (Pie) */}
        <Box>
          <Heading as="h3" size="md" mb="1rem">
            Series (Language)
          </Heading>
          <Pie data={seriesLangData} />
        </Box>

        {/* Series by Genre (Bar) */}
        <Box>
          <Heading as="h3" size="md" mb="1rem">
            Series (Genre)
          </Heading>
          <Bar data={seriesGenreBarData} />
        </Box>
      </Grid>

      {/* Second row: Movies */}
      <Grid
        templateColumns="repeat(3, 300px)"
        gap="2rem"
        justifyContent="center"
        mb="2rem"
      >
        {/* Movies by Year (Pie) */}
        <Box>
          <Heading as="h3" size="md" mb="5%">
            Movies (Year)
          </Heading>
          <Pie data={movieYearData} />
        </Box>

        {/* Movies by Language (Pie) */}
        <Box>
          <Heading as="h3" size="md" mb="5%">
            Movies (Language)
          </Heading>
          <Pie data={movieLangData} />
        </Box>

        {/* Movies by Genre (Bar) */}
        <Box>
          <Heading as="h3" size="md" mb="10%">
            Movies (Genre)
          </Heading>
          <Bar data={movieGenreBarData} />
        </Box>
      </Grid>
    </Box>
  );
};

export default StatisticsPane;

/* ---------------- Helper Functions ---------------- */

/**
 * Groups items by a given key, returning { keyValue: count, ... }.
 */
function countBy<T>(items: T[], key: keyof T): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const val = String(item[key]);
    result[val] = (result[val] || 0) + 1;
  }
  return result;
}

/**
 * Generates a Pie chart config from a map { label -> count }.
 */
function pieDataFromMap(dataMap: Record<string, number>, label: string) {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);

  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(201, 203, 207, 0.6)",
        ],
        borderWidth: 2,
      },
    ],
  };
}

/**
 * Generates a Bar chart config from a map { label -> count }.
 */
function barDataFromMap(dataMap: Record<string, number>, label: string) {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);

  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: "rgba(74, 154, 207, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };
}
