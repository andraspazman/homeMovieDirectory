import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Flex, 
  Box, 
  Image, 
  Text, 
  Spinner, 
  Heading, 
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  ModalFooter,
  useDisclosure 
} from "@chakra-ui/react";
import styles from "./SelectedContentpane.module.scss";
import ProductionCompany from "../SelectedContent/ProductionCompany";
import { MovieDTO } from "../../types/MovieDTO";

// Feltételezzük, hogy a ProductionCompanyDTO így néz ki:
export interface ProductionCompanyDTO {
  name: string;
  website: string;
}

const SelectedMovieContentPane = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<MovieDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Production company adatainak state-je
  const [productionCompany, setProductionCompany] = useState<ProductionCompanyDTO | null>(null);

  // Endpoint a film részletek lekéréséhez
  const endpoint = `https://localhost:7204/movie/${id}`;

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);
    axios
      .get<MovieDTO>(endpoint)
      .then((response) => {
        setItem(response.data);
      })
      .catch((err) => {
        console.error("Error loading detailed data:", err);
        setError("Failed to load data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [endpoint]);

  // Production company lekérése az adott endpoint alapján
  useEffect(() => {
    if (!id) return;
    axios
      .get<ProductionCompanyDTO>(`https://localhost:7204/episode/${id}/productioncompany`)
      .then((response) => {
        setProductionCompany(response.data);
      })
      .catch((err) => {
        console.error("Error loading production company:", err);
        // Ha hiba történik, a fallback értékek kerülnek majd használatra
        setProductionCompany(null);
      });
  }, [id]);

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

  return (
    <Box>
      <Flex className={styles.topSection}>
        {/* Bal oldal: film borítóképe és "Watch now" gomb */}
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

        {/* Jobb oldal: film részletek */}
        <Box className={styles.detailsContainer}>
          <Heading size="xl" mb={5}>{item.title}</Heading>
          {item.releaseYear && (
            <Text>
              <strong>Year:</strong> {item.releaseYear}
            </Text>
          )}
          <Text>
            <strong>Genre:</strong> {item.genre}
          </Text>
          <Text>
            <strong>Language:</strong> {item.language}
          </Text>
          {item.award && (
            <Text>
              <strong>Award:</strong> {item.award}
            </Text>
          )}
          <Text mt={2}>
            <strong>Description:</strong> {item.description}
          </Text>
          {/* ProductionCompany komponens használata a productionCompany adatokkal */}
          <ProductionCompany 
            name={productionCompany ? productionCompany.name : "n/a"}
            website={productionCompany ? productionCompany.website : "n/a"}
            isLoggedIn={false} // Itt állítsd be, ha van bejelentkezett felhasználó
            onEdit={() => {
              // Production company szerkesztés logika
            }}
            onAdd={() => {
              // Production company hozzáadás logika
            }}
          />
        </Box>
      </Flex>

      {/* Alsó rész: film lejátszás modal */}
      <Box className={styles.lowerSection}>
        <Heading size="md" mb={2}>Movie Playback</Heading>
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
              {/* További vezérlők elhelyezhetők itt */}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default SelectedMovieContentPane;
