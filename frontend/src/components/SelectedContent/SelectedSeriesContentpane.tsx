import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Flex, Box, Image, Text, Spinner, Heading, UnorderedList, ListItem, Button, 
  Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure
} from "@chakra-ui/react";
import styles from "./SelectedContentpane.module.scss";

interface DetailItem {
  id: string;
  title: string;
  releaseYear: number;
  genre: string;
  description: string;
  productionCompany: string; 
  coverImagePath: string;
  VideoPath?: string;
  cast: string[];
  seasons?: {
    seasonNumber: number;
    episodes: {
      episodeNumber: number;
      title: string;
    }[];
  }[];
}

const SelectedSeriesContentPane = () => {
  const { id } = useParams();
  const [item, setItem] = useState<DetailItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const endpoint = `https://localhost:7204/series/${id}`;

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);

    axios
      .get<DetailItem>(endpoint)
      .then((response) => {
        setItem(response.data);
        if (response.data.seasons && response.data.seasons.length > 0) {
          // Alapértelmezettként a legelső évadot választjuk ki
          setSelectedSeason(response.data.seasons[0].seasonNumber);
        }
      })
      .catch((err) => {
        console.error("Error loading detailed data:", err);
        setError("Failed to load data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [endpoint]);

  if (loading) {
    return (
      <Flex className={styles.loadingContainer}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box className={styles.errorBox}>
        <Text>{error}</Text>
      </Box>
    );
  }

  if (!item) {
    return null;
  }

  // Kiválasztott évad epizódjainak kigyűjtése
  let episodesToDisplay: any[] = [];
  if (item.seasons) {
    const season = item.seasons.find(s => s.seasonNumber === selectedSeason);
    if (season) {
      episodesToDisplay = season.episodes;
    }
  }

  return (
    <Box>
      <Flex className={styles.topSection}>
        <Box className={styles.imageContainer}>
          <Image 
            src={`https://localhost:7204/images/${item.coverImagePath}`} 
            alt={item.title} 
            className={styles.coverImage}
          />
          <Button colorScheme="blue" onClick={onOpen}>
            Watch now
          </Button>
        </Box>

        <Box className={styles.detailsContainer}>
          <Heading size="xl" mb={5}>{item.title}</Heading>
          <Text><strong>Year:</strong> {item.releaseYear}</Text>
          <Text><strong>Genre:</strong> {item.genre}</Text>
          <Text><strong>Production Company:</strong> {item.productionCompany}</Text>
          <Text><strong>Description:</strong> {item.description}</Text>
        </Box>

        <Box className={styles.castContainer}>
          <Heading size="sm" mb={2}>Cast</Heading>
          {item.cast && item.cast.length > 0 ? (
            <UnorderedList>
              {item.cast.map((actor, idx) => (
                <ListItem key={idx}>{actor}</ListItem>
              ))}
            </UnorderedList>
          ) : (
            <Text>No cast list provided.</Text>
          )}
        </Box>
      </Flex>

      <Box className={styles.lowerSection}>
        <Heading size="md" mb={2}>Episodes</Heading>
        {item.seasons && item.seasons.length > 0 ? (
          <>
            <Select 
              placeholder="Select season" 
              value={selectedSeason || ""}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              mb={4}
            >
              {item.seasons.map((season, idx) => (
                <option key={idx} value={season.seasonNumber}>
                  {season.seasonNumber}. Season
                </option>
              ))}
            </Select>
            {episodesToDisplay && episodesToDisplay.length > 0 ? (
              <UnorderedList>
                {episodesToDisplay.map((episode, idx) => (
                  <ListItem key={idx}>
                    <Text>{episode.episodeNumber}. Episode: {episode.title}</Text>
                  </ListItem>
                ))}
              </UnorderedList>
            ) : (
              <Text>No episodes found for the selected season.</Text>
            )}
          </>
        ) : (
          <Text>Season information is not available.</Text>
        )}

        <Heading size="md" mb={2} mt={4}>Series Playback</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Watch now
        </Button>
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{item.title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <video width="100%" height="auto" controls>
                <source src={`https://localhost:7204/video/${item.id}`} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </ModalBody>
            <ModalFooter>
              {/* Opcionálisan további vezérlők */}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default SelectedSeriesContentPane;
