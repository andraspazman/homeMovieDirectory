import React, { useEffect, useState } from "react";
import {
  SimpleGrid,
  GridItem,
  Image,
  Text,
  Box,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Adjust path as needed

// Define the interface for a playlist item returned by your playlist API.
interface PlaylistItemDTO {
  id: string;
  playlistId: string;
  moviesAndEpisodesId?: string | null;
  seriesId?: string | null;
}

// Define an interface for the detailed content we wish to display.
interface ContentDetails {
  id: string;
  title: string;
  genre: string;
  coverImagePath: string;
  isMovie: boolean;
}

const PlaylistGrid: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [displayItems, setDisplayItems] = useState<ContentDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no user is logged in, set an error.
    if (!user) {
      setError("No user is logged in.");
      setLoading(false);
      return;
    }

    // Function to fetch the user's playlist items, then fetch content details for each item.
    const fetchPlaylistItems = async () => {
      try {
        setLoading(true);

        // 1. Fetch the playlist items for the logged-in user.
        const playlistResponse = await fetch(
          `https://localhost:7204/playlist/user/${user.id}/items`
        );
        if (!playlistResponse.ok) {
          throw new Error("Failed to fetch playlist items");
        }
        const playlistItems: PlaylistItemDTO[] = await playlistResponse.json();

        // 2. For each playlist item, determine whether it's a movie/episode or a series,
        //    then fetch the detailed data from the appropriate endpoint.
        const detailPromises = playlistItems.map(async (item) => {
          let detailUrl = "";
          let isMovie = false;

          if (item.moviesAndEpisodesId) {
            // If moviesAndEpisodesId exists, assume this is a movie or episode.
            detailUrl = `https://localhost:7204/movie/${item.moviesAndEpisodesId}`;
            isMovie = true;
          } else if (item.seriesId) {
            // Otherwise, if seriesId exists, assume it's a series.
            detailUrl = `https://localhost:7204/series/${item.seriesId}`;
            isMovie = false;
          } else {
            // If neither ID is available, skip this item.
            return null;
          }

          const detailResponse = await fetch(detailUrl);
          if (!detailResponse.ok) {
            console.error(`Failed to fetch details from ${detailUrl}`);
            return null;
          }
          const contentData = await detailResponse.json();

          // Build a ContentDetails object. Adjust the property names if your API returns different keys.
          return {
            id: contentData.id,
            title: contentData.title,
            genre: contentData.genre,
            coverImagePath: contentData.coverImagePath,
            // Use the value returned by the API if available, otherwise use the local isMovie flag.
            isMovie: contentData.isMovie !== undefined ? contentData.isMovie : isMovie,
          } as ContentDetails;
        });

        const details = await Promise.all(detailPromises);
        // Filter out any null values.
        const filteredDetails = details.filter(
          (detail): detail is ContentDetails => detail !== null
        );
        setDisplayItems(filteredDetails);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching content details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistItems();
  }, [user]);

  if (loading) {
    return (
      <Box p={4}>
        <Spinner size="xl" />
        <Text mt={2}>Loading playlist...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={4}>
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (displayItems.length === 0) {
    return <Text>Your playlist is empty.</Text>;
  }

  return (
    <>
      <Box mb={4} textAlign="center" bg="gray.200" p={4} borderRadius="md" boxShadow="lg">
        <Heading as="h2" size="lg" color="black">
          {user?.normalName || user?.email}&apos;s Playlist
        </Heading>
      </Box>

      <SimpleGrid spacing={5} columns={[5]}>
        {displayItems.map((item) => (
          <GridItem
            key={item.id}
            onClick={() => {
              // Navigate based on content type.
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
              width="100%"
              height="auto"
            />
            <Box mt={2}>
              <Text fontWeight="bold">{item.title}</Text>
              <Text>{item.genre}</Text>
              <Text fontSize="sm" color="gray.600">
                {item.isMovie ? "Movie" : "Series"} ID: {item.id}
              </Text>
            </Box>
          </GridItem>
        ))}
      </SimpleGrid>
    </>
  );
};

export default PlaylistGrid;
