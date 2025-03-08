import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Flex, Box, Image, Text, Spinner, Heading, UnorderedList, ListItem, Button, 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure
} from "@chakra-ui/react";
import styles from "./SelectedContentpane.module.scss";

// Importáljuk a frontend DTO-kat (interface-eket)
import { PersonWithCharacterDTO } from "../../types/PersonWithCharacterDTO";
import { ProductionCompanyDTO } from "../../types/ProductionCompanyDTO";

// Az alábbi interface a /series/{id} endpoint által visszaadott adatokat tartalmazza.
// Fontos, hogy az epizódoknak legyen id mezője, de ebben a komponensben a szezonokra már nem fogunk
// építeni, mivel az EP1 episodeId-t külön kapjuk.
interface DetailItem {
  id: string;
  title: string;
  releaseYear: number;
  genre: string;
  description: string;
  productionCompany: string; 
  coverImagePath: string;
  videoPath?: string;
  cast: string[];
  // További adatok (pl. seasons) itt opcionálisak lehetnek, de nem használjuk őket ebben a megoldásban.
}

// Az EP1 episodeId-t tartalmazó DTO
interface EpisodeIdDTO {
  episodeId: string;
}

const SelectedSeriesContentPane = () => {
  const { id } = useParams();

  // Sorozat általános adatok
  const [item, setItem] = useState<DetailItem | null>(null);
  // EP1 epizód azonosítója
  const [episodeId, setEpisodeId] = useState<string | null>(null);
  // Kapcsolódó karakterek és szereplők
  const [personsWithCharacters, setPersonsWithCharacters] = useState<PersonWithCharacterDTO[]>([]);
  // Produkciós cég
  const [productionCompany, setProductionCompany] = useState<ProductionCompanyDTO | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Endpointok
  const seriesEndpoint = `https://localhost:7204/series/${id}`;
  const episodeIdEndpoint = `https://localhost:7204/series/${id}/ep1-id`;

  // 1. Sorozat adatok lekérése
  useEffect(() => {
    if (!seriesEndpoint) return;
    setLoading(true);

    axios.get<DetailItem>(seriesEndpoint)
      .then((response) => {
        setItem(response.data);
      })
      .catch((err) => {
        console.error("Error loading series data:", err);
        setError("Failed to load series data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [seriesEndpoint]);

  // 2. EP1 episodeId lekérése
  useEffect(() => {
    if (!episodeIdEndpoint) return;
    axios.get<EpisodeIdDTO>(episodeIdEndpoint)
      .then((response) => {
        setEpisodeId(response.data.episodeId);
        console.log(response.data.episodeId);
      })
      .catch((err) => {
        console.error("Error loading episode id:", err);
      });
  }, [episodeIdEndpoint]);

  // 3. Kapcsolódó adatok lekérése az episodeId alapján
  useEffect(() => {
    if (!episodeId) return;

    // Karakterek és szereplők lekérése
    axios.get<PersonWithCharacterDTO[]>(`https://localhost:7204/character/episode/${episodeId}/persons-with-characters`)
      .then((response) => {
        setPersonsWithCharacters(response.data);
      })
      .catch((err) => {
        console.error("Error loading persons with characters:", err);
      });

    // Produkciós cég lekérése
    axios.get<ProductionCompanyDTO>(`https://localhost:7204/episode/${episodeId}/productioncompany`)
      .then((response) => {
        setProductionCompany(response.data);
      })
      .catch((err) => {
        console.error("Error loading production company:", err);
      });
  }, [episodeId]);

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
          <Text>
            <strong>Production Company:</strong> {productionCompany ? productionCompany.name : item.productionCompany}
          </Text>
          <Text><strong>Description:</strong> {item.description}</Text>
        </Box>

        <Box className={styles.castContainer}>
          <Heading size="sm" mb={2}>Cast &amp; Characters</Heading>
          {personsWithCharacters && personsWithCharacters.length > 0 ? (
            <UnorderedList>
              {personsWithCharacters.map((pwc) => (
                <ListItem key={pwc.person.id}>
                  {pwc.person.name} {pwc.person.role && `(${pwc.person.role})`}
                  {pwc.characters && pwc.characters.length > 0 && (
                    <UnorderedList>
                      {pwc.characters.map((character) => (
                        <ListItem key={character.id}>
                          {character.characterName}
                          {character.nickName ? ` - ${character.nickName}` : ""} 
                          {character.role ? ` (${character.role})` : ""}
                        </ListItem>
                      ))}
                    </UnorderedList>
                  )}
                </ListItem>
              ))}
            </UnorderedList>
          ) : (
            <Text>No cast information provided.</Text>
          )}
        </Box>
      </Flex>

      <Box className={styles.lowerSection}>
        <Heading size="md" mb={2}>Series Playback</Heading>
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
                <source 
                  src={item.videoPath ? item.videoPath : `https://localhost:7204/video/${item.id}`} 
                  type="video/mp4" 
                />
                Your browser does not support video playback.
              </video>
            </ModalBody>
            <ModalFooter>
              {/* Optionally additional controls */}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default SelectedSeriesContentPane;
