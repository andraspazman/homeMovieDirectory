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
  genre: string;
}

interface Series {
  id: string;
  title: string;
  releaseYear: number;
  genre: string;
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

  // Számoljuk az értékeket (csoportosítjuk év és műfaj szerint)
  const seriesYearCount = countBy(series, "releaseYear");
  const seriesGenreCount = countBy(series, "genre");
  const movieYearCount = countBy(movies, "releaseYear");
  const movieGenreCount = countBy(movies, "genre");

  // Átalakítjuk a számításokat százalékos adatokra
  const seriesYearData = pieDataFromMap(seriesYearCount, "Series by Year");
  const movieYearData = pieDataFromMap(movieYearCount, "Movies by Year");

  const seriesGenreBarData = barDataFromMap(seriesGenreCount, "Series by Genre");
  const movieGenreBarData = barDataFromMap(movieGenreCount, "Movies by Genre");

  // Chart tooltip opciók, hogy a százalékok is megjelenjenek
  const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed;
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  const barOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.parsed.y;
            return `${label}: ${value}%`;
          },
        },
      },
    },
    indexAxis: "x" as const,
  };

  if (loading) {
    return <Box p="2rem">Loading statistics...</Box>;
  }

  return (
    <Box mt={10} p={1}>
      {/* First row: Series */}
      <Grid
        templateColumns="repeat(2, 300px)"
        gap="2rem"
        justifyContent="center"
        mb="2rem"
      >
        <Box>
          <Heading as="h3" size="md" mb="1rem">
            Series (Year)
          </Heading>
          <Pie data={seriesYearData} options={pieOptions} />
        </Box>

        <Box>
          <Heading as="h3" size="md" mb="1rem">
            Series (Genre)
          </Heading>
          <Bar data={seriesGenreBarData} options={barOptions} />
        </Box>
      </Grid>

      {/* Second row: Movies */}
      <Grid
        templateColumns="repeat(2, 300px)"
        gap="2rem"
        justifyContent="center"
        mb="2rem"
      >
        <Box>
          <Heading as="h3" size="md" mb="1rem">
            Movies (Year)
          </Heading>
          <Pie data={movieYearData} options={pieOptions} />
        </Box>

        <Box>
          <Heading as="h3" size="md" mb="1rem">
            Movies (Genre)
          </Heading>
          <Bar data={movieGenreBarData} options={barOptions} />
        </Box>
      </Grid>
    </Box>
  );
};

export default StatisticsPane;

/* ---------------- Helper Functions ---------------- */

/**
 * Groups items by a given key, returning an object where each key's value is the count.
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
 * Converts counts to percentage values.
 */
function pieDataFromMap(dataMap: Record<string, number>, label: string) {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);
  const total = values.reduce((acc, curr) => acc + curr, 0);
  const percentages = values.map((value) =>
    Number(((value / total) * 100).toFixed(1))
  );

  return {
    labels,
    datasets: [
      {
        label,
        data: percentages,
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
 * Converts counts to percentage values.
 */
function barDataFromMap(dataMap: Record<string, number>, label: string) {
  const labels = Object.keys(dataMap);
  const values = Object.values(dataMap);
  const total = values.reduce((acc, curr) => acc + curr, 0);
  const percentages = values.map((value) =>
    Number(((value / total) * 100).toFixed(1))
  );

  return {
    labels,
    datasets: [
      {
        label,
        data: percentages,
        backgroundColor: "rgba(74, 154, 207, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };
}
