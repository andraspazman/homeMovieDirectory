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
  Button,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Adjust path as needed

// Define the interface for a playlist item returned by your playlist API.
interface PlaylistItemDTO {
  id: string; // This is the playlist item id
  playlistId: string;
  moviesAndEpisodesId?: string | null;
  seriesId?: string | null;
}

// Define an interface for the detailed content we wish to display.
// We add both playlistItemId (for deletion) and contentId (for navigation).
interface ContentDetails {
  playlistItemId: string; // The ID of the playlist item
  contentId: string;      // The ID of the movie/series content
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

  // Pagination state: current page and items per page.
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Function to handle deletion of a playlist item using its playlistItemId.
  const handleDeleteItem = async (playlistItemId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      const response = await fetch(`https://localhost:7204/playlist/item/${playlistItemId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete playlist item");
      }
      // Remove deleted item from state.
      setDisplayItems((prevItems) =>
        prevItems.filter((item) => item.playlistItemId !== playlistItemId)
      );
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting the item.");
    }
  };

  useEffect(() => {
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
        // then fetch the detailed data from the appropriate endpoint.
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

          // Build a ContentDetails object.
          return {
            playlistItemId: item.id,      // Preserve the original playlist item id.
            contentId: contentData.id,      // Use the content id from the details response.
            title: contentData.title,
            genre: contentData.genre,
            coverImagePath: contentData.coverImagePath,
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

  // Calculate pagination values.
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayItems.length / itemsPerPage);

  // Pagination handlers.
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

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
    return <Text pt="20%">Your playlist is empty.</Text>;
  }

  return (
    <>
      <Box
        mb={4}
        textAlign="center"
        bg="gray.200"
        p={4}
        borderRadius="md"
        boxShadow="lg"
        mt="5%"
      >
        <Heading as="h2" size="lg" color="black" >
          {user?.nickname || user?.normalName}&apos;s playlist
        </Heading>
      </Box>

      <SimpleGrid spacing={5} columns={[5]}>
        {currentItems.map((item) => (
          <GridItem key={item.playlistItemId}>
            <Box
              position="relative"
              onClick={() => {
                // Navigate to the content details using the contentId.
                if (item.isMovie) {
                  navigate(`/movie/${item.contentId}`);
                } else {
                  navigate(`/series/${item.contentId}`);
                }
              }}
              cursor="pointer"
              borderWidth="1px"
              borderRadius="md"
              overflow="hidden"
              boxShadow="md"
            >
              <Image
                src={`https://localhost:7204/images/${item.coverImagePath}`}
                alt={item.title}
                width="100%"
                height="250px"
                objectFit="cover"
              />
              {/* Delete button positioned at top-right corner */}
              <IconButton
                position="absolute"
                top="2"
                right="2"
                size="sm"
                icon={<DeleteIcon />}
                aria-label="Delete"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent onClick from triggering.
                  handleDeleteItem(item.playlistItemId);
                }}
              />
              <Box p={2}>
                <Text fontWeight="bold">{item.title}</Text>
                <Text>{item.genre}</Text>
                <Text fontSize="sm" color="gray.600">
                  {item.isMovie ? "Movie" : "Series"} ID: {item.contentId}
                </Text>
              </Box>
            </Box>
          </GridItem>
        ))}
      </SimpleGrid>

      <HStack spacing={4} justifyContent="center" mt={8}>
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </HStack>
    </>
  );
};

export default PlaylistGrid;
